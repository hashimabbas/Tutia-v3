import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import RiskIssueCard from '@/components/crm/risk-issue-card';
import SeverityBadge from '@/components/crm/severity-badge';
import ProjectStatusBadge from '@/components/crm/project-status-badge';

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
}

interface Project {
    id: number;
    name: string;
    status: string;
    organization: { id: number; name: string } | null;
}

interface Props {
    project: Project;
    issues: { data: Issue[]; meta: any };
    filters: Record<string, string | undefined>;
}

const severityOrder = ['blocker', 'critical', 'major', 'minor'];

export default function IssueBoard({ project, issues, filters }: Props) {
    const grouped = severityOrder.map(sev => ({
        severity: sev,
        items: issues.data.filter(i => i.severity === sev),
    }));

    const applyFilter = (key: string, val: string) => {
        router.get(`/crm/projects/${project.id}/issues`, { ...filters, [key]: val || undefined }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title={`CRM · Issues · ${project.name}`} />

            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 backdrop-blur-xl px-6 py-2.5 z-10">
                    <div className="flex items-center gap-3">
                        <Link href={`/crm/projects/${project.id}`} className="flex h-7 w-7 items-center justify-center rounded text-[#6b7280] transition-colors hover:bg-[#f8f9fc] hover:text-[#1a1a2e]">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <Link href={`/crm/projects/${project.id}`} className="text-[#6b7280] hover:text-[#1a1a2e]">{project.name}</Link>
                            <span className="text-[#6b7280]">/</span>
                            <span className="text-[#1a1a2e]">Issues</span>
                        </div>
                    </div>
                    <ProjectStatusBadge status={project.status} />
                </div>

                <div className="flex items-center gap-3 border-b border-[#e2e6ef] px-6 py-2.5">
                    <select
                        value={filters.status ?? ''}
                        onChange={e => applyFilter('status', e.target.value)}
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
                                <p className="text-sm text-[#6b7280]">No issues logged</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-3">
                            {grouped.map(group => (
                                <div key={group.severity}>
                                    <div className="mb-2 flex items-center gap-2">
                                        <SeverityBadge severity={group.severity} size="md" />
                                        <span className="text-[10px] text-[#6b7280]">{group.items.length}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {group.items.map(i => (
                                            <RiskIssueCard key={i.id} id={i.id} description={i.description} severity={i.severity} status={i.status} owner={i.owner} projectId={project.id} type="issue" />
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
            </div>
        </>
    );
}
