import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Search, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowMeta {
    id: number;
    name: string;
}

interface StatusMeta {
    key: string;
    label: string;
}

interface Run {
    id: number;
    workflowId: number;
    status: string;
    eventKey: string;
    entityType: string;
    entityId: number;
    rootCause: string | null;
    startedAt: string | null;
    completedAt: string | null;
    durationSeconds: number | null;
    workflow: { id: number; name: string } | null;
}

interface Metrics {
    total: number;
    completed: number;
    failed: number;
    paused: number;
    averageDurationSeconds: number | null;
}

interface PaginatedData<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

interface Props {
    runs: PaginatedData<Run>;
    workflows: WorkflowMeta[];
    statuses: StatusMeta[];
    filters: {
        workflow_id?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
    metrics: Metrics;
}

export default function WorkflowRunsIndex({ runs, workflows, statuses, filters, metrics }: Props) {
    const [searchWorkflow, setSearchWorkflow] = useState(filters.workflow_id ?? '');
    const [searchStatus, setSearchStatus] = useState(filters.status ?? '');
    const [searchDateFrom, setSearchDateFrom] = useState(filters.date_from ?? '');
    const [searchDateTo, setSearchDateTo] = useState(filters.date_to ?? '');

    const applyFilters = () => {
        router.get('/crm/workflows/runs', {
            workflow_id: searchWorkflow || undefined,
            status: searchStatus || undefined,
            date_from: searchDateFrom || undefined,
            date_to: searchDateTo || undefined,
        }, { preserveState: true });
    };

    const statusColors: Record<string, string> = {
        completed: 'text-green-400 bg-green-400/10',
        failed: 'text-red-400 bg-red-400/10',
        paused: 'text-yellow-400 bg-yellow-400/10',
        running: 'text-blue-400 bg-blue-400/10',
        pending: 'text-[#555570] bg-[#1a1a24]',
        skipped: 'text-[#555570] bg-[#1a1a24]',
    };

    const formatDuration = (seconds: number | null): string => {
        if (seconds === null) return '—';
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    const metricCards = [
        { label: 'Total Runs', value: metrics.total, color: 'text-[#e8e8ed]' },
        { label: 'Successful', value: metrics.completed, color: 'text-green-400' },
        { label: 'Failed', value: metrics.failed, color: 'text-red-400' },
        { label: 'Paused', value: metrics.paused, color: 'text-yellow-400' },
        { label: 'Avg Duration', value: formatDuration(metrics.averageDurationSeconds), color: 'text-blue-400' },
    ];

    return (
        <>
            <Head title="CRM · Workflow Runs" />

            <div className="flex h-full flex-col">
                <div className="border-b border-[#1e1e2a] px-6 py-2.5">
                    <button
                        onClick={() => router.visit('/crm/workflows')}
                        className="flex items-center gap-1.5 text-[11px] text-[#555570] transition-colors hover:text-[#8b8b9e]"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Workflows
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-5xl space-y-6 p-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-lg font-medium text-[#e8e8ed]">Workflow Runs</h1>
                        </div>

                        <div className="grid grid-cols-5 gap-4">
                            {metricCards.map((card) => (
                                <div key={card.label} className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                                    <p className="text-[10px] uppercase tracking-wider text-[#555570]">{card.label}</p>
                                    <p className={cn('mt-1 text-xl font-semibold', card.color)}>{card.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555570]" />
                                <select
                                    value={searchWorkflow}
                                    onChange={e => setSearchWorkflow(e.target.value)}
                                    className="w-full rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-8 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                                >
                                    <option value="">All Workflows</option>
                                    {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>

                            <select
                                value={searchStatus}
                                onChange={e => setSearchStatus(e.target.value)}
                                className="w-36 rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                            >
                                <option value="">All Status</option>
                                {statuses.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>

                            <input
                                type="date"
                                value={searchDateFrom}
                                onChange={e => setSearchDateFrom(e.target.value)}
                                className="w-36 rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                                placeholder="From"
                            />

                            <input
                                type="date"
                                value={searchDateTo}
                                onChange={e => setSearchDateTo(e.target.value)}
                                className="w-36 rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                                placeholder="To"
                            />

                            <button
                                onClick={applyFilters}
                                className="rounded-md bg-[#2B4C8C] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3b5d9c]"
                            >
                                Apply
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-[#1e1e2a]">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#1e1e2a] bg-[#0a0a0f]">
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">Workflow</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">Status</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">Entity</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">Started</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {runs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-xs text-[#555570]">
                                                No runs found.
                                            </td>
                                        </tr>
                                    )}
                                    {runs.data.map((run) => (
                                        <tr
                                            key={run.id}
                                            className="cursor-pointer border-b border-[#1e1e2a] transition-colors hover:bg-[#0a0a0f]"
                                            onClick={() => router.visit(`/crm/workflows/runs/${run.id}`)}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-[#e8e8ed]">{run.workflow?.name ?? `Workflow #${run.workflowId}`}</p>
                                                <p className="text-[10px] text-[#555570]">{run.eventKey}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] capitalize', statusColors[run.status] ?? 'text-[#555570] bg-[#1a1a24]')}>
                                                    {run.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-[#e8e8ed]">{run.entityType}</p>
                                                <p className="text-[10px] text-[#555570]">ID: {run.entityId}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#8b8b9e]">
                                                {run.startedAt ? new Date(run.startedAt).toLocaleString() : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#8b8b9e]">
                                                {formatDuration(run.durationSeconds)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {runs.meta.last_page > 1 && (
                            <div className="flex items-center justify-center gap-1">
                                {runs.meta.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={cn(
                                            'rounded px-2.5 py-1 text-xs transition-colors',
                                            link.active
                                                ? 'bg-[#2B4C8C] text-white'
                                                : 'text-[#555570] hover:text-[#8b8b9e]',
                                            !link.url && 'opacity-50 cursor-not-allowed'
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
