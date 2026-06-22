<?php

namespace App\Services\Crm\Analytics;

use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use Illuminate\Support\Collection;

class SlaBreachPredictionService
{
    public function pendingBreachRisks(): Collection
    {
        $pending = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_PENDING)
            ->whereHas('flow', fn ($q) => $q->whereNotNull('sla_breach_minutes'))
            ->with('flow')
            ->get();

        $flowStats = $this->flowResolutionStats();

        return $pending->map(fn (CrmApprovalRequest $request) => [
            'approvalRequestId' => $request->id,
            'flowId' => $request->approval_flow_id,
            'flowName' => $request->flow?->name,
            'entityType' => $request->entity_type,
            'entityId' => $request->entity_id,
            'status' => $this->predict(
                request: $request,
                elapsedMinutes: $request->requested_at !== null
                    ? (int) $request->requested_at->diffInMinutes(now())
                    : 0,
                slaBreachMinutes: $request->flow?->sla_breach_minutes ?? 0,
                flowStats: $flowStats->get($request->approval_flow_id),
            ),
        ])->filter(fn ($p) => $p['status'] !== null)->values();
    }

    public function predict(
        CrmApprovalRequest $request,
        int $elapsedMinutes,
        int $slaBreachMinutes,
        ?array $flowStats,
    ): ?array {
        if ($slaBreachMinutes <= 0) {
            return null;
        }

        $progress = $slaBreachMinutes > 0 ? round(($elapsedMinutes / $slaBreachMinutes) * 100, 1) : 0;
        $remainingMinutes = max(0, $slaBreachMinutes - $elapsedMinutes);

        $historicalAvg = $flowStats['avgResolutionMinutes'] ?? null;

        $baseRisk = $progress;

        if ($historicalAvg !== null && $historicalAvg > 0) {
            $historicalRisk = min(100, round(($elapsedMinutes / $historicalAvg) * 100));
            $baseRisk = ($progress * 0.4) + ($historicalRisk * 0.6);
        }

        if ($flowStats !== null) {
            $escalationRate = $flowStats['escalationRate'] ?? 0;
            $baseRisk = min(100, $baseRisk + ($escalationRate * 0.2));
        }

        if ($progress >= 100) {
            $baseRisk = 100;
        }

        $baseRisk = min(100, max(0, (int) round($baseRisk)));

        $riskLevel = $baseRisk >= 75 ? 'very_high'
            : ($baseRisk >= 50 ? 'high'
                : ($baseRisk >= 25 ? 'moderate' : 'low'));

        $expectedRemaining = $historicalAvg !== null
            ? max(0, $historicalAvg - $elapsedMinutes)
            : $remainingMinutes;

        $expectedResolutionMinutes = $elapsedMinutes + $expectedRemaining;

        return [
            'elapsedMinutes' => $elapsedMinutes,
            'remainingMinutes' => $remainingMinutes,
            'slaBreachMinutes' => $slaBreachMinutes,
            'progressPercent' => $progress,
            'breachProbability' => $baseRisk,
            'riskLevel' => $riskLevel,
            'expectedRemainingMinutes' => max(0, $expectedRemaining),
            'expectedResolutionMinutes' => $expectedResolutionMinutes,
            'expectedResolutionAt' => now()->addMinutes($expectedRemaining)->toIso8601String(),
        ];
    }

    private function flowResolutionStats(): Collection
    {
        return CrmApprovalFlow::with('requests')
            ->get()
            ->mapWithKeys(fn (CrmApprovalFlow $f) => [
                $f->id => [
                    'avgResolutionMinutes' => (function () use ($f) {
                        $resolved = $f->requests->filter(fn ($r) => $r->resolution_time_minutes !== null);

                        return $resolved->isNotEmpty() ? $resolved->avg('resolution_time_minutes') : null;
                    })(),
                    'escalationRate' => $f->requests->count() > 0
                        ? round(($f->requests->where('status', ApprovalStatusCatalog::REQUEST_ESCALATED)->count() / $f->requests->count()) * 100, 1)
                        : 0,
                ],
            ]);
    }
}
