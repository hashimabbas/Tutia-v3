import { Head, usePage } from '@inertiajs/react';
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

interface RecommendationReason {
    label: string;
    value: string;
    severity: string;
}

interface RecommendationExplanation {
    summary: string;
    reasons: RecommendationReason[];
    recommendedActions: string[];
}

interface Recommendation {
    type: string;
    severity: string;
    priority: number;
    message: string;
    entityId: number | null;
    entityName: string;
    entityType: string;
    explanation: RecommendationExplanation | null;
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
    const { url } = usePage();
    const params = new URLSearchParams(url.split('?')[1] ?? '');
    const initialTab = params.get('tab') as 'workflows' | 'approvals' | 'intelligence' | 'optimization' | 'predictions' | null;
    const validTabs = ['workflows', 'approvals', 'intelligence', 'optimization', 'predictions'];
    const [tab, setTab] = useState<'workflows' | 'approvals' | 'intelligence' | 'optimization' | 'predictions'>(
        initialTab && validTabs.includes(initialTab) ? initialTab : 'workflows'
    );
    const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
    const toggleCard = (i: number) => setExpandedCards((prev) => ({ ...prev, [i]: !prev[i] }));

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
                <div className="border-b border-border/70 px-6 py-2.5">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-medium text-foreground">Analytics</h1>
                        <div className="flex gap-1 rounded-lg border border-border/70 p-0.5">
                            {tabs.map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={cn(
                                        'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                                        tab === t.key
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-muted-foreground/70',
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
                                    <MetricCard label="Total Runs" value={workflowMetrics.total} color="text-foreground" />
                                    <MetricCard label="Success Rate" value={formatPct(workflowMetrics.successRate)} color="text-success" />
                                    <MetricCard label="Failure Rate" value={formatPct(workflowMetrics.failureRate)} color="text-error" />
                                    <MetricCard label="Avg Duration" value={formatDuration(workflowMetrics.averageDurationSeconds)} color="text-info" />
                                    <MetricCard label="Running / Paused" value={`${workflowMetrics.running} / ${workflowMetrics.paused}`} color="text-warning" />
                                </div>

                                {topTriggeredWorkflows.length > 0 && (
                                    <DataTable title="Top Triggered Workflows" cols={['Workflow', 'Total Runs', 'Completed', 'Failed']}>
                                        {topTriggeredWorkflows.map((w, i) => (
                                            <tr key={w.workflowId} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">
                                                    <span className="mr-2 text-[10px] text-muted-foreground">#{i + 1}</span>
                                                    {w.workflowName ?? `Workflow #${w.workflowId}`}
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{w.totalRuns}</td>
                                                <td className="px-4 py-2.5 text-xs text-success">{w.completed}</td>
                                                <td className="px-4 py-2.5 text-xs text-error">{w.failed}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {topFailedActions.length > 0 && (
                                    <DataTable title="Top Failed Actions" cols={['Action Type', 'Total', 'Failures', 'Failure Rate']}>
                                        {topFailedActions.map((a) => (
                                            <tr key={a.actionType} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{a.actionType}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{a.totalCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-error">{a.failureCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatPct(a.failureRate)}</td>
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
                                            <tr key={w.id} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{w.name}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{w.totalRuns}</td>
                                                <td className="px-4 py-2.5 text-xs text-success">{w.completed}</td>
                                                <td className="px-4 py-2.5 text-xs text-error">{w.failed}</td>
                                                <td className="px-4 py-2.5 text-xs text-warning">{w.paused}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatPct(w.successRate)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {actionPerformance.length > 0 && (
                                    <DataTable title="Action Performance" cols={['Action Type', 'Total', 'Failures', 'Failure Rate', 'Avg Duration']}>
                                        {actionPerformance.map((a) => (
                                            <tr key={a.actionType} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{a.actionType}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{a.totalCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-error">{a.failureCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatPct(a.failureRate)}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatDuration(a.averageDurationSeconds)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {workflowDailyTrends.length > 0 && (
                                    <CollapsibleTable title="Daily Trends (30 days)" cols={['Date', 'Total', 'Completed', 'Failed', 'Paused']}>
                                        {workflowDailyTrends.map((d) => (
                                            <tr key={d.date} className="border-b border-border/70">
                                                <td className="px-4 py-2 text-[10px] text-muted-foreground">{d.date}</td>
                                                <td className="px-4 py-2 text-[10px] text-muted-foreground/70">{d.total}</td>
                                                <td className="px-4 py-2 text-[10px] text-success">{d.completed}</td>
                                                <td className="px-4 py-2 text-[10px] text-error">{d.failed}</td>
                                                <td className="px-4 py-2 text-[10px] text-warning">{d.paused}</td>
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
                                    <MetricCard label="Total Requests" value={approvalMetrics.total} color="text-foreground" />
                                    <MetricCard label="Pending" value={approvalMetrics.pending} color="text-warning" />
                                    <MetricCard label="Approval Rate" value={formatPct(approvalMetrics.approvalRate)} color="text-success" />
                                    <MetricCard label="Avg Cycle Time" value={formatMinutes(approvalMetrics.averageResolutionTimeMinutes)} color="text-info" />
                                    <MetricCard label="Escalation Rate" value={formatPct(approvalMetrics.escalationRate)} color="text-orange-400" />
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <MetricCard label="Approved" value={approvalMetrics.approved} color="text-success" />
                                    <MetricCard label="Rejected" value={approvalMetrics.rejected} color="text-error" />
                                    <MetricCard label="Expired" value={approvalMetrics.expired} color="text-muted-foreground" />
                                    <MetricCard label="Avg First Response" value={formatMinutes(approvalMetrics.averageFirstResponseMinutes)} color="text-info" />
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
                                            <tr key={f.id} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{f.name}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{f.total}</td>
                                                <td className="px-4 py-2.5 text-xs text-success">{f.approved}</td>
                                                <td className="px-4 py-2.5 text-xs text-error">{f.rejected}</td>
                                                <td className="px-4 py-2.5 text-xs text-warning">{f.pending}</td>
                                                <td className="px-4 py-2.5 text-xs text-orange-400">{f.escalated}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatMinutes(f.avgResolutionMinutes)}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatPct(f.escalationRate)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {approverPerformance.length > 0 && (
                                    <DataTable title="Approver Performance" cols={['Approver', 'Total', 'Approved', 'Rejected', 'Abstained']}>
                                        {approverPerformance.map((a) => (
                                            <tr key={a.userId} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{a.userName ?? `User #${a.userId}`}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{a.total}</td>
                                                <td className="px-4 py-2.5 text-xs text-success">{a.approved}</td>
                                                <td className="px-4 py-2.5 text-xs text-error">{a.rejected}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground">{a.abstained}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {approvalDailyTrends.length > 0 && (
                                    <CollapsibleTable title="Daily Trends (30 days)" cols={['Date', 'Total', 'Approved', 'Rejected']}>
                                        {approvalDailyTrends.map((d) => (
                                            <tr key={d.date} className="border-b border-border/70">
                                                <td className="px-4 py-2 text-[10px] text-muted-foreground">{d.date}</td>
                                                <td className="px-4 py-2 text-[10px] text-muted-foreground/70">{d.total}</td>
                                                <td className="px-4 py-2 text-[10px] text-success">{d.approved}</td>
                                                <td className="px-4 py-2 text-[10px] text-error">{d.rejected}</td>
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
                                <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Workflow Intelligence</span>
                                </div>

                                {workflowIntelligence.topFailureReasons.length > 0 && (
                                    <div className="space-y-4">
                                        <p className="text-[11px] font-medium text-foreground">Top Failure Reasons</p>
                                        {workflowIntelligence.topFailureReasons.map((w) => (
                                            <div key={w.workflowId} className="rounded-lg border border-border/70 bg-card p-4">
                                                <div className="flex items-baseline justify-between">
                                                    <p className="text-sm font-medium text-foreground">{w.workflowName}</p>
                                                    <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-[10px] text-error">{w.failureRate}% failure</span>
                                                </div>
                                                <p className="mt-1 text-[10px] text-muted-foreground">{w.failedRuns} / {w.totalRuns} runs failed</p>
                                                {w.topActions.length > 0 && (
                                                    <div className="mt-3 space-y-1">
                                                        {w.topActions.map((a) => (
                                                            <div key={a.actionType} className="flex items-center gap-2">
                                                                <div
                                                                    className="h-1.5 rounded-full bg-red-400/30"
                                                                    style={{ width: `${Math.max(a.failurePercentage, 5)}%` }}
                                                                />
                                                                <span className="text-[10px] text-muted-foreground/70">{a.actionType}</span>
                                                                <span className="text-[10px] text-error">{a.failureCount} ({a.failurePercentage}%)</span>
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
                                            <tr key={w.week} className="border-b border-border/70">
                                                <td className="px-4 py-2 text-[10px] text-muted-foreground">{w.label}</td>
                                                <td className="px-4 py-2 text-xs text-muted-foreground/70">{w.totalRuns}</td>
                                                <td className="px-4 py-2 text-xs text-success">{w.completed}</td>
                                                <td className="px-4 py-2 text-xs text-error">{w.failed}</td>
                                                <td className="px-4 py-2 text-xs text-success">{formatPct(w.successRate)}</td>
                                                <td className="px-4 py-2 text-xs text-error">{formatPct(w.failureRate)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {workflowIntelligence.slowestWorkflows.length > 0 && (
                                    <DataTable title="Slowest Workflows" cols={['Workflow', 'Runs', 'Avg Duration', 'Max', 'Min']}>
                                        {workflowIntelligence.slowestWorkflows.map((w) => (
                                            <tr key={w.workflowId} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{w.workflowName ?? `Workflow #${w.workflowId}`}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{w.totalRuns}</td>
                                                <td className="px-4 py-2.5 text-xs text-warning">{formatDuration(w.avgDurationSeconds)}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatDuration(w.maxDurationSeconds)}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatDuration(w.minDurationSeconds)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {workflowIntelligence.slowestActions.length > 0 && (
                                    <DataTable title="Slowest Actions" cols={['Action Type', 'Count', 'Avg Duration', 'Max Duration']}>
                                        {workflowIntelligence.slowestActions.map((a) => (
                                            <tr key={a.actionType} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{a.actionType}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{a.totalCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-warning">{formatDuration(a.avgDurationSeconds)}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatDuration(a.maxDurationSeconds)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {workflowIntelligence.retryCandidates.length > 0 && (
                                    <DataTable title="Retry Candidates" cols={['Action Type', 'Total', 'Failures', 'Failure Rate', 'Retryable']}>
                                        {workflowIntelligence.retryCandidates.map((a) => (
                                            <tr key={a.actionType} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{a.actionType}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{a.totalCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-error">{a.failureCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatPct(a.failureRate)}</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <span className={cn('rounded-full px-2 py-0.5 text-[10px]', a.isRetryable ? 'bg-green-400/10 text-success' : 'bg-muted text-muted-foreground')}>
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
                                            <tr key={i} className="border-b border-border/70">
                                                <td className="px-4 py-2 text-[10px] text-foreground">{h.workflowName}</td>
                                                <td className="px-4 py-2 text-[10px] text-muted-foreground/70">{h.actionType}</td>
                                                <td className="px-4 py-2 text-[10px] text-muted-foreground/70">{h.totalRuns}</td>
                                                <td className="px-4 py-2 text-[10px] text-error">{h.failures}</td>
                                                <td className="px-4 py-2 text-[10px] text-muted-foreground/70">{formatPct(h.failureRate)}</td>
                                            </tr>
                                        ))}
                                    </CollapsibleTable>
                                )}

                                <div className="mt-8 flex items-center gap-2 border-b border-border/70 pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Approval Intelligence</span>
                                </div>

                                {approvalIntelligence.bottleneckSteps.length > 0 && (
                                    <DataTable title="Bottleneck Steps" cols={['Flow', 'Step', 'Type', 'Decisions', 'Avg Time', 'Max Time']}>
                                        {approvalIntelligence.bottleneckSteps.map((b, i) => (
                                            <tr key={i} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{b.flowName}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">Step {b.stepOrder}: {b.stepName}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground">{b.approverType}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{b.totalDecisions}</td>
                                                <td className="px-4 py-2.5 text-xs text-warning">{formatMinutes(b.avgDecisionTimeMinutes)}</td>
                                                <td className="px-4 py-2.5 text-xs text-error">{formatMinutes(b.maxDecisionTimeMinutes)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {approvalIntelligence.slowestApprovers.length > 0 && (
                                    <DataTable title="Slowest Approvers" cols={['Approver', 'Decisions', 'Avg Decision Time', 'Approved', 'Rejected', 'Approval Rate']}>
                                        {approvalIntelligence.slowestApprovers.map((a) => (
                                            <tr key={a.userId} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{a.userName ?? `User #${a.userId}`}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{a.totalDecisions}</td>
                                                <td className="px-4 py-2.5 text-xs text-warning">{formatMinutes(a.avgDecisionTimeMinutes)}</td>
                                                <td className="px-4 py-2.5 text-xs text-success">{a.approved}</td>
                                                <td className="px-4 py-2.5 text-xs text-error">{a.rejected}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatPct(a.approvalRate)}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {approvalIntelligence.slaRiskFlows.length > 0 && (
                                    <DataTable title="SLA Risk Assessment" cols={['Flow', 'SLA (min)', 'Avg Resolution', 'Breaches', 'Pending', 'Risk']}>
                                        {approvalIntelligence.slaRiskFlows.map((f) => (
                                            <tr key={f.flowId} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{f.flowName}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{f.slaBreachMinutes ?? '—'}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatMinutes(f.avgResolutionMinutes)}</td>
                                                <td className="px-4 py-2.5 text-xs text-error">{f.breachCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-warning">{f.pendingCount}</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <span className={cn(
                                                        'rounded-full px-2 py-0.5 text-[10px]',
                                                        f.riskLevel === 'high' ? 'bg-red-400/10 text-error' :
                                                            f.riskLevel === 'medium' ? 'bg-yellow-400/10 text-warning' :
                                                                'bg-green-400/10 text-success',
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
                                            <tr key={h.flowId} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{h.flowName}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{h.totalRequests}</td>
                                                <td className="px-4 py-2.5 text-xs text-orange-400">{h.escalatedCount}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{formatPct(h.escalationRate)}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{h.avgEscalationCount ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {approvalIntelligence.approvalThroughput.length > 0 && (
                                    <CollapsibleTable title="Approval Throughput (30 days)" cols={['Date', 'Created', 'Resolved', 'Pending', 'Approved', 'Rejected']}>
                                        {approvalIntelligence.approvalThroughput.map((d) => (
                                            <tr key={d.date} className="border-b border-border/70">
                                                <td className="px-4 py-2 text-[10px] text-muted-foreground">{d.date}</td>
                                                <td className="px-4 py-2 text-[10px] text-muted-foreground/70">{d.created}</td>
                                                <td className="px-4 py-2 text-[10px] text-success">{d.resolved}</td>
                                                <td className="px-4 py-2 text-[10px] text-warning">{d.pending}</td>
                                                <td className="px-4 py-2 text-[10px] text-success">{d.approved}</td>
                                                <td className="px-4 py-2 text-[10px] text-error">{d.rejected}</td>
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
                                <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Health Scores</span>
                                </div>

                                {healthScores.workflows.length > 0 && (
                                    <DataTable title="Workflow Health" cols={['Workflow', 'Score', 'Status', 'Success Rate', 'Failure Rate', 'Action Failure Rate']}>
                                        {healthScores.workflows.map((h) => (
                                            <tr key={h.entityId} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{h.entityName}</td>
                                                <td className="px-4 py-2.5 text-xs font-medium text-foreground">{h.score}/100</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <HealthBadge status={h.status} />
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-success">
                                                    {String(h.factors?.successRate ?? '')}%
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-error">
                                                    {String(h.factors?.failureRate ?? '')}%
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">
                                                    {String(h.factors?.actionFailureRate ?? '')}%
                                                </td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                {healthScores.approvals.length > 0 && (
                                    <DataTable title="Approval Flow Health" cols={['Flow', 'Score', 'Status', 'Approval Rate', 'Escalation Rate', 'Pending']}>
                                        {healthScores.approvals.map((h) => (
                                            <tr key={h.entityId} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{h.entityName}</td>
                                                <td className="px-4 py-2.5 text-xs font-medium text-foreground">{h.score}/100</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <HealthBadge status={h.status} />
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-success">
                                                    {String(h.factors?.approvalRate ?? '')}%
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-orange-400">
                                                    {String(h.factors?.escalationRate ?? '')}%
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-warning">
                                                    {String(h.factors?.pendingCount ?? '0')}
                                                </td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                <div className="mt-8 flex items-center gap-2 border-b border-border/70 pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Recommendations</span>
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
                                                        'border-border/70 bg-card',
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                            r.severity === 'critical' ? 'bg-red-400/10 text-error' :
                                                                r.severity === 'warning' ? 'bg-yellow-400/10 text-warning' :
                                                                    'bg-blue-400/10 text-info',
                                                        )}>
                                                            {r.severity}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">{r.type}</span>
                                                        <span className="text-[10px] text-muted-foreground">·</span>
                                                        <span className="text-[10px] text-muted-foreground">{r.entityType}</span>
                                                    </div>
                                                    <p className="mt-1.5 text-xs text-foreground leading-relaxed">{r.message}</p>
                                                    {r.entityName && (
                                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                                            Entity: {r.entityName}{r.entityId ? ` (#${r.entityId})` : ''}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                    r.priority >= 80 ? 'bg-red-400/10 text-error' :
                                                        r.priority >= 60 ? 'bg-yellow-400/10 text-warning' :
                                                            'bg-blue-400/10 text-info',
                                                )}>
                                                    P{r.priority}
                                                </span>
                                            </div>

                                            {r.explanation && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCard(i)}
                                                        className="mt-3 flex items-center gap-1 text-[10px] text-[#3b6cdb] hover:text-[#4d7dde] transition-colors"
                                                    >
                                                        <span>{expandedCards[i] ? '▼' : '▶'} Why am I seeing this?</span>
                                                    </button>

                                                    {expandedCards[i] && (
                                                        <div className="mt-2 rounded-md border border-border/70 bg-muted/50 p-3">
                                                            <p className="text-[10px] text-muted-foreground mb-2">{r.explanation.summary}</p>

                                                            {r.explanation.reasons.length > 0 && (
                                                                <div className="space-y-1 mb-3">
                                                                    {r.explanation.reasons.map((reason, j) => (
                                                                        <div key={j} className="flex items-center gap-2">
                                                                            <span className="text-[10px] text-muted-foreground/70 min-w-[120px]">{reason.label}</span>
                                                                            <span className="text-[10px] text-foreground font-mono">{reason.value}</span>
                                                                            <span className={cn(
                                                                                'rounded px-1.5 py-0.5 text-[9px] capitalize',
                                                                                reason.severity === 'critical' ? 'bg-red-400/10 text-error' :
                                                                                    reason.severity === 'warning' ? 'bg-yellow-400/10 text-warning' :
                                                                                        'bg-muted text-muted-foreground',
                                                                            )}>
                                                                                {reason.severity}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {r.explanation.recommendedActions.length > 0 && (
                                                                <div>
                                                                    <p className="text-[10px] text-muted-foreground mb-1">Recommended Actions</p>
                                                                    <ul className="space-y-0.5">
                                                                        {r.explanation.recommendedActions.map((action, j) => (
                                                                            <li key={j} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                                                                                <span className="text-[#3b6cdb]">•</span>
                                                                                {action}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex items-center gap-2 border-b border-border/70 pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Automation Insights</span>
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
                                                        'border-border/70 bg-card',
                                            )}
                                        >
                                            <div className="flex items-start gap-2">
                                                <span className={cn(
                                                    'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                    insight.severity === 'critical' ? 'bg-red-400/10 text-error' :
                                                        insight.severity === 'warning' ? 'bg-yellow-400/10 text-warning' :
                                                            'bg-blue-400/10 text-info',
                                                )}>
                                                    {insight.severity}
                                                </span>
                                                <p className="text-xs text-foreground leading-relaxed">{insight.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {tab === 'predictions' && (
                            <>
                                <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Workflow Risk Predictions</span>
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
                                            <tr key={r.workflowId ?? i} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-xs text-foreground">{r.workflowName ?? `Workflow #${r.workflowId}`}</td>
                                                <td className="px-4 py-2.5 text-xs font-medium text-foreground">{r.riskScore !== null ? `${r.riskScore}/100` : '—'}</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <RiskBadge level={r.riskLevel} />
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{r.probability !== null ? `${Math.round(r.probability * 100)}%` : '—'}</td>
                                                <td className="px-4 py-2.5 text-xs text-error">{String(r.factors?.recentFailureRate ?? '')}%</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{String(r.factors?.overallFailureRate ?? '')}%</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <span className={cn(
                                                        'rounded-full px-2 py-0.5 text-[10px]',
                                                        r.factors?.trend === 'increasing' ? 'bg-red-400/10 text-error' :
                                                            r.factors?.trend === 'decreasing' ? 'bg-green-400/10 text-success' :
                                                                'bg-muted text-muted-foreground',
                                                    )}>
                                                        {String(r.factors?.trend ?? 'stable')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                <div className="mt-8 flex items-center gap-2 border-b border-border/70 pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">SLA Breach Predictions</span>
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
                                            <tr key={p.approvalRequestId} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-[10px] text-foreground">#{p.approvalRequestId}</td>
                                                <td className="px-4 py-2.5 text-xs text-foreground">{p.flowName ?? `Flow #${p.flowId}`}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{p.status?.elapsedMinutes ?? '—'}m</td>
                                                <td className="px-4 py-2.5 text-xs text-warning">{p.status?.remainingMinutes ?? '—'}m</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{p.status?.slaBreachMinutes ?? '—'}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{p.status?.progressPercent ?? '—'}%</td>
                                                <td className="px-4 py-2.5 text-xs font-medium text-foreground">{p.status?.breachProbability ?? '—'}%</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <RiskBadge level={p.status?.riskLevel ?? 'unknown'} />
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{p.status?.expectedRemainingMinutes ?? '—'}m</td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                <div className="mt-8 flex items-center gap-2 border-b border-border/70 pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Approval Delay Forecasts</span>
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
                                            <tr key={f.approvalRequestId} className="border-b border-border/70">
                                                <td className="px-4 py-2.5 text-[10px] text-foreground">#{f.approvalRequestId}</td>
                                                <td className="px-4 py-2.5 text-xs text-foreground">{f.flowName ?? `Flow #${f.flowId}`}</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{f.forecast.elapsedMinutes}m</td>
                                                <td className="px-4 py-2.5 text-xs text-warning">{f.forecast.expectedRemainingMinutes}m</td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{f.forecast.expectedTotalMinutes}m</td>
                                                <td className="px-4 py-2.5 text-[10px] text-muted-foreground">{f.forecast.expectedResolutionAt}</td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <ConfidenceBadge level={f.forecast.confidence} />
                                                </td>
                                            </tr>
                                        ))}
                                    </DataTable>
                                )}

                                <div className="mt-8 flex items-center gap-2 border-b border-border/70 pb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Capacity Forecasts</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="mb-3 text-[11px] font-medium text-foreground">Workflow Volume — Next 7 Days</p>
                                        <p className="text-[10px] text-muted-foreground">{predictions.workflowVolume.last30Summary}</p>
                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                            Daily avg: {predictions.workflowVolume.dailyAverage} · Trend: {predictions.workflowVolume.weeklyTrend}% ({predictions.workflowVolume.trendDirection})
                                        </p>
                                        {predictions.workflowVolume.forecasts.length > 0 && (
                                            <DataTable title="" cols={['Date', 'Predicted', 'Range']}>
                                                {predictions.workflowVolume.forecasts.map((d) => (
                                                    <tr key={d.date} className="border-b border-border/70">
                                                        <td className="px-4 py-2 text-[10px] text-muted-foreground">{d.date}</td>
                                                        <td className="px-4 py-2 text-[10px] text-foreground">{d.predictedCount}</td>
                                                        <td className="px-4 py-2 text-[10px] text-muted-foreground">{d.lowerBound}–{d.upperBound}</td>
                                                    </tr>
                                                ))}
                                            </DataTable>
                                        )}
                                    </div>
                                    <div>
                                        <p className="mb-3 text-[11px] font-medium text-foreground">Approval Volume — Next 7 Days</p>
                                        <p className="text-[10px] text-muted-foreground">{predictions.approvalVolume.last30Summary}</p>
                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                            Daily avg: {predictions.approvalVolume.dailyAverage} · Trend: {predictions.approvalVolume.weeklyTrend}% ({predictions.approvalVolume.trendDirection})
                                        </p>
                                        {predictions.approvalVolume.forecasts.length > 0 && (
                                            <DataTable title="" cols={['Date', 'Predicted', 'Range']}>
                                                {predictions.approvalVolume.forecasts.map((d) => (
                                                    <tr key={d.date} className="border-b border-border/70">
                                                        <td className="px-4 py-2 text-[10px] text-muted-foreground">{d.date}</td>
                                                        <td className="px-4 py-2 text-[10px] text-foreground">{d.predictedCount}</td>
                                                        <td className="px-4 py-2 text-[10px] text-muted-foreground">{d.lowerBound}–{d.upperBound}</td>
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
        <div className="rounded-lg border border-border/70 bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={cn('mt-1 text-xl font-semibold', color)}>{value}</p>
        </div>
    );
}

function DataTable({ title, cols, children }: { title: string; cols: string[]; children: React.ReactNode }) {
    return (
        <div className="overflow-hidden rounded-lg border border-border/70">
            <div className="border-b border-border/70 bg-muted/50 px-4 py-2">
                <p className="text-[11px] font-medium text-foreground">{title}</p>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border/70 bg-muted/50">
                        {cols.map((col) => (
                            <th key={col} className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
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
        <div className="overflow-hidden rounded-lg border border-border/70">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between border-b border-border/70 bg-muted/50 px-4 py-2 text-left transition-colors hover:bg-muted"
            >
                <p className="text-[11px] font-medium text-foreground">{title}</p>
                <span className="text-[10px] text-muted-foreground">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/70 bg-muted/50">
                            {cols.map((col) => (
                                <th key={col} className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
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
            status === 'healthy' ? 'bg-green-400/10 text-success' :
                status === 'needs_attention' ? 'bg-yellow-400/10 text-warning' :
                    'bg-red-400/10 text-error',
        )}>
            {status === 'needs_attention' ? 'Needs Attention' : status}
        </span>
    );
}

function RiskBadge({ level }: { level: string }) {
    return (
        <span className={cn(
            'inline-block rounded-full px-2 py-0.5 text-[10px] capitalize',
            level === 'very_high' ? 'bg-red-400/10 text-error' :
                level === 'high' ? 'bg-orange-400/10 text-orange-400' :
                    level === 'moderate' ? 'bg-yellow-400/10 text-warning' :
                        level === 'low' ? 'bg-green-400/10 text-success' :
                            'bg-muted text-muted-foreground',
        )}>
            {level === 'very_high' ? 'Very High' : level}
        </span>
    );
}

function ConfidenceBadge({ level }: { level: string }) {
    return (
        <span className={cn(
            'inline-block rounded-full px-2 py-0.5 text-[10px] capitalize',
            level === 'high' ? 'bg-green-400/10 text-success' :
                level === 'medium' ? 'bg-yellow-400/10 text-warning' :
                    'bg-muted text-muted-foreground',
        )}>
            {level === 'very_low' ? 'Very Low' : level}
        </span>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-lg border border-border/70 bg-card p-12 text-center">
            <p className="text-xs text-muted-foreground">{message}</p>
        </div>
    );
}
