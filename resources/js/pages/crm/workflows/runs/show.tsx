import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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
    userId: number;
    decision: string;
    comment: string | null;
    decidedAt: string | null;
}

interface ApprovalRequest {
    id: number;
    approvalFlowId: number;
    status: string;
    requestedAt: string | null;
    completedAt: string | null;
    decisions: Decision[];
    flow: { id: number; name: string; strategy: string } | null;
    resolutionTimeMinutes: number | null;
    escalationCount: number | null;
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
    workflow: { id: number; name: string } | null;
    actionRuns: ActionRun[];
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
        completed: 'text-green-600 bg-green-50',
        failed: 'text-red-600 bg-red-50',
        paused: 'text-yellow-600 bg-yellow-50',
        running: 'text-blue-600 bg-blue-50',
        pending: 'text-gray-500 bg-gray-100',
        skipped: 'text-gray-500 bg-gray-100',
        waiting: 'text-purple-600 bg-purple-50',
    };

    const formatDuration = (seconds: number | null): string => {
        if (seconds === null) return '\u2014';
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Status</p>
                        <span className={cn('mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs capitalize', statusColors[run.status] ?? 'text-gray-500 bg-gray-100')}>
                            {run.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Workflow</p>
                        <p className="mt-1 text-sm text-gray-900">{run.workflow?.name ?? `Workflow #${run.workflowId}`}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Event Key</p>
                        <p className="mt-1 text-sm text-gray-900">{run.eventKey}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Entity</p>
                        <p className="mt-1 text-sm text-gray-900">{run.entityType} #{run.entityId}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Started At</p>
                        <p className="mt-1 text-sm text-gray-900">{run.startedAt ? new Date(run.startedAt).toLocaleString() : '\u2014'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Completed At</p>
                        <p className="mt-1 text-sm text-gray-900">{run.completedAt ? new Date(run.completedAt).toLocaleString() : '\u2014'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Duration</p>
                        <p className="mt-1 text-sm text-gray-900">{formatDuration(run.durationSeconds)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Total Actions</p>
                        <p className="mt-1 text-sm text-gray-900">{run.actionRuns.length}</p>
                    </div>
                </div>
            </div>

            {run.status === 'failed' && run.rootCause && (
                <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-red-600">Root Cause</p>
                    <p className="mt-1 text-sm text-gray-900">{run.rootCause}</p>
                </div>
            )}
        </div>
    );

    const renderTimeline = () => (
        <div className="space-y-2">
            {run.actionRuns.length === 0 && (
                <p className="py-8 text-center text-xs text-gray-400">No action runs recorded.</p>
            )}
            {run.actionRuns.map((action, i) => (
                <div key={action.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] text-gray-500">
                                {i + 1}
                            </span>
                            <div>
                                <p className="text-xs font-medium text-gray-900 capitalize">{action.actionType.replace(/_/g, ' ')}</p>
                                <p className="text-[10px] text-gray-500">
                                    {action.startedAt ? new Date(action.startedAt).toLocaleString() : 'Pending'}
                                    {action.durationSeconds !== null && ` \u00b7 ${formatDuration(action.durationSeconds)}`}
                                </p>
                            </div>
                        </div>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] capitalize', statusColors[action.status] ?? 'text-gray-500 bg-gray-100')}>
                            {action.status}
                        </span>
                    </div>
                    {action.status === 'failed' && action.errorMessage && (
                        <div className="mt-2 rounded bg-red-50/50 p-2">
                            <p className="text-[10px] text-red-600">{action.errorMessage}</p>
                        </div>
                    )}
                </div>
            ))}
            {run.actionRuns.length > 0 && (
                <div className="flex items-center gap-2 py-2">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-[10px] text-gray-500">
                        {run.status === 'completed' ? 'Completed' : run.status === 'failed' ? 'Failed' : run.status === 'paused' ? 'Paused' : 'In Progress'}
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>
            )}
        </div>
    );

    const renderSnapshot = () => {
        if (!run.contextSnapshot) {
            return <p className="py-8 text-center text-xs text-gray-400">No context snapshot captured.</p>;
        }

        const formatted = JSON.stringify(run.contextSnapshot, null, 2);

        return (
            <div className="rounded-xl border border-gray-200 bg-gray-50/50">
                <pre className="overflow-auto p-4 text-xs text-gray-600">
                    <code>{formatted}</code>
                </pre>
            </div>
        );
    };

    const renderApprovals = () => {
        if (run.approvalRequests.length === 0) {
            return <p className="py-8 text-center text-xs text-gray-400">No approval requests for this run.</p>;
        }

        return (
            <div className="space-y-4">
                {run.approvalRequests.map((req) => (
                    <div key={req.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs font-medium text-gray-900">{req.flow?.name ?? `Approval Flow #${req.approvalFlowId}`}</p>
                                <p className="text-[10px] text-gray-500">Strategy: {req.flow?.strategy ?? '\u2014'}</p>
                            </div>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] capitalize', statusColors[req.status] ?? 'text-gray-500 bg-gray-100')}>
                                {req.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                            <div>
                                <p className="text-[10px] text-gray-500">Requested</p>
                                <p className="text-xs text-gray-900">{req.requestedAt ? new Date(req.requestedAt).toLocaleString() : '\u2014'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500">Resolution</p>
                                <p className="text-xs text-gray-900">{req.completedAt ? new Date(req.completedAt).toLocaleString() : '\u2014'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500">Escalation Count</p>
                                <p className="text-xs text-gray-900">{req.escalationCount ?? 0}</p>
                            </div>
                        </div>

                        {req.resolutionTimeMinutes !== null && (
                            <div className="mb-3">
                                <p className="text-[10px] text-gray-500">Resolution Time</p>
                                <p className="text-xs text-gray-900">{req.resolutionTimeMinutes} minutes</p>
                            </div>
                        )}

                        {req.decisions.length > 0 && (
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Decisions</p>
                                <div className="space-y-1">
                                    {req.decisions.map((d) => (
                                        <div key={d.id} className="flex items-center justify-between rounded bg-gray-50/50 px-3 py-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className={cn('text-[10px] font-medium capitalize', d.decision === 'approved' ? 'text-green-600' : 'text-red-600')}>
                                                    {d.decision}
                                                </span>
                                                {d.comment && <span className="text-[10px] text-gray-500">{'\u2014'} {d.comment}</span>}
                                            </div>
                                            <span className="text-[10px] text-gray-500">
                                                {d.decidedAt ? new Date(d.decidedAt).toLocaleString() : '\u2014'}
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
            <Head title={`CRM \u00b7 Run #${run.id}`} />

            <div className="flex h-full flex-col bg-gray-50/30">
                <div className="border-b border-gray-200 bg-white/90 backdrop-blur-xl px-6 py-2.5 sticky top-0 z-10">
                    <button
                        onClick={() => router.visit('/crm/workflows/runs')}
                        className="flex items-center gap-1.5 text-[11px] text-gray-500 transition-colors hover:text-gray-700"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Runs
                    </button>
                </div>

                <div className="border-b border-gray-200 bg-white/90 backdrop-blur-xl px-6 py-3 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">
                                Run #{run.id}
                            </h1>
                            <p className="text-xs text-gray-500">{run.workflow?.name} {'\u00b7'} {run.eventKey}</p>
                        </div>
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs capitalize', statusColors[run.status] ?? 'text-gray-500 bg-gray-100')}>
                            {run.status}
                        </span>
                    </div>
                </div>

                <div className="border-b border-gray-200 bg-white/90 backdrop-blur-xl px-6 sticky top-0 z-10">
                    <div className="flex gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'border-b-2 py-2.5 text-xs transition-colors',
                                    activeTab === tab.key
                                        ? 'border-[#3b6cdb] text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
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
