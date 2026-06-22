import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Copy, Trash2, Play, Pause, Workflow } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Workflow {
    id: number;
    name: string;
    description: string | null;
    entity_type: string;
    is_active: boolean;
    version: number;
    slug: string;
    triggers_count: number;
    conditions_count: number;
    actions_count: number;
    created_at: string;
}

interface Props {
    workflows: { data: Workflow[]; meta: any };
    entity_types: string[];
    filters: Record<string, string | undefined>;
}

export default function WorkflowIndex({ workflows, entity_types, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [entityFilter, setEntityFilter] = useState(filters.entity_type ?? '');
    const [activeFilter, setActiveFilter] = useState(filters.is_active ?? '');

    let searchTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (val: string) => {
        setSearch(val);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            router.get('/crm/workflows', { ...filters, search: val || undefined }, { preserveState: true, replace: true });
        }, 300);
    };

    const applyFilter = (key: string, val: string) => {
        router.get('/crm/workflows', { ...filters, [key]: val || undefined }, { preserveState: true, replace: true });
    };

    const handleToggle = async (workflow: Workflow) => {
        const res = await fetch(`/crm/workflows/${workflow.id}/toggle`, { method: 'POST' });
        if (!res.ok) { toast.error('Failed to toggle workflow'); return; }
        toast.success(workflow.is_active ? 'Workflow paused' : 'Workflow activated');
        router.reload();
    };

    const handleDuplicate = async (workflow: Workflow) => {
        const res = await fetch(`/crm/workflows/${workflow.id}/duplicate`, { method: 'POST' });
        if (!res.ok) { toast.error('Failed to duplicate workflow'); return; }
        toast.success('Workflow duplicated');
        router.reload();
    };

    const handleDelete = async (workflow: Workflow) => {
        if (!confirm(`Delete "${workflow.name}"? This cannot be undone.`)) return;
        const res = await fetch(`/crm/workflows/${workflow.id}`, { method: 'DELETE' });
        if (!res.ok) { toast.error('Failed to delete workflow'); return; }
        toast.success('Workflow deleted');
        router.reload();
    };

    return (
        <>
            <Head title="CRM · Workflows" />

            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-3">
                    <h1 className="text-base font-medium text-[#e8e8ed]">Workflows</h1>
                    <Link
                        href="/crm/workflows/create"
                        className="flex items-center gap-1.5 rounded-md bg-[#2B4C8C] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3b5d9c]"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        New Workflow
                    </Link>
                </div>

                <div className="flex items-center gap-3 border-b border-[#1e1e2a] px-6 py-2.5">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555570]" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Search workflows..."
                            className="w-full rounded-md border border-[#1e1e2a] bg-[#0f0f14] py-1.5 pl-8 pr-3 text-xs text-[#e8e8ed] placeholder-[#555570] outline-none focus:border-[#3b6cdb]"
                        />
                    </div>

                    <select
                        value={entityFilter}
                        onChange={e => { setEntityFilter(e.target.value); applyFilter('entity_type', e.target.value); }}
                        className="rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#8b8b9e] outline-none focus:border-[#3b6cdb]"
                    >
                        <option value="">All entities</option>
                        {entity_types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <select
                        value={activeFilter}
                        onChange={e => { setActiveFilter(e.target.value); applyFilter('is_active', e.target.value); }}
                        className="rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#8b8b9e] outline-none focus:border-[#3b6cdb]"
                    >
                        <option value="">All status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1e1e2a] text-[10px] font-medium uppercase tracking-wider text-[#555570]">
                                <th className="px-6 py-2.5 text-left">Name</th>
                                <th className="px-4 py-2.5 text-left">Entity</th>
                                <th className="px-4 py-2.5 text-center">Triggers</th>
                                <th className="px-4 py-2.5 text-center">Conditions</th>
                                <th className="px-4 py-2.5 text-center">Actions</th>
                                <th className="px-4 py-2.5 text-center">Status</th>
                                <th className="px-4 py-2.5 text-center">Version</th>
                                <th className="px-4 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-[#e8e8ed]">
                            {workflows.data.map(workflow => (
                                <tr
                                    key={workflow.id}
                                    className="cursor-pointer border-b border-[#1e1e2a] transition-colors hover:bg-[#0f0f14]"
                                >
                                    <td className="px-6 py-3" onClick={() => router.visit(`/crm/workflows/${workflow.id}`)}>
                                        <div>
                                            <span className="font-medium text-[#e8e8ed]">{workflow.name}</span>
                                            {workflow.description && (
                                                <div className="mt-0.5 max-w-md truncate text-[10px] text-[#555570]">{workflow.description}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3" onClick={() => router.visit(`/crm/workflows/${workflow.id}`)}>
                                        <span className="rounded bg-[#1a1a24] px-2 py-0.5 text-[10px] text-[#8b8b9e]">{workflow.entity_type}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center" onClick={() => router.visit(`/crm/workflows/${workflow.id}`)}>
                                        <span className="rounded bg-[#1a1a24] px-2 py-0.5 text-[#8b8b9e]">{workflow.triggers_count}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center" onClick={() => router.visit(`/crm/workflows/${workflow.id}`)}>
                                        <span className="rounded bg-[#1a1a24] px-2 py-0.5 text-[#8b8b9e]">{workflow.conditions_count}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center" onClick={() => router.visit(`/crm/workflows/${workflow.id}`)}>
                                        <span className="rounded bg-[#1a1a24] px-2 py-0.5 text-[#8b8b9e]">{workflow.actions_count}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center" onClick={() => router.visit(`/crm/workflows/${workflow.id}`)}>
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                workflow.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-[#1a1a24] text-[#555570]',
                                            )}
                                        >
                                            {workflow.is_active ? <Play className="h-2.5 w-2.5" fill="currentColor" /> : <Pause className="h-2.5 w-2.5" />}
                                            {workflow.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center" onClick={() => router.visit(`/crm/workflows/${workflow.id}`)}>
                                        <span className="text-[#555570]">v{workflow.version}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={e => { e.stopPropagation(); handleToggle(workflow); }}
                                                className="rounded p-1.5 text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]"
                                                title={workflow.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {workflow.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); handleDuplicate(workflow); }}
                                                className="rounded p-1.5 text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]"
                                                title="Duplicate"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); handleDelete(workflow); }}
                                                className="rounded p-1.5 text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-red-400"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {workflows.data.length === 0 && (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <Workflow className="mx-auto mb-3 h-8 w-8 text-[#1e1e2a]" />
                                <p className="text-sm text-[#555570]">No workflows yet</p>
                                <p className="mt-1 text-xs text-[#555570]">Create your first automation workflow.</p>
                            </div>
                        </div>
                    )}

                    {workflows.meta && (
                        <div className="flex items-center justify-between border-t border-[#1e1e2a] px-6 py-2.5 text-[11px] text-[#555570]">
                            <span>Page {workflows.meta.current_page} of {workflows.meta.last_page}</span>
                            <div className="flex gap-2">
                                {workflows.meta.links?.filter((l: any) => l.url).map((l: any) => (
                                    <button
                                        key={l.label}
                                        onClick={() => router.get(l.url, {}, { preserveState: true })}
                                        className={cn(
                                            'rounded px-2 py-1 transition-colors',
                                            l.active ? 'bg-[#1e1e2a] text-[#e8e8ed]' : 'text-[#555570] hover:text-[#8b8b9e]',
                                        )}
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
