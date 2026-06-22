<?php

namespace App\Services\Crm\Workflows;

use App\Services\Crm\Workflows\Contracts\WorkflowContextBuilderInterface;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;

class WorkflowContextBuilder implements WorkflowContextBuilderInterface
{
    public function build(object $event, array $payload, string $correlationId): WorkflowContext
    {
        $project = $payload['project'] ?? $payload['deal'] ?? null;
        $triggeredBy = $payload['triggered_by'] ?? $payload['completed_by']
            ?? $payload['approved_by'] ?? $payload['rejected_by']
            ?? $payload['closed_by'] ?? $payload['resolved_by']
            ?? $payload['escalated_by'] ?? null;

        return new WorkflowContext(
            correlationId: $correlationId,
            event: $event,
            eventPayload: $payload,
            project: $project,
            triggeredBy: $triggeredBy,
        );
    }
}
