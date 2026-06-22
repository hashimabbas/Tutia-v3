import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import ExpressionEvaluation from '@/components/crm/workflows/ExpressionEvaluation';
import WorkflowDebugConsole from '@/components/crm/workflows/debug/WorkflowDebugConsole';

interface ActionRun {
    id: number;
    actionType: string;
    status: string;
    configuration: Record<string, any> | null;
    response: Record<string, any> | null;
    errorMessage: string | null;
    startedAt: string | null;
    completedAt: string | null;
    durationSeconds: number | null;
}

interface Decision {
    id: number;
    user_id: number;
    decision: string;
    comment: string | null;
    decided_at: string | null;
}

interface ApprovalRequest {
    id: number;
    approval_flow_id: number;
    status: string;
    requested_at: string | null;
    completed_at: string | null;
    decisions: Decision[];
    flow: { id: number; name: string; strategy: string } | null;
    resolution_time_minutes: number | null;
    escalation_count: number | null;
}

interface RunDetails {
    id: number;
    workflowId: number;
    eventKey: string;
    entityType: string;
    entityId: number;
    status: string;
    rootCause: string | null;
    contextSnapshot: Record<string, any> | null;
    startedAt: string | null;
    completedAt: string | null;
    durationSeconds: number | null;
    workflow: { id: number; name: string; entityType: string } | null;
    actions: ActionRun[];
    approvalRequests: ApprovalRequest[];
}

interface Props {
    run: RunDetails;
}

type Tab = 'overview' | 'timeline' | 'evaluation' | 'debug' | 'snapshot' | 'approvals';

export default function WorkflowRunShow({ run }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const tabs: { key: Tab; label: string }[] = [
        { key: 'overview', label: 'Overview' },
        { key: 'timeline', label: 'Execution Timeline' },
        { key: 'evaluation', label: 'Rule Evaluation' },
        { key: 'debug', label: 'Debug Console' },
        { key: 'snapshot', label: 'Context Snapshot' },
        { key: 'approvals', label: 'Approvals' },
    ];

    const statusColors: Record<string, string> = {
        completed: 'text-green-400 bg-green-400/10',
        failed: 'text-red-400 bg-red-400/10',
        paused: 'text-yellow-400 bg-yellow-400/10',
        running: 'text-blue-400 bg-blue-400/10',
        pending: 'text-[#555570] bg-[#1a1a24]',
        skipped: 'text-[#555570] bg-[#1a1a24]',
        waiting: 'text-purple-400 bg-purple-400/10',
    };

    const formatDuration = (seconds: number | null): string => {
        if (seconds === null) return '—';
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Status</p>
                        <span className={cn('mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs capitalize', statusColors[run.status] ?? 'text-[#555570] bg-[#1a1a24]')}>
                            {run.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Workflow</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{run.workflow?.name ?? `Workflow #${run.workflowId}`}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Event Key</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{run.eventKey}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Entity</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{run.entityType} #{run.entityId}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Started At</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{run.startedAt ? new Date(run.startedAt).toLocaleString() : '—'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Completed At</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{run.completedAt ? new Date(run.completedAt).toLocaleString() : '—'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Duration</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{formatDuration(run.durationSeconds)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Total Actions</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]}">{run.actions.length}</p>
                    </div>
                </div>
            </div>

            {run.status === 'failed' && run.rootCause && (
                <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-red-400">Root Cause</p>
                    <p className="mt-1 text-sm text-[#e8e8ed]">{run.rootCause}</p>
                </div>
            )}
        </div>
    );

    const renderTimeline = () => (
        <div className="space-y-2">
            {run.actions.length === 0 && (
                <p className="py-8 text-center text-xs text-[#555570]">No action runs recorded.</p>
            )}
            {run.actions.map((action, i) => (
                <div key={action.id} className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a24] text-[10px] text-[#555570]">
                                {i + 1}
                            </span>
                            <div>
                                <p className="text-xs font-medium text-[#e8e8ed] capitalize">{action.actionType.replace(/_/g, ' ')}</p>
                                <p className="text-[10px] text-[#555570]">
                                    {action.startedAt ? new Date(action.startedAt).toLocaleString() : 'Pending'}
                                    {action.durationSeconds !== null && ` · ${formatDuration(action.durationSeconds)}`}
                                </p>
                            </div>
                        </div>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] capitalize', statusColors[action.status] ?? 'text-[#555570] bg-[#1a1a24]')}>
                            {action.status}
                        </span>
                    </div>
                    {action.status === 'failed' && action.errorMessage && (
                        <div className="mt-2 rounded bg-red-400/5 p-2">
                            <p className="text-[10px] text-red-400">{action.errorMessage}</p>
                        </div>
                    )}
                </div>
            ))}
            {run.actions.length > 0 && (
                <div className="flex items-center gap-2 py-2">
                    <div className="h-px flex-1 bg-[#1e1e2a]" />
                    <span className="text-[10px] text-[#555570]">
                        {run.status === 'completed' ? 'Completed' : run.status === 'failed' ? 'Failed' : run.status === 'paused' ? 'Paused' : 'In Progress'}
                    </span>
                    <div className="h-px flex-1 bg-[#1e1e2a]" />
                </div>
            )}
        </div>
    );

    const renderSnapshot = () => {
        if (!run.contextSnapshot) {
            return <p className="py-8 text-center text-xs text-[#555570]">No context snapshot captured.</p>;
        }

        const formatted = JSON.stringify(run.contextSnapshot, null, 2);

        return (
            <div className="rounded-lg border border-[#1e1e2a] bg-[#0a0a0f]">
                <pre className="overflow-auto p-4 text-xs text-[#8b8b9e]">
                    <code>{formatted}</code>
                </pre>
            </div>
        );
    };

    const renderApprovals = () => {
        if (run.approvalRequests.length === 0) {
            return <p className="py-8 text-center text-xs text-[#555570]">No approval requests for this run.</p>;
        }

        return (
            <div className="space-y-4">
                {run.approvalRequests.map((req) => (
                    <div key={req.id} className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs font-medium text-[#e8e8ed]">{req.flow?.name ?? `Approval Flow #${req.approval_flow_id}`}</p>
                                <p className="text-[10px] text-[#555570]">Strategy: {req.flow?.strategy ?? '—'}</p>
                            </div>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] capitalize', statusColors[req.status] ?? 'text-[#555570] bg-[#1a1a24]')}>
                                {req.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                            <div>
                                <p className="text-[10px] text-[#555570]">Requested</p>
                                <p className="text-xs text-[#e8e8ed]">{req.requested_at ? new Date(req.requested_at).toLocaleString() : '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#555570]">Resolution</p>
                                <p className="text-xs text-[#e8e8ed]">{req.completed_at ? new Date(req.completed_at).toLocaleString() : '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#555570]">Escalation Count</p>
                                <p className="text-xs text-[#e8e8ed]">{req.escalation_count ?? 0}</p>
                            </div>
                        </div>

                        {req.resolution_time_minutes !== null && (
                            <div className="mb-3">
                                <p className="text-[10px] text-[#555570]">Resolution Time</p>
                                <p className="text-xs text-[#e8e8ed]">{req.resolution_time_minutes} minutes</p>
                            </div>
                        )}

                        {req.decisions.length > 0 && (
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[#555570] mb-2">Decisions</p>
                                <div className="space-y-1">
                                    {req.decisions.map((d) => (
                                        <div key={d.id} className="flex items-center justify-between rounded bg-[#0a0a0f] px-3 py-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className={cn('text-[10px] font-medium capitalize', d.decision === 'approved' ? 'text-green-400' : 'text-red-400')}>
                                                    {d.decision}
                                                </span>
                                                {d.comment && <span className="text-[10px] text-[#555570]">— {d.comment}</span>}
                                            </div>
                                            <span className="text-[10px] text-[#555570]">
                                                {d.decided_at ? new Date(d.decided_at).toLocaleString() : '—'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const getExpressionDebugProps = () => {
        const snapshot = run.contextSnapshot;
        return {
            expression: snapshot?.event_payload?._expression ?? null,
            matchedRules: snapshot?.event_payload?._expression_matched_rules ?? null,
            trace: snapshot?.event_payload?._expression_trace ?? null,
            evaluatedRules: snapshot?.event_payload?._expression_evaluated_rules ?? 0,
            passedRules: snapshot?.event_payload?._expression_passed_rules ?? 0,
        };
    };

    const renderEvaluation = () => {
        const { expression, matchedRules, trace, evaluatedRules, passedRules } = getExpressionDebugProps();

        return (
            <ExpressionEvaluation
                expression={expression}
                matchedRules={matchedRules}
                trace={trace}
                evaluatedRules={evaluatedRules}
                passedRules={passedRules}
                status={run.status}
            />
        );
    };

    const renderDebug = () => {
        const { expression, matchedRules, trace, evaluatedRules, passedRules } = getExpressionDebugProps();

        return (
            <WorkflowDebugConsole
                expression={expression}
                trace={trace}
                matchedRules={matchedRules}
                evaluatedRules={evaluatedRules}
                passedRules={passedRules}
                status={run.status}
            />
        );
    };

    const tabContent: Record<Tab, () => React.ReactNode> = {
        overview: renderOverview,
        timeline: renderTimeline,
        evaluation: renderEvaluation,
        debug: renderDebug,
        snapshot: renderSnapshot,
        approvals: renderApprovals,
    };

    return (
        <>
            <Head title={`CRM · Run #${run.id}`} />

            <div className="flex h-full flex-col">
                <div className="border-b border-[#1e1e2a] px-6 py-2.5">
                    <button
                        onClick={() => router.visit('/crm/workflows/runs')}
                        className="flex items-center gap-1.5 text-[11px] text-[#555570] transition-colors hover:text-[#8b8b9e]"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Runs
                    </button>
                </div>

                <div className="border-b border-[#1e1e2a] px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-medium text-[#e8e8ed]">
                                Run #{run.id}
                            </h1>
                            <p className="text-xs text-[#555570]">{run.workflow?.name} · {run.eventKey}</p>
                        </div>
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs capitalize', statusColors[run.status] ?? 'text-[#555570] bg-[#1a1a24]')}>
                            {run.status}
                        </span>
                    </div>
                </div>

                <div className="border-b border-[#1e1e2a] px-6">
                    <div className="flex gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'border-b-2 py-2.5 text-xs transition-colors',
                                    activeTab === tab.key
                                        ? 'border-[#3b6cdb] text-[#e8e8ed]'
                                        : 'border-transparent text-[#555570] hover:text-[#8b8b9e]'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-4xl p-6">
                        {tabContent[activeTab]()}
                    </div>
                </div>
            </div>
        </>
    );
}
