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
        completed: 'text-green-600 bg-green-50',
        failed: 'text-red-600 bg-red-50',
        paused: 'text-yellow-600 bg-yellow-50',
        running: 'text-blue-600 bg-blue-50',
        pending: 'text-gray-500 bg-gray-100',
        skipped: 'text-gray-500 bg-gray-100',
    };

    const formatDuration = (seconds: number | null): string => {
        if (seconds === null) return '\u2014';
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    const metricCards = [
        { label: 'Total Runs', value: metrics.total, color: 'text-gray-900' },
        { label: 'Successful', value: metrics.completed, color: 'text-green-600' },
        { label: 'Failed', value: metrics.failed, color: 'text-red-600' },
        { label: 'Paused', value: metrics.paused, color: 'text-yellow-600' },
        { label: 'Avg Duration', value: formatDuration(metrics.averageDurationSeconds), color: 'text-blue-600' },
    ];

    return (
        <>
            <Head title={'CRM \u00b7 Workflow Runs'} />

            <div className="flex h-full flex-col bg-gray-50/30">
                <div className="border-b border-gray-200 bg-white/90 backdrop-blur-xl px-6 py-2.5 sticky top-0 z-10">
                    <button
                        onClick={() => router.visit('/crm/workflows')}
                        className="flex items-center gap-1.5 text-[11px] text-gray-500 transition-colors hover:text-gray-700"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Workflows
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-5xl space-y-6 p-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-lg font-semibold text-gray-900">Workflow Runs</h1>
                        </div>

                        <div className="grid grid-cols-5 gap-4">
                            {metricCards.map((card) => (
                                <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500">{card.label}</p>
                                    <p className={cn('mt-1 text-xl font-semibold', card.color)}>{card.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={searchWorkflow}
                                    onChange={e => setSearchWorkflow(e.target.value)}
                                    className="w-full rounded-md border border-gray-200 bg-white px-8 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                                >
                                    <option value="">All Workflows</option>
                                    {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>

                            <select
                                value={searchStatus}
                                onChange={e => setSearchStatus(e.target.value)}
                                className="w-36 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                            >
                                <option value="">All Status</option>
                                {statuses.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>

                            <input
                                type="date"
                                value={searchDateFrom}
                                onChange={e => setSearchDateFrom(e.target.value)}
                                className="w-36 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                                placeholder="From"
                            />

                            <input
                                type="date"
                                value={searchDateTo}
                                onChange={e => setSearchDateTo(e.target.value)}
                                className="w-36 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                                placeholder="To"
                            />

                            <button
                                onClick={applyFilters}
                                className="rounded-md bg-[#2B4C8C] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3b5d9c]"
                            >
                                Apply
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/50">
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">Workflow</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">Status</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">Entity</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">Started</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {runs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-xs text-gray-400">
                                                No runs found.
                                            </td>
                                        </tr>
                                    )}
                                    {runs.data.map((run) => (
                                        <tr
                                            key={run.id}
                                            className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
                                            onClick={() => router.visit(`/crm/workflows/runs/${run.id}`)}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-gray-900">{run.workflow?.name ?? `Workflow #${run.workflowId}`}</p>
                                                <p className="text-[10px] text-gray-500">{run.eventKey}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] capitalize', statusColors[run.status] ?? 'text-gray-500 bg-gray-100')}>
                                                    {run.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-gray-900">{run.entityType}</p>
                                                <p className="text-[10px] text-gray-500">ID: {run.entityId}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                {run.startedAt ? new Date(run.startedAt).toLocaleString() : '\u2014'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                {formatDuration(run.durationSeconds)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {runs.meta && runs.meta.last_page > 1 && (
                            <div className="flex items-center justify-center gap-1">
                                {runs.meta.links?.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={cn(
                                            'rounded px-2.5 py-1 text-xs transition-colors',
                                            link.active
                                                ? 'bg-[#2B4C8C] text-white'
                                                : 'text-gray-500 hover:text-gray-700',
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
