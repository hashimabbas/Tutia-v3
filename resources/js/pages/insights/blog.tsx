import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Search,
    Calendar,
    Clock,
    ArrowRight,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface ArticleData {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    featured_image_alt: string | null;
    status: string;
    published_at: string | null;
    reading_time: number;
    is_featured: boolean;
    author: { id: number; name: string; avatar: string | null } | null;
    category: { id: number; name: string; slug: string; color: string } | null;
    tags: { id: number; name: string }[];
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

interface CategoryData {
    id: number;
    name: string;
    slug: string;
    color: string;
    articles_count: number;
}

interface Props {
    articles: PaginatedData<ArticleData>;
    featured: ArticleData[];
    popular: ArticleData[];
    categories: CategoryData[];
    recent: ArticleData[];
    filters: { category?: string; tag?: string; search?: string };
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function Blog({ articles, featured, popular, categories, recent, filters }: Props) {
    const { locale } = useI18n();
    const [search, setSearch] = useState(filters.search || '');
    const [heroIndex, setHeroIndex] = useState(0);

    const activeCategory = categories.find((c) => c.slug === filters.category);

    function applyFilter(key: string, value: string | undefined) {
        router.get('/insights/blog', { ...filters, [key]: value || undefined, page: undefined }, { preserveState: true, replace: true });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilter('search', search || undefined);
    }

    function clearFilters() {
        setSearch('');
        router.get('/insights/blog', {}, { preserveState: true, replace: true });
    }

    const hasFilters = filters.category || filters.search;

    return (
        <>
            <Head title={locale === 'ar' ? 'المدونة' : 'Blog'}>
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'مدونة توتيا - أفكار ورؤى حول التكنولوجيا'
                            : 'TUTIA Blog - Insights and perspectives on technology'
                    }
                />
            </Head>

            <Section
                background="navy"
                className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <BookOpen className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'المدونة' : 'Blog'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'أفكار ورؤى حول التكنولوجيا والتحول الرقمي في السودان'
                                : 'Insights and perspectives on technology and digital transformation in Sudan'}
                        </Text>
                    </div>
                </Container>
            </Section>

            {/* Featured Hero Carousel */}
            {featured.length > 0 && (
                <Section>
                    <Container>
                        <div className="mb-8 flex items-center justify-between">
                            <Heading level="h2">
                                {locale === 'ar' ? 'مميز' : 'Featured'}
                            </Heading>
                            {featured.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setHeroIndex((i) => (i - 1 + featured.length) % featured.length)}
                                        className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
                                    >
                                        <ChevronLeft className="size-4 rtl:rotate-180" />
                                    </button>
                                    <button
                                        onClick={() => setHeroIndex((i) => (i + 1) % featured.length)}
                                        className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
                                    >
                                        <ChevronRight className="size-4 rtl:rotate-180" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {(() => {
                            const f = featured[heroIndex];
                            return (
                                <Link
                                    key={f.id}
                                    href={`/insights/blog/${f.slug}`}
                                    className="group relative flex min-h-[300px] md:min-h-[400px] overflow-hidden rounded-2xl bg-neutral-900"
                                >
                                    {f.featured_image && (
                                        <img
                                            src={`/storage/${f.featured_image}`}
                                            alt={f.featured_image_alt || f.title}
                                            className="absolute inset-0 size-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="relative mt-auto p-6 md:p-10">
                                        {f.category && (
                                            <span
                                                className="mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white"
                                                style={{ backgroundColor: f.category.color }}
                                            >
                                                {f.category.name}
                                            </span>
                                        )}
                                        <Heading level="h2" className="text-white">
                                            {f.title}
                                        </Heading>
                                        {f.excerpt && (
                                            <Text variant="body" className="mt-2 max-w-2xl text-neutral-300 line-clamp-2">
                                                {f.excerpt}
                                            </Text>
                                        )}
                                        <div className="mt-4 flex items-center gap-4 text-xs text-neutral-400">
                                            {f.author && (
                                                <span className="flex items-center gap-1.5">
                                                    {f.author.avatar && (
                                                        <img src={`/storage/${f.author.avatar}`} alt="" className="size-5 rounded-full object-cover" />
                                                    )}
                                                    {f.author.name}
                                                </span>
                                            )}
                                            {f.published_at && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    {formatDate(f.published_at)}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {f.reading_time} min read
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })()}

                        {featured.length > 1 && (
                            <div className="mt-4 flex justify-center gap-1.5">
                                {featured.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setHeroIndex(i)}
                                        className={cn(
                                            'h-1.5 rounded-full transition-all',
                                            i === heroIndex ? 'w-8 bg-brand-navy-500' : 'w-1.5 bg-neutral-300'
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </Container>
                </Section>
            )}

            {/* Main content */}
            <Section>
                <Container>
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                        {/* Article grid */}
                        <div className="lg:col-span-2">
                            {/* Search + Filter */}
                            <div className="mb-8 flex flex-wrap items-center gap-3">
                                <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-sm">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={locale === 'ar' ? 'بحث...' : 'Search articles...'}
                                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 text-sm outline-none transition-colors focus:border-brand-navy-300 focus:ring-2 focus:ring-brand-navy-500/10"
                                    />
                                </form>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => applyFilter('category', undefined)}
                                        className={cn(
                                            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                                            !filters.category ? 'bg-brand-navy-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                        )}
                                    >
                                        {locale === 'ar' ? 'الكل' : 'All'}
                                    </button>
                                    {categories.slice(0, 6).map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => applyFilter('category', c.slug === filters.category ? undefined : c.slug)}
                                            className={cn(
                                                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                                                filters.category === c.slug ? 'bg-brand-navy-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                            )}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                    {hasFilters && (
                                        <button onClick={clearFilters} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-neutral-400 hover:text-neutral-600">
                                            <X className="size-3" />
                                            {locale === 'ar' ? 'مسح' : 'Clear'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {articles.data.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-neutral-200 p-16 text-center">
                                    <BookOpen className="mx-auto size-12 text-neutral-200" />
                                    <Heading level="h3" className="mt-4 text-neutral-600">
                                        {locale === 'ar' ? 'لا توجد مقالات بعد' : 'No articles yet'}
                                    </Heading>
                                    <Text variant="body" className="mt-2 text-neutral-400">
                                        {locale === 'ar'
                                            ? 'سننشر مقالات قريباً. ترقبونا!'
                                            : 'We will publish articles soon. Stay tuned!'}
                                    </Text>
                                </div>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {articles.data.map((article) => (
                                        <Link
                                            key={article.id}
                                            href={`/insights/blog/${article.slug}`}
                                            className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-all hover:shadow-lg"
                                        >
                                            <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                                                {article.featured_image ? (
                                                    <img
                                                        src={`/storage/${article.featured_image}`}
                                                        alt={article.featured_image_alt || article.title}
                                                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex size-full items-center justify-center">
                                                        <BookOpen className="size-8 text-neutral-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-neutral-400 mb-2">
                                                    {article.category && (
                                                        <span className="font-semibold" style={{ color: article.category.color }}>
                                                            {article.category.name}
                                                        </span>
                                                    )}
                                                    {article.published_at && (
                                                        <span>&middot; {formatDate(article.published_at)}</span>
                                                    )}
                                                    <span>&middot; {article.reading_time} min read</span>
                                                </div>
                                                <Heading level="h3" className="text-base md:text-lg text-neutral-900 group-hover:text-brand-navy-500 transition-colors line-clamp-2">
                                                    {article.title}
                                                </Heading>
                                                {article.excerpt && (
                                                    <Text variant="body-sm" className="mt-2 text-neutral-500 line-clamp-2">
                                                        {article.excerpt}
                                                    </Text>
                                                )}
                                                <div className="mt-4 flex items-center gap-2">
                                                    {article.author?.avatar && (
                                                        <img src={`/storage/${article.author.avatar}`} alt="" className="size-6 rounded-full object-cover" />
                                                    )}
                                                    <span className="text-xs text-neutral-500">
                                                        {article.author?.name || 'TUTIA'}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {articles.last_page > 1 && (
                                <div className="mt-10 flex items-center justify-center gap-2">
                                    {articles.current_page > 1 && (
                                        <Link
                                            href={`/insights/blog?page=${articles.current_page - 1}${hasFilters ? `&category=${filters.category || ''}` : ''}`}
                                            className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
                                        >
                                            <ChevronLeft className="size-4 rtl:rotate-180" />
                                        </Link>
                                    )}
                                    {Array.from({ length: articles.last_page }, (_, i) => i + 1).map((page) => (
                                        <Link
                                            key={page}
                                            href={`/insights/blog?page=${page}${hasFilters ? `&category=${filters.category || ''}` : ''}`}
                                            className={cn(
                                                'flex size-10 items-center justify-center rounded-xl text-sm font-medium transition-colors',
                                                page === articles.current_page
                                                    ? 'bg-brand-navy-500 text-white'
                                                    : 'text-neutral-600 hover:bg-neutral-100'
                                            )}
                                        >
                                            {page}
                                        </Link>
                                    ))}
                                    {articles.current_page < articles.last_page && (
                                        <Link
                                            href={`/insights/blog?page=${articles.current_page + 1}${hasFilters ? `&category=${filters.category || ''}` : ''}`}
                                            className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
                                        >
                                            <ChevronRight className="size-4 rtl:rotate-180" />
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-8">
                            {/* Categories */}
                            {categories.length > 0 && (
                                <div className="rounded-2xl border border-neutral-100 bg-white p-6">
                                    <Heading level="h3" className="text-sm text-neutral-900 mb-4">
                                        {locale === 'ar' ? 'التصنيفات' : 'Categories'}
                                    </Heading>
                                    <div className="space-y-2">
                                        {categories.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => applyFilter('category', c.slug === filters.category ? undefined : c.slug)}
                                                className={cn(
                                                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors',
                                                    filters.category === c.slug ? 'bg-brand-navy-50 text-brand-navy-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'
                                                )}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
                                                    {c.name}
                                                </span>
                                                <span className="text-xs text-neutral-400">({c.articles_count})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Popular */}
                            {popular.length > 0 && (
                                <div className="rounded-2xl border border-neutral-100 bg-white p-6">
                                    <Heading level="h3" className="text-sm text-neutral-900 mb-4">
                                        {locale === 'ar' ? 'الأكثر قراءة' : 'Popular'}
                                    </Heading>
                                    <div className="space-y-4">
                                        {popular.map((a, i) => (
                                            <Link key={a.id} href={`/insights/blog/${a.slug}`} className="group flex items-start gap-3">
                                                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-navy-50 text-[10px] font-bold text-brand-navy-500">
                                                    {i + 1}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-neutral-700 group-hover:text-brand-navy-500 transition-colors line-clamp-2">
                                                        {a.title}
                                                    </p>
                                                    <p className="mt-0.5 text-[10px] text-neutral-400">{a.reading_time} min read</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent */}
                            {recent.length > 0 && (
                                <div className="rounded-2xl border border-neutral-100 bg-white p-6">
                                    <Heading level="h3" className="text-sm text-neutral-900 mb-4">
                                        {locale === 'ar' ? 'أحدث المقالات' : 'Recent'}
                                    </Heading>
                                    <div className="space-y-3">
                                        {recent.map((a) => (
                                            <Link key={a.id} href={`/insights/blog/${a.slug}`} className="group flex gap-3">
                                                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                                                    {a.featured_image ? (
                                                        <img src={`/storage/${a.featured_image}`} alt="" className="size-full object-cover" />
                                                    ) : (
                                                        <div className="flex size-full items-center justify-center">
                                                            <BookOpen className="size-4 text-neutral-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-neutral-700 group-hover:text-brand-navy-500 transition-colors line-clamp-2">
                                                        {a.title}
                                                    </p>
                                                    <p className="mt-0.5 text-[10px] text-neutral-400">
                                                        {a.published_at ? formatDate(a.published_at) : ''}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </Container>
            </Section>

            {/* Newsletter CTA */}
            <Section background="muted">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2">
                        {locale === 'ar' ? 'ابق على اطلاع' : 'Stay Updated'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'اشترك في نشرتنا البريدية لتصلك أحدث المقالات فور نشرها'
                            : 'Subscribe to our newsletter to get notified when we publish new articles'}
                    </Text>
                    <div className="mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/contact">
                                {locale === 'ar'
                                    ? 'اشترك الآن'
                                    : 'Subscribe Now'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <Button
                        asChild
                        variant="link"
                        className="text-brand-navy-500"
                    >
                        <Link href="/insights">
                            <ArrowLeft className="mr-2 size-4 rtl:rotate-180" />
                            {locale === 'ar'
                                ? 'العودة إلى المدونة والموارد'
                                : 'Back to Insights & Resources'}
                        </Link>
                    </Button>
                </Container>
            </Section>
        </>
    );
}
