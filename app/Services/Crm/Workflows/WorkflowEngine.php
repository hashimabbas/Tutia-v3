<?php

namespace App\Services\Crm\Workflows;

use App\Events\Crm\ChangeOrderApproved;
use App\Events\Crm\ChangeOrderRejected;
use App\Events\Crm\DealConvertedToProject;
use App\Events\Crm\DeliverableCompleted;
use App\Events\Crm\HealthDegraded;
use App\Events\Crm\IssueEscalated;
use App\Events\Crm\IssueResolved;
use App\Events\Crm\MilestoneCompleted;
use App\Events\Crm\ProjectAtRisk;
use App\Events\Crm\ProjectCreated;
use App\Events\Crm\RiskClosed;
use App\Models\CrmWorkflow;
use App\Services\Crm\Communications\Registry\NotificationEventCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowConditionsVersion;
use App\Services\Crm\Workflows\Contracts\WorkflowContextBuilderInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowEvaluatorInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowExecutorInterface;
use App\Services\Crm\Workflows\DTOs\WorkflowConditionResult;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;
use App\Services\Crm\Workflows\DTOs\WorkflowExecutionResult;

class WorkflowEngine
{
    private const EVENT_KEY_MAP = [
        DealConvertedToProject::class => NotificationEventCatalog::DEAL_CONVERTED,
        ProjectCreated::class => NotificationEventCatalog::PROJECT_CREATED,
        MilestoneCompleted::class => NotificationEventCatalog::MILESTONE_COMPLETED,
        DeliverableCompleted::class => NotificationEventCatalog::DELIVERABLE_COMPLETED,
        RiskClosed::class => NotificationEventCatalog::RISK_CLOSED,
        IssueResolved::class => NotificationEventCatalog::ISSUE_RESOLVED,
        IssueEscalated::class => NotificationEventCatalog::ISSUE_ESCALATED,
        ProjectAtRisk::class => NotificationEventCatalog::PROJECT_AT_RISK,
        HealthDegraded::class => NotificationEventCatalog::HEALTH_DEGRADED,
        ChangeOrderApproved::class => NotificationEventCatalog::CHANGE_ORDER_APPROVED,
        ChangeOrderRejected::class => NotificationEventCatalog::CHANGE_ORDER_REJECTED,
    ];

    public function __construct(
        private readonly WorkflowLoader $loader,
        private readonly WorkflowContextBuilderInterface $contextBuilder,
        private readonly WorkflowEvaluatorInterface $evaluator,
        private readonly WorkflowExecutorInterface $executor,
    ) {}

    public function resume(int $runId): WorkflowExecutionResult
    {
        return $this->executor->resume($runId);
    }

    /**
     * @return array<int, WorkflowExecutionResult>
     */
    public function handle(object $event, array $payload, string $correlationId): array
    {
        $eventKey = $this->resolveEventKey($event);

        $workflows = $this->loader->findActiveByEventKey($eventKey);

        if ($workflows->isEmpty()) {
            return [];
        }

        $context = $this->contextBuilder->build($event, $payload, $correlationId);

        $results = [];

        foreach ($workflows as $workflow) {
            $conditionResults = $this->evaluator->evaluate($workflow, $context);
            $conditionsPassed = $this->evaluator->conditionsPassed($conditionResults);

            if (! $conditionsPassed) {
                $results[] = new WorkflowExecutionResult(
                    workflowId: $workflow->id,
                    conditionsPassed: false,
                    conditionResults: $conditionResults,
                    actionResults: [],
                    allActionsSucceeded: true,
                    status: 'skipped',
                );

                continue;
            }

            $executionContext = $this->enrichContextWithMatchedRules($context, $workflow, $conditionResults);

            $executionResult = $this->executor->execute($workflow, $executionContext);

            $results[] = new WorkflowExecutionResult(
                workflowId: $workflow->id,
                conditionsPassed: true,
                conditionResults: $conditionResults,
                actionResults: $executionResult->actionResults,
                allActionsSucceeded: $executionResult->allActionsSucceeded,
                status: $executionResult->status,
            );
        }

        return $results;
    }

    private function enrichContextWithMatchedRules(WorkflowContext $context, CrmWorkflow $workflow, array $conditionResults): WorkflowContext
    {
        if ($workflow->conditions_version !== WorkflowConditionsVersion::V2->value) {
            return $context;
        }

        /** @var array<int, mixed> $matchedRules */
        $matchedRules = [];

        /** @var array<int, mixed> $trace */
        $trace = [];

        $evaluatedRules = 0;
        $passedRules = 0;

        foreach ($conditionResults as $result) {
            if (! $result instanceof WorkflowConditionResult || ! is_array($result->actualValue)) {
                continue;
            }

            if (isset($result->actualValue['matchedRules'])) {
                $matchedRules = array_merge($matchedRules, $result->actualValue['matchedRules']);
            }

            if (isset($result->actualValue['trace'])) {
                $trace = array_merge($trace, $result->actualValue['trace']);
            }

            if (isset($result->actualValue['evaluatedRules'])) {
                $evaluatedRules += $result->actualValue['evaluatedRules'];
            }

            if (isset($result->actualValue['passedRules'])) {
                $passedRules += $result->actualValue['passedRules'];
            }
        }

        if (empty($matchedRules) && empty($trace)) {
            return $context;
        }

        $enrichedPayload = array_merge($context->eventPayload, [
            '_expression' => $workflow->expression,
            '_expression_matched_rules' => $matchedRules,
            '_expression_trace' => $trace,
            '_expression_evaluated_rules' => $evaluatedRules,
            '_expression_passed_rules' => $passedRules,
        ]);

        return new WorkflowContext(
            correlationId: $context->correlationId,
            event: $context->event,
            eventPayload: $enrichedPayload,
            project: $context->project,
            triggeredBy: $context->triggeredBy,
        );
    }

    private function resolveEventKey(object $event): string
    {
        $class = $event::class;

        return self::EVENT_KEY_MAP[$class] ?? throw new \RuntimeException("Unknown event class: {$class}");
    }
}
