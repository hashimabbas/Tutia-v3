<?php

namespace App\Services\Crm\Projects\Health\Contributors;

use App\Models\CrmProject;

class ChangeOrderStabilityContributor implements ContributorInterface
{
    public function calculate(CrmProject $project): array
    {
        $count = $project->changeOrders()->approved()->count();

        $score = match (true) {
            $count <= 2 => 5,
            $count <= 5 => 3,
            default => 0,
        };

        return [
            'name' => 'Change Order Stability',
            'key' => 'change_order_stability',
            'label' => 'Change Order Stability',
            'weight' => 5,
            'max_score' => 5,
            'score' => $score,
            'details' => ['approved_change_orders' => $count],
        ];
    }
}
