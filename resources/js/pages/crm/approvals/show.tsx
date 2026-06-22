import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalStep {
    id: number;
    stepOrder: number;
    approverType: string;
    approverId: number;
    required: boolean;
}

interface ApprovalFlow {
    id: number;
    name: string;
    strategy: string;
    escalationModel: string | null;
    slaWarningMinutes: number | null;
    slaBreachMinutes: number | null;
    steps: ApprovalStep[];
}

interface Decision {
    id: number;
    user_id: number;
    decision: string;
    comment: string | null;
    decided_at: string | null;
    user?: { id: number; name: string };
    step?: { id: number; step_order: number };
}

interface ApprovalRequest {
    id: number;
    approvalFlowId: number;
    status: string;
    entityType: string;
    entityId: number;
    notes: string | null;
    requestedBy: { id: number; name: string; email: string } | null;
    requestedAt: string | null;
    completedAt: string | null;
    approvedAt: string | null;
    rejectedAt: string | null;
    firstResponseAt: string | null;
    resolutionTimeMinutes: number | null;
    escalationCount: number | null;
    slaWarningSentAt: string | null;
    slaBreachAt: string | null;
    escalatedAt: string | null;
    flow: ApprovalFlow | null;
    decisions: Decision[];
    workflowRun: {
        id: number;
        status: string;
        contextSnapshot: Record<string, any> | null;
        startedAt: string | null;
        completedAt: string | null;
        workflow: { id: number; name: string } | null;
    } | null;
}

interface Props {
    request: ApprovalRequest;
}

type Tab = 'overview' | 'steps' | 'timeline' | 'context';

export default function ApprovalShow({ request }: Props) {
    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [deciding, setDeciding] = useState(false);
    const [decisionValue, setDecisionValue] = useState<'approved' | 'rejected' | 'abstained' | null>(null);
    const [comment, setComment] = useState('');

    const tabs: { key: Tab; label: string }[] = [
        { key: 'overview', label: 'Overview' },
        { key: 'steps', label: 'Approval Steps' },
        { key: 'timeline', label: 'Decisions Timeline' },
        { key: 'context', label: 'Workflow Context' },
    ];

    const statusColors: Record<string, string> = {
        pending: 'text-yellow-400 bg-yellow-400/10',
        approved: 'text-green-400 bg-green-400/10',
        rejected: 'text-red-400 bg-red-400/10',
        expired: 'text-[#555570] bg-[#1a1a24]',
        escalated: 'text-orange-400 bg-orange-400/10',
        cancelled: 'text-[#555570] bg-[#1a1a24]',
    };

    const decisionStatusColors: Record<string, string> = {
        pending: 'text-[#555570]',
        approved: 'text-green-400',
        rejected: 'text-red-400',
        abstained: 'text-yellow-400',
    };

    const formatDuration = (minutes: number | null): string => {
        if (minutes === null) return '—';
        if (minutes < 60) return `${minutes}m`;
        return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    };

    const isPending = request.status === 'pending';

    const decidedStepIds = new Set(request.decisions.map(d => d.step?.id).filter(Boolean));
    const canDecide = isPending && request.flow?.steps.some(
        step => step.approverType === 'user'
            && step.approverId === currentUserId
            && !decidedStepIds.has(step.id)
    );

    const handleDecide = async () => {
        if (!decisionValue) return;
        setDeciding(true);
        try {
            const res = await fetch(`/crm/approvals/api/${request.id}/decide`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ decision: decisionValue, comment }),
            });
            if (!res.ok) {
                const err = await res.json();
                toast.error(err.message ?? 'Failed to record decision');
                return;
            }
            toast.success(decisionValue === 'approved' ? 'Approved' : decisionValue === 'rejected' ? 'Rejected' : 'Abstained');
            router.reload();
        } finally {
            setDeciding(false);
        }
    };

    const resetDecision = () => {
        setDecisionValue(null);
        setComment('');
    };

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Status</p>
                        <span className={cn('mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs capitalize', statusColors[request.status] ?? 'text-[#555570] bg-[#1a1a24]')}>
                            {request.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Approval Flow</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{request.flow?.name ?? '—'}</p>
                        <p className="text-[10px] text-[#555570]">Strategy: {request.flow?.strategy ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Entity</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{request.entityType} #{request.entityId}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Requested By</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{request.requestedBy?.name ?? '—'}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Requested At</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{request.requestedAt ? new Date(request.requestedAt).toLocaleString() : '—'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Completed At</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{request.completedAt ? new Date(request.completedAt).toLocaleString() : '—'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Resolution Time</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{formatDuration(request.resolutionTimeMinutes)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#555570]">Escalations</p>
                        <p className="mt-1 text-sm text-[#e8e8ed]">{request.escalationCount ?? 0}</p>
                    </div>
                </div>
            </div>

            {request.notes && (
                <div className="rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-[#555570]">Notes</p>
                    <p className="mt-1 text-sm text-[#e8e8ed]">{request.notes}</p>
                </div>
            )}

            {request.workflowRun && (
                <div className="rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-[#555570]">Workflow Run</p>
                    <p className="mt-1 text-sm text-[#e8e8ed]">{request.workflowRun.workflow?.name ?? '—'} (Run #{request.workflowRun.id})</p>
                    <p className="text-[10px] text-[#555570]">
                        Status: {request.workflowRun.status}
                        {request.workflowRun.startedAt && ` · Started: ${new Date(request.workflowRun.startedAt).toLocaleString()}`}
                    </p>
                </div>
            )}

            {/* SLA Information */}
            {request.flow?.slaBreachMinutes && (
                <div className="rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-[#555570]">SLA</p>
                    <div className="mt-1 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-[#555570]">Warning After</p>
                            <p className="text-xs text-[#e8e8ed]">{request.flow.slaWarningMinutes ?? 'N/A'} minutes</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#555570]">Breach After</p>
                            <p className="text-xs text-[#e8e8ed]">{request.flow.slaBreachMinutes} minutes</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#555570]">Warning Sent</p>
                            <p className="text-xs text-[#e8e8ed]">{request.slaWarningSentAt ? new Date(request.slaWarningSentAt).toLocaleString() : '—'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#555570]">Escalation Model</p>
                            <p className="text-xs capitalize text-[#e8e8ed]">{request.flow.escalationModel ?? 'none'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderSteps = () => {
        if (!request.flow?.steps.length) {
            return <p className="py-8 text-center text-xs text-[#555570]">No steps defined for this flow.</p>;
        }

        const decisionsByStep = new Map(request.decisions.map(d => [d.step?.id, d]));

        return (
            <div className="space-y-3">
                {request.flow.steps.map((step) => {
                    const decision = decisionsByStep.get(step.id);
                    return (
                        <div key={step.id} className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a24] text-[10px] text-[#555570]">
                                        {step.stepOrder}
                                    </span>
                                    <div>
                                        <p className="text-xs font-medium text-[#e8e8ed]">
                                            Approver #{step.approverId}
                                            {step.required && <span className="ml-1.5 text-[10px] text-red-400">Required</span>}
                                        </p>
                                        <p className="text-[10px] text-[#555570]">Type: {step.approverType}</p>
                                    </div>
                                </div>
                                <span className={cn('text-xs capitalize', decisionStatusColors[decision?.decision ?? 'pending'])}>
                                    {decision?.decision ?? 'Awaiting'}
                                </span>
                            </div>
                            {decision?.comment && (
                                <p className="mt-2 text-[10px] text-[#555570]">"{decision.comment}"</p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderTimeline = () => {
        if (!request.decisions.length) {
            return <p className="py-8 text-center text-xs text-[#555570]">No decisions recorded yet.</p>;
        }

        const sorted = [...request.decisions].sort((a, b) => {
            if (!a.decided_at) return 1;
            if (!b.decided_at) return -1;
            return new Date(a.decided_at).getTime() - new Date(b.decided_at).getTime();
        });

        const decisionIcon = (decision: string) => {
            switch (decision) {
                case 'approved': return '✓';
                case 'rejected': return '✗';
                case 'abstained': return '–';
                default: return '?';
            }
        };

        return (
            <div className="relative space-y-4">
                <div className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-px bg-[#1e1e2a]" />
                {sorted.map((d) => (
                    <div key={d.id} className="relative flex items-start gap-4 pl-6">
                        <span className={cn(
                            'absolute left-0 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold',
                            d.decision === 'approved' ? 'bg-green-400/20 text-green-400' :
                            d.decision === 'rejected' ? 'bg-red-400/20 text-red-400' :
                            'bg-yellow-400/20 text-yellow-400'
                        )}>
                            {decisionIcon(d.decision)}
                        </span>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-[#e8e8ed]">
                                    <span className="font-medium capitalize">{d.decision}</span>
                                    {d.user?.name && <span className="text-[#555570]"> by {d.user.name}</span>}
                                </p>
                                <span className="text-[10px] text-[#555570]">
                                    {d.decided_at ? new Date(d.decided_at).toLocaleString() : '—'}
                                </span>
                            </div>
                            {d.comment && <p className="mt-0.5 text-[10px] text-[#555570]">"{d.comment}"</p>}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderContext = () => {
        const snapshot = request.workflowRun?.contextSnapshot;
        if (!snapshot) {
            return <p className="py-8 text-center text-xs text-[#555570]">No workflow context available.</p>;
        }

        return (
            <div className="rounded-lg border border-[#1e1e2a] bg-[#0a0a0f]">
                <pre className="overflow-auto p-4 text-xs text-[#8b8b9e]">
                    <code>{JSON.stringify(snapshot, null, 2)}</code>
                </pre>
            </div>
        );
    };

    const tabContent: Record<Tab, () => React.ReactNode> = {
        overview: renderOverview,
        steps: renderSteps,
        timeline: renderTimeline,
        context: renderContext,
    };

    return (
        <>
            <Head title={`CRM · Approval #${request.id}`} />

            <div className="flex h-full flex-col">
                <div className="border-b border-[#1e1e2a] px-6 py-2.5">
                    <button
                        onClick={() => router.visit('/crm/approvals')}
                        className="flex items-center gap-1.5 text-[11px] text-[#555570] transition-colors hover:text-[#8b8b9e]"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Approvals
                    </button>
                </div>

                <div className="border-b border-[#1e1e2a] px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-medium text-[#e8e8ed]">
                                Approval #{request.id}
                            </h1>
                            <p className="text-xs text-[#555570]">{request.flow?.name ?? '—'} · {request.entityType} #{request.entityId}</p>
                        </div>
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs capitalize', statusColors[request.status] ?? 'text-[#555570] bg-[#1a1a24]')}>
                            {request.status}
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

                        {/* Decision Form — only shown when pending + user can act */}
                        {canDecide && (
                            <div className="mt-8 rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-5">
                                <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-[#555570]">Your Decision</h3>

                                {!decisionValue ? (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setDecisionValue('approved')}
                                            className="rounded-md bg-green-500/20 px-4 py-2 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/30"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setDecisionValue('rejected')}
                                            className="rounded-md bg-red-500/20 px-4 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => setDecisionValue('abstained')}
                                            className="rounded-md bg-yellow-500/20 px-4 py-2 text-xs font-medium text-yellow-400 transition-colors hover:bg-yellow-500/30"
                                        >
                                            Abstain
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-xs text-[#e8e8ed]">
                                            Decision: <span className={cn('font-medium capitalize', decisionStatusColors[decisionValue])}>{decisionValue}</span>
                                        </p>
                                        <textarea
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            placeholder={decisionValue === 'rejected' ? 'Reason (required)' : 'Comment (optional)'}
                                            className="w-full rounded-md border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-xs text-[#e8e8ed] outline-none placeholder:text-[#555570] focus:border-[#3b6cdb]"
                                            rows={3}
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleDecide}
                                                disabled={deciding || (decisionValue === 'rejected' && !comment.trim())}
                                                className={cn(
                                                    'rounded-md px-4 py-2 text-xs font-medium text-white transition-colors disabled:opacity-50',
                                                    decisionValue === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                                                    decisionValue === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                                                    'bg-yellow-500 hover:bg-yellow-600'
                                                )}
                                            >
                                                {deciding ? '...' : `Confirm ${decisionValue}`}
                                            </button>
                                            <button
                                                onClick={resetDecision}
                                                className="rounded-md px-3 py-2 text-xs text-[#555570] transition-colors hover:text-[#8b8b9e]"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        {decisionValue === 'rejected' && !comment.trim() && (
                                            <p className="text-[10px] text-red-400">A reason is required when rejecting</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
