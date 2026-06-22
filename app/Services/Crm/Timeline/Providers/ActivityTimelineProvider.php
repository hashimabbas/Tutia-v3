<?php

namespace App\Services\Crm\Timeline\Providers;

use App\Models\CrmActivity;
use App\Services\Crm\Timeline\Contracts\TimelineProvider;
use App\Services\Crm\Timeline\TimelineCollection;
use App\Services\Crm\Timeline\TimelineEvent;

class ActivityTimelineProvider implements TimelineProvider
{
    private const TYPE_MAP = [
        'note' => ['icon' => 'FileText', 'color' => '#555570', 'category' => 'note'],
        'call' => ['icon' => 'Phone', 'color' => '#fbbf24', 'category' => 'communication'],
        'email' => ['icon' => 'Mail', 'color' => '#3b6cdb', 'category' => 'communication'],
        'meeting' => ['icon' => 'Calendar', 'color' => '#a78bfa', 'category' => 'event'],
        'task' => ['icon' => 'CheckSquare', 'color' => '#34d399', 'category' => 'task'],
        'milestone_created' => ['icon' => 'Calendar', 'color' => '#3b6cdb', 'category' => 'milestone'],
        'milestone_completed' => ['icon' => 'CheckCircle2', 'color' => '#34d399', 'category' => 'milestone'],
        'milestone_reopened' => ['icon' => 'ArrowRight', 'color' => '#fbbf24', 'category' => 'milestone'],
        'deliverable_created' => ['icon' => 'FileText', 'color' => '#3b6cdb', 'category' => 'deliverable'],
        'deliverable_completed' => ['icon' => 'CheckCircle2', 'color' => '#34d399', 'category' => 'deliverable'],
        'deliverable_approved' => ['icon' => 'CheckCircle2', 'color' => '#a78bfa', 'category' => 'deliverable'],
        'risk_created' => ['icon' => 'AlertTriangle', 'color' => '#fbbf24', 'category' => 'risk'],
        'risk_mitigated' => ['icon' => 'ArrowRight', 'color' => '#f97316', 'category' => 'risk'],
        'risk_closed' => ['icon' => 'CheckCircle2', 'color' => '#34d399', 'category' => 'risk'],
        'issue_created' => ['icon' => 'AlertTriangle', 'color' => '#f87171', 'category' => 'issue'],
        'issue_escalated' => ['icon' => 'ArrowUp', 'color' => '#ef4444', 'category' => 'issue'],
        'issue_resolved' => ['icon' => 'CheckCircle2', 'color' => '#34d399', 'category' => 'issue'],
        'issue_closed' => ['icon' => 'CheckCircle2', 'color' => '#555570', 'category' => 'issue'],
        'change_order_created' => ['icon' => 'FileText', 'color' => '#3b6cdb', 'category' => 'change_order'],
        'change_order_approved' => ['icon' => 'CheckCircle2', 'color' => '#34d399', 'category' => 'change_order'],
    ];

    public function supports(string $entityType, int $entityId): bool
    {
        return in_array($entityType, ['lead', 'deal', 'organization', 'contact', 'project']);
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

    public function getEvents(
        string $entityType,
        int $entityId,
        ?string $cursor,
        int $limit,
        array $filters,
    ): TimelineCollection {
        $morphClass = $this->morphFromEntityType($entityType);

        $query = CrmActivity::where('activitable_type', $morphClass)
            ->where('activitable_id', $entityId);

        if (! empty($filters) && ! in_array('all', $filters)) {
            $query->whereIn('type', $filters);
        }

        $query->orderBy('created_at', 'desc')->limit($limit + 1);

        if ($cursor) {
            $query->where('created_at', '<', $cursor);
        }

        $results = $query->get();
        $hasMore = $results->count() > $limit;
        $events = $results->take($limit)->map(function (CrmActivity $activity) use ($entityType, $entityId) {
            $typeInfo = self::TYPE_MAP[$activity->type] ?? ['icon' => 'FileText', 'color' => '#555570', 'category' => 'activity'];
            $actorId = $activity->created_by;

            return new TimelineEvent(
                eventId: 'activity_'.$activity->id,
                eventType: $activity->type,
                eventCategory: $typeInfo['category'],
                icon: $typeInfo['icon'],
                color: $typeInfo['color'],
                occurredAt: $activity->created_at->toIso8601String(),
                actorId: $actorId,
                actor: [
                    'id' => $actorId,
                    'name' => $activity->createdBy?->name ?? 'Unknown',
                    'avatar' => null,
                ],
                summary: $activity->subject,
                description: $activity->description,
                source: $activity->type,
                entityType: $entityType,
                entityId: $entityId,
                entityBreadcrumb: [],
                metadata: [
                    'type' => $activity->type,
                    'is_completed' => $activity->is_completed,
                    'due_at' => $activity->due_at?->toIso8601String(),
                ],
            );
        })->values()->all();

        $nextCursor = $hasMore && count($events) > 0
            ? $results->get($limit - 1)?->created_at?->toIso8601String()
            : null;

        return new TimelineCollection($events, $nextCursor, $hasMore);
    }
}
