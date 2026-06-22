import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Building2, Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';

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

export default function OrganizationIndex({ organizations, classifications, industries, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [classificationFilter, setClassificationFilter] = useState(filters.classification ?? '');
    const [industryFilter, setIndustryFilter] = useState(filters.industry ?? '');

    let searchTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (val: string) => {
        setSearch(val);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            router.get('/crm/organizations', { ...filters, search: val || undefined }, { preserveState: true, replace: true });
        }, 300);
    };

    const applyFilter = (key: string, val: string) => {
        router.get('/crm/organizations', { ...filters, [key]: val || undefined }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="CRM · Organizations" />

            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-3">
                    <h1 className="text-base font-medium text-[#e8e8ed]">Organizations</h1>
                    <Link
                        href="/crm/organizations"
                        method="post"
                        as="button"
                        className="flex items-center gap-1.5 rounded-md bg-[#2B4C8C] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3b5d9c]"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        New
                    </Link>
                </div>

                <div className="flex items-center gap-3 border-b border-[#1e1e2a] px-6 py-2.5">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555570]" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Search organizations..."
                            className="w-full rounded-md border border-[#1e1e2a] bg-[#0f0f14] py-1.5 pl-8 pr-3 text-xs text-[#e8e8ed] placeholder-[#555570] outline-none focus:border-[#3b6cdb]"
                        />
                    </div>

                    <select
                        value={classificationFilter}
                        onChange={e => { setClassificationFilter(e.target.value); applyFilter('classification', e.target.value); }}
                        className="rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#8b8b9e] outline-none focus:border-[#3b6cdb]"
                    >
                        <option value="">All classifications</option>
                        {classifications.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>

                    <select
                        value={industryFilter}
                        onChange={e => { setIndustryFilter(e.target.value); applyFilter('industry', e.target.value); }}
                        className="rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#8b8b9e] outline-none focus:border-[#3b6cdb]"
                    >
                        <option value="">All industries</option>
                        {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                    </select>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1e1e2a] text-[10px] font-medium uppercase tracking-wider text-[#555570]">
                                <th className="px-6 py-2.5 text-left">Name</th>
                                <th className="px-4 py-2.5 text-left">Domain</th>
                                <th className="px-4 py-2.5 text-left">Industry</th>
                                <th className="px-4 py-2.5 text-right">Deals</th>
                                <th className="px-4 py-2.5 text-left">Owner</th>
                                <th className="px-4 py-2.5 text-right">Created</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-[#e8e8ed]">
                            {organizations.data.map(org => (
                                <tr
                                    key={org.id}
                                    onClick={() => router.visit(`/crm/organizations/${org.id}`)}
                                    className="cursor-pointer border-b border-[#1e1e2a] transition-colors hover:bg-[#0f0f14]"
                                >
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#1a1a24]">
                                                <Building2 className="h-3.5 w-3.5 text-[#555570]" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-[#e8e8ed]">{org.name}</span>
                                                <div className="flex gap-1 mt-0.5">
                                                    {org.classifications.map(c => (
                                                        <span key={c.id} className="rounded bg-[#1a1a24] px-1.5 py-0.5 text-[9px] text-[#555570]">
                                                            {c.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {org.domain && (
                                            <div className="flex items-center gap-1.5 text-[#8b8b9e]">
                                                <Globe className="h-3 w-3" />
                                                {org.domain}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-[#8b8b9e]">{org.industry ?? '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="rounded bg-[#1a1a24] px-2 py-0.5 text-[#8b8b9e]">{org.deals_count ?? 0}</span>
                                    </td>
                                    <td className="px-4 py-3 text-[#8b8b9e]">{org.owner?.name ?? '-'}</td>
                                    <td className="px-4 py-3 text-right text-[#555570]">
                                        {new Date(org.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {organizations.data.length === 0 && (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <Building2 className="mx-auto mb-3 h-8 w-8 text-[#1e1e2a]" />
                                <p className="text-sm text-[#555570]">No organizations yet</p>
                                <p className="mt-1 text-xs text-[#555570]">Import your first company list or create one manually.</p>
                            </div>
                        </div>
                    )}

                    {organizations.meta && (
                        <div className="flex items-center justify-between border-t border-[#1e1e2a] px-6 py-2.5 text-[11px] text-[#555570]">
                            <span>Page {organizations.meta.current_page} of {organizations.meta.last_page}</span>
                            <div className="flex gap-2">
                                {organizations.meta.links?.filter((l: any) => l.url).map((l: any) => (
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
