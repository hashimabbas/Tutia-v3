import { Head, Link, router } from '@inertiajs/react';
import {
    Search,
    LayoutGrid,
    List,
    ChevronDown,
    MoreHorizontal,
    Phone,
    Mail,
    Calendar,
    Globe,
    Plus,
    X,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Check,
    Trash2,
    Filter,
    Building2,
    User,
    Clock,
    Target,
    Zap,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Eye,
    Edit,
    Copy,
} from 'lucide-react';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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

const STAGE_CONFIG: Record<string, { label: string; color: string; dot: string; bar: string; glow: string }> = {
    new:          { label: 'New',          color: 'text-blue-700 bg-blue-50 border-blue-200',         dot: 'bg-blue-600',  bar: 'bg-blue-600',  glow: 'shadow-blue-500/10' },
    contacted:    { label: 'Contacted',     color: 'text-amber-700 bg-amber-50 border-amber-200',       dot: 'bg-amber-600', bar: 'bg-amber-600', glow: 'shadow-amber-500/10' },
    qualified:    { label: 'Qualified',     color: 'text-violet-700 bg-violet-50 border-violet-200',     dot: 'bg-violet-600', bar: 'bg-violet-600', glow: 'shadow-violet-500/10' },
    proposal:     { label: 'Proposal',      color: 'text-orange-700 bg-orange-50 border-orange-200',    dot: 'bg-orange-600', bar: 'bg-orange-600', glow: 'shadow-orange-500/10' },
    negotiation:  { label: 'Negotiation',   color: 'text-rose-700 bg-rose-50 border-rose-200',         dot: 'bg-rose-600',  bar: 'bg-rose-600',  glow: 'shadow-rose-500/10' },
    converted:    { label: 'Converted',     color: 'text-emerald-700 bg-emerald-50 border-emerald-200',   dot: 'bg-emerald-600', bar: 'bg-emerald-600', glow: 'shadow-emerald-500/10' },
    lost:         { label: 'Lost',          color: 'text-red-700 bg-red-50 border-red-200',            dot: 'bg-red-600',   bar: 'bg-red-600',   glow: 'shadow-red-500/10' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    high:   { label: 'High',   color: 'text-rose-700 bg-rose-50', dot: 'bg-rose-600' },
    medium: { label: 'Medium', color: 'text-amber-700 bg-amber-50', dot: 'bg-amber-600' },
    low:    { label: 'Low',    color: 'text-slate-600 bg-slate-100', dot: 'bg-slate-500' },
};

function StageBadge({ stage }: { stage: string }) {
    const cfg = STAGE_CONFIG[stage];
    if (!cfg) return null;
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize', cfg.color)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
        </span>
    );
}

function formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function EmptyState({ view, onCreate }: { view: string; onCreate: () => void }) {
    return (
        <div className="flex h-full flex-col items-center justify-center p-12">
            <div className="relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 ring-1 ring-[#e2e6ef]">
                    <Target className="h-8 w-8 text-[#6b7280]" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2B4C8C] ring-2 ring-white">
                    <Zap className="h-3 w-3 text-white" />
                </div>
            </div>
            <h3 className="mb-1 text-base font-medium text-[#1a1a2e]">No leads {view === 'kanban' ? 'in this view' : 'found'}</h3>
            <p className="mb-6 text-center text-xs text-[#6b7280] max-w-[240px]">
                {view === 'kanban'
                    ? 'Try changing your filter criteria or create a new lead to get started.'
                    : 'No leads match your current filters. Try adjusting your search or filter criteria.'}
            </p>
            <div className="flex gap-2">
                <Link href="/crm/leads/create">
                    <Button size="sm">
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        New Lead
                    </Button>
                </Link>
            </div>
        </div>
    );
}

function StatsRow({ kanban_groups }: { kanban_groups: Record<string, Lead[]> }) {
    const stageOrder = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted', 'lost'];
    const total = stageOrder.reduce((sum, s) => sum + (kanban_groups[s]?.length ?? 0), 0);
    const newCount = kanban_groups['new']?.length ?? 0;
    const convertedCount = kanban_groups['converted']?.length ?? 0;

    return (
        <div className="grid grid-cols-7 gap-2 px-6 pt-4">
            {stageOrder.map((stage) => {
                const count = kanban_groups[stage]?.length ?? 0;
                const cfg = STAGE_CONFIG[stage];
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                    <div
                        key={stage}
                        className={cn(
                            'relative overflow-hidden rounded-xl border border-[#e2e6ef] bg-white p-3 transition-all duration-200 hover:border-[#c8cce0]',
                            cfg?.glow,
                        )}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-1.5">
                                <span className={cn('h-1.5 w-1.5 rounded-full', cfg?.dot)} />
                                <span className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                                    {cfg?.label ?? stage}
                                </span>
                            </div>
                            <p className="mt-1.5 text-xl font-semibold text-[#1a1a2e]">{count}</p>
                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#e2e6ef]">
                                <div
                                    className={cn('h-full rounded-full transition-all duration-500', cfg?.bar)}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ActiveFilters({
    filters,
    stages,
    sources,
}: {
    filters: LeadsPageProps['filters'];
    stages: string[];
    sources: string[];
}) {
    const chips: { label: string; key: string; value?: string }[] = [];

    if (filters.search) chips.push({ label: `"${filters.search}"`, key: 'search' });
    if (filters.stage) {
        const s = stages.find((st) => st === filters.stage);
        if (s) chips.push({ label: `Stage: ${s.replace(/_/g, ' ')}`, key: 'stage' });
    }
    if (filters.source) {
        const s = sources.find((src) => src === filters.source);
        if (s) chips.push({ label: `Source: ${s.replace(/_/g, ' ')}`, key: 'source' });
    }
    if (filters.priority) chips.push({ label: `Priority: ${filters.priority}`, key: 'priority' });

    if (chips.length === 0) return null;

    const clear = (key: string) => {
        const params = new URLSearchParams(window.location.search);
        params.delete(key);
        window.location.href = `/crm/leads?${params.toString()}`;
    };

    const clearAll = () => {
        window.location.href = '/crm/leads';
    };

    return (
        <div className="flex flex-wrap items-center gap-1.5 px-6 pb-2">
            <span className="mr-0.5 text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">Filters:</span>
            {chips.map((chip) => (
                <button
                    key={chip.key}
                    onClick={() => clear(chip.key)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#e2e6ef] bg-[#e2e6ef] px-2.5 py-1 text-[11px] text-[#6b7280] transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e]"
                >
                    {chip.label}
                    <X className="h-3 w-3" />
                </button>
            ))}
            <button
                onClick={clearAll}
                className="text-[11px] text-[#6b7280] underline-offset-2 hover:text-[#374151] hover:underline"
            >
                Clear all
            </button>
        </div>
    );
}

function SortIcon({ field, currentSort, currentDir }: { field: string; currentSort?: string; currentDir?: string }) {
    if (currentSort !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
    if (currentDir === 'asc') return <ArrowUp className="ml-1 h-3 w-3 text-[#2b4c8c]" />;
    return <ArrowDown className="ml-1 h-3 w-3 text-[#2b4c8c]" />;
}

export default function LeadsIndex({ leads, kanban_groups, stages, sources, filters }: LeadsPageProps) {
    const [view, setView] = useState<'kanban' | 'list'>('kanban');
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const searchTimer = useRef<ReturnType<typeof setTimeout>>();

    const stageOrder = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted', 'lost'];

    const totalLeads = stageOrder.reduce((sum, s) => sum + (kanban_groups[s]?.length ?? 0), 0);
    const newToday = kanban_groups['new']?.filter((l) => {
        const d = new Date(l.created_at);
        const now = new Date();
        return d.toDateString() === now.toDateString();
    }).length ?? 0;

    const allLeadIds = useMemo(() => leads.data.map((l) => l.id), [leads.data]);

    const navigate = useCallback((params: Record<string, string>) => {
        const sp = new URLSearchParams(window.location.search);
        Object.entries(params).forEach(([k, v]) => {
            if (v) sp.set(k, v);
            else sp.delete(k);
        });
        window.location.href = `/crm/leads?${sp.toString()}`;
    }, []);

    const handleSearch = useCallback(
        (value: string) => {
            setSearch(value);
            if (searchTimer.current) clearTimeout(searchTimer.current);
            searchTimer.current = setTimeout(() => {
                navigate({ search: value, ...filters, search: value });
            }, 350);
        },
        [navigate, filters],
    );

    const handleSort = useCallback(
        (field: string) => {
            const dir = filters.sort === field && filters.dir === 'asc' ? 'desc' : 'asc';
            navigate({ sort: field, dir, search: filters.search ?? '' });
        },
        [navigate, filters],
    );

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedIds((prev) => {
            if (prev.size === allLeadIds.length) return new Set();
            return new Set(allLeadIds);
        });
    }, [allLeadIds]);

    useEffect(() => {
        setSelectAll(selectedIds.size === allLeadIds.length && allLeadIds.length > 0);
    }, [selectedIds, allLeadIds]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const bulkAction = useCallback(
        (action: string) => {
            if (selectedIds.size === 0) return;
            router.post(
                '/crm/leads/bulk-update',
                { ids: Array.from(selectedIds), stage: action },
                { preserveScroll: true, onSuccess: () => clearSelection() },
            );
        },
        [selectedIds, clearSelection],
    );

    const hasActiveFilters = filters.search || filters.stage || filters.source || filters.priority;

    return (
        <>
            <Head title="CRM · Leads" />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Modern Header */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-[#f8f9fc]/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-xl font-semibold text-[#1a1a2e] tracking-tight">
                                    Leads
                                    <span className="ml-2 text-sm font-normal text-[#6b7280]">· {totalLeads} total</span>
                                </h1>
                                <p className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
                                    {newToday > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                            <Zap className="h-2.5 w-2.5" />
                                            {newToday} new today
                                        </span>
                                    )}
                                    <span>Updated just now</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b7280]" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search leads..."
                                    className="h-8 w-[220px] rounded-lg border border-[#e2e6ef] bg-white pl-8 pr-8 text-xs text-[#1a1a2e] placeholder-[#6b7280] outline-none transition-all focus:w-[280px] focus:border-[#2b4c8c] focus:ring-1 focus:ring-[#2b4c8c]/20"
                                />
                                {search && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#374151]"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            <div className="h-5 w-px bg-[#e2e6ef]" />

                            {/* View toggle */}
                            <div className="flex rounded-lg border border-[#e2e6ef] bg-white p-0.5">
                                <button
                                    onClick={() => setView('kanban')}
                                    className={cn(
                                        'flex h-7 w-7 items-center justify-center rounded-md text-xs transition-all',
                                        view === 'kanban'
                                            ? 'bg-[#2B4C8C] text-white shadow-sm'
                                            : 'text-[#6b7280] hover:text-[#374151]',
                                    )}
                                    title="Kanban view"
                                >
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => setView('list')}
                                    className={cn(
                                        'flex h-7 w-7 items-center justify-center rounded-md text-xs transition-all',
                                        view === 'list'
                                            ? 'bg-[#2B4C8C] text-white shadow-sm'
                                            : 'text-[#6b7280] hover:text-[#374151]',
                                    )}
                                    title="List view"
                                >
                                    <List className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="h-5 w-px bg-[#e2e6ef]" />

                            <Link href="/crm/leads/create">
                                <Button size="sm" className="gap-1.5 bg-[#2B4C8C] text-white hover:bg-[#2B4C8C]/90">
                                    <Plus className="h-3.5 w-3.5" />
                                    New Lead
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filter bar */}
                    <div className="flex items-center gap-2 border-t border-[#e2e6ef] px-6 py-2.5">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#e2e6ef] bg-white px-2.5 text-[11px] text-[#6b7280] transition-all hover:border-[#c8cce0]">
                                    <Filter className="h-3 w-3" />
                                    Stage
                                    {filters.stage && (
                                        <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2B4C8C] text-[8px] font-medium text-white">
                                            1
                                        </span>
                                    )}
                                    <ChevronDown className="h-2.5 w-2.5 opacity-50" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="w-44 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]"
                            >
                                <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                                    Filter by stage
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-[#e2e6ef]" />
                                {stages.map((s) => {
                                    const cfg = STAGE_CONFIG[s];
                                    const count = kanban_groups[s]?.length ?? 0;
                                    const active = filters.stage === s;
                                    return (
                                        <DropdownMenuItem
                                            key={s}
                                            onClick={() =>
                                                navigate({
                                                    ...filters,
                                                    stage: active ? '' : s,
                                                    search: filters.search ?? '',
                                                })
                                            }
                                            className={cn(
                                                'flex cursor-pointer items-center justify-between focus:bg-[#eef1f8]',
                                                active && 'bg-[#e2e6ef]',
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {active && <Check className="h-3 w-3 text-[#2b4c8c]" />}
                                                <span className={cn('h-1.5 w-1.5 rounded-full', cfg?.dot)} />
                                                <span className="capitalize">{cfg?.label ?? s}</span>
                                            </div>
                                            <span className="text-[10px] text-[#6b7280]">{count}</span>
                                        </DropdownMenuItem>
                                    );
                                })}
                                {filters.stage && (
                                    <>
                                        <DropdownMenuSeparator className="bg-[#e2e6ef]" />
                                        <DropdownMenuItem
                                            onClick={() =>
                                                navigate({ search: filters.search ?? '', stage: '', source: filters.source ?? '' })
                                            }
                                            className="cursor-pointer justify-center text-[#6b7280] focus:bg-[#eef1f8]"
                                        >
                                            Clear filter
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#e2e6ef] bg-white px-2.5 text-[11px] text-[#6b7280] transition-all hover:border-[#c8cce0]">
                                    <Globe className="h-3 w-3" />
                                    Source
                                    <ChevronDown className="h-2.5 w-2.5 opacity-50" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="w-44 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]"
                            >
                                <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                                    Filter by source
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-[#e2e6ef]" />
                                {sources.map((s) => {
                                    const active = filters.source === s;
                                    return (
                                        <DropdownMenuItem
                                            key={s}
                                            onClick={() =>
                                                navigate({
                                                    ...filters,
                                                    source: active ? '' : s,
                                                    search: filters.search ?? '',
                                                })
                                            }
                                            className={cn(
                                                'flex cursor-pointer items-center gap-2 capitalize focus:bg-[#eef1f8]',
                                                active && 'bg-[#e2e6ef]',
                                            )}
                                        >
                                            {active && <Check className="h-3 w-3 text-[#2b4c8c]" />}
                                            <span className={cn(active ? 'ml-0' : 'ml-5')}>{s.replace(/_/g, ' ')}</span>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#e2e6ef] bg-white px-2.5 text-[11px] text-[#6b7280] transition-all hover:border-[#c8cce0]">
                                    <Zap className="h-3 w-3" />
                                    Priority
                                    <ChevronDown className="h-2.5 w-2.5 opacity-50" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="w-44 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]"
                            >
                                <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                                    Filter by priority
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-[#e2e6ef]" />
                                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => {
                                    const active = filters.priority === key;
                                    return (
                                        <DropdownMenuItem
                                            key={key}
                                            onClick={() =>
                                                navigate({
                                                    ...filters,
                                                    priority: active ? '' : key,
                                                    search: filters.search ?? '',
                                                })
                                            }
                                            className={cn(
                                                'flex cursor-pointer items-center gap-2 capitalize focus:bg-[#eef1f8]',
                                                active && 'bg-[#e2e6ef]',
                                            )}
                                        >
                                            {active && <Check className="h-3 w-3 text-[#2b4c8c]" />}
                                            <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                                            <span className={cn(active ? 'ml-0' : 'ml-5')}>{cfg.label}</span>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {hasActiveFilters && (
                            <button
                                onClick={() => (window.location.href = '/crm/leads')}
                                className="ml-auto inline-flex items-center gap-1 text-[11px] text-[#6b7280] hover:text-[#374151]"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Reset
                            </button>
                        )}
                    </div>

                    {/* Active filter chips */}
                    <ActiveFilters filters={filters} stages={stages} sources={sources} />
                </div>

                {/* Stats row */}
                <StatsRow kanban_groups={kanban_groups} />

                {/* Main content */}
                <div className="relative flex-1 overflow-hidden">
                    {/* Bulk action bar */}
                    {selectedIds.size > 0 && (
                        <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3 rounded-xl border border-[#e2e6ef] bg-[#f0f2f7]/95 px-4 py-2.5 shadow-2xl shadow-black/5 backdrop-blur-xl">
                                <span className="text-xs font-medium text-[#1a1a2e]">
                                    <span className="text-[#2b4c8c]">{selectedIds.size}</span> selected
                                </span>
                                <div className="h-4 w-px bg-[#e2e6ef]" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 text-[11px] text-[#6b7280]">
                                            Change Stage
                                            <ChevronDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-36 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]">
                                        {stages.map((s) => (
                                            <DropdownMenuItem
                                                key={s}
                                                onClick={() => bulkAction(s)}
                                                className="cursor-pointer capitalize focus:bg-[#eef1f8]"
                                            >
                                                {s.replace(/_/g, ' ')}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="ghost" size="sm" className="h-7 text-[11px] text-[#1a1a2e]">
                                    Assign
                                    <User className="ml-1 h-3 w-3" />
                                </Button>
                                <div className="h-4 w-px bg-[#e2e6ef]" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[11px] text-rose-600 hover:text-rose-700"
                                >
                                    <Trash2 className="mr-1 h-3 w-3" />
                                    Delete
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[11px] text-[#6b7280] hover:text-[#374151]"
                                    onClick={clearSelection}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Kanban View */}
                    {view === 'kanban' && (
                        <div className="flex h-full gap-4 overflow-x-auto px-6 py-4">
                            {stageOrder.map((stage) => {
                                const columnLeads = kanban_groups[stage] ?? [];
                                const cfg = STAGE_CONFIG[stage];
                                return (
                                    <div key={stage} className="flex w-64 shrink-0 flex-col">
                                        {/* Column header */}
                                        <div
                                            className={cn(
                                                'relative mb-3 overflow-hidden rounded-xl border border-[#e2e6ef] px-3 py-2.5',
                                                'bg-gradient-to-r from-[#f0f2f7] to-white',
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn('h-2 w-2 rounded-full', cfg?.dot)} />
                                                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#1a1a2e]">
                                                        {cfg?.label ?? stage.replace(/_/g, ' ')}
                                                    </h3>
                                                </div>
                                                <span
                                                    className={cn(
                                                        'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-medium',
                                                        cfg?.color ?? 'text-gray-400 bg-gray-500/10',
                                                    )}
                                                >
                                                    {columnLeads.length}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Cards */}
                                        <div className="flex flex-col gap-2 overflow-y-auto">
                                            {columnLeads.length > 0 ? (
                                                columnLeads.map((lead) => (
                                                    <Link
                                                        key={lead.id}
                                                        href={`/crm/leads/${lead.id}`}
                                                        className="group relative overflow-hidden rounded-xl border border-[#e2e6ef] bg-white p-3.5 transition-all duration-200 hover:border-[#c8cce0] hover:bg-[#f0f2f7] hover:shadow-lg hover:shadow-black/5"
                                                    >
                                                        {/* Stage color accent line */}
                                                        <div
                                                            className={cn(
                                                                'absolute left-0 top-0 h-full w-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                                                                cfg?.bar,
                                                            )}
                                                        />

                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-2.5">
                                                                <Avatar className="h-7 w-7 rounded-lg">
                                                                    <AvatarFallback className="bg-[#e2e6ef] text-[10px] font-medium text-[#6b7280] rounded-lg">
                                                                        {lead.name.charAt(0).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <h4 className="text-[13px] font-medium text-[#1a1a2e] leading-tight">
                                                                        {lead.name}
                                                                    </h4>
                                                                    {lead.company && (
                                                                        <p className="text-[10px] text-[#6b7280]">
                                                                            {lead.company}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button
                                                                        onClick={(e) => e.preventDefault()}
                                                                        className="flex h-6 w-6 items-center justify-center rounded-md text-[#6b7280] opacity-0 transition-all hover:bg-[#eef1f8] hover:text-[#374151] group-hover:opacity-100"
                                                                    >
                                                                        <MoreHorizontal className="h-3 w-3" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent
                                                                    align="end"
                                                                    className="w-32 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]"
                                                                >
                                                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#eef1f8]">
                                                                        <Link href={`/crm/leads/${lead.id}`}>
                                                                            <Eye className="mr-2 h-3 w-3" />
                                                                            View
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#eef1f8]">
                                                                        <Link href={`/crm/leads/${lead.id}/edit`}>
                                                                            <Edit className="mr-2 h-3 w-3" />
                                                                            Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-[#e2e6ef]" />
<DropdownMenuItem className="cursor-pointer text-rose-600 focus:bg-[#eef1f8]">
                                        <Trash2 className="mr-2 h-3 w-3" />
                                        Delete
                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>

                                                        <div className="mt-2.5 flex items-center gap-2 text-[10px] text-[#6b7280]">
                                                            <Mail className="h-3 w-3" />
                                                            <span className="truncate">{lead.email}</span>
                                                        </div>

                                                        <div className="mt-2 flex items-center justify-between border-t border-[#e2e6ef]/50 pt-2">
                                                            <div className="flex items-center gap-2 text-[10px] text-[#6b7280]">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>{formatDate(lead.created_at)}</span>
                                                            </div>
                                                            <StageBadge stage={lead.stage} />
                                                        </div>
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e2e6ef] bg-[#f8f9fc] px-4 py-8 text-center">
                                                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#e2e6ef]">
                                                        <Target className="h-3.5 w-3.5 text-[#6b7280]" />
                                                    </div>
                                                    <p className="text-[11px] text-[#6b7280]">No leads</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* List View */}
                    {view === 'list' && (
                        <div className="flex h-full flex-col">
                            <div className="overflow-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#e2e6ef] text-left text-[11px] text-[#6b7280]">
                                            <th className="w-10 px-4 py-3">
                                                <button
                                                    onClick={toggleSelectAll}
                                                    className={cn(
                                                        'flex h-4 w-4 items-center justify-center rounded border transition-all',
                                                        selectAll
                                                            ? 'border-[#2b4c8c] bg-[#2b4c8c] text-white'
                                                            : 'border-[#e2e6ef] hover:border-[#c8cce0]',
                                                    )}
                                                >
                                                    {selectAll && <Check className="h-3 w-3" />}
                                                </button>
                                            </th>
                                            <th className="px-4 py-3">
                                                <button
                                                    onClick={() => handleSort('name')}
                                                    className="inline-flex items-center font-medium hover:text-[#374151]"
                                                >
                                                    Name
                                                    <SortIcon field="name" currentSort={filters.sort} currentDir={filters.dir} />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 font-medium">Contact</th>
                                            <th className="px-4 py-3">
                                                <button
                                                    onClick={() => handleSort('stage')}
                                                    className="inline-flex items-center font-medium hover:text-[#374151]"
                                                >
                                                    Stage
                                                    <SortIcon field="stage" currentSort={filters.sort} currentDir={filters.dir} />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 font-medium">Priority</th>
                                            <th className="px-4 py-3 font-medium">Source</th>
                                            <th className="px-4 py-3">
                                                <button
                                                    onClick={() => handleSort('created_at')}
                                                    className="inline-flex items-center font-medium hover:text-[#374151]"
                                                >
                                                    Created
                                                    <SortIcon field="created_at" currentSort={filters.sort} currentDir={filters.dir} />
                                                </button>
                                            </th>
                                            <th className="w-12 px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.data.length > 0 ? (
                                            leads.data.map((lead) => {
                                                const isSelected = selectedIds.has(lead.id);
                                                return (
                                                    <tr
                                                        key={lead.id}
                                                        className={cn(
                                                            'border-b border-[#e2e6ef] text-[13px] text-[#1a1a2e] transition-all',
                                                            isSelected
                                                                ? 'bg-[#e2e6ef]/80'
                                                                : 'hover:bg-[#eef1f8]/50',
                                                        )}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <button
                                                                onClick={() => toggleSelect(lead.id)}
                                                                className={cn(
                                                                    'flex h-4 w-4 items-center justify-center rounded border transition-all',
                                                                    isSelected
                                                                        ? 'border-[#2b4c8c] bg-[#2b4c8c] text-white'
                                                                        : 'border-[#e2e6ef] hover:border-[#c8cce0]',
                                                                )}
                                                            >
                                                                {isSelected && <Check className="h-3 w-3" />}
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Link
                                                                href={`/crm/leads/${lead.id}`}
                                                                className="flex items-center gap-3"
                                                            >
                                                                <Avatar className="h-7 w-7 rounded-lg">
                                                                    <AvatarFallback className="bg-[#e2e6ef] text-[10px] font-medium text-[#6b7280] rounded-lg">
                                                                        {lead.name.charAt(0).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-medium text-[#1a1a2e]">
                                                                        {lead.name}
                                                                    </div>
                                                                    {lead.company && (
                                                                        <div className="flex items-center gap-1 text-[10px] text-[#6b7280]">
                                                                            <Building2 className="h-2.5 w-2.5" />
                                                                            {lead.company}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Link>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-col gap-0.5">
                                                                <a
                                                                    href={`mailto:${lead.email}`}
                                                                    className="flex items-center gap-1.5 text-[12px] text-[#6b7280] hover:text-[#2b4c8c]"
                                                                >
                                                                    <Mail className="h-3 w-3" />
                                                                    {lead.email}
                                                                </a>
                                                                {lead.phone && (
                                                                    <a
                                                                        href={`tel:${lead.phone}`}
                                                                        className="flex items-center gap-1.5 text-[11px] text-[#6b7280] hover:text-[#374151]"
                                                                    >
                                                                        <Phone className="h-2.5 w-2.5" />
                                                                        {lead.phone}
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <StageBadge stage={lead.stage} />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={cn(
                                                                        'h-1.5 w-1.5 rounded-full',
                                                                        PRIORITY_CONFIG[lead.priority]?.dot ?? 'bg-slate-500',
                                                                    )}
                                                                />
                                                                <span className="text-[11px] capitalize text-[#6b7280]">
                                                                    {PRIORITY_CONFIG[lead.priority]?.label ?? lead.priority}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-1 text-[11px] capitalize text-[#6b7280]">
                                                                <Globe className="h-3 w-3" />
                                                                {lead.source.replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-1 text-[11px] text-[#6b7280]">
                                                                <Clock className="h-3 w-3" />
                                                                {formatFullDate(lead.created_at)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b7280] opacity-0 transition-all hover:bg-[#eef1f8] hover:text-[#374151] group-hover:opacity-100 [tr:hover_&]:opacity-100">
                                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent
                                                                    align="end"
                                                                    className="w-36 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]"
                                                                >
                                                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#eef1f8]">
                                                                        <Link href={`/crm/leads/${lead.id}`}>
                                                                            <Eye className="mr-2 h-3 w-3" />
                                                                            View
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#eef1f8]">
                                                                        <Link href={`/crm/leads/${lead.id}/edit`}>
                                                                            <Edit className="mr-2 h-3 w-3" />
                                                                            Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="cursor-pointer focus:bg-[#eef1f8]">
                                                                        <Copy className="mr-2 h-3 w-3" />
                                                                        Duplicate
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-[#e2e6ef]" />
<DropdownMenuItem className="cursor-pointer text-rose-600 focus:bg-[#eef1f8]">
                                        <Trash2 className="mr-2 h-3 w-3" />
                                        Delete
                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={8}>
                                                    <EmptyState view="list" onCreate={() => {}} />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {leads.meta && leads.meta.total > 25 && (
                                <div className="flex items-center justify-between border-t border-[#e2e6ef] px-6 py-3">
                                    <span className="text-[11px] text-[#6b7280]">
                                        Showing {leads.meta.from ?? 1}–{leads.meta.to ?? leads.data.length} of{' '}
                                        {leads.meta.total}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-[#6b7280]"
                                            disabled={!leads.meta.prev_page_url}
                                            onClick={() => {
                                                if (leads.meta.prev_page_url) {
                                                    window.location.href = leads.meta.prev_page_url;
                                                }
                                            }}
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-[#6b7280]"
                                            disabled={!leads.meta.next_page_url}
                                            onClick={() => {
                                                if (leads.meta.next_page_url) {
                                                    window.location.href = leads.meta.next_page_url;
                                                }
                                            }}
                                        >
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
