import { Head, Link, router } from '@inertiajs/react';
import { Flag, CalendarDays, ListChecks, ArrowUpDown } from 'lucide-react';
import ProjectStatusBadge from '@/components/crm/project-status-badge';

interface Deliverable {
    id: number;
    name: string;
    status: string;
}

interface Milestone {
    id: number;
    name: string;
    description: string | null;
    status: string;
    sort_order: number;
    start_date: string | null;
    end_date: string | null;
    actual_end_date: string | null;
    created_at: string;
    project: { id: number; name: string; status: string; organization: { id: number; name: string } | null };
    deliverables: Deliverable[];
}

interface Props {
    milestones: { data: Milestone[]; meta: any };
    filters: Record<string, string | undefined>;
}

function formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: '#6b7280', bg: '#f3f4f6' },
    in_progress: { label: 'In Progress', color: '#3b82f6', bg: '#eff6ff' },
    completed: { label: 'Completed', color: '#10b981', bg: '#ecfdf5' },
};

const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

export default function MilestonesIndex({ milestones, filters }: Props) {
    const applyFilter = (key: string, val: string) => {
        router.get(
            '/crm/milestones',
            { ...filters, [key]: val || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="CRM · Milestones" />

            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 px-6 py-3">
                    <h1 className="text-base font-medium text-[#1a1a2e]">
                        Milestones
                        {milestones.meta?.total > 0 && (
                            <span className="ml-2 text-xs font-normal text-[#6b7280]">
                                ({milestones.meta.total})
                            </span>
                        )}
                    </h1>
                </div>

                <div className="flex items-center gap-3 border-b border-[#e2e6ef] px-6 py-2.5">
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
                    <select
                        value={filters.sort ?? ''}
                        onChange={(e) => applyFilter('sort', e.target.value)}
                        className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                    >
                        <option value="">Sort by date</option>
                        <option value="start_date">Start date</option>
                        <option value="end_date">End date</option>
                    </select>
                    <select
                        value={filters.dir ?? ''}
                        onChange={(e) => applyFilter('dir', e.target.value)}
                        className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#e2e6ef] text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                                <th className="px-6 py-2.5 text-left">Name</th>
                                <th className="px-4 py-2.5 text-left">Project</th>
                                <th className="px-4 py-2.5 text-left">Status</th>
                                <th className="px-4 py-2.5 text-left">Dates</th>
                                <th className="px-4 py-2.5 text-center">Deliverables</th>
                                <th className="px-4 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-[#1a1a2e]">
                            {milestones.data.map((ms) => {
                                const st = statusStyles[ms.status] ?? statusStyles.pending;
                                const deliverableCounts = {
                                    total: ms.deliverables.length,
                                    completed: ms.deliverables.filter((d) => d.status === 'completed').length,
                                };
                                return (
                                    <tr
                                        key={ms.id}
                                        className="border-b border-[#e2e6ef] hover:bg-[#f8f9fc]"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded bg-[#f3f4f6]">
                                                    <Flag className="h-3.5 w-3.5 text-[#6b7280]" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[#1a1a2e]">
                                                        {ms.name}
                                                    </div>
                                                    {ms.description && (
                                                        <div className="mt-0.5 text-[10px] text-[#6b7280] line-clamp-1">
                                                            {ms.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <Link
                                                    href={`/crm/projects/${ms.project.id}`}
                                                    className="font-medium text-[#2B4C8C] hover:underline"
                                                >
                                                    {ms.project.name}
                                                </Link>
                                                <ProjectStatusBadge status={ms.project.status} />
                                            </div>
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
                                                <span>
                                                    {formatDate(ms.start_date)}
                                                    {' — '}
                                                    {formatDate(ms.end_date)}
                                                </span>
                                            </div>
                                            {ms.actual_end_date && (
                                                <div className="mt-0.5 text-[10px] text-[#10b981]">
                                                    Completed {formatDate(ms.actual_end_date)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link
                                                href={`/crm/projects/${ms.project.id}/milestones/${ms.id}/deliverables`}
                                                className="flex items-center justify-center gap-1 text-[#2B4C8C] hover:underline"
                                            >
                                                <ListChecks className="h-3 w-3" />
                                                {deliverableCounts.completed}/{deliverableCounts.total}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/crm/projects/${ms.project.id}/milestones`}
                                                className="rounded border border-[#e2e6ef] px-2 py-1 text-[10px] text-[#6b7280] hover:border-[#c8ccd6]"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {milestones.data.length === 0 && (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <Flag className="mx-auto mb-3 h-8 w-8 text-[#e2e6ef]" />
                                <p className="text-sm text-[#6b7280]">No milestones found</p>
                            </div>
                        </div>
                    )}

                    {milestones.meta && milestones.meta.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-[#e2e6ef] px-6 py-2.5 text-[11px] text-[#6b7280]">
                            <span>
                                Page {milestones.meta.current_page} of {milestones.meta.last_page}
                            </span>
                            <div className="flex gap-2">
                                {milestones.meta.links
                                    ?.filter((l: any) => l.url)
                                    .map((l: any) => (
                                        <button
                                            key={l.label}
                                            onClick={() =>
                                                router.get(l.url, {}, { preserveState: true })
                                            }
                                            className={`rounded px-2 py-1 transition-colors ${
                                                l.active
                                                    ? 'bg-[#2B4C8C] text-white'
                                                    : 'text-[#6b7280] hover:text-[#1a1a2e]'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: l.label }}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
