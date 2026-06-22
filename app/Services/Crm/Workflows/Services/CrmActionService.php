<?php

namespace App\Services\Crm\Workflows\Services;

use App\Models\CrmActivity;
use App\Models\CrmChangeOrder;
use App\Models\CrmIssue;
use App\Models\CrmProject;
use App\Models\CrmProjectRisk;
use App\Models\User;
use App\Services\Crm\Workflows\DTOs\WorkflowActionContext;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class CrmActionService
{
    public function createActivity(WorkflowActionContext $actionContext): CrmActivity
    {
        $config = $actionContext->action->configuration_json;
        $payload = $actionContext->workflowContext->eventPayload;

        return CrmActivity::create([
            'activitable_type' => 'project',
            'activitable_id' => $this->extractProjectId($actionContext->workflowContext),
            'type' => $config['type'] ?? 'general',
            'subject' => $config['subject'] ?? 'Workflow action',
            'description' => $config['description'] ?? '',
            'due_at' => isset($config['due_at']) ? Carbon::parse($config['due_at']) : null,
            'completed_at' => null,
            'created_by' => $this->extractUserId($actionContext->workflowContext),
            'customer_safe' => $config['customer_safe'] ?? false,
        ]);
    }

    public function createTask(WorkflowActionContext $actionContext): CrmActivity
    {
        $config = $actionContext->action->configuration_json;
        $payload = $actionContext->workflowContext->eventPayload;

        return CrmActivity::create([
            'activitable_type' => 'project',
            'activitable_id' => $this->extractProjectId($actionContext->workflowContext),
            'type' => 'task',
            'subject' => $config['subject'] ?? 'Workflow task',
            'description' => $config['description'] ?? '',
            'due_at' => isset($config['due_at']) ? Carbon::parse($config['due_at']) : null,
            'completed_at' => null,
            'created_by' => $this->extractUserId($actionContext->workflowContext),
            'customer_safe' => $config['customer_safe'] ?? false,
        ]);
    }

    public function createNote(WorkflowActionContext $actionContext): CrmActivity
    {
        $config = $actionContext->action->configuration_json;
        $payload = $actionContext->workflowContext->eventPayload;

        return CrmActivity::create([
            'activitable_type' => 'project',
            'activitable_id' => $this->extractProjectId($actionContext->workflowContext),
            'type' => 'note',
            'subject' => $config['subject'] ?? 'Workflow note',
            'description' => $config['description'] ?? '',
            'due_at' => null,
            'completed_at' => null,
            'created_by' => $this->extractUserId($actionContext->workflowContext),
            'customer_safe' => $config['customer_safe'] ?? false,
        ]);
    }

    public function assignOwner(WorkflowActionContext $actionContext): void
    {
        $config = $actionContext->action->configuration_json;
        $payload = $actionContext->workflowContext->eventPayload;

        $entity = $this->resolveEntity($config['entity_type'] ?? null, $payload);

        if ($entity === null) {
            throw new \RuntimeException('Cannot assign owner: no target entity found');
        }

        $ownerId = $config['owner_id'] ?? $actionContext->workflowContext->triggeredBy?->id
            ?? throw new \RuntimeException('Cannot assign owner: no owner_id in config and no triggeredBy user');

        $entity->update(['owner_id' => $ownerId]);
    }

    public function updateStatus(WorkflowActionContext $actionContext): void
    {
        $config = $actionContext->action->configuration_json;
        $payload = $actionContext->workflowContext->eventPayload;

        $entity = $this->resolveEntity($config['entity_type'] ?? null, $payload);

        if ($entity === null) {
            throw new \RuntimeException('Cannot update status: no target entity found');
        }

        $field = $config['field'] ?? 'status';
        $value = $config['value'] ?? throw new \RuntimeException('Cannot update status: no value in config');

        $entity->update([$field => $value]);
    }

    public function createRisk(WorkflowActionContext $actionContext): CrmProjectRisk
    {
        $config = $actionContext->action->configuration_json;
        $payload = $actionContext->workflowContext->eventPayload;

        return CrmProjectRisk::create([
            'project_id' => $this->extractProjectId($actionContext->workflowContext),
            'description' => $config['description'] ?? 'Risk created by workflow',
            'severity' => $config['severity'] ?? 'medium',
            'probability' => $config['probability'] ?? 'medium',
            'impact' => $config['impact'] ?? 'medium',
            'status' => 'identified',
            'owner_id' => $this->extractUserId($actionContext->workflowContext),
            'mitigation_plan' => $config['mitigation_plan'] ?? null,
            'is_visible_to_customer' => $config['is_visible_to_customer'] ?? true,
        ]);
    }

    public function createIssue(WorkflowActionContext $actionContext): CrmIssue
    {
        $config = $actionContext->action->configuration_json;
        $payload = $actionContext->workflowContext->eventPayload;

        return CrmIssue::create([
            'project_id' => $this->extractProjectId($actionContext->workflowContext),
            'description' => $config['description'] ?? 'Issue created by workflow',
            'severity' => $config['severity'] ?? 'medium',
            'status' => 'open',
            'owner_id' => $this->extractUserId($actionContext->workflowContext),
            'resolution' => null,
            'resolved_at' => null,
            'is_visible_to_customer' => $config['is_visible_to_customer'] ?? true,
        ]);
    }

    public function createChangeOrder(WorkflowActionContext $actionContext): CrmChangeOrder
    {
        $config = $actionContext->action->configuration_json;
        $payload = $actionContext->workflowContext->eventPayload;

        return CrmChangeOrder::create([
            'project_id' => $this->extractProjectId($actionContext->workflowContext),
            'title' => $config['title'] ?? 'Change order created by workflow',
            'description' => $config['description'] ?? '',
            'status' => 'pending',
            'cost_impact' => $config['cost_impact'] ?? 0.00,
            'timeline_impact_days' => $config['timeline_impact_days'] ?? 0,
            'requested_by' => $this->extractUserId($actionContext->workflowContext),
            'approved_at' => null,
            'approved_by' => null,
            'rejection_reason' => null,
            'customer_status' => 'pending',
            'approved_by_portal_account_id' => null,
            'customer_responded_at' => null,
        ]);
    }

    private function extractProjectId(WorkflowContext $context): ?int
    {
        if ($context->project instanceof CrmProject) {
            return $context->project->id;
        }

        if (is_array($context->project)) {
            return $context->project['id'] ?? null;
        }

        return $context->eventPayload['project_id']
            ?? $context->eventPayload['id']
            ?? null;
    }

    private function extractUserId(WorkflowContext $context): ?int
    {
        if ($context->triggeredBy instanceof User) {
            return $context->triggeredBy->id;
        }

        if (is_array($context->triggeredBy)) {
            return $context->triggeredBy['id'] ?? null;
        }

        return null;
    }

    private function resolveEntity(?string $entityType, array $payload): ?Model
    {
        if ($entityType === null) {
            foreach (['issue', 'risk', 'change_order'] as $key) {
                if (isset($payload[$key]) && $payload[$key] instanceof Model) {
                    return $payload[$key];
                }
            }
        }

        $map = [
            'issue' => CrmIssue::class,
            'risk' => CrmProjectRisk::class,
            'change_order' => CrmChangeOrder::class,
            'activity' => CrmActivity::class,
            'project' => CrmProject::class,
        ];

        $class = $map[$entityType] ?? null;

        if ($class !== null && isset($payload[$entityType]) && $payload[$entityType] instanceof $class) {
            return $payload[$entityType];
        }

        if ($class !== null && isset($payload['id'])) {
            return $class::find($payload['id']);
        }

        return null;
    }
}
