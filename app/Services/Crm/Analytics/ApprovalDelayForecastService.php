<?php

namespace App\Services\Crm\Analytics;

use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use Illuminate\Support\Collection;

class ApprovalDelayForecastService
{
    public function pendingForecasts(): Collection
    {
        $pending = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_PENDING)
            ->with('flow')
            ->get();

        $flowAverages = $this->flowAverageResolution();

        return $pending->map(fn (CrmApprovalRequest $request) => [
            'approvalRequestId' => $request->id,
            'flowId' => $request->approval_flow_id,
            'flowName' => $request->flow?->name,
            'entityType' => $request->entity_type,
            'entityId' => $request->entity_id,
            'forecast' => $this->forecast(
                request: $request,
                elapsedMinutes: $request->requested_at !== null
                    ? (int) $request->requested_at->diffInMinutes(now())
                    : 0,
                flowAvgMinutes: $flowAverages->get($request->approval_flow_id),
            ),
        ]);
    }

    public function forecast(
        CrmApprovalRequest $request,
        int $elapsedMinutes,
        ?float $flowAvgMinutes,
    ): array {
        if ($flowAvgMinutes !== null) {
            $expectedRemaining = max(0, (int) round($flowAvgMinutes - $elapsedMinutes));
            $expectedTotal = $elapsedMinutes + $expectedRemaining;
            $confidence = $this->confidenceLevel($flowAvgMinutes, $elapsedMinutes, $request->flow);
        } else {
            $expectedRemaining = 1440;
            $expectedTotal = $elapsedMinutes + $expectedRemaining;
            $confidence = 'very_low';
        }

        return [
            'elapsedMinutes' => $elapsedMinutes,
            'expectedRemainingMinutes' => $expectedRemaining,
            'expectedTotalMinutes' => $expectedTotal,
            'expectedResolutionAt' => now()->addMinutes($expectedRemaining)->toIso8601String(),
            'confidence' => $confidence,
        ];
    }

    private function flowAverageResolution(): Collection
    {
        return CrmApprovalRequest::whereNotNull('resolution_time_minutes')
            ->get()
            ->groupBy('approval_flow_id')
            ->mapWithKeys(fn (Collection $group, int $flowId) => [
                $flowId => round($group->avg('resolution_time_minutes')),
            ]);
    }

    private function confidenceLevel(float $flowAvg, int $elapsed, $flow): string
    {
        $requests = CrmApprovalRequest::where('approval_flow_id', $flow?->id)
            ->whereNotNull('resolution_time_minutes')
            ->get();

        if ($requests->count() < 5) {
            return 'low';
        }

        $variance = $requests->avg(fn ($r) => abs($r->resolution_time_minutes - $flowAvg));
        $relativeVariance = $flowAvg > 0 ? $variance / $flowAvg : 1;

        if ($elapsed > $flowAvg * 0.8) {
            return 'high';
        }
        if ($relativeVariance < 0.3) {
            return 'high';
        }
        if ($relativeVariance < 0.5) {
            return 'medium';
        }

        return 'low';
    }
}
