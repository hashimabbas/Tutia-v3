import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    Search,
    Eye,
    EyeOff,
    Star,
    StarOff,
    Image as ImageIcon,
    Calendar,
    ChevronDown,
    Trash2,
    Camera,
    Loader2,
    X,
    Sparkles,
    GalleryVerticalEnd,
    CheckCircle,
    CircleDashed,
    ImageUp,
    Paintbrush,
} from 'lucide-react';

interface ExperienceEvent {
    id: number;
    title: string;
    subtitle: string | null;
    event_date: string;
    cover_image: string | null;
    display_order: number;
    is_published: boolean;
    is_featured: boolean;
    slug: string;
    images_count: number;
    deleted_at: string | null;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    events: PaginatedData<ExperienceEvent>;
    filters: {
        search?: string;
        featured?: string;
        published?: string;
    };
    stats: {
        total_events: number;
        published_events: number;
        featured_events: number;
        total_images: number;
    };
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ExperienceIndex({ events, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const allSelected = events.data.length > 0 && selected.size === events.data.length;

    function navigate(url: string) {
        router.get(url, {}, { preserveState: true, replace: true });
    }

    function handleSearch(value: string) {
        setSearch(value);
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        params.delete('page');
        navigate(`/crm/experiences?${params.toString()}`);
    }

    function toggleFilter(key: string, value: string) {
        const params = new URLSearchParams(window.location.search);
        if (params.get(key) === value) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        params.delete('page');
        navigate(`/crm/experiences?${params.toString()}`);
    }

    function toggleSelectAll() {
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(events.data.map((e) => e.id)));
        }
    }

    function toggleSelect(id: number) {
        const next = new Set(selected);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelected(next);
    }

    function togglePublished(event: ExperienceEvent) {
        setTogglingId(event.id);
        router.post(`/crm/experiences/${event.id}/toggle-published`, {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setTogglingId(null),
        });
    }

    function toggleFeatured(event: ExperienceEvent) {
        setTogglingId(event.id);
        router.post(`/crm/experiences/${event.id}/toggle-featured`, {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setTogglingId(null),
        });
    }

    function bulkAction(action: string) {
        if (selected.size === 0) return;
        router.post(`/crm/experiences/bulk/${action}`, { ids: Array.from(selected) }, {
            preserveState: true,
            onSuccess: () => setSelected(new Set()),
        });
    }

    function confirmDelete(event: ExperienceEvent) {
        if (window.confirm(`Delete "${event.title}"? This cannot be undone.`)) {
            router.delete(`/crm/experiences/${event.id}`, { preserveState: true });
        }
    }

    const hasActiveFilters = filters.search || filters.featured || filters.published;

    const clearFilters = () => {
        setSearch('');
        navigate('/crm/experiences');
    };

    const statCards = [
        { label: 'Total Events', value: stats.total_events, icon: GalleryVerticalEnd, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Published', value: stats.published_events, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Featured', value: stats.featured_events, icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Images', value: stats.total_images, icon: ImageUp, color: 'text-sky-600', bg: 'bg-sky-50' },
    ];

    return (
        <div className="flex-1 space-y-6 py-8">
            <Head title="Experience Gallery" />

            <div className="flex items-center justify-between px-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Experience Gallery</h1>
                    <p className="mt-1 text-sm text-gray-500">Curate and manage events for the public gallery.</p>
                </div>
                <Link
                    href="/crm/experiences/create"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2B4C8C] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#2B4C8C]/20 transition-all hover:bg-[#1e3a6e] hover:shadow-[#2B4C8C]/30"
                >
                    <Plus className="size-4" />
                    New Event
                </Link>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-4 gap-4 px-8">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="absolute right-3 top-3">
                            <div className={cn('rounded-xl p-2', card.bg)}>
                                <card.icon className={cn('size-4', card.color)} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-gray-900">{card.value}</p>
                        <p className="mt-1 text-xs font-medium text-gray-500">{card.label}</p>
                        <div className={cn('mt-3 h-1 w-full rounded-full', card.bg)}>
                            <div
                                className={cn('h-1 rounded-full transition-all', card.color.replace('text', 'bg'))}
                                style={{ width: `${Math.min(100, (card.value / Math.max(1, stats.total_events)) * 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap items-center gap-3 px-8">
                <div className="relative flex-1 max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors focus:border-[#2B4C8C] focus:ring-2 focus:ring-[#2B4C8C]/10"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => toggleFilter('featured', '1')}
                    className={cn(
                        'inline-flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-medium transition-all',
                        filters.featured
                            ? 'border-amber-200 bg-amber-50 text-amber-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                    )}
                >
                    <Star className={cn('size-3.5', filters.featured ? 'fill-amber-400 text-amber-400' : '')} />
                    Featured
                </button>

                <div className="relative">
                    <select
                        value={filters.published ?? ''}
                        onChange={(e) => {
                            const params = new URLSearchParams(window.location.search);
                            if (e.target.value) {
                                params.set('published', e.target.value);
                            } else {
                                params.delete('published');
                            }
                            params.delete('page');
                            navigate(`/crm/experiences?${params.toString()}`);
                        }}
                        className="h-9 appearance-none rounded-xl border border-gray-200 bg-white py-1.5 pr-9 pl-3 text-xs font-medium text-gray-600 outline-none transition-colors focus:border-[#2B4C8C]"
                    >
                        <option value="">All Status</option>
                        <option value="1">Published</option>
                        <option value="0">Draft</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                </div>

                {hasActiveFilters && (
                    <button onClick={clearFilters} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3.5 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600">
                        <X className="size-3" />
                        Clear
                    </button>
                )}

                {selected.size > 0 && (
                    <div className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-1">
                        <span className="text-xs font-medium text-gray-500">{selected.size} selected</span>
                        <button
                            type="button"
                            onClick={() => bulkAction('publish')}
                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100"
                        >
                            Publish
                        </button>
                        <button
                            type="button"
                            onClick={() => bulkAction('unpublish')}
                            className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                        >
                            Unpublish
                        </button>
                        <button
                            type="button"
                            onClick={() => bulkAction('delete')}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="mx-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {events.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-20">
                        <div className="mb-4 rounded-2xl bg-gray-50 p-4">
                            <Camera className="size-10 text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">No events yet</p>
                        <p className="mt-1 text-xs text-gray-500">Create your first experience to start building the gallery.</p>
                        <Link
                            href="/crm/experiences/create"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2B4C8C] px-4 py-2.5 text-xs font-medium text-white shadow-lg shadow-[#2B4C8C]/20 transition-all hover:bg-[#1e3a6e]"
                        >
                            <Plus className="size-3.5" />
                            Create Event
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/50">
                                    <th className="w-12 px-4 py-3.5">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-[#2B4C8C] focus:ring-[#2B4C8C]/20"
                                        />
                                    </th>
                                    <th className="px-4 py-3.5 text-left text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Event</th>
                                    <th className="px-4 py-3.5 text-left text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3.5 text-left text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Images</th>
                                    <th className="px-4 py-3.5 text-left text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Order</th>
                                    <th className="px-4 py-3.5 text-left text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Date</th>
                                    <th className="w-28 px-4 py-3.5" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {events.data.map((event) => (
                                    <tr key={event.id} className="group transition-colors hover:bg-gray-50/50">
                                        <td className="px-4 py-3.5">
                                            <input
                                                type="checkbox"
                                                checked={selected.has(event.id)}
                                                onChange={() => toggleSelect(event.id)}
                                                className="rounded border-gray-300 text-[#2B4C8C] focus:ring-[#2B4C8C]/20"
                                            />
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <Link href={`/crm/experiences/${event.id}/edit`} className="group/link">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm transition-shadow group-hover/link:shadow-md">
                                                        {event.cover_image ? (
                                                            <img
                                                                src={`/storage/${event.cover_image}`}
                                                                alt={event.title}
                                                                className="size-full object-cover transition-transform duration-500 group-hover/link:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex size-full items-center justify-center">
                                                                <ImageIcon className="size-5 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 transition-colors group-hover/link:text-[#2B4C8C] truncate">
                                                            {event.title}
                                                            {event.is_featured && (
                                                                <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-600">
                                                                    <Star className="size-2.5 fill-amber-400" />
                                                                    Featured
                                                                </span>
                                                            )}
                                                        </p>
                                                        {event.subtitle && (
                                                            <p className="mt-0.5 text-xs text-gray-400">{event.subtitle}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => togglePublished(event)}
                                                    disabled={togglingId === event.id}
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all',
                                                        event.is_published
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-sm'
                                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100',
                                                    )}
                                                >
                                                    {togglingId === event.id ? (
                                                        <Loader2 className="size-2.5 animate-spin" />
                                                    ) : event.is_published ? (
                                                        <Eye className="size-3" />
                                                    ) : (
                                                        <EyeOff className="size-3" />
                                                    )}
                                                    {event.is_published ? 'Published' : 'Draft'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleFeatured(event)}
                                                    disabled={togglingId === event.id}
                                                    className={cn(
                                                        'rounded-lg p-1.5 transition-all',
                                                        event.is_featured
                                                            ? 'text-amber-400 hover:bg-amber-50'
                                                            : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50',
                                                    )}
                                                >
                                                    {event.is_featured ? (
                                                        <Star className="size-3.5 fill-amber-400" />
                                                    ) : (
                                                        <StarOff className="size-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                                                <ImageIcon className="size-3 text-gray-400" />
                                                {event.images_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center justify-center rounded-lg bg-gray-50 px-2 py-1 text-xs font-mono font-medium text-gray-600">
                                                #{event.display_order}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                                <Calendar className="size-3.5 text-gray-400" />
                                                {formatDate(event.event_date)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Link
                                                    href={`/crm/experiences/${event.id}/edit`}
                                                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => confirmDelete(event)}
                                                    className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-red-600 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:shadow-md"
                                                >
                                                    <Trash2 className="size-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {events.data.length > 0 && events.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-50 px-4 py-3.5">
                        <span className="text-xs text-gray-400">
                            Showing {events.from}–{events.to} of {events.total}
                        </span>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: events.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => {
                                        const params = new URLSearchParams(window.location.search);
                                        params.set('page', String(page));
                                        navigate(`/crm/experiences?${params.toString()}`);
                                    }}
                                    className={cn(
                                        'flex size-8 items-center justify-center rounded-lg text-xs font-medium transition-all',
                                        page === events.current_page
                                            ? 'bg-[#2B4C8C] text-white shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-100',
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
