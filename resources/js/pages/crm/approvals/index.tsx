import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Filter, RefreshCw, Eye, X, Check, AlertTriangle, Clock, ArrowUpDown } from 'lucide-react';
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
    const [showFilters, setShowFilters] = useState(false);

    const applyFilters = () => {
        router.get('/crm/approvals', {
            status: filterStatus || undefined,
            flow_id: filterFlow || undefined,
            date_from: filterDateFrom || undefined,
            date_to: filterDateTo || undefined,
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setFilterStatus('');
        setFilterFlow('');
        setFilterDateFrom('');
        setFilterDateTo('');
        router.get('/crm/approvals', {}, { preserveState: true });
    };

    const hasActiveFilters = filters.status || filters.flow_id || filters.date_from || filters.date_to;

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

    const metricCards = [
        { label: 'Pending', value: metrics.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
        { label: 'Approved Today', value: metrics.approvedToday, icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        { label: 'Rejected Today', value: metrics.rejectedToday, icon: X, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        { label: 'Escalated', value: metrics.escalated, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    ];

    return (
        <>
            <Head title="CRM · Approvals" />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                <div className="sticky top-0 z-10 border-b border-[#e2e6ef] bg-white/90 px-6 py-3 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-semibold text-[#1a1a2e]">Approvals</h1>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all',
                                showFilters || hasActiveFilters
                                    ? 'border-[#2B4C8C] bg-[#2B4C8C]/5 text-[#2B4C8C]'
                                    : 'border-[#e2e6ef] text-[#6b7280] hover:border-[#c5c9d6] hover:text-[#374151]'
                            )}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            Filters
                            {hasActiveFilters && <span className="ml-0.5 rounded-full bg-[#2B4C8C] px-1.5 py-0.5 text-[9px] text-white">{Object.values(filters).filter(Boolean).length}</span>}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-6xl space-y-5 p-6">
                        {/* Metrics */}
                        <div className="grid grid-cols-4 gap-4">
                            {metricCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <div key={card.label} className={cn('rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md', card.border)}>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-[#8b8b9e]">{card.label}</p>
                                            <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', card.bg)}>
                                                <Icon className={cn('h-3.5 w-3.5', card.color)} />
                                            </div>
                                        </div>
                                        <p className={cn('mt-2 text-2xl font-bold', card.color)}>{card.value}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="rounded-xl border border-[#e2e6ef] bg-white p-4 shadow-sm">
                                <div className="flex flex-wrap items-end gap-3">
                                    <div>
                                        <label className="mb-1 block text-[10px] font-medium text-[#6b7280]">Status</label>
                                        <select
                                            value={filterStatus}
                                            onChange={e => setFilterStatus(e.target.value)}
                                            className="h-9 w-36 rounded-lg border border-[#e2e6ef] bg-white px-2.5 text-xs text-[#374151] outline-none focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                        >
                                            <option value="">All Status</option>
                                            {statuses.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] font-medium text-[#6b7280]">Flow</label>
                                        <select
                                            value={filterFlow}
                                            onChange={e => setFilterFlow(e.target.value)}
                                            className="h-9 w-48 rounded-lg border border-[#e2e6ef] bg-white px-2.5 text-xs text-[#374151] outline-none focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                        >
                                            <option value="">All Flows</option>
                                            {flows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] font-medium text-[#6b7280]">From</label>
                                        <input
                                            type="date"
                                            value={filterDateFrom}
                                            onChange={e => setFilterDateFrom(e.target.value)}
                                            className="h-9 w-36 rounded-lg border border-[#e2e6ef] bg-white px-2.5 text-xs text-[#374151] outline-none focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] font-medium text-[#6b7280]">To</label>
                                        <input
                                            type="date"
                                            value={filterDateTo}
                                            onChange={e => setFilterDateTo(e.target.value)}
                                            className="h-9 w-36 rounded-lg border border-[#e2e6ef] bg-white px-2.5 text-xs text-[#374151] outline-none focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={applyFilters}
                                            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#2B4C8C] px-4 text-xs font-medium text-white transition-colors hover:bg-[#3b5d9c]"
                                        >
                                            <Search className="h-3.5 w-3.5" />
                                            Apply
                                        </button>
                                        <button
                                            onClick={clearFilters}
                                            className="flex h-9 items-center gap-1.5 rounded-lg border border-[#e2e6ef] px-3 text-xs text-[#6b7280] transition-colors hover:bg-[#f3f4f6]"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        <div className="overflow-hidden rounded-xl border border-[#e2e6ef] bg-white shadow-sm">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#e2e6ef] bg-[#f8f9fc]">
                                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">ID</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Flow</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Entity</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Status</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Requested</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Escalations</th>
                                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-16 text-center">
                                                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                                    <Search className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-500">No approval requests found</p>
                                                <p className="mt-1 text-xs text-gray-400">Try adjusting your filters or check back later.</p>
                                            </td>
                                        </tr>
                                    )}
                                    {requests.data.map((req) => (
                                        <tr
                                            key={req.id}
                                            className="cursor-pointer border-b border-[#e2e6ef] transition-colors hover:bg-[#f8f9fc]"
                                            onClick={() => router.visit(`/crm/approvals/${req.id}`)}
                                        >
                                            <td className="px-4 py-3.5 text-xs font-medium text-[#6b7280]">#{req.id}</td>
                                            <td className="px-4 py-3.5 text-xs text-[#374151]">{req.flow?.name ?? '\u2014'}</td>
                                            <td className="px-4 py-3.5 text-xs text-[#374151]">
                                                {req.entityType} <span className="text-[#8b8b9e]">#{req.entityId}</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] capitalize', statusColors[req.status] ?? 'text-gray-500 bg-gray-100 border-gray-200')}>
                                                    {statusIcons[req.status]}
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-[#8b8b9e]">
                                                {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : '\u2014'}
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-[#8b8b9e]">{req.escalationCount ?? 0}</td>
                                            <td className="px-4 py-3.5 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); router.visit(`/crm/approvals/${req.id}`); }}
                                                    className="rounded-md border border-[#e2e6ef] px-2.5 py-1 text-[10px] text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#374151]"
                                                >
                                                    <Eye className="mr-1 inline-block h-3 w-3" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {requests.meta && requests.meta.last_page > 1 && (
                            <div className="flex items-center justify-center gap-1">
                                {requests.meta.links?.filter(l => l.url).map((link, i) => {
                                    const label = link.label === 'pagination.previous' ? '\u2039' : link.label === 'pagination.next' ? '\u203A' : link.label;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                            className={cn(
                                                'flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 text-[11px] transition-all',
                                                link.active
                                                    ? 'bg-[#2B4C8C] text-white shadow-sm'
                                                    : 'text-[#6b7280] hover:bg-[#e2e6ef] hover:text-[#374151]',
                                            )}
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
