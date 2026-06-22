<?php

namespace App\Services\Crm\Projects\Health\Contributors;

use App\Models\CrmProject;

class MilestoneProgressContributor implements ContributorInterface
{
    public function calculate(CrmProject $project): array
    {
        $total = $project->milestones()->count();
        if ($total === 0) {
            return ['name' => 'Milestone Progress', 'key' => 'milestone_progress', 'label' => 'Milestone Progress', 'weight' => 25, 'max_score' => 25, 'score' => 0, 'details' => ['total' => 0, 'completed' => 0]];
        }

        $completed = $project->milestones()->where('status', 'completed')->count();
        $pct = (int) round(($completed / $total) * 100);
        $score = (int) round(($pct / 100) * 25);

        return [
            'name' => 'Milestone Progress',
            'key' => 'milestone_progress',
            'label' => 'Milestone Progress',
            'weight' => 25,
            'max_score' => 25,
            'score' => $score,
            'details' => ['total' => $total, 'completed' => $completed, 'percent_complete' => $pct],
        ];
    }
}
