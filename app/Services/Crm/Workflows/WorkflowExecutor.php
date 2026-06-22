<?php

namespace App\Services\Crm\Workflows;

use App\Models\CrmApprovalRequest;
use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowActionRun;
use App\Models\CrmWorkflowRun;
use App\Services\Crm\Workflows\Actions\WorkflowActionRegistry;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use App\Services\Crm\Workflows\Contracts\WorkflowExecutorInterface;
use App\Services\Crm\Workflows\DTOs\WorkflowActionContext;
use App\Services\Crm\Workflows\DTOs\WorkflowActionResult;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;
use App\Services\Crm\Workflows\DTOs\WorkflowExecutionResult;
use Illuminate\Support\Carbon;
use RuntimeException;

class WorkflowExecutor implements WorkflowExecutorInterface
{
    public function __construct(
        private readonly WorkflowActionRegistry $actionRegistry,
    ) {}

    public function execute(CrmWorkflow $workflow, WorkflowContext $context): WorkflowExecutionResult
    {
        $run = CrmWorkflowRun::create([
            'workflow_id' => $workflow->id,
            'event_key' => $context->event::class,
            'entity_type' => $workflow->entity_type,
            'entity_id' => $context->eventPayload['id'] ?? $context->eventPayload['project_id'] ?? 0,
            'status' => WorkflowStatusCatalog::RUN_RUNNING,
            'context_snapshot' => $context->snapshot(),
            'correlation_id' => $context->correlationId,
            'started_at' => Carbon::now(),
        ]);

        return $this->executeActions($workflow, $context, $run);
    }

    public function resume(int $runId): WorkflowExecutionResult
    {
        $run = CrmWorkflowRun::find($runId);

        if ($run === null) {
            throw new RuntimeException("Workflow run not found: {$runId}");
        }

        if ($run->status !== WorkflowStatusCatalog::RUN_PAUSED) {
            throw new RuntimeException("Workflow run {$runId} is not in paused status: {$run->status}");
        }

        $waitingActionRun = $run->actionRuns()
            ->where('status', WorkflowStatusCatalog::ACTION_WAITING)
            ->first();

        if ($waitingActionRun === null) {
            throw new RuntimeException("No waiting action run found for paused workflow run: {$runId}");
        }

        $approvalRequestId = $waitingActionRun->response_json['approval_request_id'] ?? null;

        if ($approvalRequestId === null) {
            throw new RuntimeException("Waiting action run {$waitingActionRun->id} has no approval_request_id in response");
        }

        $approvalRequest = CrmApprovalRequest::find($approvalRequestId);

        if ($approvalRequest === null) {
            throw new RuntimeException("Approval request not found: {$approvalRequestId}");
        }

        if ($approvalRequest->status === 'approved') {
            $waitingActionRun->update([
                'status' => WorkflowStatusCatalog::ACTION_COMPLETED,
                'completed_at' => Carbon::now(),
            ]);

            $remainingActions = $run->workflow->actions()
                ->where('id', '>', $waitingActionRun->response_json['crm_workflow_action_id'] ?? 0)
                ->orderBy('sort_order')
                ->get();

            if ($remainingActions->isEmpty()) {
                $run->update([
                    'status' => WorkflowStatusCatalog::RUN_COMPLETED,
                    'completed_at' => Carbon::now(),
                ]);

                $result = new WorkflowActionResult(
                    actionId: $waitingActionRun->id,
                    actionType: $waitingActionRun->action_type,
                    configuration: $waitingActionRun->configuration_json,
                    success: true,
                    response: $waitingActionRun->response_json,
                );

                return new WorkflowExecutionResult(
                    workflowId: $run->workflow_id,
                    conditionsPassed: true,
                    conditionResults: [],
                    actionResults: [$result],
                    allActionsSucceeded: true,
                    status: WorkflowStatusCatalog::RUN_COMPLETED,
                );
            }

            $context = $this->rebuildContext($run);

            $afterActionId = $waitingActionRun->response_json['crm_workflow_action_id'] ?? 0;

            return $this->executeActions($run->workflow, $context, $run, afterActionId: $afterActionId);
        }

        $waitingActionRun->update([
            'status' => WorkflowStatusCatalog::ACTION_FAILED,
            'completed_at' => Carbon::now(),
        ]);

        $run->update([
            'status' => WorkflowStatusCatalog::RUN_FAILED,
            'completed_at' => Carbon::now(),
        ]);

        $result = new WorkflowActionResult(
            actionId: $waitingActionRun->id,
            actionType: $waitingActionRun->action_type,
            configuration: $waitingActionRun->configuration_json,
            success: false,
            response: $waitingActionRun->response_json,
            errorMessage: 'Approval request was rejected',
        );

        return new WorkflowExecutionResult(
            workflowId: $run->workflow_id,
            conditionsPassed: true,
            conditionResults: [],
            actionResults: [$result],
            allActionsSucceeded: false,
            status: WorkflowStatusCatalog::RUN_FAILED,
        );
    }

    private function executeActions(
        CrmWorkflow $workflow,
        WorkflowContext $context,
        CrmWorkflowRun $run,
        ?int $afterActionId = null,
    ): WorkflowExecutionResult {
        $actionResults = [];
        $hasPausedAction = false;
        $pausedActionResult = null;

        foreach ($workflow->actions as $action) {
            if ($afterActionId !== null && $action->id <= $afterActionId) {
                continue;
            }

            $actionRun = CrmWorkflowActionRun::create([
                'workflow_run_id' => $run->id,
                'action_type' => $action->action_type,
                'status' => WorkflowStatusCatalog::ACTION_RUNNING,
                'configuration_json' => $action->configuration_json,
                'started_at' => Carbon::now(),
            ]);

            try {
                $actionContext = new WorkflowActionContext($context, $action, $run);

                $result = $this->actionRegistry->hasHandler($action->action_type)
                    ? $this->actionRegistry->execute($action, $context, $run)
                    : new WorkflowActionResult(
                        actionId: $action->id,
                        actionType: $action->action_type,
                        configuration: $action->configuration_json,
                        success: false,
                        errorMessage: "No handler registered for: {$action->action_type}",
                    );

                if ($result->isPending) {
                    $actionRun->update([
                        'status' => WorkflowStatusCatalog::ACTION_WAITING,
                        'response_json' => $result->response,
                        'completed_at' => Carbon::now(),
                    ]);

                    $hasPausedAction = true;
                    $pausedActionResult = $result;
                    $actionResults[] = $result;

                    break;
                }

                $actionRun->update([
                    'status' => $result->success ? WorkflowStatusCatalog::ACTION_COMPLETED : WorkflowStatusCatalog::ACTION_FAILED,
                    'response_json' => $result->response,
                    'error_message' => $result->errorMessage,
                    'completed_at' => Carbon::now(),
                ]);
            } catch (\Throwable $e) {
                $actionRun->update([
                    'status' => WorkflowStatusCatalog::ACTION_FAILED,
                    'error_message' => $e->getMessage(),
                    'completed_at' => Carbon::now(),
                ]);

                $result = new WorkflowActionResult(
                    actionId: $action->id,
                    actionType: $action->action_type,
                    configuration: $action->configuration_json,
                    success: false,
                    errorMessage: $e->getMessage(),
                );
            }

            $actionResults[] = $result;

            if (! $result->success && $action->stop_on_fail) {
                $remaining = $workflow->actions->slice($workflow->actions->search($action) + 1);

                foreach ($remaining as $remainingAction) {
                    CrmWorkflowActionRun::create([
                        'workflow_run_id' => $run->id,
                        'action_type' => $remainingAction->action_type,
                        'status' => WorkflowStatusCatalog::ACTION_SKIPPED,
                        'configuration_json' => $remainingAction->configuration_json,
                        'started_at' => Carbon::now(),
                        'completed_at' => Carbon::now(),
                    ]);

                    $actionResults[] = new WorkflowActionResult(
                        actionId: $remainingAction->id,
                        actionType: $remainingAction->action_type,
                        configuration: $remainingAction->configuration_json,
                        success: false,
                        errorMessage: 'Skipped due to previous action failure',
                    );
                }

                break;
            }
        }

        if ($hasPausedAction) {
            $run->update([
                'status' => WorkflowStatusCatalog::RUN_PAUSED,
            ]);

            return new WorkflowExecutionResult(
                workflowId: $workflow->id,
                conditionsPassed: true,
                conditionResults: [],
                actionResults: $actionResults,
                allActionsSucceeded: true,
                status: WorkflowStatusCatalog::RUN_PAUSED,
            );
        }

        $allSucceeded = collect($actionResults)->every(fn (WorkflowActionResult $r) => $r->success);

        $run->update([
            'status' => $allSucceeded ? WorkflowStatusCatalog::RUN_COMPLETED : WorkflowStatusCatalog::RUN_FAILED,
            'completed_at' => Carbon::now(),
        ]);

        return new WorkflowExecutionResult(
            workflowId: $workflow->id,
            conditionsPassed: true,
            conditionResults: [],
            actionResults: $actionResults,
            allActionsSucceeded: $allSucceeded,
            status: $allSucceeded ? WorkflowStatusCatalog::RUN_COMPLETED : WorkflowStatusCatalog::RUN_FAILED,
        );
    }

    private function rebuildContext(CrmWorkflowRun $run): WorkflowContext
    {
        $snapshot = $run->context_snapshot;

        return new WorkflowContext(
            correlationId: $snapshot['correlation_id'] ?? $run->correlation_id ?? 'resumed-'.$run->id,
            event: new \stdClass,
            eventPayload: $snapshot['event_payload'] ?? [],
            project: $snapshot['project_id'] ?? null,
            triggeredBy: $snapshot['triggered_by_id'] ?? null,
        );
    }
}
