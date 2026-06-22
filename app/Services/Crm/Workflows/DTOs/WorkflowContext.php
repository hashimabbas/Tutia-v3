<?php

namespace App\Services\Crm\Workflows\DTOs;

use App\Models\CrmProject;
use App\Models\User;

class WorkflowContext
{
    /**
     * @param  array<string, mixed>  $eventPayload
     * @param  mixed  $project  Raw project data or CrmProject instance from event payload
     * @param  mixed  $triggeredBy  Raw user data or User instance from event payload
     */
    public function __construct(
        public readonly string $correlationId,
        public readonly object $event,
        public readonly array $eventPayload,
        public readonly mixed $project = null,
        public readonly mixed $triggeredBy = null,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function snapshot(): array
    {
        $projectId = match (true) {
            $this->project instanceof CrmProject => $this->project->id,
            is_array($this->project) => $this->project['id'] ?? null,
            default => null,
        };

        $userId = match (true) {
            $this->project instanceof User => $this->triggeredBy->id,
            is_array($this->triggeredBy) => $this->triggeredBy['id'] ?? null,
            $this->triggeredBy instanceof User => $this->triggeredBy->id,
            default => null,
        };

        return [
            'correlation_id' => $this->correlationId,
            'event_class' => $this->event::class,
            'event_payload' => $this->eventPayload,
            'project_id' => $projectId,
            'triggered_by_id' => $userId,
        ];
    }
}
