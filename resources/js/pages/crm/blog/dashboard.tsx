import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    FileText,
    Clock,
    Archive,
    Eye,
    Star,
    TrendingUp,
    ArrowUpRight,
    PenLine,
} from 'lucide-react';

interface StatCard {
    label: string;
    value: number | string;
    icon: typeof BookOpen;
    color: string;
    bg: string;
}

interface Article {
    id: number;
    title: string;
    status: string;
    updated_at: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
    articles_count: number;
}

interface Tag {
    id: number;
    name: string;
    slug: string;
    articles_count: number;
}

interface Author {
    id: number;
    name: string;
    avatar: string | null;
    articles_count: number;
    is_active: boolean;
}

interface Props {
    stats: {
        total: number;
        published: number;
        drafts: number;
        scheduled: number;
        archived: number;
        total_views: number;
        featured: number;
        recently_updated: Article[];
    };
    categories: Category[];
    tags: Tag[];
    authors: Author[];
    recentArticles: Article[];
    popularArticles: Article[];
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

export default function BlogDashboard({ stats, categories, tags, authors, recentArticles, popularArticles }: Props) {
    const statCards: StatCard[] = [
        { label: 'Total Articles', value: stats.total, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Published', value: stats.published, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Drafts', value: stats.drafts, icon: PenLine, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Archived', value: stats.archived, icon: Archive, color: 'text-gray-600', bg: 'bg-gray-50' },
        { label: 'Total Views', value: stats.total_views.toLocaleString(), icon: Eye, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Featured', value: stats.featured, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    ];

    return (
        <>
            <Head title="Blog Dashboard" />

            <div className="flex-1 space-y-8 py-8">
                <div className="flex items-center justify-between px-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Blog Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your editorial content</p>
                    </div>
                    <Link
                        href="/crm/blog/articles/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#2B4C8C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1e3a6e]"
                    >
                        <PenLine className="size-4" />
                        New Article
                    </Link>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 gap-4 px-8 md:grid-cols-4 lg:grid-cols-7">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className={cn('mb-3 inline-flex rounded-lg p-2.5', card.bg)}>
                                    <Icon className={cn('size-4', card.color)} />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                <p className="mt-0.5 text-[10px] font-medium tracking-wide text-gray-500 uppercase">{card.label}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-8 px-8 lg:grid-cols-3">
                    {/* Recent Articles */}
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
                            <h3 className="text-sm font-semibold text-gray-900">Recently Updated</h3>
                            <Link href="/crm/blog/articles" className="text-[10px] font-medium text-[#2B4C8C] hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentArticles.length === 0 ? (
                                <div className="px-5 py-8 text-center">
                                    <FileText className="mx-auto size-8 text-gray-200" />
                                    <p className="mt-2 text-xs text-gray-400">No articles yet</p>
                                </div>
                            ) : (
                                recentArticles.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={`/crm/blog/articles/${article.id}/edit`}
                                        className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                                            <p className="text-[10px] text-gray-400">
                                                {new Date(article.updated_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={cn(
                                            'ml-3 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider',
                                            article.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
                                            article.status === 'draft' ? 'bg-amber-50 text-amber-600' :
                                            article.status === 'scheduled' ? 'bg-purple-50 text-purple-600' :
                                            'bg-gray-50 text-gray-600'
                                        )}>
                                            {article.status}
                                        </span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
                            <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
                            <Link href="/crm/blog/categories" className="text-[10px] font-medium text-[#2B4C8C] hover:underline">
                                Manage
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {categories.length === 0 ? (
                                <div className="px-5 py-8 text-center text-xs text-gray-400">No categories</div>
                            ) : (
                                categories.map((cat) => (
                                    <div key={cat.id} className="flex items-center justify-between px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                            <span className="text-sm text-gray-700">{cat.name}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{cat.articles_count} articles</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Popular / Authors */}
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
                            <h3 className="text-sm font-semibold text-gray-900">Authors</h3>
                            <Link href="/crm/blog/authors" className="text-[10px] font-medium text-[#2B4C8C] hover:underline">
                                Manage
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {authors.length === 0 ? (
                                <div className="px-5 py-8 text-center text-xs text-gray-400">No authors</div>
                            ) : (
                                authors.map((author) => (
                                    <div key={author.id} className="flex items-center justify-between px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                                {author.avatar ? (
                                                    <img src={`/storage/${author.avatar}`} alt={author.name} className="size-8 rounded-full object-cover" />
                                                ) : (
                                                    author.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{author.name}</p>
                                                {!author.is_active && (
                                                    <span className="text-[9px] text-gray-400">Inactive</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{author.articles_count} articles</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
