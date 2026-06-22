import { Head } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import SegmentFilter from '@/components/crm/analytics/SegmentFilter';

interface WorkflowMetrics {
    total: number;
    completed: number;
    failed: number;
    paused: number;
    running: number;
    pending: number;
    skipped: number;
    successRate: number | null;
    failureRate: number | null;
    averageDurationSeconds: number | null;
}

interface ApprovalMetrics {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    escalated: number;
    cancelled: number;
    approvalRate: number | null;
    rejectionRate: number | null;
    escalationRate: number;
    averageResolutionTimeMinutes: number | null;
    averageFirstResponseMinutes: number | null;
}

interface WorkflowBreakdown {
    id: number;
    name: string;
    totalRuns: number;
    completed: number;
    failed: number;
    paused: number;
    successRate: number;
}

interface ActionStats {
    actionType: string;
    totalCount: number;
    failureCount: number;
    failureRate: number;
    averageDurationSeconds: number | null;
}

interface ApprovalFlowBreakdown {
    id: number;
    name: string;
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    escalated: number;
    avgResolutionMinutes: number | null;
    escalationRate: number;
}

interface ApproverStats {
    userId: number;
    userName: string | null;
    total: number;
    approved: number;
    rejected: number;
    abstained: number;
}

interface TrendDay {
    date: string;
    total: number;
    completed: number;
    failed: number;
    paused: number;
}

interface ApprovalTrendDay {
    date: string;
    total: number;
    approved: number;
    rejected: number;
}

interface WfTopWorkflow {
    workflowId: number;
    workflowName: string | null;
    totalRuns: number;
    completed: number;
    failed: number;
}

interface WfTopAction {
    actionType: string;
    totalCount: number;
    failureCount: number;
    failureRate: number;
}

interface WfFailureReason {
    workflowId: number;
    workflowName: string;
    totalRuns: number;
    failedRuns: number;
    failureRate: number;
    topActions: { actionType: string; failureCount: number; failurePercentage: number }[];
}

interface WfHeatmapCell {
    workflowId: number;
    workflowName: string;
    actionType: string;
    totalRuns: number;
    failures: number;
    failureRate: number;
}

interface WfSuccessTrend {
    week: string;
    label: string;
    totalRuns: number;
    completed: number;
    failed: number;
    successRate: number | null;
    failureRate: number | null;
}

interface WfSlowWorkflow {
    workflowId: number;
    workflowName: string | null;
    totalRuns: number;
    avgDurationSeconds: number;
    maxDurationSeconds: number;
    minDurationSeconds: number;
}

interface WfSlowAction {
    actionType: string;
    totalCount: number;
    avgDurationSeconds: number;
    maxDurationSeconds: number;
}

interface WfRetryCandidate {
    actionType: string;
    totalCount: number;
    failureCount: number;
    failureRate: number;
    isRetryable: boolean;
}

interface ApprovalBottleneck {
    flowId: number;
    flowName: string;
    stepOrder: number;
    stepName: string;
    approverType: string;
    totalDecisions: number;
    avgDecisionTimeMinutes: number;
    maxDecisionTimeMinutes: number;
}

interface ApproverSlow {
    userId: number;
    userName: string | null;
    totalDecisions: number;
    avgDecisionTimeMinutes: number;
    approved: number;
    rejected: number;
    approvalRate: number;
}

interface SlaRiskFlow {
    flowId: number;
    flowName: string;
    slaBreachMinutes: number | null;
    slaWarningMinutes: number | null;
    avgResolutionMinutes: number | null;
    totalCompleted: number;
    pendingCount: number;
    breachCount: number;
    riskLevel: string;
}

interface EscalationHotspot {
    flowId: number;
    flowName: string;
    totalRequests: number;
    escalatedCount: number;
    escalationRate: number;
    avgEscalationCount: number | null;
}

interface ThroughputDay {
    date: string;
    created: number;
    resolved: number;
    pending: number;
    approved: number;
    rejected: number;
}

interface Recommendation {
    type: string;
    severity: string;
    priority: number;
    message: string;
    entityId: number | null;
    entityName: string;
    entityType: string;
}

interface HealthEntry {
    entityId: number;
    entityName: string;
    entityType: string;
    score: number;
    status: string;
    factors: Record<string, unknown>;
}

interface Insight {
    type: string;
    severity: string;
    priority: number;
    message: string;
}

interface WorkflowRisk {
    workflowId: number | null;
    workflowName: string | null;
    riskScore: number | null;
    riskLevel: string;
    probability: number | null;
    factors: Record<string, unknown>;
}

interface SlaBreachPrediction {
    approvalRequestId: number;
    flowId: number;
    flowName: string | null;
    entityType: string;
    entityId: number;
    status: {
        elapsedMinutes: number;
        remainingMinutes: number;
        slaBreachMinutes: number;
        progressPercent: number;
        breachProbability: number;
        riskLevel: string;
        expectedRemainingMinutes: number;
        expectedResolutionMinutes: number;
        expectedResolutionAt: string;
    } | null;
}

interface DelayForecast {
    approvalRequestId: number;
    flowId: number;
    flowName: string | null;
    entityType: string;
    entityId: number;
    forecast: {
        elapsedMinutes: number;
        expectedRemainingMinutes: number;
        expectedTotalMinutes: number;
        expectedResolutionAt: string;
        confidence: string;
    };
}

interface VolumeForecastDay {
    date: string;
    predictedCount: number;
    lowerBound: number;
    upperBound: number;
}

interface VolumeForecast {
    type: string;
    dailyAverage: number;
    weeklyTrend: number;
    trendDirection: string;
    last30Summary: string;
    forecasts: VolumeForecastDay[];
}

interface Props {
    workflowMetrics: WorkflowMetrics;
    topTriggeredWorkflows: WfTopWorkflow[];
    topFailedActions: WfTopAction[];
    workflowDailyTrends: TrendDay[];
    workflowByWorkflow: WorkflowBreakdown[];
    actionPerformance: ActionStats[];
    approvalMetrics: ApprovalMetrics;
    approvalByFlow: ApprovalFlowBreakdown[];
    approvalDailyTrends: ApprovalTrendDay[];
    approverPerformance: ApproverStats[];
    workflowIntelligence: {
        topFailureReasons: WfFailureReason[];
        failureHeatmap: WfHeatmapCell[];
        successTrends: WfSuccessTrend[];
        slowestWorkflows: WfSlowWorkflow[];
        slowestActions: WfSlowAction[];
        retryCandidates: WfRetryCandidate[];
    };
    approvalIntelligence: {
        bottleneckSteps: ApprovalBottleneck[];
        slowestApprovers: ApproverSlow[];
        slaRiskFlows: SlaRiskFlow[];
        escalationHotspots: EscalationHotspot[];
        approvalThroughput: ThroughputDay[];
    };
    recommendations: Recommendation[];
    healthScores: {
        workflows: HealthEntry[];
        approvals: HealthEntry[];
    };
    insights: Insight[];
    predictions: {
        workflowRisks: WorkflowRisk[];
        slaBreaches: SlaBreachPrediction[];
        delayForecasts: DelayForecast[];
        workflowVolume: VolumeForecast;
        approvalVolume: VolumeForecast;
    };
}

export default function CrmAnalytics({
    workflowMetrics,
    topTriggeredWorkflows,
    topFailedActions,
    workflowDailyTrends,
    workflowByWorkflow,
    actionPerformance,
    approvalMetrics,
    approvalByFlow,
    approvalDailyTrends,
    approverPerformance,
    workflowIntelligence,
    approvalIntelligence,
    recommendations,
    healthScores,
    insights,
    predictions,
}: Props) {
    const [tab, setTab] = useState<'workflows' | 'approvals' | 'intelligence' | 'optimization' | 'predictions'>('workflows');

    const tabs = [
        { key: 'workflows' as const, label: 'Workflows' },
        { key: 'approvals' as const, label: 'Approvals' },
        { key: 'intelligence' as const, label: 'Intelligence' },
        { key: 'optimization' as const, label: 'Optimization' },
        { key: 'predictions' as const, label: 'Predictions' },
    ];

    const formatDuration = (seconds: number | null): string => {
        if (seconds === null) return '—';
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    const formatMinutes = (minutes: number | null): string => {
        if (minutes === null) return '—';
        if (minutes < 60) return `${minutes}m`;
        return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    };

    const formatPct = (value: number | null): string =>
        value !== null ? `${value}%` : '—';

    const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowBreakdown[] | null>(null);
    const [filteredApprovals, setFilteredApprovals] = useState<ApprovalFlowBreakdown[] | null>(null);
    const [segmentExpression, setSegmentExpression] = useState('');
    const [matchInfo, setMatchInfo] = useState<{ count: number; total: number; percentage: number } | null>(null);

    const handleSegmentFilter = useCallback(async (tab: 'workflows' | 'approvals', expression: string) => {
        try {
            const res = await fetch('/crm/analytics/api/segment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ tab, expression }),
            });
            const data = await res.json();
            setSegmentExpression(expression);
            setMatchInfo({ count: data.count, total: data.total, percentage: data.percentage });
            if (tab === 'workflows') {
                setFilteredWorkflows(data.items as WorkflowBreakdown[]);
            } else {
                setFilteredApprovals(data.items as ApprovalFlowBreakdown[]);
            }
        } catch {
            // fallback: show all
        }
    }, []);

    const handleSegmentClear = useCallback((tab: 'workflows' | 'approvals') => {
        setSegmentExpression('');
        setMatchInfo(null);
        if (tab === 'workflows') {
            setFilteredWorkflows(null);
        } else {
            setFilteredApprovals(null);
        }
    }, []);

    const displayWorkflows = filteredWorkflows ?? workflowByWorkflow;
    const displayApprovals = filteredApprovals ?? approvalByFlow;
    const isFiltered = segmentExpression !== '';

    return (
        <>
            <Head title="CRM · Analytics" />

            <div className="flex h-full flex-col">
                <div className="border-b border-[#1e1e2a] px-6 py-2.5">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-medium text-[#e8e8ed]">Analytics</h1>
                        <div className="flex gap-1 rounded-lg border border-[#1e1e2a] p-0.5">
                            {tabs.map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={cn(
                                        'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                                        tab === t.key
                                            ? 'bg-[#2B4C8C] text-white'
                                            : 'text-[#555570] hover:text-[#8b8b9e]',
                                    )}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-6xl space-y-6 p-6">
                        {tab === 'workflows' && (
                            <>
                                <div className="grid grid-cols-5 gap-4">
                                    <MetricCard label="Total Runs" value={workflowMetrics.total} color="text-[#e8e8ed]" />
                                    <MetricCard label="Success Rate" value={formatPct(workflowMetrics.successRate)} color="text-green-400" />
                                    <MetricCard label="Failure Rate" value={formatPct(workflowMetrics.failureRate)} color="text-red-400" />
                                    <MetricCard label="Avg Duration" value={formatDuration(workflowMetrics.averageDurationSeconds)} color="text-blue-400" />
                                    <MetricCard label="Running / Paused" value={`${workflowMetrics.running} / ${workflowMetrics.paused}`} color="text-yellow-400" />
                                </div>

                                {topTriggeredWorkflows.length > 0 && (
                                    <DataTable title="Top Triggered Workflows" cols={['Workflow', 'Total Runs', 'Completed', 'Failed']}>
                                        {topTriggeredWorkflows.map((w, i) => (
                                            <tr key={w.workflowId} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">
                                                    <span className="mr-2 text-[10px] text-[#555570]">#{i + 1}</span>
                                                    {w.workflowName ?? `Workflow #${w.workflowId}`}
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{w.totalRuns}</td>
                                                <td className="px-4 py-2.5 text-xs text-green-400">{w.completed}</td>
                                                <td className="px-4 py-2.5 text-xs text-red-400">{w.failed}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {topFailedActions.length > 0 && (
                                    <DataTable title="Top Failed Actions" cols={['Action Type', 'Total', 'Failures', 'Failure Rate']}>
                                        {topFailedActions.map((a) => (
                                            <tr key={a.actionType} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{a.actionType}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{a.totalCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-red-400">{a.failureCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatPct(a.failureRate)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                <SegmentFilter
                                    tab="workflows"
                                    onFilter={(expr) => handleSegmentFilter('workflows', expr)}
                                    onClear={() => handleSegmentClear('workflows')}
                                    isActive={isFiltered && tab === 'workflows'}
                                    matchInfo={isFiltered && tab === 'workflows' ? matchInfo : null}
                                />

                                {displayWorkflows.length > 0 && (
                                    <DataTable title={isFiltered && tab === 'workflows' ? 'Workflow Performance (Filtered)' : 'Workflow Performance'} cols={['Workflow', 'Runs', 'Completed', 'Failed', 'Paused', 'Success Rate']}>
                                        {displayWorkflows.map((w) => (
                                            <tr key={w.id} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{w.name}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{w.totalRuns}</td>
                                                <td className="px-4 py-2.5 text-xs text-green-400">{w.completed}</td>
                                                <td className="px-4 py-2.5 text-xs text-red-400">{w.failed}</td>
                                                <td className="px-4 py-2.5 text-xs text-yellow-400">{w.paused}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatPct(w.successRate)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {actionPerformance.length > 0 && (
                                    <DataTable title="Action Performance" cols={['Action Type', 'Total', 'Failures', 'Failure Rate', 'Avg Duration']}>
                                        {actionPerformance.map((a) => (
                                            <tr key={a.actionType} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{a.actionType}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{a.totalCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-red-400">{a.failureCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatPct(a.failureRate)}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatDuration(a.averageDurationSeconds)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {workflowDailyTrends.length > 0 && (
                                    <CollapsibleTable title="Daily Trends (30 days)" cols={['Date', 'Total', 'Completed', 'Failed', 'Paused']}>
                                        {workflowDailyTrends.map((d) => (
                                            <tr key={d.date} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2 text-[10px] text-[#555570]">{d.date}</td>
                                                <td className="px-4 py-2 text-[10px] text-[#8b8b9e]">{d.total}</td>
                                                <td className="px-4 py-2 text-[10px] text-green-400">{d.completed}</td>
                                                <td className="px-4 py-2 text-[10px] text-red-400">{d.failed}</td>
                                                <td className="px-4 py-2 text-[10px] text-yellow-400">{d.paused}</td>
                                            </tr>
                                        ))}
                                    </CollapsibleTable>
                                )}

                                {workflowMetrics.total === 0 && (
                                    <EmptyState message="No workflow runs yet. Run a workflow to see analytics." />
                                )}
                            </>
                        )}

                        {tab === 'approvals' && (
                            <>
                                <div className="grid grid-cols-5 gap-4">
                                    <MetricCard label="Total Requests" value={approvalMetrics.total} color="text-[#e8e8ed]" />
                                    <MetricCard label="Pending" value={approvalMetrics.pending} color="text-yellow-400" />
                                    <MetricCard label="Approval Rate" value={formatPct(approvalMetrics.approvalRate)} color="text-green-400" />
                                    <MetricCard label="Avg Cycle Time" value={formatMinutes(approvalMetrics.averageResolutionTimeMinutes)} color="text-blue-400" />
                                    <MetricCard label="Escalation Rate" value={formatPct(approvalMetrics.escalationRate)} color="text-orange-400" />
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <MetricCard label="Approved" value={approvalMetrics.approved} color="text-green-400" />
                                    <MetricCard label="Rejected" value={approvalMetrics.rejected} color="text-red-400" />
                                    <MetricCard label="Expired" value={approvalMetrics.expired} color="text-[#555570]" />
                                    <MetricCard label="Avg First Response" value={formatMinutes(approvalMetrics.averageFirstResponseMinutes)} color="text-blue-400" />
                                </div>

                                <SegmentFilter
                                    tab="approvals"
                                    onFilter={(expr) => handleSegmentFilter('approvals', expr)}
                                    onClear={() => handleSegmentClear('approvals')}
                                    isActive={isFiltered && tab === 'approvals'}
                                    matchInfo={isFiltered && tab === 'approvals' ? matchInfo : null}
                                />

                                {displayApprovals.length > 0 && (
                                    <DataTable title={isFiltered && tab === 'approvals' ? 'Approval by Flow (Filtered)' : 'Approval by Flow'} cols={['Flow', 'Total', 'Approved', 'Rejected', 'Pending', 'Escalated', 'Avg Resolution', 'Escalation Rate']}>
                                        {displayApprovals.map((f) => (
                                            <tr key={f.id} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{f.name}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{f.total}</td>
                                                <td className="px-4 py-2.5 text-xs text-green-400">{f.approved}</td>
                                                <td className="px-4 py-2.5 text-xs text-red-400">{f.rejected}</td>
                                                <td className="px-4 py-2.5 text-xs text-yellow-400">{f.pending}</td>
                                                <td className="px-4 py-2.5 text-xs text-orange-400">{f.escalated}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatMinutes(f.avgResolutionMinutes)}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatPct(f.escalationRate)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {approverPerformance.length > 0 && (
                                    <DataTable title="Approver Performance" cols={['Approver', 'Total', 'Approved', 'Rejected', 'Abstained']}>
                                        {approverPerformance.map((a) => (
                                            <tr key={a.userId} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{a.userName ?? `User #${a.userId}`}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{a.total}</td>
                                                <td className="px-4 py-2.5 text-xs text-green-400">{a.approved}</td>
                                                <td className="px-4 py-2.5 text-xs text-red-400">{a.rejected}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#555570]">{a.abstained}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {approvalDailyTrends.length > 0 && (
                                    <CollapsibleTable title="Daily Trends (30 days)" cols={['Date', 'Total', 'Approved', 'Rejected']}>
                                        {approvalDailyTrends.map((d) => (
                                            <tr key={d.date} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2 text-[10px] text-[#555570]">{d.date}</td>
                                                <td className="px-4 py-2 text-[10px] text-[#8b8b9e]">{d.total}</td>
                                                <td className="px-4 py-2 text-[10px] text-green-400">{d.approved}</td>
                                                <td className="px-4 py-2 text-[10px] text-red-400">{d.rejected}</td>
                                            </tr>
                                        ))}
                                    </CollapsibleTable>
                                )}

                                {approvalMetrics.total === 0 && (
                                    <EmptyState message="No approval requests yet. Create an approval flow to see analytics." />
                                )}
                            </>
                        )}

                        {tab === 'intelligence' && (
                            <>
                                <div className="flex items-center gap-2 border-b border-[#1e1e2a] pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-[#555570]">Workflow Intelligence</span>
                                </div>

                                {workflowIntelligence.topFailureReasons.length > 0 && (
                                    <div className="space-y-4">
                                        <p className="text-[11px] font-medium text-[#e8e8ed]">Top Failure Reasons</p>
                                        {workflowIntelligence.topFailureReasons.map((w) => (
                                            <div key={w.workflowId} className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                                                <div className="flex items-baseline justify-between">
                                                    <p className="text-sm font-medium text-[#e8e8ed]">{w.workflowName}</p>
                                                    <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-[10px] text-red-400">{w.failureRate}% failure</span>
                                                </div>
                                                <p className="mt-1 text-[10px] text-[#555570]">{w.failedRuns} / {w.totalRuns} runs failed</p>
                                                {w.topActions.length > 0 && (
                                                    <div className="mt-3 space-y-1">
                                                        {w.topActions.map((a) => (
                                                            <div key={a.actionType} className="flex items-center gap-2">
                                                                <div
                                                                    className="h-1.5 rounded-full bg-red-400/30"
                                                                    style={{ width: `${Math.max(a.failurePercentage, 5)}%` }}
                                                                />
                                                                <span className="text-[10px] text-[#8b8b9e]">{a.actionType}</span>
                                                                <span className="text-[10px] text-red-400">{a.failureCount} ({a.failurePercentage}%)</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {workflowIntelligence.successTrends.length > 0 && (
                                    <DataTable title="Success Trends (Weekly)" cols={['Week', 'Total', 'Completed', 'Failed', 'Success Rate', 'Failure Rate']}>
                                        {workflowIntelligence.successTrends.map((w) => (
                                            <tr key={w.week} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2 text-[10px] text-[#555570]">{w.label}</td>
                                                <td className="px-4 py-2 text-xs text-[#8b8b9e]">{w.totalRuns}</td>
                                                <td className="px-4 py-2 text-xs text-green-400">{w.completed}</td>
                                                <td className="px-4 py-2 text-xs text-red-400">{w.failed}</td>
                                                <td className="px-4 py-2 text-xs text-green-400">{formatPct(w.successRate)}</td>
                                                <td className="px-4 py-2 text-xs text-red-400">{formatPct(w.failureRate)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {workflowIntelligence.slowestWorkflows.length > 0 && (
                                    <DataTable title="Slowest Workflows" cols={['Workflow', 'Runs', 'Avg Duration', 'Max', 'Min']}>
                                        {workflowIntelligence.slowestWorkflows.map((w) => (
                                            <tr key={w.workflowId} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{w.workflowName ?? `Workflow #${w.workflowId}`}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{w.totalRuns}</td>
                                                <td className="px-4 py-2.5 text-xs text-yellow-400">{formatDuration(w.avgDurationSeconds)}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatDuration(w.maxDurationSeconds)}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatDuration(w.minDurationSeconds)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {workflowIntelligence.slowestActions.length > 0 && (
                                    <DataTable title="Slowest Actions" cols={['Action Type', 'Count', 'Avg Duration', 'Max Duration']}>
                                        {workflowIntelligence.slowestActions.map((a) => (
                                            <tr key={a.actionType} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{a.actionType}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{a.totalCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-yellow-400">{formatDuration(a.avgDurationSeconds)}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatDuration(a.maxDurationSeconds)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {workflowIntelligence.retryCandidates.length > 0 && (
                                    <DataTable title="Retry Candidates" cols={['Action Type', 'Total', 'Failures', 'Failure Rate', 'Retryable']}>
                                        {workflowIntelligence.retryCandidates.map((a) => (
                                            <tr key={a.actionType} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{a.actionType}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{a.totalCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-red-400">{a.failureCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatPct(a.failureRate)}</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <span className={cn('rounded-full px-2 py-0.5 text-[10px]', a.isRetryable ? 'bg-green-400/10 text-green-400' : 'bg-[#1a1a24] text-[#555570]')}>
                                                        {a.isRetryable ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {workflowIntelligence.failureHeatmap.length > 0 && (
                                    <CollapsibleTable title="Failure Heatmap (Workflow × Action)" cols={['Workflow', 'Action Type', 'Total Runs', 'Failures', 'Failure Rate']}>
                                        {workflowIntelligence.failureHeatmap.map((h, i) => (
                                            <tr key={i} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2 text-[10px] text-[#e8e8ed]">{h.workflowName}</td>
                                                <td className="px-4 py-2 text-[10px] text-[#8b8b9e]">{h.actionType}</td>
                                                <td className="px-4 py-2 text-[10px] text-[#8b8b9e]">{h.totalRuns}</td>
                                                <td className="px-4 py-2 text-[10px] text-red-400">{h.failures}</td>
                                                <td className="px-4 py-2 text-[10px] text-[#8b8b9e]">{formatPct(h.failureRate)}</td>
                                            </tr>
                                        ))}
                                    </CollapsibleTable>
                                )}

                                <div className="mt-8 flex items-center gap-2 border-b border-[#1e1e2a] pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-[#555570]">Approval Intelligence</span>
                                </div>

                                {approvalIntelligence.bottleneckSteps.length > 0 && (
                                    <DataTable title="Bottleneck Steps" cols={['Flow', 'Step', 'Type', 'Decisions', 'Avg Time', 'Max Time']}>
                                        {approvalIntelligence.bottleneckSteps.map((b, i) => (
                                            <tr key={i} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{b.flowName}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">Step {b.stepOrder}: {b.stepName}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#555570]">{b.approverType}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{b.totalDecisions}</td>
                                                <td className="px-4 py-2.5 text-xs text-yellow-400">{formatMinutes(b.avgDecisionTimeMinutes)}</td>
                                                <td className="px-4 py-2.5 text-xs text-red-400">{formatMinutes(b.maxDecisionTimeMinutes)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {approvalIntelligence.slowestApprovers.length > 0 && (
                                    <DataTable title="Slowest Approvers" cols={['Approver', 'Decisions', 'Avg Decision Time', 'Approved', 'Rejected', 'Approval Rate']}>
                                        {approvalIntelligence.slowestApprovers.map((a) => (
                                            <tr key={a.userId} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{a.userName ?? `User #${a.userId}`}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{a.totalDecisions}</td>
                                                <td className="px-4 py-2.5 text-xs text-yellow-400">{formatMinutes(a.avgDecisionTimeMinutes)}</td>
                                                <td className="px-4 py-2.5 text-xs text-green-400">{a.approved}</td>
                                                <td className="px-4 py-2.5 text-xs text-red-400">{a.rejected}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatPct(a.approvalRate)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {approvalIntelligence.slaRiskFlows.length > 0 && (
                                    <DataTable title="SLA Risk Assessment" cols={['Flow', 'SLA (min)', 'Avg Resolution', 'Breaches', 'Pending', 'Risk']}>
                                        {approvalIntelligence.slaRiskFlows.map((f) => (
                                            <tr key={f.flowId} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{f.flowName}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{f.slaBreachMinutes ?? '—'}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatMinutes(f.avgResolutionMinutes)}</td>
                                                <td className="px-4 py-2.5 text-xs text-red-400">{f.breachCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-yellow-400">{f.pendingCount}</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <span className={cn(
                                                        'rounded-full px-2 py-0.5 text-[10px]',
                                                        f.riskLevel === 'high' ? 'bg-red-400/10 text-red-400' :
                                                            f.riskLevel === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                                                                'bg-green-400/10 text-green-400',
                                                    )}>
                                                        {f.riskLevel}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {approvalIntelligence.escalationHotspots.length > 0 && (
                                    <DataTable title="Escalation Hotspots" cols={['Flow', 'Requests', 'Escalated', 'Escalation Rate', 'Avg Escalations']}>
                                        {approvalIntelligence.escalationHotspots.map((h) => (
                                            <tr key={h.flowId} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{h.flowName}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{h.totalRequests}</td>
                                                <td className="px-4 py-2.5 text-xs text-orange-400">{h.escalatedCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{formatPct(h.escalationRate)}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{h.avgEscalationCount ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {approvalIntelligence.approvalThroughput.length > 0 && (
                                    <CollapsibleTable title="Approval Throughput (30 days)" cols={['Date', 'Created', 'Resolved', 'Pending', 'Approved', 'Rejected']}>
                                        {approvalIntelligence.approvalThroughput.map((d) => (
                                            <tr key={d.date} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2 text-[10px] text-[#555570]">{d.date}</td>
                                                <td className="px-4 py-2 text-[10px] text-[#8b8b9e]">{d.created}</td>
                                                <td className="px-4 py-2 text-[10px] text-green-400">{d.resolved}</td>
                                                <td className="px-4 py-2 text-[10px] text-yellow-400">{d.pending}</td>
                                                <td className="px-4 py-2 text-[10px] text-green-400">{d.approved}</td>
                                                <td className="px-4 py-2 text-[10px] text-red-400">{d.rejected}</td>
                                            </tr>
                                        ))}
                                    </CollapsibleTable>
                                )}

                                {workflowIntelligence.topFailureReasons.length === 0 && approvalIntelligence.bottleneckSteps.length === 0 && (
                                    <EmptyState message="Not enough data for intelligence insights. Run more workflows and process more approvals." />
                                )}
                            </>
                        )}

                        {tab === 'optimization' && (
                            <>
                                <div className="flex items-center gap-2 border-b border-[#1e1e2a] pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-[#555570]">Health Scores</span>
                                </div>

                                {healthScores.workflows.length > 0 && (
                                    <DataTable title="Workflow Health" cols={['Workflow', 'Score', 'Status', 'Success Rate', 'Failure Rate', 'Action Failure Rate']}>
                                        {healthScores.workflows.map((h) => (
                                            <tr key={h.entityId} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{h.entityName}</td>
                                                <td className="px-4 py-2.5 text-xs font-medium text-[#e8e8ed]">{h.score}/100</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <HealthBadge status={h.status} />
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-green-400">
                                                    {String(h.factors?.successRate ?? '')}%
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-red-400">
                                                    {String(h.factors?.failureRate ?? '')}%
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">
                                                    {String(h.factors?.actionFailureRate ?? '')}%
                                                </td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {healthScores.approvals.length > 0 && (
                                    <DataTable title="Approval Flow Health" cols={['Flow', 'Score', 'Status', 'Approval Rate', 'Escalation Rate', 'Pending']}>
                                        {healthScores.approvals.map((h) => (
                                            <tr key={h.entityId} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{h.entityName}</td>
                                                <td className="px-4 py-2.5 text-xs font-medium text-[#e8e8ed]">{h.score}/100</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <HealthBadge status={h.status} />
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-green-400">
                                                    {String(h.factors?.approvalRate ?? '')}%
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-orange-400">
                                                    {String(h.factors?.escalationRate ?? '')}%
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-yellow-400">
                                                    {String(h.factors?.pendingCount ?? '0')}
                                                </td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                <div className="mt-8 flex items-center gap-2 border-b border-[#1e1e2a] pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-[#555570]">Recommendations</span>
                                </div>

                                {recommendations.length === 0 && (
                                    <EmptyState message="No recommendations yet. Run more workflows and process approvals to get actionable suggestions." />
                                )}

                                <div className="space-y-3">
                                    {recommendations.map((r, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                'rounded-lg border p-4',
                                                r.severity === 'critical' ? 'border-red-400/20 bg-red-400/5' :
                                                    r.severity === 'warning' ? 'border-yellow-400/20 bg-yellow-400/5' :
                                                        'border-[#1e1e2a] bg-[#0f0f14]',
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                            r.severity === 'critical' ? 'bg-red-400/10 text-red-400' :
                                                                r.severity === 'warning' ? 'bg-yellow-400/10 text-yellow-400' :
                                                                    'bg-blue-400/10 text-blue-400',
                                                        )}>
                                                            {r.severity}
                                                        </span>
                                                        <span className="text-[10px] text-[#555570]">{r.type}</span>
                                                        <span className="text-[10px] text-[#555570]">·</span>
                                                        <span className="text-[10px] text-[#555570]">{r.entityType}</span>
                                                    </div>
                                                    <p className="mt-1.5 text-xs text-[#e8e8ed] leading-relaxed">{r.message}</p>
                                                    {r.entityName && (
                                                        <p className="mt-1 text-[10px] text-[#555570]">
                                                            Entity: {r.entityName}{r.entityId ? ` (#${r.entityId})` : ''}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                    r.priority >= 80 ? 'bg-red-400/10 text-red-400' :
                                                        r.priority >= 60 ? 'bg-yellow-400/10 text-yellow-400' :
                                                            'bg-blue-400/10 text-blue-400',
                                                )}>
                                                    P{r.priority}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex items-center gap-2 border-b border-[#1e1e2a] pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-[#555570]">Automation Insights</span>
                                </div>

                                {insights.length === 0 && (
                                    <EmptyState message="Not enough data for insights. Continue using the system to generate observations." />
                                )}

                                <div className="space-y-3">
                                    {insights.map((insight, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                'rounded-lg border p-4',
                                                insight.severity === 'critical' ? 'border-red-400/20 bg-red-400/5' :
                                                    insight.severity === 'warning' ? 'border-yellow-400/20 bg-yellow-400/5' :
                                                        'border-[#1e1e2a] bg-[#0f0f14]',
                                            )}
                                        >
                                            <div className="flex items-start gap-2">
                                                <span className={cn(
                                                    'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                    insight.severity === 'critical' ? 'bg-red-400/10 text-red-400' :
                                                        insight.severity === 'warning' ? 'bg-yellow-400/10 text-yellow-400' :
                                                            'bg-blue-400/10 text-blue-400',
                                                )}>
                                                    {insight.severity}
                                                </span>
                                                <p className="text-xs text-[#e8e8ed] leading-relaxed">{insight.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {tab === 'predictions' && (
                            <>
                                <div className="flex items-center gap-2 border-b border-[#1e1e2a] pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-[#555570]">Workflow Risk Predictions</span>
                                </div>

                                {predictions.workflowRisks.length === 0 && (
                                    <EmptyState message="Not enough data for risk predictions. Run more workflows to generate predictions." />
                                )}

                                {predictions.workflowRisks.length > 0 && (
                                    <DataTable
                                        title="Failure Risk by Workflow"
                                        cols={['Workflow', 'Risk Score', 'Risk Level', 'Probability', 'Recent Failure Rate', 'Overall Failure Rate', 'Trend']}
                                    >
                                        {predictions.workflowRisks.map((r, i) => (
                                            <tr key={r.workflowId ?? i} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{r.workflowName ?? `Workflow #${r.workflowId}`}</td>
                                                <td className="px-4 py-2.5 text-xs font-medium text-[#e8e8ed]">{r.riskScore !== null ? `${r.riskScore}/100` : '—'}</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <RiskBadge level={r.riskLevel} />
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{r.probability !== null ? `${Math.round(r.probability * 100)}%` : '—'}</td>
                                                <td className="px-4 py-2.5 text-xs text-red-400">{String(r.factors?.recentFailureRate ?? '')}%</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{String(r.factors?.overallFailureRate ?? '')}%</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <span className={cn(
                                                        'rounded-full px-2 py-0.5 text-[10px]',
                                                        r.factors?.trend === 'increasing' ? 'bg-red-400/10 text-red-400' :
                                                            r.factors?.trend === 'decreasing' ? 'bg-green-400/10 text-green-400' :
                                                                'bg-[#1a1a24] text-[#555570]',
                                                    )}>
                                                        {String(r.factors?.trend ?? 'stable')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                <div className="mt-8 flex items-center gap-2 border-b border-[#1e1e2a] pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-[#555570]">SLA Breach Predictions</span>
                                </div>

                                {predictions.slaBreaches.length === 0 && (
                                    <EmptyState message="No pending approval requests with SLA tracking. Set SLA thresholds on approval flows to see breach predictions." />
                                )}

                                {predictions.slaBreaches.length > 0 && (
                                    <DataTable
                                        title="Pending SLA Breach Risk"
                                        cols={['Request', 'Flow', 'Elapsed', 'Remaining', 'SLA (min)', 'Progress', 'Breach Probability', 'Risk', 'Expected Remaining']}
                                    >
                                        {predictions.slaBreaches.map((p) => (
                                            <tr key={p.approvalRequestId} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-[10px] text-[#e8e8ed]">#{p.approvalRequestId}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{p.flowName ?? `Flow #${p.flowId}`}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{p.status?.elapsedMinutes ?? '—'}m</td>
                                                <td className="px-4 py-2.5 text-xs text-yellow-400">{p.status?.remainingMinutes ?? '—'}m</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{p.status?.slaBreachMinutes ?? '—'}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{p.status?.progressPercent ?? '—'}%</td>
                                                <td className="px-4 py-2.5 text-xs font-medium text-[#e8e8ed]">{p.status?.breachProbability ?? '—'}%</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <RiskBadge level={p.status?.riskLevel ?? 'unknown'} />
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{p.status?.expectedRemainingMinutes ?? '—'}m</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                <div className="mt-8 flex items-center gap-2 border-b border-[#1e1e2a] pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-[#555570]">Approval Delay Forecasts</span>
                                </div>

                                {predictions.delayForecasts.length === 0 && (
                                    <EmptyState message="No pending approval requests to forecast. Pending requests will appear here with expected resolution times." />
                                )}

                                {predictions.delayForecasts.length > 0 && (
                                    <DataTable
                                        title="Expected Resolution Times"
                                        cols={['Request', 'Flow', 'Elapsed', 'Expected Remaining', 'Expected Total', 'Expected At', 'Confidence']}
                                    >
                                        {predictions.delayForecasts.map((f) => (
                                            <tr key={f.approvalRequestId} className="border-b border-[#1e1e2a]">
                                                <td className="px-4 py-2.5 text-[10px] text-[#e8e8ed]">#{f.approvalRequestId}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#e8e8ed]">{f.flowName ?? `Flow #${f.flowId}`}</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{f.forecast.elapsedMinutes}m</td>
                                                <td className="px-4 py-2.5 text-xs text-yellow-400">{f.forecast.expectedRemainingMinutes}m</td>
                                                <td className="px-4 py-2.5 text-xs text-[#8b8b9e]">{f.forecast.expectedTotalMinutes}m</td>
                                                <td className="px-4 py-2.5 text-[10px] text-[#555570]">{f.forecast.expectedResolutionAt}</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <ConfidenceBadge level={f.forecast.confidence} />
                                                </td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                <div className="mt-8 flex items-center gap-2 border-b border-[#1e1e2a] pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-[#555570]">Capacity Forecasts</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="mb-3 text-[11px] font-medium text-[#e8e8ed]">Workflow Volume — Next 7 Days</p>
                                        <p className="text-[10px] text-[#555570]">{predictions.workflowVolume.last30Summary}</p>
                                        <p className="mt-1 text-[10px] text-[#555570]">
                                            Daily avg: {predictions.workflowVolume.dailyAverage} · Trend: {predictions.workflowVolume.weeklyTrend}% ({predictions.workflowVolume.trendDirection})
                                        </p>
                                        {predictions.workflowVolume.forecasts.length > 0 && (
                                            <DataTable title="" cols={['Date', 'Predicted', 'Range']}>
                                                {predictions.workflowVolume.forecasts.map((d) => (
                                                    <tr key={d.date} className="border-b border-[#1e1e2a]">
                                                        <td className="px-4 py-2 text-[10px] text-[#555570]">{d.date}</td>
                                                        <td className="px-4 py-2 text-[10px] text-[#e8e8ed]">{d.predictedCount}</td>
                                                        <td className="px-4 py-2 text-[10px] text-[#555570]">{d.lowerBound}–{d.upperBound}</td>
                                                    </tr>
                                                ))}
                                            </DataTable>
                                        )}
                                    </div>
                                    <div>
                                        <p className="mb-3 text-[11px] font-medium text-[#e8e8ed]">Approval Volume — Next 7 Days</p>
                                        <p className="text-[10px] text-[#555570]">{predictions.approvalVolume.last30Summary}</p>
                                        <p className="mt-1 text-[10px] text-[#555570]">
                                            Daily avg: {predictions.approvalVolume.dailyAverage} · Trend: {predictions.approvalVolume.weeklyTrend}% ({predictions.approvalVolume.trendDirection})
                                        </p>
                                        {predictions.approvalVolume.forecasts.length > 0 && (
                                            <DataTable title="" cols={['Date', 'Predicted', 'Range']}>
                                                {predictions.approvalVolume.forecasts.map((d) => (
                                                    <tr key={d.date} className="border-b border-[#1e1e2a]">
                                                        <td className="px-4 py-2 text-[10px] text-[#555570]">{d.date}</td>
                                                        <td className="px-4 py-2 text-[10px] text-[#e8e8ed]">{d.predictedCount}</td>
                                                        <td className="px-4 py-2 text-[10px] text-[#555570]">{d.lowerBound}–{d.upperBound}</td>
                                                    </tr>
                                                ))}
                                            </DataTable>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function MetricCard({ label, value, color }: { label: string; value: string | number; color: string }) {
    return (
        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#555570]">{label}</p>
            <p className={cn('mt-1 text-xl font-semibold', color)}>{value}</p>
        </div>
    );
}

function DataTable({ title, cols, children }: { title: string; cols: string[]; children: React.ReactNode }) {
    return (
        <div className="overflow-hidden rounded-lg border border-[#1e1e2a]">
            <div className="border-b border-[#1e1e2a] bg-[#0a0a0f] px-4 py-2">
                <p className="text-[11px] font-medium text-[#e8e8ed]">{title}</p>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-[#1e1e2a] bg-[#0a0a0f]">
                        {cols.map((col) => (
                            <th key={col} className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

function CollapsibleTable({ title, cols, children }: { title: string; cols: string[]; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="overflow-hidden rounded-lg border border-[#1e1e2a]">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between border-b border-[#1e1e2a] bg-[#0a0a0f] px-4 py-2 text-left transition-colors hover:bg-[#12121a]"
            >
                <p className="text-[11px] font-medium text-[#e8e8ed]">{title}</p>
                <span className="text-[10px] text-[#555570]">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[#1e1e2a] bg-[#0a0a0f]">
                            {cols.map((col) => (
                                <th key={col} className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>{children}</tbody>
                </table>
            )}
        </div>
    );
}

function HealthBadge({ status }: { status: string }) {
    return (
        <span className={cn(
            'inline-block rounded-full px-2 py-0.5 text-[10px] capitalize',
            status === 'healthy' ? 'bg-green-400/10 text-green-400' :
                status === 'needs_attention' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-red-400/10 text-red-400',
        )}>
            {status === 'needs_attention' ? 'Needs Attention' : status}
        </span>
    );
}

function RiskBadge({ level }: { level: string }) {
    return (
        <span className={cn(
            'inline-block rounded-full px-2 py-0.5 text-[10px] capitalize',
            level === 'very_high' ? 'bg-red-400/10 text-red-400' :
                level === 'high' ? 'bg-orange-400/10 text-orange-400' :
                    level === 'moderate' ? 'bg-yellow-400/10 text-yellow-400' :
                        level === 'low' ? 'bg-green-400/10 text-green-400' :
                            'bg-[#1a1a24] text-[#555570]',
        )}>
            {level === 'very_high' ? 'Very High' : level}
        </span>
    );
}

function ConfidenceBadge({ level }: { level: string }) {
    return (
        <span className={cn(
            'inline-block rounded-full px-2 py-0.5 text-[10px] capitalize',
            level === 'high' ? 'bg-green-400/10 text-green-400' :
                level === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-[#1a1a24] text-[#555570]',
        )}>
            {level === 'very_low' ? 'Very Low' : level}
        </span>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-12 text-center">
            <p className="text-xs text-[#555570]">{message}</p>
        </div>
    );
}
