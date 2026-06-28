import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import SeverityBadge from '@/components/crm/severity-badge';
import { cn } from '@/lib/utils';

interface Owner {
    id: number;
    name: string;
}

interface Organization {
    id: number;
    name: string;
}

interface Project {
    id: number;
    name: string;
    status: string;
    organization: Organization | null;
}

interface Risk {
    id: number;
    description: string;
    severity: string;
    probability: string;
    status: string;
    impact: string | null;
    mitigation_plan: string | null;
    owner: Owner | null;
    project: Project;
    created_at: string;
}

interface Props {
    risks: { data: Risk[]; meta: any };
    filters: Record<string, string | undefined>;
}

function formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function ProbabilityBadge({ probability }: { probability: string }) {
    const config: Record<string, { color: string; bg: string; label: string }> = {
        high: { color: '#f97316', bg: 'rgba(249,115,22,0.15)', label: 'High' },
        medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Medium' },
        low: { color: '#3b6cdb', bg: 'rgba(59,108,219,0.15)', label: 'Low' },
    };
    const c = config[probability] ?? config.low;
    return (
        <span
            className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium"
            style={{ backgroundColor: c.bg, color: c.color }}
        >
            {c.label}
        </span>
    );
}

const severityOrder = ['critical', 'high', 'medium', 'low'] as const;

export default function RiskBoard({ risks, filters }: Props) {
    const grouped = severityOrder.map((sev) => ({
        severity: sev,
        items: risks.data.filter((r) => r.severity === sev),
    }));

    const applyFilter = (key: string, val: string) => {
        router.get(
            '/crm/risks',
            { ...filters, [key]: val || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="CRM · Risks" />

            <div className="flex h-full flex-col">
                <div className="z-10 flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 px-6 py-2.5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/crm"
                            className="flex h-7 w-7 items-center justify-center rounded text-[#6b7280] transition-colors hover:bg-[#f8f9fc] hover:text-[#1a1a2e]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#1a1a2e]">Risks</span>
                            <span className="rounded bg-[#f0f2f7] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">
                                {risks.meta?.total ?? risks.data.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-b border-[#e2e6ef] px-6 py-2.5">
                    <select
                        value={filters.severity ?? ''}
                        onChange={(e) => applyFilter('severity', e.target.value)}
                        className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                    >
                        <option value="">All severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter('status', e.target.value)}
                        className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                    >
                        <option value="">All statuses</option>
                        <option value="identified">Identified</option>
                        <option value="being_mitigated">Being Mitigated</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    {risks.data.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-[#e2e6ef]" />
                                <p className="text-sm text-[#6b7280]">No risks logged</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-3">
                            {grouped.map((group) => (
                                <div key={group.severity}>
                                    <div className="mb-2 flex items-center gap-2">
                                        <SeverityBadge severity={group.severity} size="md" />
                                        <span className="text-[10px] text-[#6b7280]">
                                            {group.items.length}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {group.items.map((r) => (
                                            <Link
                                                key={r.id}
                                                href={`/crm/projects/${r.project.id}/risks`}
                                                className="block rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-2.5 transition-colors hover:border-[#2a2a3a]"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle
                                                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                                        style={{
                                                            color:
                                                                r.severity === 'critical'
                                                                    ? '#f87171'
                                                                    : r.severity === 'high'
                                                                      ? '#fbbf24'
                                                                      : '#555570',
                                                        }}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 line-clamp-2 text-xs leading-relaxed text-[#e8e8ed]">
                                                            {r.description}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <SeverityBadge severity={r.severity} />
                                                            <ProbabilityBadge probability={r.probability} />
                                                            <span className="text-[9px] text-[#555570] capitalize">
                                                                {r.status.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1.5 flex items-center gap-2 text-[9px] text-[#555570]">
                                                            <span className="truncate">
                                                                <span
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        router.visit(`/crm/projects/${r.project.id}`);
                                                                    }}
                                                                    className="cursor-pointer hover:text-[#2B4C8C]"
                                                                >
                                                                    {r.project.name}
                                                                </span>
                                                            </span>
                                                            {r.owner && (
                                                                <span className="shrink-0">{r.owner.name}</span>
                                                            )}
                                                            {r.project.organization && (
                                                                <span className="shrink-0 text-[#3d3d50]">
                                                                    {r.project.organization.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-0.5 text-[8px] text-[#3d3d50]">
                                                            {formatDate(r.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        {group.items.length === 0 && (
                                            <div className="rounded border border-dashed border-[#e2e6ef] p-3 text-center text-[10px] text-[#6b7280]">
                                                No {group.severity} risks
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {risks.meta && risks.meta.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-[#e2e6ef] bg-[#f8f9fc] px-6 py-3">
                        <span className="text-[11px] text-[#6b7280]">
                            Page {risks.meta.current_page} of {risks.meta.last_page}
                            <span className="mx-1.5">·</span>
                            {risks.meta.total} risks
                        </span>
                        <div className="flex items-center gap-1.5">
                            {risks.meta.links
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
        </>
    );
}
