<?php

namespace App\Services\Crm\Projects\Health\Contributors;

use App\Models\CrmProject;

class IssueImpactContributor implements ContributorInterface
{
    private const SEVERITY_WEIGHTS = [
        'blocker' => -8,
        'critical' => -6,
        'major' => -4,
        'minor' => -2,
    ];

    public function calculate(CrmProject $project): array
    {
        $openIssues = $project->issues()->whereIn('status', ['open', 'in_progress'])->get(['severity']);

        if ($openIssues->isEmpty()) {
            return ['name' => 'Issue Impact', 'key' => 'issue_impact', 'label' => 'Issue Impact', 'weight' => 15, 'max_score' => 15, 'score' => 15, 'details' => ['open_count' => 0, 'blocker_count' => 0]];
        }

        $deduction = 0;
        $blockerCount = 0;

        foreach ($openIssues as $issue) {
            $weight = self::SEVERITY_WEIGHTS[$issue->severity] ?? -4;
            $deduction += $weight;
            if ($issue->severity === 'blocker') {
                $blockerCount++;
            }
        }

        $score = max(0, 15 + $deduction);

        return [
            'name' => 'Issue Impact',
            'key' => 'issue_impact',
            'label' => 'Issue Impact',
            'weight' => 15,
            'max_score' => 15,
            'score' => $score,
            'details' => ['open_count' => $openIssues->count(), 'blocker_count' => $blockerCount],
        ];
    }
}
