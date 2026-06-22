<?php

namespace App\Services\Crm\Projects\Health\Contributors;

use App\Models\CrmProject;

class ScheduleVarianceContributor implements ContributorInterface
{
    public function calculate(CrmProject $project): array
    {
        $milestones = $project->milestones()->get(['status', 'end_date', 'actual_end_date']);

        if ($milestones->isEmpty()) {
            return ['name' => 'Schedule Variance', 'key' => 'schedule_variance', 'label' => 'Schedule Variance', 'weight' => 25, 'max_score' => 25, 'score' => 0, 'details' => ['total' => 0, 'completed' => 0, 'on_time' => 0, 'delayed' => 0]];
        }

        $onTime = 0;
        $delayed = 0;

        foreach ($milestones as $milestone) {
            if ($milestone->status !== 'completed') {
                continue;
            }
            if ($milestone->actual_end_date !== null && $milestone->end_date !== null) {
                if ($milestone->actual_end_date <= $milestone->end_date) {
                    $onTime++;
                } else {
                    $delayed++;
                }
            } else {
                $onTime++;
            }
        }

        $completed = $onTime + $delayed;
        $pct = $completed > 0 ? round(($onTime / $completed) * 100) : 100;
        $score = (int) round(($pct / 100) * 25);

        return [
            'name' => 'Schedule Variance',
            'key' => 'schedule_variance',
            'label' => 'Schedule Variance',
            'weight' => 25,
            'max_score' => 25,
            'score' => $score,
            'details' => ['total' => $milestones->count(), 'completed' => $completed, 'on_time' => $onTime, 'delayed' => $delayed],
        ];
    }
}
