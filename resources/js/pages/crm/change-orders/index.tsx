import { Head, Link, router } from '@inertiajs/react';
import { GitCompareArrows, MoreHorizontal, Eye, FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ChangeOrder {
    id: number;
    title: string;
    description: string | null;
    status: string;
    cost_impact: number;
    timeline_impact_days: number;
    requested_by: string | null;
    created_at: string;
    project: {
        id: number;
        name: string;
        organization: { id: number; name: string } | null;
    };
}

interface Props {
    changeOrders: { data: ChangeOrder[]; meta: any };
    filters: Record<string, string | undefined>;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    identified: {
        label: 'Identified',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        dot: 'bg-amber-500',
    },
    approved: {
        label: 'Approved',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    rejected: {
        label: 'Rejected',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        dot: 'bg-rose-500',
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
                    <GitCompareArrows className="h-8 w-8 text-[#6b7280]" />
                </div>
                <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2B4C8C] ring-2 ring-white">
                    <Plus className="h-3 w-3 text-white" />
                </div>
            </div>
            <h3 className="mb-1 text-base font-medium text-[#1a1a2e]">
                No change orders yet
            </h3>
            <p className="mb-6 max-w-[240px] text-center text-xs text-[#6b7280]">
                Change orders will appear once created from a project.
            </p>
            <Link href="/crm/projects">
                <Button
                    size="sm"
                    className="gap-1.5 bg-[#2B4C8C] text-white hover:bg-[#2B4C8C]/90"
                >
                    <Plus className="h-3.5 w-3.5" />
                    View Projects
                </Button>
            </Link>
        </div>
    );
}

export default function ChangeOrderIndex({ changeOrders, filters }: Props) {
    const applyFilter = (key: string, val: string) => {
        router.get(
            '/crm/change-orders',
            { ...filters, [key]: val || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="CRM · Change Orders" />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Sticky header */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-[#f8f9fc]/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-[#1a1a2e]">
                                Change Orders
                                <span className="ml-2 text-sm font-normal text-[#6b7280]">
                                    ·{' '}
                                    {changeOrders.meta?.total ??
                                        changeOrders.data.length}{' '}
                                    total
                                </span>
                            </h1>
                            <p className="text-[11px] text-[#6b7280]">
                                Track and manage change requests across all
                                projects
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={filters.status ?? ''}
                                onChange={(e) =>
                                    applyFilter('status', e.target.value)
                                }
                                className="h-8 rounded-lg border border-[#e2e6ef] bg-white px-2.5 text-xs text-[#6b7280] outline-none focus:border-[#2b4c8c] focus:ring-1 focus:ring-[#2b4c8c]/20"
                            >
                                <option value="">All statuses</option>
                                <option value="identified">Identified</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    {changeOrders.data.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#e2e6ef] text-left text-[11px] text-[#6b7280]">
                                    <th className="px-6 py-3 font-medium">
                                        Title
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Project
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Cost Impact
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Timeline Impact
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Created
                                    </th>
                                    <th className="w-12 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {changeOrders.data.map((co) => (
                                    <tr
                                        key={co.id}
                                        onClick={() =>
                                            router.visit(
                                                `/crm/projects/${co.project.id}/change-orders`,
                                            )
                                        }
                                        className="cursor-pointer border-b border-[#e2e6ef] text-[13px] text-[#1a1a2e] transition-all hover:bg-[#eef1f8]/50"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
                                                    <GitCompareArrows className="h-4 w-4 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[#1a1a2e]">
                                                        {co.title}
                                                    </div>
                                                    {co.description && (
                                                        <div className="max-w-[260px] truncate text-[11px] text-[#6b7280]">
                                                            {co.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/crm/projects/${co.project.id}`}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="font-medium text-[#2B4C8C] hover:underline"
                                            >
                                                {co.project.name}
                                            </Link>
                                            {co.project.organization && (
                                                <div className="text-[10px] text-[#6b7280]">
                                                    {co.project.organization.name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-[#1a1a2e]">
                                            {formatCurrency(co.cost_impact)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-[#6b7280]">
                                            {co.timeline_impact_days} day
                                            {co.timeline_impact_days !== 1
                                                ? 's'
                                                : ''}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                status={co.status}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-[#6b7280]">
                                            {formatDate(co.created_at)}
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
                                                                `/crm/projects/${co.project.id}/change-orders`,
                                                            );
                                                        }}
                                                        className="cursor-pointer focus:bg-[#eef1f8]"
                                                    >
                                                        <Eye className="mr-2 h-3 w-3" />
                                                        View Details
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
                    {changeOrders.meta &&
                        changeOrders.meta.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-[#e2e6ef] bg-[#f8f9fc] px-6 py-3">
                                <span className="text-[11px] text-[#6b7280]">
                                    Page {changeOrders.meta.current_page} of{' '}
                                    {changeOrders.meta.last_page}
                                    <span className="mx-1.5">·</span>
                                    {changeOrders.meta.total} change orders
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {changeOrders.meta.links
                                        ?.filter((l: any) => l.url)
                                        .map((l: any, i: number) => {
                                            const label =
                                                l.label ===
                                                'pagination.previous'
                                                    ? '‹'
                                                    : l.label ===
                                                        'pagination.next'
                                                      ? '›'
                                                      : l.label;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() =>
                                                        router.get(l.url, {}, {
                                                            preserveState: true,
                                                        })
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
