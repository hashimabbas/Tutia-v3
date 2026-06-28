import { Head, Link, router } from '@inertiajs/react';
import { Package, CalendarDays, Building2, MoreHorizontal, Eye } from 'lucide-react';
import ProjectStatusBadge from '@/components/crm/project-status-badge';
import { useState, useCallback, useRef } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Deliverable {
    id: number;
    name: string;
    description: string | null;
    status: string;
    due_date: string | null;
    sort_order: number;
    acceptance_criteria: string | null;
    created_at: string;
    milestone: {
        id: number;
        name: string;
        project: {
            id: number;
            name: string;
            organization: { id: number; name: string } | null;
        };
    };
}

interface Props {
    deliverables: { data: Deliverable[]; meta: any };
    filters: Record<string, string | undefined>;
}

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: '#6b7280', bg: '#f3f4f6' },
    in_progress: { label: 'In Progress', color: '#3b82f6', bg: '#eff6ff' },
    completed: { label: 'Completed', color: '#10b981', bg: '#ecfdf5' },
    approved: { label: 'Approved', color: '#7c3aed', bg: '#f5f3ff' },
};

const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'approved', label: 'Approved' },
];

function formatDate(date: string | null): string {
    if (!date) return '-';
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
                    <Package className="h-8 w-8 text-[#6b7280]" />
                </div>
            </div>
            <h3 className="mb-1 text-base font-medium text-[#1a1a2e]">
                No deliverables found
            </h3>
            <p className="mb-6 max-w-[240px] text-center text-xs text-[#6b7280]">
                Deliverables will appear here once they are created within projects.
            </p>
        </div>
    );
}

export default function DeliverablesIndex({ deliverables, filters }: Props) {
    const navigate = useCallback((params: Record<string, string>) => {
        const sp = new URLSearchParams(window.location.search);
        Object.entries(params).forEach(([k, v]) => {
            if (v) sp.set(k, v);
            else sp.delete(k);
        });
        const qs = sp.toString();
        router.get(`/crm/deliverables${qs ? `?${qs}` : ''}`, {}, { preserveState: true, replace: true });
    }, []);

    const applyFilter = (key: string, val: string) => {
        navigate({ [key]: val });
    };

    return (
        <>
            <Head title="CRM · Deliverables" />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Sticky header */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-[#f8f9fc]/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-[#1a1a2e]">
                                Deliverables
                                <span className="ml-2 text-sm font-normal text-[#6b7280]">
                                    · {deliverables.meta?.total ?? deliverables.data.length} total
                                </span>
                            </h1>
                            <p className="text-[11px] text-[#6b7280]">
                                All deliverables across projects
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 border-b border-[#e2e6ef] bg-white px-6 py-2.5">
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter('status', e.target.value)}
                        className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    {deliverables.data.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#e2e6ef] text-left text-[11px] text-[#6b7280]">
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Milestone</th>
                                    <th className="px-4 py-3 font-medium">Project</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Due Date</th>
                                    <th className="w-12 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliverables.data.map((d) => {
                                    const st = statusStyles[d.status] ?? statusStyles.pending;
                                    return (
                                        <tr
                                            key={d.id}
                                            className="border-b border-[#e2e6ef] text-[13px] text-[#1a1a2e] transition-all hover:bg-[#eef1f8]/50"
                                        >
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-3.5 w-3.5 text-[#6b7280]" />
                                                    <div>
                                                        <div className="font-medium text-[#1a1a2e]">
                                                            {d.name}
                                                        </div>
                                                        {d.description && (
                                                            <div className="mt-0.5 text-[10px] text-[#6b7280] line-clamp-1">
                                                                {d.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-[#6b7280]">
                                                {d.milestone.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/crm/projects/${d.milestone.project.id}`}
                                                    className="flex items-center gap-1.5 text-[#1a1a2e] hover:text-[#2B4C8C]"
                                                >
                                                    <Building2 className="h-3 w-3 text-[#6b7280]" />
                                                    <span>{d.milestone.project.name}</span>
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                                                    style={{ color: st.color, backgroundColor: st.bg }}
                                                >
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[#6b7280]">
                                                <div className="flex items-center gap-1">
                                                    <CalendarDays className="h-3 w-3" />
                                                    <span>{formatDate(d.due_date)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b7280] transition-all hover:bg-[#e2e6ef] hover:text-[#374151]">
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
                                                                    `/crm/projects/${d.milestone.project.id}/milestones/${d.milestone.id}/deliverables`,
                                                                );
                                                            }}
                                                            className="cursor-pointer focus:bg-[#eef1f8]"
                                                        >
                                                            <Eye className="mr-2 h-3 w-3" />
                                                            View
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState />
                    )}

                    {/* Pagination */}
                    {deliverables.meta && deliverables.meta.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-[#e2e6ef] bg-[#f8f9fc] px-6 py-3">
                            <span className="text-[11px] text-[#6b7280]">
                                Page {deliverables.meta.current_page} of {deliverables.meta.last_page}
                                <span className="mx-1.5">·</span>
                                {deliverables.meta.total} deliverables
                            </span>
                            <div className="flex items-center gap-1.5">
                                {deliverables.meta.links
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
                                                    router.get(l.url, {}, { preserveState: true })
                                                }
                                                className={cn(
                                                    'flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 text-[11px] transition-all',
                                                    l.active
                                                        ? 'bg-[#2B4C8C] text-white shadow-sm'
                                                        : 'text-[#6b7280] hover:bg-[#e2e6ef] hover:text-[#374151]',
                                                )}
                                                dangerouslySetInnerHTML={{ __html: label }}
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
