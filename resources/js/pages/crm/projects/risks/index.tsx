import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import RiskIssueCard from '@/components/crm/risk-issue-card';
import SeverityBadge from '@/components/crm/severity-badge';
import ProjectStatusBadge from '@/components/crm/project-status-badge';

interface Owner {
    id: number;
    name: string;
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
    created_at: string;
}

interface Project {
    id: number;
    name: string;
    status: string;
    organization: { id: number; name: string } | null;
}

interface Props {
    project: Project;
    risks: { data: Risk[]; meta: any };
    filters: Record<string, string | undefined>;
}

function formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const severityOrder = ['critical', 'high', 'medium', 'low'];

export default function RiskBoard({ project, risks, filters }: Props) {
    const grouped = severityOrder.map(sev => ({
        severity: sev,
        items: risks.data.filter(r => r.severity === sev),
    }));

    const applyFilter = (key: string, val: string) => {
        router.get(`/crm/projects/${project.id}/risks`, { ...filters, [key]: val || undefined }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title={`CRM · Risks · ${project.name}`} />

            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-2.5">
                    <div className="flex items-center gap-3">
                        <Link href={`/crm/projects/${project.id}`} className="flex h-7 w-7 items-center justify-center rounded text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <Link href={`/crm/projects/${project.id}`} className="text-[#555570] hover:text-[#8b8b9e]">{project.name}</Link>
                            <span className="text-[#555570]">/</span>
                            <span className="text-[#e8e8ed]">Risks</span>
                        </div>
                    </div>
                    <ProjectStatusBadge status={project.status} />
                </div>

                <div className="flex items-center gap-3 border-b border-[#1e1e2a] px-6 py-2.5">
                    <select
                        value={filters.status ?? ''}
                        onChange={e => applyFilter('status', e.target.value)}
                        className="rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#8b8b9e] outline-none focus:border-[#3b6cdb]"
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
                                <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-[#1e1e2a]" />
                                <p className="text-sm text-[#555570]">No risks logged</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-3">
                            {grouped.map(group => (
                                <div key={group.severity}>
                                    <div className="mb-2 flex items-center gap-2">
                                        <SeverityBadge severity={group.severity} size="md" />
                                        <span className="text-[10px] text-[#555570]">{group.items.length}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {group.items.map(r => (
                                            <RiskIssueCard key={r.id} id={r.id} description={r.description} severity={r.severity} status={r.status} owner={r.owner} projectId={project.id} type="risk" />
                                        ))}
                                        {group.items.length === 0 && (
                                            <div className="rounded border border-dashed border-[#1e1e2a] p-3 text-center text-[10px] text-[#555570]">
                                                No {group.severity} risks
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
