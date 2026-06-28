import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    FileText,
    Search,
    Plus,
    Trash2,
    Copy,
    Eye,
    EyeOff,
    ArrowUpDown,
    ChevronDown,
    X,
} from 'lucide-react';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    status: string;
    published_at: string | null;
    featured_image: string | null;
    view_count: number;
    reading_time: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    author: { id: number; name: string; avatar: string | null } | null;
    category: { id: number; name: string; color: string } | null;
    tags: { id: number; name: string }[];
    tags_count: number;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
}

interface Props {
    articles: { data: Article[]; current_page: number; last_page: number; total: number; from: number; to: number };
    filters: { search?: string; status?: string; category_id?: string; featured?: string; sort?: string; dir?: string };
    categories: Category[];
    stats: { total: number; published: number; drafts: number };
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

const statusStyles: Record<string, string> = {
    draft: 'bg-amber-50 text-amber-600',
    published: 'bg-emerald-50 text-emerald-600',
    scheduled: 'bg-purple-50 text-purple-600',
    archived: 'bg-gray-50 text-gray-600',
    review: 'bg-blue-50 text-blue-600',
};

export default function ArticlesIndex({ articles, filters, categories, stats }: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const [sortField, setSortField] = useState(filters.sort || 'updated_at');
    const [sortDir, setSortDir] = useState(filters.dir || 'desc');
    const [search, setSearch] = useState(filters.search || '');

    const toggleSort = (field: string) => {
        const dir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDir(dir);
        router.get('/crm/blog/articles', { ...filters, sort: field, dir }, { preserveState: true, replace: true });
    };

    const applyFilter = (key: string, value: string | undefined) => {
        router.get('/crm/blog/articles', { ...filters, [key]: value || undefined, page: undefined }, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search || undefined);
    };

    const toggleSelect = (id: number) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selected.length === articles.data.length) {
            setSelected([]);
        } else {
            setSelected(articles.data.map((a) => a.id));
        }
    };

    const bulkAction = (action: string) => {
        if (selected.length === 0) return;
        if (action === 'delete') {
            router.post('/crm/blog/articles/bulk-delete', { ids: selected }, { onSuccess: () => setSelected([]) });
        } else {
            router.post('/crm/blog/articles/bulk-status', { ids: selected, status: action }, { onSuccess: () => setSelected([]) });
        }
    };

    const clearFilters = () => {
        setSearch('');
        router.get('/crm/blog/articles', {}, { preserveState: true, replace: true });
    };

    const hasActiveFilters = filters.search || filters.status || filters.category_id || filters.featured;

    return (
        <>
            <Head title="Articles" />

            <div className="flex-1 space-y-6 py-8">
                <div className="flex items-center justify-between px-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
                        <p className="mt-1 text-sm text-gray-500">{articles.total} total articles</p>
                    </div>
                    <Link
                        href="/crm/blog/articles/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#2B4C8C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1e3a6e]"
                    >
                        <Plus className="size-4" />
                        New Article
                    </Link>
                </div>

                {/* Stats bar */}
                <div className="flex items-center gap-4 px-8">
                    <button onClick={() => applyFilter('status', undefined)} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', !filters.status ? 'bg-[#2B4C8C] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}>All ({stats.total})</button>
                    <button onClick={() => applyFilter('status', 'published')} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', filters.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}>Published ({stats.published})</button>
                    <button onClick={() => applyFilter('status', 'draft')} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', filters.status === 'draft' ? 'bg-amber-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}>Drafts ({stats.drafts})</button>
                    <button onClick={() => applyFilter('status', 'scheduled')} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', filters.status === 'scheduled' ? 'bg-purple-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}>Scheduled</button>
                    <button onClick={() => applyFilter('featured', filters.featured ? undefined : '1')} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', filters.featured ? 'bg-yellow-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}>Featured</button>
                </div>

                {/* Search + Filters */}
                <div className="flex items-center gap-3 px-8">
                    <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search articles..."
                            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors focus:border-[#2B4C8C] focus:ring-2 focus:ring-[#2B4C8C]/10"
                        />
                    </form>

                    <select
                        value={filters.category_id || ''}
                        onChange={(e) => applyFilter('category_id', e.target.value || undefined)}
                        className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#2B4C8C]"
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                            <X className="size-3" />
                            Clear
                        </button>
                    )}
                </div>

                {/* Bulk actions */}
                {selected.length > 0 && (
                    <div className="flex items-center gap-2 px-8">
                        <span className="text-xs text-gray-500">{selected.length} selected</span>
                        <button onClick={() => bulkAction('published')} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100">Publish</button>
                        <button onClick={() => bulkAction('draft')} className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-100">Draft</button>
                        <button onClick={() => bulkAction('archived')} className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">Archive</button>
                        <button onClick={() => bulkAction('delete')} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">Delete</button>
                    </div>
                )}

                {/* Table */}
                <div className="mx-8 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/50">
                                    <th className="w-10 px-4 py-3">
                                        <input type="checkbox" checked={selected.length === articles.data.length && articles.data.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300" />
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        <button onClick={() => toggleSort('title')} className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                                            Article <ArrowUpDown className="size-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Author</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Category</th>
                                    <th className="px-4 py-3 text-left">
                                        <button onClick={() => toggleSort('status')} className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                                            Status <ArrowUpDown className="size-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        <button onClick={() => toggleSort('published_at')} className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                                            Date <ArrowUpDown className="size-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Views</th>
                                    <th className="w-24 px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {articles.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-16 text-center">
                                            <FileText className="mx-auto size-10 text-gray-200" />
                                            <p className="mt-3 text-sm font-medium text-gray-500">No articles found</p>
                                            <p className="text-xs text-gray-400">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : (
                                    articles.data.map((article) => (
                                        <tr key={article.id} className="group transition-colors hover:bg-gray-50/50">
                                            <td className="px-4 py-3">
                                                <input type="checkbox" checked={selected.includes(article.id)} onChange={() => toggleSelect(article.id)} className="rounded border-gray-300" />
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={`/crm/blog/articles/${article.id}/edit`} className="group/link">
                                                    <div className="flex items-center gap-3">
                                                        {article.featured_image ? (
                                                            <img src={`/storage/${article.featured_image}`} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                                                        ) : (
                                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                                                <FileText className="size-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 group-hover/link:text-[#2B4C8C] truncate transition-colors">
                                                                {article.title}
                                                                {article.is_featured && <span className="ml-1.5 text-yellow-500">★</span>}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400">{article.reading_time} min read</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                {article.author ? (
                                                    <span className="text-xs text-gray-600">{article.author.name}</span>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {article.category ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: article.category.color + '15', color: article.category.color }}>
                                                        <span className="size-1.5 rounded-full" style={{ backgroundColor: article.category.color }} />
                                                        {article.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider', statusStyles[article.status] || 'bg-gray-50 text-gray-600')}>
                                                    {article.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {article.published_at ? new Date(article.published_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">{article.view_count}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(`/crm/blog/articles/${article.id}/toggle-published`)}
                                                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                                        title={article.status === 'published' ? 'Unpublish' : 'Publish'}
                                                    >
                                                        {article.status === 'published' ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(`/crm/blog/articles/${article.id}/duplicate`)}
                                                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                                        title="Duplicate"
                                                    >
                                                        <Copy className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { if (confirm('Delete this article?')) router.delete(`/crm/blog/articles/${article.id}`); }}
                                                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {articles.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-50 px-4 py-3">
                            <span className="text-xs text-gray-400">
                                Showing {articles.from}–{articles.to} of {articles.total}
                            </span>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: articles.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={`/crm/blog/articles?page=${page}`}
                                        className={cn(
                                            'flex size-8 items-center justify-center rounded-lg text-xs font-medium transition-colors',
                                            page === articles.current_page
                                                ? 'bg-[#2B4C8C] text-white'
                                                : 'text-gray-500 hover:bg-gray-50'
                                        )}
                                    >
                                        {page}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
