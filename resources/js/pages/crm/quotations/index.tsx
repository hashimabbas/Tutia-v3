import { Head, Link, router } from '@inertiajs/react';
import { Search, FileText, Plus, MoreHorizontal, X, Eye, Edit, Trash2 } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Quotation {
    id: number;
    version: number;
    status: string;
    subtotal: number;
    discount_total: number;
    tax_rate: number;
    tax_total: number;
    grand_total: number;
    payment_terms: string | null;
    valid_until: string | null;
    notes: string | null;
    viewed_at: string | null;
    created_at: string;
    deal: { id: number; title: string; organization: { name: string } | null };
    created_by: { id: number; name: string } | null;
}

interface Props {
    quotations: { data: Quotation[]; meta: any };
    filters: Record<string, string | undefined>;
}

const statusConfig: Record<
    string,
    { label: string; color: string; dot: string }
> = {
    draft: {
        label: 'Draft',
        color: 'text-slate-700 bg-slate-100 border-slate-200',
        dot: 'bg-slate-500',
    },
    internal_review: {
        label: 'Internal Review',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        dot: 'bg-amber-500',
    },
    sent: {
        label: 'Sent',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        dot: 'bg-blue-500',
    },
    viewed: {
        label: 'Viewed',
        color: 'text-violet-700 bg-violet-50 border-violet-200',
        dot: 'bg-violet-500',
    },
    accepted: {
        label: 'Accepted',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    rejected: {
        label: 'Rejected',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        dot: 'bg-rose-500',
    },
    expired: {
        label: 'Expired',
        color: 'text-red-700 bg-red-50 border-red-200',
        dot: 'bg-red-500',
    },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status];
    if (!cfg) return null;
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize',
                cfg.color,
            )}
        >
            <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
        </span>
    );
}

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(val);
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function EmptyState() {
    return (
        <div className="flex h-full flex-col items-center justify-center p-12">
            <div className="relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 ring-1 ring-[#e2e6ef]">
                    <FileText className="h-8 w-8 text-[#6b7280]" />
                </div>
                <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2B4C8C] ring-2 ring-white">
                    <Plus className="h-3 w-3 text-white" />
                </div>
            </div>
            <h3 className="mb-1 text-base font-medium text-[#1a1a2e]">
                No quotations yet
            </h3>
            <p className="mb-6 max-w-[240px] text-center text-xs text-[#6b7280]">
                Create a quotation from a deal to get started.
            </p>
            <Link href="/crm/deals">
                <Button
                    size="sm"
                    className="gap-1.5 bg-[#2B4C8C] text-white hover:bg-[#2B4C8C]/90"
                >
                    <Plus className="h-3.5 w-3.5" />
                    New Quotation
                </Button>
            </Link>
        </div>
    );
}

export default function QuotationIndex({ quotations, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>();

    const navigate = useCallback((params: Record<string, string>) => {
        const sp = new URLSearchParams(window.location.search);
        Object.entries(params).forEach(([k, v]) => {
            if (v) sp.set(k, v);
            else sp.delete(k);
        });
        window.location.href = `/crm/quotations?${sp.toString()}`;
    }, []);

    const handleSearch = useCallback(
        (value: string) => {
            setSearch(value);
            if (searchTimer.current) clearTimeout(searchTimer.current);
            searchTimer.current = setTimeout(() => {
                navigate({ search: value });
            }, 300);
        },
        [navigate],
    );

    return (
        <>
            <Head title="CRM · Quotations" />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Sticky header */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-[#f8f9fc]/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-[#1a1a2e]">
                                Quotations
                                <span className="ml-2 text-sm font-normal text-[#6b7280]">
                                    ·{' '}
                                    {quotations.meta?.total ??
                                        quotations.data.length}{' '}
                                    total
                                </span>
                            </h1>
                            <p className="text-[11px] text-[#6b7280]">
                                Create and manage customer quotations
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#6b7280]" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    placeholder="Search by deal..."
                                    className="h-8 w-[220px] rounded-lg border border-[#e2e6ef] bg-white pr-8 pl-8 text-xs text-[#1a1a2e] placeholder-[#6b7280] transition-all outline-none focus:w-[280px] focus:border-[#2b4c8c] focus:ring-1 focus:ring-[#2b4c8c]/20"
                                />
                                {search && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 text-[#6b7280] hover:text-[#374151]"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            <div className="h-5 w-px bg-[#e2e6ef]" />

                            <Link href="/crm/deals">
                                <Button
                                    size="sm"
                                    className="gap-1.5 bg-[#2B4C8C] text-white hover:bg-[#2B4C8C]/90"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    New Quotation
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    {quotations.data.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#e2e6ef] text-left text-[11px] text-[#6b7280]">
                                    <th className="px-6 py-3 font-medium">
                                        ID / Version
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Deal
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Organization
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Grand Total
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Created
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Created By
                                    </th>
                                    <th className="w-12 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotations.data.map((q) => (
                                    <tr
                                        key={q.id}
                                        onClick={() =>
                                            router.visit(
                                                `/crm/quotations/${q.id}`,
                                            )
                                        }
                                        className="cursor-pointer border-b border-[#e2e6ef] text-[13px] text-[#1a1a2e] transition-all hover:bg-[#eef1f8]/50"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
                                                    <FileText className="h-4 w-4 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[#1a1a2e]">
                                                        #{q.id}
                                                    </div>
                                                    <div className="text-[10px] text-[#6b7280]">
                                                        v{q.version}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-[#1a1a2e]">
                                            {q.deal.title}
                                        </td>
                                        <td className="px-4 py-3 text-[#6b7280]">
                                            {q.deal.organization?.name ?? (
                                                <span className="text-[#9ca3af]">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-[#1a1a2e]">
                                            {formatCurrency(q.grand_total)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={q.status} />
                                        </td>
                                        <td className="px-4 py-3 text-[#6b7280]">
                                            {formatDate(q.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-[#6b7280]">
                                            {q.created_by?.name ?? (
                                                <span className="text-[#9ca3af]">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b7280] transition-all hover:bg-[#e2e6ef] hover:text-[#374151]"
                                                    >
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-36 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]"
                                                >
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.visit(
                                                                `/crm/quotations/${q.id}`,
                                                            );
                                                        }}
                                                        className="cursor-pointer focus:bg-[#eef1f8]"
                                                    >
                                                        <Eye className="mr-2 h-3 w-3" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.visit(
                                                                `/crm/quotations/${q.id}/edit`,
                                                            );
                                                        }}
                                                        className="cursor-pointer focus:bg-[#eef1f8]"
                                                    >
                                                        <Edit className="mr-2 h-3 w-3" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-[#e2e6ef]" />
                                                    <DropdownMenuItem className="cursor-pointer text-rose-600 focus:bg-[#eef1f8]">
                                                        <Trash2 className="mr-2 h-3 w-3" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState />
                    )}

                    {/* Pagination */}
                    {quotations.meta && quotations.meta.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-[#e2e6ef] bg-[#f8f9fc] px-6 py-3">
                            <span className="text-[11px] text-[#6b7280]">
                                Page {quotations.meta.current_page} of{' '}
                                {quotations.meta.last_page}
                                <span className="mx-1.5">·</span>
                                {quotations.meta.total} quotations
                            </span>
                            <div className="flex items-center gap-1.5">
                                {quotations.meta.links
                                    ?.filter((l: any) => l.url)
                                    .map((l: any, i: number) => {
                                        const label =
                                            l.label === 'pagination.previous'
                                                ? '‹'
                                                : l.label === 'pagination.next'
                                                  ? '›'
                                                  : l.label;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() =>
                                                    router.get(
                                                        l.url,
                                                        {},
                                                        { preserveState: true },
                                                    )
                                                }
                                                className={cn(
                                                    'flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 text-[11px] transition-all',
                                                    l.active
                                                        ? 'bg-[#2B4C8C] text-white shadow-sm'
                                                        : 'text-[#6b7280] hover:bg-[#e2e6ef] hover:text-[#374151]',
                                                )}
                                                dangerouslySetInnerHTML={{
                                                    __html: label,
                                                }}
                                            />
                                        );
                                    })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
