import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import SeverityBadge from '@/components/crm/severity-badge';
import ProjectStatusBadge from '@/components/crm/project-status-badge';
import { cn } from '@/lib/utils';

interface Owner {
    id: number;
    name: string;
}

interface Issue {
    id: number;
    description: string;
    severity: string;
    status: string;
    owner: Owner | null;
    created_at: string;
    project: {
        id: number;
        name: string;
        status: string;
        organization: { id: number; name: string } | null;
    };
}

interface Props {
    issues: { data: Issue[]; meta: any };
    filters: Record<string, string | undefined>;
}

const severityOrder = ['blocker', 'critical', 'major', 'minor'];

export default function IssuesIndex({ issues, filters }: Props) {
    const grouped = severityOrder.map((sev) => ({
        severity: sev,
        items: issues.data.filter((i) => i.severity === sev),
    }));

    const applyFilter = (key: string, val: string) => {
        router.get(
            '/crm/issues',
            { ...filters, [key]: val || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="CRM · Issues" />

            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#e2e6ef] px-6 py-3">
                    <div className="flex items-center gap-2">
                        <h1 className="text-base font-medium text-[#1a1a2e]">
                            Issues
                        </h1>
                        <span className="text-[11px] text-[#6b7280]">
                            {issues.meta?.total ?? issues.data.length}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-b border-[#e2e6ef] px-6 py-2.5">
                    <select
                        value={filters.severity ?? ''}
                        onChange={(e) => applyFilter('severity', e.target.value)}
                        className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                    >
                        <option value="">All severities</option>
                        <option value="blocker">Blocker</option>
                        <option value="critical">Critical</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                    </select>
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter('status', e.target.value)}
                        className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                    >
                        <option value="">All statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    {issues.data.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-[#e2e6ef]" />
                                <p className="text-sm text-[#6b7280]">
                                    No issues found
                                </p>
                                <p className="mt-1 text-xs text-[#6b7280]">
                                    Try adjusting your filters.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-3">
                            {grouped.map((group) => (
                                <div key={group.severity}>
                                    <div className="mb-2 flex items-center gap-2">
                                        <SeverityBadge
                                            severity={group.severity}
                                            size="md"
                                        />
                                        <span className="text-[10px] text-[#6b7280]">
                                            {group.items.length}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {group.items.map((i) => (
                                            <Link
                                                key={i.id}
                                                href={`/crm/projects/${i.project.id}/issues`}
                                                className="block rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-2.5 transition-colors hover:border-[#2a2a3a]"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle
                                                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                                        style={{
                                                            color:
                                                                i.severity === 'blocker' || i.severity === 'critical'
                                                                    ? '#f87171'
                                                                    : i.severity === 'major'
                                                                      ? '#fbbf24'
                                                                      : '#555570',
                                                        }}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 line-clamp-2 text-xs leading-relaxed text-[#e8e8ed]">
                                                            {i.description}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <SeverityBadge severity={i.severity} />
                                                            <span className="text-[9px] text-[#555570] capitalize">
                                                                {i.status.replace(/_/g, ' ')}
                                                            </span>
                                                            {i.owner && (
                                                                <span className="text-[9px] text-[#555570]">
                                                                    {i.owner.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-1.5 border-t border-[#1e1e2a] pt-1">
                                                            <span className="text-[9px] font-medium text-[#555570]">
                                                                {i.project.name}
                                                            </span>
                                                            <ProjectStatusBadge status={i.project.status} />
                                                        </div>
                                                        <div className="mt-0.5 text-[8px] text-[#555570]">
                                                            {new Date(i.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        {group.items.length === 0 && (
                                            <div className="rounded border border-dashed border-[#e2e6ef] p-3 text-center text-[10px] text-[#6b7280]">
                                                No {group.severity} issues
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {issues.meta && issues.meta.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 border-t border-[#e2e6ef] px-6 py-3">
                        {issues.meta.links
                            ?.filter((l: any) => l.url)
                            .map((link: any, i: number) => {
                                const label =
                                    link.label === 'pagination.previous'
                                        ? '\u2039'
                                        : link.label === 'pagination.next'
                                          ? '\u203A'
                                          : link.label;
                                return (
                                    <button
                                        key={i}
                                        onClick={() =>
                                            router.get(link.url, {}, { preserveState: true })
                                        }
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
        </>
    );
}
