import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Building2, Globe, ChevronDown, X, Filter, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Eye, Edit, Trash2, Sparkles, Check } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Classification {
    id: number;
    slug: string;
    name: string;
}

interface Organization {
    id: number;
    name: string;
    domain: string | null;
    industry: string | null;
    size: string | null;
    phone: string | null;
    website: string | null;
    notes: string | null;
    logo_url: string | null;
    owner_id: number | null;
    created_by: number;
    created_at: string;
    owner: { id: number; name: string } | null;
    primary_contacts: { id: number; first_name: string; last_name: string }[];
    classifications: Classification[];
    leads_count?: number;
    deals_count?: number;
}

interface Props {
    organizations: { data: Organization[]; meta: any };
    classifications: Classification[];
    industries: string[];
    filters: Record<string, string | undefined>;
}

function EmptyState() {
    return (
        <div className="flex h-full flex-col items-center justify-center p-12">
            <div className="relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 ring-1 ring-[#e2e6ef]">
                    <Building2 className="h-8 w-8 text-[#6b7280]" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2B4C8C] ring-2 ring-white">
                    <Sparkles className="h-3 w-3 text-white" />
                </div>
            </div>
            <h3 className="mb-1 text-base font-medium text-[#1a1a2e]">No organizations yet</h3>
            <p className="mb-6 text-center text-xs text-[#6b7280] max-w-[240px]">
                Import your first company list or create one manually.
            </p>
            <Link href="/crm/organizations/create">
                <Button size="sm" className="gap-1.5 bg-[#2B4C8C] text-white hover:bg-[#2B4C8C]/90">
                    <Plus className="h-3.5 w-3.5" />
                    New Organization
                </Button>
            </Link>
        </div>
    );
}

function SortIcon({ field, currentSort, currentDir }: { field: string; currentSort?: string; currentDir?: string }) {
    if (currentSort !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
    if (currentDir === 'asc') return <ArrowUp className="ml-1 h-3 w-3 text-[#2b4c8c]" />;
    return <ArrowDown className="ml-1 h-3 w-3 text-[#2b4c8c]" />;
}

export default function OrganizationIndex({ organizations, classifications, industries, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [classificationFilter, setClassificationFilter] = useState(filters.classification ?? '');
    const [industryFilter, setIndustryFilter] = useState(filters.industry ?? '');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>();

    const navigate = useCallback((params: Record<string, string>) => {
        const sp = new URLSearchParams(window.location.search);
        Object.entries(params).forEach(([k, v]) => {
            if (v) sp.set(k, v);
            else sp.delete(k);
        });
        window.location.href = `/crm/organizations?${sp.toString()}`;
    }, []);

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            navigate({ search: value, classification: classificationFilter || '', industry: industryFilter || '' });
        }, 300);
    }, [navigate, classificationFilter, industryFilter]);

    const applyFilter = (key: string, val: string) => {
        navigate({ [key]: val || '', search: filters.search ?? '', classification: key === 'classification' ? val : classificationFilter, industry: key === 'industry' ? val : industryFilter });
    };

    const hasActiveFilters = filters.search || filters.classification || filters.industry;

    return (
        <>
            <Head title="CRM · Organizations" />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Sticky header */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-[#f8f9fc]/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-xl font-semibold text-[#1a1a2e] tracking-tight">
                                Organizations
                                <span className="ml-2 text-sm font-normal text-[#6b7280]">· {organizations.meta?.total ?? organizations.data.length} total</span>
                            </h1>
                            <p className="text-[11px] text-[#6b7280]">Manage companies and institutional relationships</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b7280]" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => handleSearch(e.target.value)}
                                    placeholder="Search organizations..."
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

                            <Link href="/crm/organizations/create">
                                <Button size="sm" className="gap-1.5 bg-[#2B4C8C] text-white hover:bg-[#2B4C8C]/90">
                                    <Plus className="h-3.5 w-3.5" />
                                    New Organization
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
                                    Classification
                                    {filters.classification && (
                                        <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2B4C8C] text-[8px] font-medium text-white">1</span>
                                    )}
                                    <ChevronDown className="h-2.5 w-2.5 opacity-50" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-44 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]">
                                <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                                    Filter by classification
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-[#e2e6ef]" />
                                <DropdownMenuItem
                                    onClick={() => applyFilter('classification', '')}
                                    className={cn('flex cursor-pointer items-center justify-between focus:bg-[#eef1f8]', !filters.classification && 'bg-[#e2e6ef]')}
                                >
                                    <span>All</span>
                                    {!filters.classification && <Check className="h-3 w-3 text-[#2b4c8c]" />}
                                </DropdownMenuItem>
                                {classifications.map(c => {
                                    const active = c.slug === filters.classification;
                                    return (
                                        <DropdownMenuItem
                                            key={c.id}
                                            onClick={() => applyFilter('classification', c.slug)}
                                            className={cn('flex cursor-pointer items-center gap-2 focus:bg-[#eef1f8]', active && 'bg-[#e2e6ef]')}
                                        >
                                            {active && <Check className="h-3 w-3 text-[#2b4c8c]" />}
                                            <span className={cn(active ? 'ml-0' : 'ml-5')}>{c.name}</span>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#e2e6ef] bg-white px-2.5 text-[11px] text-[#6b7280] transition-all hover:border-[#c8cce0]">
                                    <Filter className="h-3 w-3" />
                                    Industry
                                    {filters.industry && (
                                        <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2B4C8C] text-[8px] font-medium text-white">1</span>
                                    )}
                                    <ChevronDown className="h-2.5 w-2.5 opacity-50" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e] max-h-60 overflow-y-auto">
                                <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                                    Filter by industry
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-[#e2e6ef]" />
                                <DropdownMenuItem
                                    onClick={() => applyFilter('industry', '')}
                                    className={cn('flex cursor-pointer items-center justify-between focus:bg-[#eef1f8]', !filters.industry && 'bg-[#e2e6ef]')}
                                >
                                    <span>All industries</span>
                                    {!filters.industry && <Check className="h-3 w-3 text-[#2b4c8c]" />}
                                </DropdownMenuItem>
                                {industries.map(ind => {
                                    const active = ind === filters.industry;
                                    return (
                                        <DropdownMenuItem
                                            key={ind}
                                            onClick={() => applyFilter('industry', ind)}
                                            className={cn('flex cursor-pointer items-center gap-2 focus:bg-[#eef1f8]', active && 'bg-[#e2e6ef]')}
                                        >
                                            {active && <Check className="h-3 w-3 text-[#2b4c8c]" />}
                                            <span className={cn(active ? 'ml-0' : 'ml-5')}>{ind}</span>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {hasActiveFilters && (
                            <button
                                onClick={() => (window.location.href = '/crm/organizations')}
                                className="ml-auto inline-flex items-center gap-1 text-[11px] text-[#6b7280] hover:text-[#374151]"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    {organizations.data.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#e2e6ef] text-left text-[11px] text-[#6b7280]">
                                    <th className="px-6 py-3 font-medium">
                                        <button onClick={() => navigate({ sort: 'name', dir: filters.sort === 'name' && filters.dir === 'asc' ? 'desc' : 'asc', search: filters.search ?? '', classification: classificationFilter, industry: industryFilter })} className="inline-flex items-center font-medium hover:text-[#374151]">
                                            Name
                                            <SortIcon field="name" currentSort={filters.sort} currentDir={filters.dir} />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 font-medium">Domain</th>
                                    <th className="px-4 py-3 font-medium">Industry</th>
                                    <th className="px-4 py-3 text-right font-medium">Deals</th>
                                    <th className="px-4 py-3 font-medium">Owner</th>
                                    <th className="w-12 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {organizations.data.map(org => (
                                    <tr
                                        key={org.id}
                                        onClick={() => router.visit(`/crm/organizations/${org.id}`)}
                                        className="cursor-pointer border-b border-[#e2e6ef] text-[13px] text-[#1a1a2e] transition-all hover:bg-[#eef1f8]/50"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 shadow-sm">
                                                    <Building2 className="h-4 w-4 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[#1a1a2e]">{org.name}</div>
                                                    {org.classifications.length > 0 && (
                                                        <div className="mt-0.5 flex gap-1">
                                                            {org.classifications.map(c => (
                                                                <span key={c.id} className="rounded-md bg-[#eef1f8] px-1.5 py-0.5 text-[9px] font-medium text-[#6b7280]">
                                                                    {c.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {org.domain ? (
                                                <div className="flex items-center gap-1.5 text-[#6b7280]">
                                                    <Globe className="h-3 w-3 shrink-0" />
                                                    <span>{org.domain}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[#9ca3af]">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-[#6b7280]">{org.industry ?? <span className="text-[#9ca3af]">—</span>}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-[#e2e6ef] px-2 py-0.5 text-[11px] font-medium text-[#6b7280]">
                                                {org.deals_count ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[#6b7280]">{org.owner?.name ?? <span className="text-[#9ca3af]">—</span>}</td>
                                        <td className="px-4 py-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        onClick={e => e.stopPropagation()}
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b7280] transition-all hover:bg-[#e2e6ef] hover:text-[#374151]"
                                                        style={{ opacity: 1 }}
                                                    >
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]">
                                                    <DropdownMenuItem
                                                        onClick={e => { e.stopPropagation(); router.visit(`/crm/organizations/${org.id}`); }}
                                                        className="cursor-pointer focus:bg-[#eef1f8]"
                                                    >
                                                        <Eye className="mr-2 h-3 w-3" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={e => { e.stopPropagation(); router.visit(`/crm/organizations/${org.id}/edit`); }}
                                                        className="cursor-pointer focus:bg-[#eef1f8]"
                                                    >
                                                        <Edit className="mr-2 h-3 w-3" />
                                                        Edit
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
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState />
                    )}

                    {/* Pagination */}
                    {organizations.meta && organizations.meta.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-[#e2e6ef] bg-[#f8f9fc] px-6 py-3">
                            <span className="text-[11px] text-[#6b7280]">
                                Page {organizations.meta.current_page} of {organizations.meta.last_page}
                                <span className="mx-1.5">·</span>
                                {organizations.meta.total} organizations
                            </span>
                            <div className="flex items-center gap-1.5">
                                {organizations.meta.links?.filter((l: any) => l.url).map((l: any, i: number) => {
                                    const label = l.label === 'pagination.previous' ? '‹' : l.label === 'pagination.next' ? '›' : l.label;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => router.get(l.url, {}, { preserveState: true })}
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
