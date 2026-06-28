import { Head, Link, router } from '@inertiajs/react';
import { Search, MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
            ? 'text-emerald-600 bg-emerald-50'
            : probability >= 50
              ? 'text-amber-600 bg-amber-50'
              : 'text-slate-500 bg-slate-50';

    return (
        <span
            className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                color,
            )}
        >
            {probability}%
        </span>
    );
}

function StageDot({ stage }: { stage: string }) {
    const colors: Record<string, string> = {
        qualification: 'bg-slate-400',
        meeting: 'bg-blue-500',
        proposal: 'bg-violet-500',
        negotiation: 'bg-amber-500',
        closed_won: 'bg-emerald-500',
        closed_lost: 'bg-rose-500',
    };
    return (
        <span
            className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full',
                colors[stage] ?? 'bg-slate-400',
            )}
        />
    );
}

function DealCard({ deal }: { deal: Deal }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (deleting) return;
        setDeleting(true);
        router.delete(`/crm/deals/${deal.id}`, {
            preserveScroll: true,
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <Link
            href={`/crm/deals/${deal.id}`}
            className="group block rounded-xl border border-[#e2e6ef] bg-white p-4 shadow-sm transition-all hover:border-[#c8cce0] hover:shadow-md"
        >
            <div className="mb-2.5 flex items-start justify-between">
                <div className="flex min-w-0 items-center gap-2">
                    <StageDot stage={deal.stage} />
                    <h3 className="truncate text-sm font-medium text-[#1a1a2e]">
                        {deal.title}
                    </h3>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            onClick={(e) => e.preventDefault()}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-[#9ca3af] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#f0f2f7] hover:text-[#6b7280]"
                        >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 text-xs">
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/crm/deals/${deal.id}/edit`}>
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleDelete}
                            disabled={deleting}
                            className="cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="mb-2.5 flex items-baseline gap-2">
                <span className="text-lg font-bold tracking-tight text-[#1a1a2e]">
                    {formatCurrency(deal.value, deal.currency)}
                </span>
                <ProbabilityBadge probability={deal.probability} />
            </div>

            {deal.company && (
                <p className="mb-1 text-[11px] text-[#6b7280]">
                    {deal.company}
                </p>
            )}

            <div className="flex items-center justify-between">
                {deal.expected_close_date ? (
                    <span className="text-[11px] text-[#9ca3af]">
                        Close:{' '}
                        {new Date(deal.expected_close_date).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' },
                        )}
                    </span>
                ) : (
                    <span className="text-[11px] text-[#d1d5db]">
                        No close date
                    </span>
                )}
                {deal.owner && (
                    <span className="text-[10px] text-[#9ca3af]">
                        {deal.owner.name}
                    </span>
                )}
            </div>
        </Link>
    );
}

export default function DealsIndex({
    deals,
    stage_groups,
    filters,
}: DealsPageProps) {
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

    const stageKeys = [
        'qualification',
        'meeting',
        'proposal',
        'negotiation',
        'closed_won',
        'closed_lost',
    ];

    return (
        <>
            <Head title="CRM · Deals" />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 px-6 py-4 backdrop-blur-xl">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-[#1a1a2e]">
                            Deals
                        </h1>
                        <p className="text-xs text-[#6b7280]">
                            {deals.meta?.total ?? 0} deals in pipeline
                        </p>
                    </div>
                    <Link href="/crm/deals/create">
                        <Button
                            size="sm"
                            className="h-9 gap-2 bg-[#2B4C8C] text-white shadow-sm transition-all hover:bg-[#2B4C8C]/90 hover:shadow-md"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            New Deal
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 border-b border-[#e2e6ef] bg-white px-6 py-3">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search deals..."
                            className="h-9 w-56 rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] pr-3 pl-9 text-xs text-[#1a1a2e] placeholder-[#9ca3af] transition-all outline-none focus:border-[#2B4C8C] focus:ring-[3px] focus:ring-[#2B4C8C]/10"
                        />
                    </form>
                </div>

                {/* Pipeline Kanban */}
                <div className="flex-1 overflow-auto">
                    <div className="flex h-full gap-5 px-6 py-5">
                        {stageKeys.map((key) => {
                            const group = stage_groups[key];

                            if (!group) return null;

                            const isClosed =
                                key === 'closed_won' || key === 'closed_lost';

                            return (
                                <div
                                    key={key}
                                    className={cn(
                                        'flex w-72 shrink-0 flex-col',
                                        isClosed && 'opacity-60',
                                    )}
                                >
                                    <div className="mb-3 flex items-center justify-between px-0.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[11px] font-semibold tracking-widest text-[#6b7280] uppercase">
                                                {group.label}
                                            </h3>
                                            <span className="rounded-lg bg-[#f0f2f7] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">
                                                {group.deals.length}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-[#6b7280]">
                                            {formatCurrency(group.total)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                        {group.deals.map((deal) => (
                                            <DealCard
                                                key={deal.id}
                                                deal={deal}
                                            />
                                        ))}
                                        {group.deals.length === 0 && (
                                            <div className="rounded-xl border border-dashed border-[#e2e6ef] bg-white/50 px-4 py-10 text-center">
                                                <p className="text-xs text-[#9ca3af]">
                                                    No deals
                                                </p>
                                                <p className="mt-0.5 text-[10px] text-[#d1d5db]">
                                                    Drag or add new
                                                </p>
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
