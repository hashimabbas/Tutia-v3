import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Check,
    X,
    Minus,
    Clock,
    AlertTriangle,
    User,
    Layers,
    GitBranch,
    Shield,
} from 'lucide-react';
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
    const [decisionValue, setDecisionValue] = useState<
        'approved' | 'rejected' | 'abstained' | null
    >(null);
    const [comment, setComment] = useState('');

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        {
            key: 'overview',
            label: 'Overview',
            icon: <Layers className="h-3.5 w-3.5" />,
        },
        {
            key: 'steps',
            label: 'Approval Steps',
            icon: <GitBranch className="h-3.5 w-3.5" />,
        },
        {
            key: 'timeline',
            label: 'Timeline',
            icon: <Clock className="h-3.5 w-3.5" />,
        },
        {
            key: 'context',
            label: 'Workflow Context',
            icon: <Shield className="h-3.5 w-3.5" />,
        },
    ];

    const statusColors: Record<string, string> = {
        pending: 'text-amber-700 bg-amber-50 border-amber-200',
        approved: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        rejected: 'text-red-700 bg-red-50 border-red-200',
        expired: 'text-gray-500 bg-gray-100 border-gray-200',
        escalated: 'text-orange-700 bg-orange-50 border-orange-200',
        cancelled: 'text-gray-500 bg-gray-100 border-gray-200',
    };

    const statusIcons: Record<string, React.ReactNode> = {
        pending: <Clock className="h-3 w-3" />,
        approved: <Check className="h-3 w-3" />,
        rejected: <X className="h-3 w-3" />,
        escalated: <AlertTriangle className="h-3 w-3" />,
    };

    const decisionStatusColors: Record<string, string> = {
        pending: 'text-gray-400',
        approved: 'text-emerald-600',
        rejected: 'text-red-600',
        abstained: 'text-amber-600',
    };

    const decisionBgColors: Record<string, string> = {
        pending: 'bg-gray-50',
        approved: 'bg-emerald-50',
        rejected: 'bg-red-50',
        abstained: 'bg-amber-50',
    };

    const formatDuration = (minutes: number | null): string => {
        if (minutes === null) return '\u2014';
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    const isPending = request.status === 'pending';

    const decidedStepIds = new Set(
        request.decisions.map((d) => d.step?.id).filter(Boolean),
    );
    const canDecide =
        isPending &&
        request.flow?.steps.some(
            (step) =>
                step.approverType === 'user' &&
                step.approverId === currentUserId &&
                !decidedStepIds.has(step.id),
        );

    const handleDecide = async () => {
        if (!decisionValue) return;
        setDeciding(true);
        try {
            const res = await fetch(`/crm/approvals/api/${request.id}/decide`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ decision: decisionValue, comment }),
            });
            if (!res.ok) {
                const err = await res.json();
                toast.error(err.message ?? 'Failed to record decision');
                return;
            }
            toast.success(
                decisionValue === 'approved'
                    ? 'Approved'
                    : decisionValue === 'rejected'
                      ? 'Rejected'
                      : 'Abstained',
            );
            router.reload();
        } finally {
            setDeciding(false);
        }
    };

    const resetDecision = () => {
        setDecisionValue(null);
        setComment('');
    };

    const formatTimestamp = (ts: string | null): string => {
        if (!ts) return '\u2014';
        return new Date(ts).toLocaleString();
    };

    const MetricBlock = ({
        label,
        value,
    }: {
        label: string;
        value: string;
    }) => (
        <div className="rounded-lg bg-[#f8f9fc] p-3">
            <p className="text-[10px] font-medium tracking-wider text-[#8b8b9e] uppercase">
                {label}
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#1a1a2e]">{value}</p>
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <MetricBlock
                        label="Status"
                        value={
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs capitalize',
                                    statusColors[request.status] ??
                                        'border-gray-200 bg-gray-100 text-gray-500',
                                )}
                            >
                                {statusIcons[request.status]}
                                {request.status}
                            </span>
                        }
                    />
                    <MetricBlock
                        label="Approval Flow"
                        value={request.flow?.name ?? '\u2014'}
                    />
                    <div className="rounded-lg bg-[#f8f9fc] p-3">
                        <p className="text-[10px] font-medium tracking-wider text-[#8b8b9e] uppercase">
                            Strategy
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-[#1a1a2e] capitalize">
                            {request.flow?.strategy?.replace(/_/g, ' ') ??
                                '\u2014'}
                        </p>
                    </div>
                    <MetricBlock
                        label="Entity"
                        value={`${request.entityType} #${request.entityId}`}
                    />
                    <MetricBlock
                        label="Requested By"
                        value={request.requestedBy?.name ?? '\u2014'}
                    />
                </div>
                <div className="space-y-3">
                    <MetricBlock
                        label="Requested At"
                        value={formatTimestamp(request.requestedAt)}
                    />
                    <MetricBlock
                        label="Completed At"
                        value={formatTimestamp(request.completedAt)}
                    />
                    <MetricBlock
                        label="Resolution Time"
                        value={formatDuration(request.resolutionTimeMinutes)}
                    />
                    <MetricBlock
                        label="Escalations"
                        value={String(request.escalationCount ?? 0)}
                    />
                </div>
            </div>

            {request.notes && (
                <div className="rounded-xl border border-[#e2e6ef] bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-medium tracking-wider text-[#8b8b9e] uppercase">
                        Notes
                    </p>
                    <p className="mt-1 text-sm text-[#374151]">
                        {request.notes}
                    </p>
                </div>
            )}

            {request.workflowRun && (
                <div className="rounded-xl border border-[#e2e6ef] bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-medium tracking-wider text-[#8b8b9e] uppercase">
                        Workflow Run
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#1a1a2e]">
                        {request.workflowRun.workflow?.name ?? '\u2014'}{' '}
                        <span className="text-[#8b8b9e]">
                            (Run #{request.workflowRun.id})
                        </span>
                    </p>
                    <p className="mt-0.5 text-xs text-[#8b8b9e]">
                        Status: {request.workflowRun.status}
                        {request.workflowRun.startedAt &&
                            ` \u00b7 Started: ${formatTimestamp(request.workflowRun.startedAt)}`}
                    </p>
                </div>
            )}

            {request.flow?.slaBreachMinutes && (
                <div className="rounded-xl border border-[#e2e6ef] bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-medium tracking-wider text-[#8b8b9e] uppercase">
                        SLA
                    </p>
                    <div className="mt-3 grid grid-cols-4 gap-4">
                        <div>
                            <p className="text-[10px] text-[#8b8b9e]">
                                Warning After
                            </p>
                            <p className="text-xs font-medium text-[#374151]">
                                {request.flow.slaWarningMinutes ?? 'N/A'} min
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#8b8b9e]">
                                Breach After
                            </p>
                            <p className="text-xs font-medium text-[#374151]">
                                {request.flow.slaBreachMinutes} min
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#8b8b9e]">
                                Warning Sent
                            </p>
                            <p className="text-xs font-medium text-[#374151]">
                                {formatTimestamp(request.slaWarningSentAt)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#8b8b9e]">
                                Escalation Model
                            </p>
                            <p className="text-xs font-medium text-[#374151] capitalize">
                                {request.flow.escalationModel ?? 'none'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderSteps = () => {
        if (!request.flow?.steps.length) {
            return (
                <div className="flex flex-col items-center py-16">
                    <GitBranch className="mb-3 h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">
                        No steps defined for this flow.
                    </p>
                </div>
            );
        }

        const decisionsByStep = new Map(
            request.decisions.map((d) => [d.step?.id, d]),
        );

        return (
            <div className="space-y-3">
                {request.flow.steps.map((step) => {
                    const decision = decisionsByStep.get(step.id);
                    return (
                        <div
                            key={step.id}
                            className="rounded-xl border border-[#e2e6ef] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={cn(
                                            'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold',
                                            decision?.decision === 'approved'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : decision?.decision ===
                                                    'rejected'
                                                  ? 'bg-red-100 text-red-700'
                                                  : decision?.decision ===
                                                      'abstained'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-gray-100 text-gray-500',
                                        )}
                                    >
                                        {step.stepOrder}
                                    </span>
                                    <div>
                                        <p className="text-xs font-medium text-[#1a1a2e]">
                                            {step.approverType === 'user'
                                                ? 'User'
                                                : step.approverType}{' '}
                                            #{step.approverId}
                                            {step.required && (
                                                <span className="ml-1.5 inline-flex items-center rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-medium text-red-600">
                                                    Required
                                                </span>
                                            )}
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-[#8b8b9e]">
                                            Type: {step.approverType}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {decision?.user && (
                                        <span className="text-[10px] text-[#8b8b9e]">
                                            {decision.user.name}
                                        </span>
                                    )}
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
                                            decision?.decision === 'approved'
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                : decision?.decision ===
                                                    'rejected'
                                                  ? 'border-red-200 bg-red-50 text-red-700'
                                                  : decision?.decision ===
                                                      'abstained'
                                                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                    : 'border-gray-200 bg-gray-50 text-gray-400',
                                        )}
                                    >
                                        {decision?.decision === 'approved' ? (
                                            <Check className="h-2.5 w-2.5" />
                                        ) : decision?.decision ===
                                          'rejected' ? (
                                            <X className="h-2.5 w-2.5" />
                                        ) : decision?.decision ===
                                          'abstained' ? (
                                            <Minus className="h-2.5 w-2.5" />
                                        ) : null}
                                        {decision?.decision ?? 'Awaiting'}
                                    </span>
                                </div>
                            </div>
                            {decision?.comment && (
                                <div className="mt-3 border-t border-[#e2e6ef] pt-3">
                                    <p className="text-[10px] text-[#8b8b9e] italic">
                                        "{decision.comment}"
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderTimeline = () => {
        if (!request.decisions.length) {
            return (
                <div className="flex flex-col items-center py-16">
                    <Clock className="mb-3 h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">
                        No decisions recorded yet.
                    </p>
                </div>
            );
        }

        const sorted = [...request.decisions].sort((a, b) => {
            if (!a.decided_at) return 1;
            if (!b.decided_at) return -1;
            return (
                new Date(a.decided_at).getTime() -
                new Date(b.decided_at).getTime()
            );
        });

        return (
            <div className="relative space-y-6">
                <div className="absolute top-3 left-[11px] h-[calc(100%-24px)] w-0.5 bg-[#e2e6ef]" />
                {sorted.map((d) => (
                    <div
                        key={d.id}
                        className="relative flex items-start gap-4 pl-10"
                    >
                        <span
                            className={cn(
                                'absolute left-0 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ring-4 ring-white',
                                d.decision === 'approved'
                                    ? 'bg-emerald-500 text-white'
                                    : d.decision === 'rejected'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-amber-500 text-white',
                            )}
                        >
                            {d.decision === 'approved' ? (
                                <Check className="h-3 w-3" />
                            ) : d.decision === 'rejected' ? (
                                <X className="h-3 w-3" />
                            ) : (
                                <Minus className="h-3 w-3" />
                            )}
                        </span>
                        <div className="flex-1 rounded-xl border border-[#e2e6ef] bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
                                            d.decision === 'approved'
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                : d.decision === 'rejected'
                                                  ? 'border-red-200 bg-red-50 text-red-700'
                                                  : 'border-amber-200 bg-amber-50 text-amber-700',
                                        )}
                                    >
                                        {d.decision}
                                    </span>
                                    {d.user?.name && (
                                        <span className="flex items-center gap-1 text-[10px] text-[#8b8b9e]">
                                            <User className="h-3 w-3" />
                                            {d.user.name}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] text-[#8b8b9e]">
                                    {formatTimestamp(d.decided_at)}
                                </span>
                            </div>
                            {d.comment && (
                                <p className="mt-2 border-t border-[#e2e6ef] pt-2 text-[11px] text-[#6b7280] italic">
                                    "{d.comment}"
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderContext = () => {
        const snapshot = request.workflowRun?.contextSnapshot;
        if (!snapshot) {
            return (
                <div className="flex flex-col items-center py-16">
                    <Shield className="mb-3 h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">
                        No workflow context available.
                    </p>
                </div>
            );
        }

        return (
            <div className="overflow-hidden rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] shadow-sm">
                <pre className="overflow-auto p-4 text-xs text-[#6b7280]">
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
            <Head title={`CRM \u00b7 Approval #${request.id}`} />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                <div className="sticky top-0 z-10 border-b border-[#e2e6ef] bg-white/90 px-6 py-2.5 backdrop-blur-xl">
                    <button
                        onClick={() => router.visit('/crm/approvals')}
                        className="flex items-center gap-1.5 text-[11px] text-[#6b7280] transition-colors hover:text-[#374151]"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Approvals
                    </button>
                </div>

                <div className="sticky top-0 z-10 border-b border-[#e2e6ef] bg-white/90 px-6 py-3 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-[#1a1a2e]">
                                Approval #{request.id}
                            </h1>
                            <p className="text-xs text-[#8b8b9e]">
                                {request.flow?.name ?? '\u2014'} \u00b7{' '}
                                {request.entityType} #{request.entityId}
                            </p>
                        </div>
                        <span
                            className={cn(
                                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
                                statusColors[request.status] ??
                                    'border-gray-200 bg-gray-100 text-gray-500',
                            )}
                        >
                            {statusIcons[request.status]}
                            {request.status}
                        </span>
                    </div>
                </div>

                <div className="sticky top-0 z-10 border-b border-[#e2e6ef] bg-white/90 px-6 backdrop-blur-xl">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-all',
                                    activeTab === tab.key
                                        ? 'border-[#2B4C8C] text-[#2B4C8C]'
                                        : 'border-transparent text-[#8b8b9e] hover:text-[#374151]',
                                )}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-4xl p-6">
                        {tabContent[activeTab]()}

                        {/* Decision Form */}
                        {canDecide && (
                            <div className="mt-8 rounded-xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-wider text-[#6b7280] uppercase">
                                    <User className="h-3.5 w-3.5" />
                                    Your Decision
                                </h3>

                                {!decisionValue ? (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() =>
                                                setDecisionValue('approved')
                                            }
                                            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-100 hover:shadow-sm"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDecisionValue('rejected')
                                            }
                                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700 transition-all hover:bg-red-100 hover:shadow-sm"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDecisionValue('abstained')
                                            }
                                            className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 transition-all hover:bg-amber-100 hover:shadow-sm"
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                            Abstain
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-xs text-[#374151]">
                                            Decision:{' '}
                                            <span
                                                className={cn(
                                                    'font-semibold capitalize',
                                                    decisionStatusColors[
                                                        decisionValue
                                                    ],
                                                )}
                                            >
                                                {decisionValue}
                                            </span>
                                        </p>
                                        <textarea
                                            value={comment}
                                            onChange={(e) =>
                                                setComment(e.target.value)
                                            }
                                            placeholder={
                                                decisionValue === 'rejected'
                                                    ? 'Reason (required)'
                                                    : 'Comment (optional)'
                                            }
                                            className="w-full rounded-lg border border-[#e2e6ef] bg-white px-3 py-2 text-xs text-[#374151] outline-none placeholder:text-[#8b8b9e] focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                            rows={3}
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleDecide}
                                                disabled={
                                                    deciding ||
                                                    (decisionValue ===
                                                        'rejected' &&
                                                        !comment.trim())
                                                }
                                                className={cn(
                                                    'flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-white transition-all disabled:opacity-50',
                                                    decisionValue === 'approved'
                                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                                        : decisionValue ===
                                                            'rejected'
                                                          ? 'bg-red-600 hover:bg-red-700'
                                                          : 'bg-amber-600 hover:bg-amber-700',
                                                )}
                                            >
                                                {deciding
                                                    ? 'Processing...'
                                                    : `Confirm ${decisionValue}`}
                                            </button>
                                            <button
                                                onClick={resetDecision}
                                                className="rounded-lg px-3 py-2 text-xs text-[#6b7280] transition-colors hover:bg-[#f3f4f6]"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        {decisionValue === 'rejected' &&
                                            !comment.trim() && (
                                                <p className="flex items-center gap-1 text-[10px] text-red-600">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    A reason is required when
                                                    rejecting
                                                </p>
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
