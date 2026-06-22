import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FlowMeta {
    id: number;
    name: string;
}

interface StatusMeta {
    key: string;
    label: string;
}

interface ApprovalRequest {
    id: number;
    approvalFlowId: number;
    status: string;
    entityType: string;
    entityId: number;
    requestedAt: string | null;
    completedAt: string | null;
    resolutionTimeMinutes: number | null;
    escalationCount: number | null;
    flow: { id: number; name: string } | null;
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
    requests: PaginatedData<ApprovalRequest>;
    flows: FlowMeta[];
    statuses: StatusMeta[];
    filters: {
        status?: string;
        flow_id?: string;
        date_from?: string;
        date_to?: string;
    };
    metrics: {
        pending: number;
        approvedToday: number;
        rejectedToday: number;
        escalated: number;
    };
}

export default function ApprovalIndex({ requests, flows, statuses, filters, metrics }: Props) {
    const [filterStatus, setFilterStatus] = useState(filters.status ?? '');
    const [filterFlow, setFilterFlow] = useState(filters.flow_id ?? '');
    const [filterDateFrom, setFilterDateFrom] = useState(filters.date_from ?? '');
    const [filterDateTo, setFilterDateTo] = useState(filters.date_to ?? '');

    const applyFilters = () => {
        router.get('/crm/approvals', {
            status: filterStatus || undefined,
            flow_id: filterFlow || undefined,
            date_from: filterDateFrom || undefined,
            date_to: filterDateTo || undefined,
        }, { preserveState: true });
    };

    const statusColors: Record<string, string> = {
        pending: 'text-yellow-400 bg-yellow-400/10',
        approved: 'text-green-400 bg-green-400/10',
        rejected: 'text-red-400 bg-red-400/10',
        expired: 'text-[#555570] bg-[#1a1a24]',
        escalated: 'text-orange-400 bg-orange-400/10',
        cancelled: 'text-[#555570] bg-[#1a1a24]',
    };

    const metricCards = [
        { label: 'Pending', value: metrics.pending, color: 'text-yellow-400' },
        { label: 'Approved Today', value: metrics.approvedToday, color: 'text-green-400' },
        { label: 'Rejected Today', value: metrics.rejectedToday, color: 'text-red-400' },
        { label: 'Escalated', value: metrics.escalated, color: 'text-orange-400' },
    ];

    return (
        <>
            <Head title="CRM · Approvals" />

            <div className="flex h-full flex-col">
                <div className="border-b border-[#1e1e2a] px-6 py-2.5">
                    <h1 className="text-lg font-medium text-[#e8e8ed]">Approvals</h1>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-5xl space-y-6 p-6">
                        <div className="grid grid-cols-4 gap-4">
                            {metricCards.map((card) => (
                                <div key={card.label} className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                                    <p className="text-[10px] uppercase tracking-wider text-[#555570]">{card.label}</p>
                                    <p className={cn('mt-1 text-xl font-semibold', card.color)}>{card.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="w-36 rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                            >
                                <option value="">All Status</option>
                                {statuses.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>

                            <select
                                value={filterFlow}
                                onChange={e => setFilterFlow(e.target.value)}
                                className="w-48 rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                            >
                                <option value="">All Flows</option>
                                {flows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>

                            <input
                                type="date"
                                value={filterDateFrom}
                                onChange={e => setFilterDateFrom(e.target.value)}
                                className="w-36 rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                                placeholder="From"
                            />

                            <input
                                type="date"
                                value={filterDateTo}
                                onChange={e => setFilterDateTo(e.target.value)}
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
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">ID</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">Flow</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">Entity</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">Status</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">Requested</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#555570]">Escalations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-xs text-[#555570]">
                                                No approval requests found.
                                            </td>
                                        </tr>
                                    )}
                                    {requests.data.map((req) => (
                                        <tr
                                            key={req.id}
                                            className="cursor-pointer border-b border-[#1e1e2a] transition-colors hover:bg-[#0a0a0f]"
                                            onClick={() => router.visit(`/crm/approvals/${req.id}`)}
                                        >
                                            <td className="px-4 py-3 text-xs text-[#555570]">#{req.id}</td>
                                            <td className="px-4 py-3 text-xs text-[#e8e8ed]">{req.flow?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-xs text-[#e8e8ed]">{req.entityType} #{req.entityId}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] capitalize', statusColors[req.status] ?? 'text-[#555570] bg-[#1a1a24]')}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#8b8b9e]">
                                                {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#8b8b9e]">{req.escalationCount ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {requests.meta.last_page > 1 && (
                            <div className="flex items-center justify-center gap-1">
                                {requests.meta.links.map((link, i) => (
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
