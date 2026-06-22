import { Head, Link } from '@inertiajs/react';
import {
    Search,
    MoreHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Deal {
    id: number;
    title: string;
    value: number;
    currency: string;
    stage: string;
    probability: number;
    company?: string;
    contact_name?: string;
    expected_close_date?: string;
    lead?: { id: number; name: string } | null;
    owner?: { id: number; name: string } | null;
}

interface StageGroup {
    label: string;
    deals: Deal[];
    total: number;
}

interface DealsPageProps {
    deals: { data: Deal[]; meta: any };
    stage_groups: Record<string, StageGroup>;
    stages: Record<string, string>;
    filters: {
        search?: string;
        stage?: string;
        sort?: string;
        dir?: string;
    };
}

function formatCurrency(value: number, currency = 'SDG'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function ProbabilityBadge({ probability }: { probability: number }) {
    const color =
        probability >= 80
            ? 'text-emerald-400'
            : probability >= 50
              ? 'text-amber-400'
              : 'text-slate-400';

    return <span className={`text-[11px] font-medium ${color}`}>{probability}%</span>;
}

function DealCard({ deal }: { deal: Deal }) {
    return (
        <Link
            href={`/crm/deals/${deal.id}`}
            className="block rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3 transition-all hover:border-[#2a2a3a] hover:bg-[#14141e]"
        >
            <div className="mb-2 flex items-start justify-between">
                <h3 className="text-[13px] font-medium text-[#e8e8ed]">{deal.title}</h3>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex h-5 w-5 items-center justify-center rounded text-[#555570] hover:bg-[#1a1a24] hover:text-[#8b8b9e]">
                            <MoreHorizontal className="h-3 w-3" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-32 border-[#1e1e2a] bg-[#0f0f14] text-xs text-[#e8e8ed]"
                    >
                        <DropdownMenuItem className="cursor-pointer focus:bg-[#1a1a24]">
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-400 focus:bg-[#1a1a24]">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="mb-2 flex items-baseline gap-1.5">
                <span className="text-base font-semibold text-[#e8e8ed]">
                    {formatCurrency(deal.value, deal.currency)}
                </span>
                <ProbabilityBadge probability={deal.probability} />
            </div>

            {deal.company && (
                <p className="mb-1.5 text-[11px] text-[#555570]">{deal.company}</p>
            )}

            {deal.expected_close_date && (
                <div className="flex items-center gap-1 text-[11px] text-[#555570]">
                    <span>Close: {new Date(deal.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
            )}
        </Link>
    );
}

export default function DealsIndex({ deals, stage_groups, filters }: DealsPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(window.location.search);

        if (search) {
            params.set('search', search);
        } else {
            params.delete('search');
        }

        window.location.href = `/crm/deals?${params.toString()}`;
    };

    const stageKeys = ['qualification', 'meeting', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

    return (
        <>
            <Head title="CRM · Deals" />

            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-3">
                    <div>
                        <h1 className="text-lg font-medium text-[#e8e8ed]">Deals</h1>
                        <p className="text-xs text-[#555570]">
                            {deals.meta?.total ?? 0} total pipeline
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 border-b border-[#1e1e2a] px-6 py-2.5">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555570]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search deals..."
                            className="h-8 w-56 rounded-md border border-[#1e1e2a] bg-[#0f0f14] pl-8 pr-3 text-xs text-[#e8e8ed] placeholder-[#555570] outline-none focus:border-[#3b6cdb]"
                        />
                    </form>
                </div>

                {/* Pipeline Kanban */}
                <div className="flex-1 overflow-auto">
                    <div className="flex h-full gap-4 overflow-x-auto px-6 py-4">
                        {stageKeys.map((key) => {
                            const group = stage_groups[key];

                            if (!group) {
return null;
}

                            const isClosed = key === 'closed_won' || key === 'closed_lost';

                            return (
                                <div
                                    key={key}
                                    className={`flex w-72 shrink-0 flex-col ${isClosed ? 'opacity-60' : ''}`}
                                >
                                    <div className="mb-3 flex items-center justify-between px-0.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[11px] font-medium uppercase tracking-wider text-[#8b8b9e]">
                                                {group.label}
                                            </h3>
                                            <span className="rounded bg-[#1a1a24] px-1.5 py-0.5 text-[10px] text-[#555570]">
                                                {group.deals.length}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-[#555570]">
                                            {formatCurrency(group.total)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {group.deals.map((deal) => (
                                            <DealCard key={deal.id} deal={deal} />
                                        ))}
                                        {group.deals.length === 0 && (
                                            <div className="rounded-lg border border-dashed border-[#1e1e2a] px-4 py-6 text-center text-xs text-[#555570]">
                                                No deals
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
