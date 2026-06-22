import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, FolderKanban } from 'lucide-react';
import { useState } from 'react';
import ProjectStatusBadge from '@/components/crm/project-status-badge';

interface Organization {
    id: number;
    name: string;
}

interface Project {
    id: number;
    name: string;
    status: string;
    contract_value: number;
    change_order_total: number;
    start_date: string | null;
    target_end_date: string | null;
    organization: Organization | null;
    created_at: string;
}

interface Props {
    projects: { data: Project[]; meta: any };
    filters: Record<string, string | undefined>;
}

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
}

export default function ProjectIndex({ projects, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    let searchTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (val: string) => {
        setSearch(val);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            router.get('/crm/projects', { ...filters, search: val || undefined }, { preserveState: true, replace: true });
        }, 300);
    };

    const applyFilter = (key: string, val: string) => {
        router.get('/crm/projects', { ...filters, [key]: val || undefined }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="CRM · Projects" />

            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-3">
                    <h1 className="text-base font-medium text-[#e8e8ed]">Projects</h1>
                </div>

                <div className="flex items-center gap-3 border-b border-[#1e1e2a] px-6 py-2.5">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555570]" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Search projects..."
                            className="w-full rounded-md border border-[#1e1e2a] bg-[#0f0f14] py-1.5 pl-8 pr-3 text-xs text-[#e8e8ed] placeholder-[#555570] outline-none focus:border-[#3b6cdb]"
                        />
                    </div>
                    <select
                        value={filters.status ?? ''}
                        onChange={e => applyFilter('status', e.target.value)}
                        className="rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#8b8b9e] outline-none focus:border-[#3b6cdb]"
                    >
                        <option value="">All statuses</option>
                        <option value="planned">Planned</option>
                        <option value="initiating">Initiating</option>
                        <option value="active">Active</option>
                        <option value="at_risk">At Risk</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1e1e2a] text-[10px] font-medium uppercase tracking-wider text-[#555570]">
                                <th className="px-6 py-2.5 text-left">Name</th>
                                <th className="px-4 py-2.5 text-left">Organization</th>
                                <th className="px-4 py-2.5 text-left">Status</th>
                                <th className="px-4 py-2.5 text-right">Value</th>
                                <th className="px-4 py-2.5 text-left">Target End</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-[#e8e8ed]">
                            {projects.data.map(project => (
                                <tr
                                    key={project.id}
                                    onClick={() => router.visit(`/crm/projects/${project.id}`)}
                                    className="cursor-pointer border-b border-[#1e1e2a] transition-colors hover:bg-[#0f0f14]"
                                >
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#1a1a24]">
                                                <FolderKanban className="h-3.5 w-3.5 text-[#555570]" />
                                            </div>
                                            <span className="font-medium text-[#e8e8ed]">{project.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-[#8b8b9e]">{project.organization?.name ?? '-'}</td>
                                    <td className="px-4 py-3"><ProjectStatusBadge status={project.status} /></td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {formatCurrency(project.contract_value + project.change_order_total)}
                                    </td>
                                    <td className="px-4 py-3 text-[#555570]">
                                        {project.target_end_date ? new Date(project.target_end_date).toLocaleDateString() : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {projects.data.length === 0 && (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <FolderKanban className="mx-auto mb-3 h-8 w-8 text-[#1e1e2a]" />
                                <p className="text-sm text-[#555570]">No projects yet</p>
                                <p className="mt-1 text-xs text-[#555570]">Convert a deal to create your first project.</p>
                            </div>
                        </div>
                    )}

                    {projects.meta && (
                        <div className="flex items-center justify-between border-t border-[#1e1e2a] px-6 py-2.5 text-[11px] text-[#555570]">
                            <span>Page {projects.meta.current_page} of {projects.meta.last_page}</span>
                            <div className="flex gap-2">
                                {projects.meta.links?.filter((l: any) => l.url).map((l: any) => (
                                    <button
                                        key={l.label}
                                        onClick={() => router.get(l.url, {}, { preserveState: true })}
                                        className={`rounded px-2 py-1 transition-colors ${l.active ? 'bg-[#1e1e2a] text-[#e8e8ed]' : 'text-[#555570] hover:text-[#8b8b9e]'}`}
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
