<?php

namespace App\Services\Crm\Analytics;

use App\Models\CrmApprovalDecision;
use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use Illuminate\Support\Collection;

class ApprovalAnalyticsService
{
    public function overview(): array
    {
        $total = CrmApprovalRequest::count();
        $pending = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_PENDING)->count();
        $approved = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_APPROVED)->count();
        $rejected = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_REJECTED)->count();
        $expired = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_EXPIRED)->count();
        $escalated = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_ESCALATED)->count();
        $cancelled = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_CANCELLED)->count();

        $decided = $approved + $rejected;
        $approvalRate = $decided > 0 ? round(($approved / $decided) * 100, 1) : null;
        $rejectionRate = $decided > 0 ? round(($rejected / $decided) * 100, 1) : null;

        $resolved = CrmApprovalRequest::whereNotNull('resolution_time_minutes')->get();
        $avgResolutionTime = $resolved->isNotEmpty()
            ? round($resolved->avg('resolution_time_minutes'))
            : null;

        $withFirstResponse = CrmApprovalRequest::whereNotNull('first_response_at')
            ->get(['requested_at', 'first_response_at']);
        $avgFirstResponse = $withFirstResponse->isNotEmpty()
            ? round($withFirstResponse->avg(fn ($r) => $r->requested_at->diffInMinutes($r->first_response_at, true)))
            : null;

        $effectiveTotal = max($total, 1);
        $escalationRate = round(($escalated / $effectiveTotal) * 100, 1);

        return [
            'total' => $total,
            'pending' => $pending,
            'approved' => $approved,
            'rejected' => $rejected,
            'expired' => $expired,
            'escalated' => $escalated,
            'cancelled' => $cancelled,
            'approvalRate' => $approvalRate,
            'rejectionRate' => $rejectionRate,
            'escalationRate' => $escalationRate,
            'averageResolutionTimeMinutes' => $avgResolutionTime,
            'averageFirstResponseMinutes' => $avgFirstResponse,
        ];
    }

    public function byFlow(): Collection
    {
        return CrmApprovalFlow::with('requests')
            ->get()
            ->filter(fn (CrmApprovalFlow $f) => $f->requests->isNotEmpty())
            ->map(fn (CrmApprovalFlow $f) => [
                'id' => $f->id,
                'name' => $f->name,
                'total' => $f->requests->count(),
                'approved' => $f->requests->where('status', ApprovalStatusCatalog::REQUEST_APPROVED)->count(),
                'rejected' => $f->requests->where('status', ApprovalStatusCatalog::REQUEST_REJECTED)->count(),
                'pending' => $f->requests->where('status', ApprovalStatusCatalog::REQUEST_PENDING)->count(),
                'escalated' => $f->requests->where('status', ApprovalStatusCatalog::REQUEST_ESCALATED)->count(),
                'avgResolutionMinutes' => (function () use ($f) {
                    $resolved = $f->requests->filter(fn ($r) => $r->resolution_time_minutes !== null);

                    return $resolved->isNotEmpty() ? round($resolved->avg('resolution_time_minutes')) : null;
                })(),
                'escalationRate' => $f->requests->count() > 0
                    ? round(($f->requests->where('status', ApprovalStatusCatalog::REQUEST_ESCALATED)->count() / $f->requests->count()) * 100, 1)
                    : 0,
            ])
            ->sortByDesc('total')
            ->values();
    }

    public function dailyTrends(int $days = 30): Collection
    {
        $since = now()->subDays($days)->startOfDay();

        $requests = CrmApprovalRequest::where('created_at', '>=', $since)
            ->get(['created_at', 'status']);

        $dates = collect();
        for ($i = $days; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayReqs = $requests->filter(fn ($r) => $r->created_at->format('Y-m-d') === $date);
            $dates->push([
                'date' => $date,
                'total' => $dayReqs->count(),
                'approved' => $dayReqs->where('status', ApprovalStatusCatalog::REQUEST_APPROVED)->count(),
                'rejected' => $dayReqs->where('status', ApprovalStatusCatalog::REQUEST_REJECTED)->count(),
            ]);
        }

        return $dates;
    }

    public function approverPerformance(): Collection
    {
        return CrmApprovalDecision::select('user_id', 'decision')
            ->with('user:id,name')
            ->get()
            ->groupBy('user_id')
            ->map(fn (Collection $group, int $userId) => [
                'userId' => $userId,
                'userName' => $group->first()->user?->name,
                'total' => $group->count(),
                'approved' => $group->where('decision', ApprovalStatusCatalog::DECISION_APPROVED)->count(),
                'rejected' => $group->where('decision', ApprovalStatusCatalog::DECISION_REJECTED)->count(),
                'abstained' => $group->where('decision', ApprovalStatusCatalog::DECISION_ABSTAINED)->count(),
            ])
            ->sortByDesc('total')
            ->values();
    }
}
