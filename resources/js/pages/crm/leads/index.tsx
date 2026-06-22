import { Head, Link } from '@inertiajs/react';
import {
    Search,
    Filter,
    LayoutGrid,
    List,
    ChevronDown,
    MoreHorizontal,
    Phone,
    Mail,
    Calendar,
    Globe,
} from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Lead {
    id: number;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    source: string;
    stage: string;
    priority: string;
    assigned_to?: number | null;
    created_at: string;
    updated_at: string;
    last_contacted_at?: string | null;
    converted_at?: string | null;
    assignedTo?: { id: number; name: string } | null;
}

interface LeadsPageProps {
    leads: { data: Lead[]; meta: any };
    kanban_groups: Record<string, Lead[]>;
    stages: string[];
    sources: string[];
    filters: {
        search?: string;
        stage?: string;
        source?: string;
        priority?: string;
        sort?: string;
        dir?: string;
    };
}

function StageBadge({ stage }: { stage: string }) {
    const colors: Record<string, string> = {
        new: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        contacted: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        qualified: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
        proposal: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        negotiation: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        converted: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        lost: 'text-red-400 bg-red-500/10 border-red-500/20',
    };

    return (
        <span
            className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${colors[stage] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}
        >
            {stage}
        </span>
    );
}

function PriorityDot({ priority }: { priority: string }) {
    const colors: Record<string, string> = {
        high: 'bg-rose-500',
        medium: 'bg-amber-500',
        low: 'bg-slate-500',
    };

    return <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[priority] ?? 'bg-slate-500'}`} />;
}

function SourceIcon({ source }: { source: string }) {
    const icons: Record<string, React.ElementType> = {
        consultation: Calendar,
        proposal: Mail,
        quote: Mail,
        contact: Phone,
        seller_registration: Globe,
        newsletter: Mail,
    };
    const Icon = icons[source] ?? Phone;

    return <Icon className="h-3 w-3" />;
}

function formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
return 'Today';
}

    if (days === 1) {
return 'Yesterday';
}

    if (days < 7) {
return `${days}d ago`;
}

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function KanbanCard({ lead }: { lead: Lead }) {
    return (
        <Link
            href={`/crm/leads/${lead.id}`}
            className="block rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3 transition-all hover:border-[#2a2a3a] hover:bg-[#14141e]"
        >
            <div className="mb-2 flex items-start justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a24] text-[11px] font-medium text-[#8b8b9e]">
                    {lead.name.charAt(0)}
                </div>
                <div className="flex items-center gap-1.5">
                    <PriorityDot priority={lead.priority} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex h-5 w-5 items-center justify-center rounded text-[#555570] hover:bg-[#1a1a24] hover:text-[#8b8b9e]">
                                <MoreHorizontal className="h-3 w-3" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-32 border-[#1e1e2a] bg-[#0f0f14] text-xs text-[#e8e8ed]"
                        >
                            <DropdownMenuItem className="cursor-pointer focus:bg-[#1a1a24]">
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-400 focus:bg-[#1a1a24]">
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <h3 className="mb-1 text-[13px] font-medium text-[#e8e8ed]">{lead.name}</h3>

            {lead.company && (
                <p className="mb-2 text-[11px] text-[#555570]">{lead.company}</p>
            )}

            <div className="flex items-center gap-2 text-[11px] text-[#555570]">
                <SourceIcon source={lead.source} />
                <span>{lead.source.replace(/_/g, ' ')}</span>
                <span>·</span>
                <span>{formatDate(lead.created_at)}</span>
            </div>

            {lead.phone && (
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#555570]">
                    <Phone className="h-3 w-3" />
                    <span>{lead.phone}</span>
                </div>
            )}
        </Link>
    );
}

function KanbanColumn({ stage, leads }: { stage: string; leads: Lead[] }) {
    return (
        <div className="flex w-64 shrink-0 flex-col">
            <div className="mb-3 flex items-center justify-between px-0.5">
                <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-medium uppercase tracking-wider text-[#8b8b9e]">
                        {stage.replace(/_/g, ' ')}
                    </h3>
                    <span className="rounded bg-[#1a1a24] px-1.5 py-0.5 text-[10px] text-[#555570]">
                        {leads.length}
                    </span>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {leads.map((lead) => (
                    <KanbanCard key={lead.id} lead={lead} />
                ))}
            </div>
        </div>
    );
}

function LeadRow({ lead }: { lead: Lead }) {
    return (
        <tr className="border-b border-[#1e1e2a] text-[13px] text-[#e8e8ed] transition-colors hover:bg-[#1a1a24]">
            <td className="px-4 py-3">
                <Link href={`/crm/leads/${lead.id}`} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a24] text-[11px] font-medium text-[#8b8b9e]">
                        {lead.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-[11px] text-[#555570]">{lead.email}</div>
                    </div>
                </Link>
            </td>
            <td className="px-4 py-3 text-[#8b8b9e]">{lead.company ?? '—'}</td>
            <td className="px-4 py-3 text-[#8b8b9e]">{lead.phone ?? '—'}</td>
            <td className="px-4 py-3">
                <StageBadge stage={lead.stage} />
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <PriorityDot priority={lead.priority} />
                    <span className="text-[11px] capitalize text-[#555570]">{lead.priority}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[#555570]">
                    <SourceIcon source={lead.source} />
                    <span className="capitalize">{lead.source.replace(/_/g, ' ')}</span>
                </div>
            </td>
            <td className="px-4 py-3 text-[11px] text-[#555570]">{formatDate(lead.created_at)}</td>
            <td className="px-4 py-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex h-7 w-7 items-center justify-center rounded text-[#555570] hover:bg-[#1a1a24] hover:text-[#8b8b9e]">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-32 border-[#1e1e2a] bg-[#0f0f14] text-xs text-[#e8e8ed]"
                    >
                        <DropdownMenuItem className="cursor-pointer focus:bg-[#1a1a24]">
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-400 focus:bg-[#1a1a24]">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
}

export default function LeadsIndex({ leads, kanban_groups, stages, sources, filters }: LeadsPageProps) {
    const [view, setView] = useState<'kanban' | 'list'>('kanban');
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(window.location.search);

        if (search) {
params.set('search', search);
} else {
params.delete('search');
}

        window.location.href = `/crm/leads?${params.toString()}`;
    };

    const stageOrder = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted', 'lost'];

    return (
        <>
            <Head title="CRM · Leads" />

            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-3">
                    <div>
                        <h1 className="text-lg font-medium text-[#e8e8ed]">Leads</h1>
                        <p className="text-xs text-[#555570]">
                            {leads.meta?.total ?? 0} total
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View toggle */}
                        <div className="flex rounded-md border border-[#1e1e2a] bg-[#0f0f14] p-0.5">
                            <button
                                onClick={() => setView('kanban')}
                                className={`flex h-7 w-7 items-center justify-center rounded text-xs transition-colors ${
                                    view === 'kanban'
                                        ? 'bg-[#1e1e2a] text-[#e8e8ed]'
                                        : 'text-[#555570] hover:text-[#8b8b9e]'
                                }`}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`flex h-7 w-7 items-center justify-center rounded text-xs transition-colors ${
                                    view === 'list'
                                        ? 'bg-[#1e1e2a] text-[#e8e8ed]'
                                        : 'text-[#555570] hover:text-[#8b8b9e]'
                                }`}
                            >
                                <List className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 border-b border-[#1e1e2a] px-6 py-2.5">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555570]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search leads..."
                            className="h-8 w-56 rounded-md border border-[#1e1e2a] bg-[#0f0f14] pl-8 pr-3 text-xs text-[#e8e8ed] placeholder-[#555570] outline-none focus:border-[#3b6cdb]"
                        />
                    </form>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 text-xs text-[#8b8b9e] transition-colors hover:border-[#2a2a3a]">
                                <Filter className="h-3.5 w-3.5" />
                                Stage
                                <ChevronDown className="h-3 w-3" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40 border-[#1e1e2a] bg-[#0f0f14] text-xs text-[#e8e8ed]">
                            {stages.map((s) => (
                                <DropdownMenuItem key={s} asChild className="cursor-pointer capitalize focus:bg-[#1a1a24]">
                                    <Link
                                        href={
                                            filters.stage === s
                                                ? `/crm/leads?${new URLSearchParams({ ...filters, stage: '' }).toString()}`
                                                : `/crm/leads?${new URLSearchParams({ ...filters, stage: s, search: filters.search ?? '' }).toString()}`
                                        }
                                        preserveState
                                    >
                                        {s.replace(/_/g, ' ')}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 text-xs text-[#8b8b9e] transition-colors hover:border-[#2a2a3a]">
                                <Filter className="h-3.5 w-3.5" />
                                Source
                                <ChevronDown className="h-3 w-3" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40 border-[#1e1e2a] bg-[#0f0f14] text-xs text-[#e8e8ed]">
                            {sources.map((s) => (
                                <DropdownMenuItem key={s} asChild className="cursor-pointer capitalize focus:bg-[#1a1a24]">
                                    <Link
                                        href={
                                            filters.source === s
                                                ? `/crm/leads?${new URLSearchParams({ ...filters, source: '' }).toString()}`
                                                : `/crm/leads?${new URLSearchParams({ ...filters, source: s, search: filters.search ?? '' }).toString()}`
                                        }
                                        preserveState
                                    >
                                        {s.replace(/_/g, ' ')}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    {view === 'kanban' ? (
                        <div className="flex gap-4 overflow-x-auto px-6 py-4">
                            {stageOrder.map((stage) => (
                                <KanbanColumn
                                    key={stage}
                                    stage={stage}
                                    leads={kanban_groups[stage] ?? []}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#1e1e2a] text-left text-[11px] text-[#555570]">
                                        <th className="px-4 py-2.5 font-medium">Name</th>
                                        <th className="px-4 py-2.5 font-medium">Company</th>
                                        <th className="px-4 py-2.5 font-medium">Phone</th>
                                        <th className="px-4 py-2.5 font-medium">Stage</th>
                                        <th className="px-4 py-2.5 font-medium">Priority</th>
                                        <th className="px-4 py-2.5 font-medium">Source</th>
                                        <th className="px-4 py-2.5 font-medium">Created</th>
                                        <th className="px-4 py-2.5 font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.data.length > 0 ? (
                                        leads.data.map((lead) => (
                                            <LeadRow key={lead.id} lead={lead} />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-xs text-[#555570]">
                                                No leads found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
