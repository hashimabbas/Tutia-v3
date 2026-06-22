<?php

namespace App\Services\Crm\Projects\Health\Contributors;

use App\Models\CrmProject;

class RiskImpactContributor implements ContributorInterface
{
    private const SEVERITY_WEIGHTS = [
        'critical' => -8,
        'high' => -5,
        'medium' => -3,
        'low' => -1,
    ];

    public function calculate(CrmProject $project): array
    {
        $openRisks = $project->risks()->whereIn('status', ['identified', 'being_mitigated'])->get(['severity']);

        if ($openRisks->isEmpty()) {
            return ['name' => 'Risk Impact', 'key' => 'risk_impact', 'label' => 'Risk Impact', 'weight' => 20, 'max_score' => 20, 'score' => 20, 'details' => ['open_count' => 0, 'critical_count' => 0]];
        }

        $deduction = 0;
        $criticalCount = 0;

        foreach ($openRisks as $risk) {
            $weight = self::SEVERITY_WEIGHTS[$risk->severity] ?? -3;
            $deduction += $weight;
            if ($risk->severity === 'critical') {
                $criticalCount++;
            }
        }

        $score = max(0, 20 + $deduction);

        return [
            'name' => 'Risk Impact',
            'key' => 'risk_impact',
            'label' => 'Risk Impact',
            'weight' => 20,
            'max_score' => 20,
            'score' => $score,
            'details' => ['open_count' => $openRisks->count(), 'critical_count' => $criticalCount],
        ];
    }
}
