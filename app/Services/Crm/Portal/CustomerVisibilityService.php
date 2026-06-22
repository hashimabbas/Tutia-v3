<?php

namespace App\Services\Crm\Portal;

use App\Models\CrmChangeOrder;
use App\Models\CrmDeliverable;
use App\Models\CrmIssue;
use App\Models\CrmMilestone;
use App\Models\CrmPortalAccount;
use App\Models\CrmProject;
use App\Models\CrmProjectRisk;
use Illuminate\Support\Collection;

class CustomerVisibilityService
{
    public function __construct(
        private PortalRoleResolver $roles,
    ) {}

    public function canAccessProject(CrmPortalAccount $account, CrmProject $project): bool
    {
        if (! $account->enabled_at || $account->disabled_at) {
            return false;
        }

        return $account->projects()
            ->where('crm_projects.id', $project->id)
            ->exists();
    }

    public function visibleProjects(CrmPortalAccount $account): Collection
    {
        if (! $account->enabled_at || $account->disabled_at) {
            return collect();
        }

        return $account->projects;
    }

    public function isEntityVisible(CrmPortalAccount $account, object $entity): bool
    {
        if ($entity instanceof CrmProjectRisk) {
            return $entity->is_visible_to_customer;
        }

        if ($entity instanceof CrmIssue) {
            return $entity->is_visible_to_customer;
        }

        if ($entity instanceof CrmDeliverable) {
            return $entity->is_visible_to_customer;
        }

        if ($entity instanceof CrmMilestone || $entity instanceof CrmChangeOrder) {
            return true;
        }

        return false;
    }

    public function filterVisible(CrmPortalAccount $account, Collection $entities): Collection
    {
        return $entities->filter(fn ($entity) => $this->isEntityVisible($account, $entity))->values();
    }

    public function projectData(CrmPortalAccount $account, CrmProject $project): array
    {
        $project->loadMissing(['milestones', 'risks', 'issues', 'changeOrders']);

        return [
            'id' => $project->id,
            'name' => $project->name,
            'status' => $this->translateStatus($project->status),
            'health_tier' => $this->resolveHealthTier($project),
            'total_value' => (float) $project->contract_value + (float) $project->change_order_total,
            'milestones' => $project->milestones->map(fn (CrmMilestone $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'status' => $m->status,
            ]),
            'risks' => $this->filterVisible($account, $project->risks)
                ->map(fn (CrmProjectRisk $r) => [
                    'id' => $r->id,
                    'description' => $r->description,
                    'severity' => $r->severity,
                    'status' => $r->status,
                ]),
            'issues' => $this->filterVisible($account, $project->issues)
                ->map(fn (CrmIssue $i) => [
                    'id' => $i->id,
                    'description' => $i->description,
                    'severity' => $i->severity,
                    'status' => $i->status,
                ]),
            'change_orders' => $project->changeOrders->map(fn (CrmChangeOrder $co) => [
                'id' => $co->id,
                'title' => $co->title,
                'amount' => (float) $co->cost_impact,
                'status' => $co->customer_status,
                'created_at' => $co->created_at,
            ]),
        ];
    }

    private function translateStatus(string $status): string
    {
        return match ($status) {
            'planned' => 'Not Started',
            'initiating' => 'Getting Started',
            'active' => 'In Progress',
            'at_risk' => 'At Risk',
            'completed' => 'Completed',
            'archived' => 'Archived',
            default => $status,
        };
    }

    private function resolveHealthTier(CrmProject $project): string
    {
        if (! $project->relationLoaded('healthSnapshots')) {
            return 'Unknown';
        }

        $latest = $project->healthSnapshots()->latest()->first();
        $score = $latest?->score ?? 100;

        return match (true) {
            $score >= 80 => 'On Track',
            $score >= 50 => 'At Risk',
            default => 'Behind',
        };
    }
}
