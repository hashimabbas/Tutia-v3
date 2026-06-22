<?php

namespace App\Services\Crm\Timeline\Providers;

use App\Models\CrmAuditLog;
use App\Services\Crm\Timeline\Contracts\TimelineProvider;
use App\Services\Crm\Timeline\TimelineCollection;
use App\Services\Crm\Timeline\TimelineEvent;

class AuditLogTimelineProvider implements TimelineProvider
{
    private const TYPE_MAP = [
        'created' => ['icon' => 'PlusCircle', 'color' => '#3b6cdb', 'category' => 'system'],
        'updated' => ['icon' => 'Edit3', 'color' => '#555570', 'category' => 'system'],
        'deleted' => ['icon' => 'Trash2', 'color' => '#f87171', 'category' => 'system'],
        'stage_changed' => ['icon' => 'ArrowRight', 'color' => '#34d399', 'category' => 'system'],
        'assigned' => ['icon' => 'UserCheck', 'color' => '#fbbf24', 'category' => 'system'],
    ];

    public function supports(string $entityType, int $entityId): bool
    {
        return in_array($entityType, ['lead', 'deal', 'organization', 'contact']);
    }

    private function morphFromEntityType(string $entityType): string
    {
        return match ($entityType) {
            'lead' => 'App\Models\CrmLead',
            'deal' => 'App\Models\CrmDeal',
            'organization' => 'App\Models\CrmOrganization',
            'contact' => 'App\Models\CrmContact',
            default => 'App\Models\Crm'.ucfirst($entityType),
        };
    }

    private function entityTypeFromMorph(string $morphClass): string
    {
        return match ($morphClass) {
            'App\Models\CrmLead' => 'lead',
            'App\Models\CrmDeal' => 'deal',
            'App\Models\CrmOrganization' => 'organization',
            'App\Models\CrmContact' => 'contact',
            default => 'unknown',
        };
    }

    public function getEvents(
        string $entityType,
        int $entityId,
        ?string $cursor,
        int $limit,
        array $filters,
    ): TimelineCollection {
        $morphClass = $this->morphFromEntityType($entityType);

        $query = CrmAuditLog::where('auditable_type', $morphClass)
            ->where('auditable_id', $entityId);

        if (! empty($filters) && ! in_array('all', $filters)) {
            $query->whereIn('event', $filters);
        }

        $query->orderBy('created_at', 'desc')->limit($limit + 1);

        if ($cursor) {
            $query->where('created_at', '<', $cursor);
        }

        $results = $query->get();
        $hasMore = $results->count() > $limit;
        $events = $results->take($limit)->map(function (CrmAuditLog $log) use ($entityType, $entityId) {
            $typeInfo = self::TYPE_MAP[$log->event] ?? ['icon' => 'FileText', 'color' => '#555570', 'category' => 'system'];
            $actorId = $log->user_id;

            return new TimelineEvent(
                eventId: 'audit_'.$log->id,
                eventType: $log->event,
                eventCategory: $typeInfo['category'],
                icon: $typeInfo['icon'],
                color: $typeInfo['color'],
                occurredAt: $log->created_at->toIso8601String(),
                actorId: $actorId,
                actor: [
                    'id' => $actorId,
                    'name' => $log->user?->name ?? 'System',
                    'avatar' => null,
                ],
                summary: $this->summarize($log),
                description: $log->event === 'stage_changed'
                    ? ($log->old_values['stage'] ?? '').' → '.($log->new_values['stage'] ?? '')
                    : null,
                source: 'audit_log',
                entityType: $entityType,
                entityId: $entityId,
                entityBreadcrumb: [],
                metadata: [
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                    'auditable_type' => $log->auditable_type,
                ],
            );
        })->values()->all();

        $nextCursor = $hasMore && count($events) > 0
            ? $results->get($limit - 1)?->created_at?->toIso8601String()
            : null;

        return new TimelineCollection($events, $nextCursor, $hasMore);
    }

    private function summarize(CrmAuditLog $log): string
    {
        return match ($log->event) {
            'created' => 'Record created',
            'updated' => 'Details updated',
            'deleted' => 'Record deleted',
            'stage_changed' => 'Stage changed: '.($log->old_values['stage'] ?? '?').' → '.($log->new_values['stage'] ?? '?'),
            'assigned' => 'Assigned to '.($log->new_values['assigned_to'] ?? 'someone'),
            default => $log->event,
        };
    }
}
