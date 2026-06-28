import { Head, Link, router } from '@inertiajs/react';
import {
    Search,
    Plus,
    Users,
    Mail,
    Phone,
    Building2,
    ChevronDown,
    X,
    Filter,
    RefreshCw,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Check,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    User,
    Sparkles,
} from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import InfluenceBadge from '@/components/crm/influence-badge';

interface InfluenceType {
    id: number;
    slug: string;
    name: string;
}

interface OrgPivot {
    is_primary: boolean;
}

interface ContactOrg {
    id: number;
    name: string;
    pivot: OrgPivot;
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
    organizations: ContactOrg[];
    created_at: string;
    deals_count?: number;
}

interface Props {
    contacts: { data: Contact[]; meta: any };
    influence_types: InfluenceType[];
    filters: Record<string, string | undefined>;
}

function formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function SortIcon({
    field,
    currentSort,
    currentDir,
}: {
    field: string;
    currentSort?: string;
    currentDir?: string;
}) {
    if (currentSort !== field)
        return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
    if (currentDir === 'asc')
        return <ArrowUp className="ml-1 h-3 w-3 text-[#2b4c8c]" />;
    return <ArrowDown className="ml-1 h-3 w-3 text-[#2b4c8c]" />;
}

function EmptyState() {
    return (
        <div className="flex h-full flex-col items-center justify-center p-12">
            <div className="relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 ring-1 ring-[#e2e6ef]">
                    <Users className="h-8 w-8 text-[#6b7280]" />
                </div>
                <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2B4C8C] ring-2 ring-white">
                    <Sparkles className="h-3 w-3 text-white" />
                </div>
            </div>
            <h3 className="mb-1 text-base font-medium text-[#1a1a2e]">
                No contacts found
            </h3>
            <p className="mb-6 max-w-[240px] text-center text-xs text-[#6b7280]">
                No contacts match your current filters. Try adjusting your
                search or filter criteria.
            </p>
        </div>
    );
}

export default function ContactIndex({
    contacts,
    influence_types,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [influenceFilter, setInfluenceFilter] = useState(
        filters.influence_type_id ?? '',
    );
    const searchTimer = useRef<ReturnType<typeof setTimeout>>();

    const navigate = useCallback((params: Record<string, string>) => {
        const sp = new URLSearchParams(window.location.search);
        Object.entries(params).forEach(([k, v]) => {
            if (v) sp.set(k, v);
            else sp.delete(k);
        });
        window.location.href = `/crm/contacts?${sp.toString()}`;
    }, []);

    const handleSearch = useCallback(
        (value: string) => {
            setSearch(value);
            if (searchTimer.current) clearTimeout(searchTimer.current);
            searchTimer.current = setTimeout(() => {
                navigate({
                    search: value,
                    influence_type_id: filters.influence_type_id ?? '',
                });
            }, 300);
        },
        [navigate, filters],
    );

    const handleSort = useCallback(
        (field: string) => {
            const dir =
                filters.sort === field && filters.dir === 'asc'
                    ? 'desc'
                    : 'asc';
            navigate({
                sort: field,
                dir,
                search: filters.search ?? '',
                influence_type_id: filters.influence_type_id ?? '',
            });
        },
        [navigate, filters],
    );

    const hasActiveFilters = filters.search || filters.influence_type_id;

    return (
        <>
            <Head title="CRM · Contacts" />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Sticky header */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-[#f8f9fc]/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-[#1a1a2e]">
                                Contacts
                                <span className="ml-2 text-sm font-normal text-[#6b7280]">
                                    ·{' '}
                                    {contacts.meta?.total ??
                                        contacts.data.length}{' '}
                                    total
                                </span>
                            </h1>
                            <p className="text-[11px] text-[#6b7280]">
                                Manage your network of contacts and
                                relationships
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#6b7280]" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    placeholder="Search contacts..."
                                    className="h-8 w-[220px] rounded-lg border border-[#e2e6ef] bg-white pr-8 pl-8 text-xs text-[#1a1a2e] placeholder-[#6b7280] transition-all outline-none focus:w-[280px] focus:border-[#2b4c8c] focus:ring-1 focus:ring-[#2b4c8c]/20"
                                />
                                {search && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 text-[#6b7280] hover:text-[#374151]"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            <div className="h-5 w-px bg-[#e2e6ef]" />

                            <Link href="/crm/contacts/create">
                                <Button
                                    size="sm"
                                    className="gap-1.5 bg-[#2B4C8C] text-white hover:bg-[#2B4C8C]/90"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    New Contact
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
                                    Influence
                                    {filters.influence_type_id && (
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
                                <DropdownMenuLabel className="text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                                    Filter by influence
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-[#e2e6ef]" />
                                <DropdownMenuItem
                                    onClick={() =>
                                        navigate({
                                            search: filters.search ?? '',
                                            influence_type_id: '',
                                        })
                                    }
                                    className={cn(
                                        'flex cursor-pointer items-center justify-between focus:bg-[#eef1f8]',
                                        !filters.influence_type_id &&
                                            'bg-[#e2e6ef]',
                                    )}
                                >
                                    <span>All types</span>
                                    {!filters.influence_type_id && (
                                        <Check className="h-3 w-3 text-[#2b4c8c]" />
                                    )}
                                </DropdownMenuItem>
                                {influence_types.map((t) => {
                                    const active =
                                        String(t.id) ===
                                        filters.influence_type_id;
                                    return (
                                        <DropdownMenuItem
                                            key={t.id}
                                            onClick={() =>
                                                navigate({
                                                    search:
                                                        filters.search ?? '',
                                                    influence_type_id: String(
                                                        t.id,
                                                    ),
                                                })
                                            }
                                            className={cn(
                                                'flex cursor-pointer items-center gap-2 focus:bg-[#eef1f8]',
                                                active && 'bg-[#e2e6ef]',
                                            )}
                                        >
                                            {active && (
                                                <Check className="h-3 w-3 text-[#2b4c8c]" />
                                            )}
                                            <span
                                                className={cn(
                                                    active ? 'ml-0' : 'ml-5',
                                                )}
                                            >
                                                {t.name}
                                            </span>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {hasActiveFilters && (
                            <button
                                onClick={() =>
                                    (window.location.href = '/crm/contacts')
                                }
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
                    {contacts.data.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#e2e6ef] text-left text-[11px] text-[#6b7280]">
                                    <th className="px-6 py-3 font-medium">
                                        <button
                                            onClick={() => handleSort('name')}
                                            className="inline-flex items-center font-medium hover:text-[#374151]"
                                        >
                                            Name
                                            <SortIcon
                                                field="name"
                                                currentSort={filters.sort}
                                                currentDir={filters.dir}
                                            />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Organization
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Contact
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Influence
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Deals
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Owner
                                    </th>
                                    <th className="w-12 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.data.map((contact) => (
                                    <tr
                                        key={contact.id}
                                        onClick={() =>
                                            router.visit(
                                                `/crm/contacts/${contact.id}`,
                                            )
                                        }
                                        className="cursor-pointer border-b border-[#e2e6ef] text-[13px] text-[#1a1a2e] transition-all hover:bg-[#eef1f8]/50"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 rounded-lg">
                                                    <AvatarFallback className="rounded-lg bg-[#e2e6ef] text-[11px] font-medium text-[#6b7280]">
                                                        {contact.first_name.charAt(
                                                            0,
                                                        )}
                                                        {contact.last_name.charAt(
                                                            0,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-[#1a1a2e]">
                                                        {contact.name}
                                                    </div>
                                                    {contact.job_title && (
                                                        <div className="text-[11px] text-[#6b7280]">
                                                            {contact.job_title}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {contact.organizations?.[0] ? (
                                                <div className="flex items-center gap-1.5 text-[#6b7280]">
                                                    <Building2 className="h-3 w-3 shrink-0" />
                                                    <span>
                                                        {
                                                            contact
                                                                .organizations[0]
                                                                .name
                                                        }
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[#6b7280]">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-0.5">
                                                {contact.email && (
                                                    <div className="flex items-center gap-1.5 text-[#6b7280]">
                                                        <Mail className="h-3 w-3 shrink-0" />
                                                        <span className="max-w-[180px] truncate">
                                                            {contact.email}
                                                        </span>
                                                    </div>
                                                )}
                                                {contact.phone && (
                                                    <div className="flex items-center gap-1.5 text-[#6b7280]">
                                                        <Phone className="h-3 w-3 shrink-0" />
                                                        <span>
                                                            {contact.phone}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <InfluenceBadge
                                                slug={
                                                    contact.influence_type
                                                        ?.slug ?? null
                                                }
                                                name={
                                                    contact.influence_type?.name
                                                }
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-[#e2e6ef] px-2 py-0.5 text-[11px] font-medium text-[#6b7280]">
                                                {contact.deals_count ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[#6b7280]">
                                            {contact.owner ? (
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3 w-3 shrink-0" />
                                                    <span>
                                                        {contact.owner.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b7280] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#e2e6ef] hover:text-[#374151]"
                                                        style={{ opacity: 1 }}
                                                    >
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-36 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]"
                                                >
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.visit(
                                                                `/crm/contacts/${contact.id}`,
                                                            );
                                                        }}
                                                        className="cursor-pointer focus:bg-[#eef1f8]"
                                                    >
                                                        <Eye className="mr-2 h-3 w-3" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.visit(
                                                                `/crm/contacts/${contact.id}/edit`,
                                                            );
                                                        }}
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
                    {contacts.meta && contacts.meta.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-[#e2e6ef] bg-[#f8f9fc] px-6 py-3">
                            <span className="text-[11px] text-[#6b7280]">
                                Page {contacts.meta.current_page} of{' '}
                                {contacts.meta.last_page}
                                <span className="mx-1.5">·</span>
                                {contacts.meta.total} contacts
                            </span>
                            <div className="flex items-center gap-1.5">
                                {contacts.meta.links
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
                                                    router.get(
                                                        l.url,
                                                        {},
                                                        { preserveState: true },
                                                    )
                                                }
                                                className={cn(
                                                    'flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 text-[11px] transition-all',
                                                    l.active
                                                        ? 'bg-[#2B4C8C] text-white shadow-sm'
                                                        : 'text-[#6b7280] hover:bg-[#e2e6ef] hover:text-[#374151]',
                                                )}
                                                dangerouslySetInnerHTML={{
                                                    __html: label,
                                                }}
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
