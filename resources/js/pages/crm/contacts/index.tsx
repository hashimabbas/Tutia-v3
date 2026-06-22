import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Users, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import InfluenceBadge from '@/components/crm/influence-badge';

interface InfluenceType {
    id: number;
    slug: string;
    name: string;
}

interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string | null;
    phone: string | null;
    job_title: string | null;
    influence_type: InfluenceType | null;
    owner: { id: number; name: string } | null;
    primary_organization: { id: number; name: string } | null;
    created_at: string;
    deals_count?: number;
}

interface Props {
    contacts: { data: Contact[]; meta: any };
    influence_types: InfluenceType[];
    filters: Record<string, string | undefined>;
}

export default function ContactIndex({ contacts, influence_types, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [influenceFilter, setInfluenceFilter] = useState(filters.influence_type_id ?? '');

    let searchTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (val: string) => {
        setSearch(val);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            router.get('/crm/contacts', { ...filters, search: val || undefined }, { preserveState: true, replace: true });
        }, 300);
    };

    const applyFilter = (key: string, val: string) => {
        router.get('/crm/contacts', { ...filters, [key]: val || undefined }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="CRM · Contacts" />

            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-3">
                    <h1 className="text-base font-medium text-[#e8e8ed]">Contacts</h1>
                    <Link
                        href="/crm/contacts"
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
                            placeholder="Search contacts..."
                            className="w-full rounded-md border border-[#1e1e2a] bg-[#0f0f14] py-1.5 pl-8 pr-3 text-xs text-[#e8e8ed] placeholder-[#555570] outline-none focus:border-[#3b6cdb]"
                        />
                    </div>

                    <select
                        value={influenceFilter}
                        onChange={e => { setInfluenceFilter(e.target.value); applyFilter('influence_type_id', e.target.value); }}
                        className="rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#8b8b9e] outline-none focus:border-[#3b6cdb]"
                    >
                        <option value="">All influence</option>
                        {influence_types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>

                    <button className="rounded border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-[11px] text-[#555570] transition-colors hover:border-[#2a2a3a]">
                        Merge Duplicates
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1e1e2a] text-[10px] font-medium uppercase tracking-wider text-[#555570]">
                                <th className="px-6 py-2.5 text-left">Name</th>
                                <th className="px-4 py-2.5 text-left">Organization</th>
                                <th className="px-4 py-2.5 text-left">Email</th>
                                <th className="px-4 py-2.5 text-left">Influence</th>
                                <th className="px-4 py-2.5 text-right">Deals</th>
                                <th className="px-4 py-2.5 text-left">Owner</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-[#e8e8ed]">
                            {contacts.data.map(contact => (
                                <tr
                                    key={contact.id}
                                    onClick={() => router.visit(`/crm/contacts/${contact.id}`)}
                                    className="cursor-pointer border-b border-[#1e1e2a] transition-colors hover:bg-[#0f0f14]"
                                >
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a24] text-[10px] font-medium text-[#8b8b9e]">
                                                {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="font-medium text-[#e8e8ed]">{contact.name}</span>
                                                {contact.job_title && <div className="text-[10px] text-[#555570]">{contact.job_title}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-[#8b8b9e]">{contact.primary_organization?.name ?? '-'}</td>
                                    <td className="px-4 py-3">
                                        {contact.email && (
                                            <div className="flex items-center gap-1.5 text-[#8b8b9e]">
                                                <Mail className="h-3 w-3 shrink-0" />
                                                <span className="truncate max-w-[160px]">{contact.email}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <InfluenceBadge slug={contact.influence_type?.slug ?? null} name={contact.influence_type?.name} />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="rounded bg-[#1a1a24] px-2 py-0.5 text-[#8b8b9e]">{contact.deals_count ?? 0}</span>
                                    </td>
                                    <td className="px-4 py-3 text-[#555570]">{contact.owner?.name ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {contacts.data.length === 0 && (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <Users className="mx-auto mb-3 h-8 w-8 text-[#1e1e2a]" />
                                <p className="text-sm text-[#555570]">No contacts yet</p>
                                <p className="mt-1 text-xs text-[#555570]">Add them manually or import from a spreadsheet.</p>
                            </div>
                        </div>
                    )}

                    {contacts.meta && (
                        <div className="flex items-center justify-between border-t border-[#1e1e2a] px-6 py-2.5 text-[11px] text-[#555570]">
                            <span>Page {contacts.meta.current_page} of {contacts.meta.last_page}</span>
                            <div className="flex gap-2">
                                {contacts.meta.links?.filter((l: any) => l.url).map((l: any) => (
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
