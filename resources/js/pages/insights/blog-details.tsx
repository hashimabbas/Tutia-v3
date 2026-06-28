import { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    User,
    BookOpen,
    ArrowLeft,
    Share2,
    ChevronRight,
    Tag as TagIcon,
    ArrowRight,
} from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface AuthorData {
    id: number;
    name: string;
    email: string;
    title: string | null;
    avatar: string | null;
    biography: string | null;
    social_links: Record<string, string> | null;
}

interface CategoryData {
    id: number;
    name: string;
    slug: string;
    color: string;
}

interface TagData {
    id: number;
    name: string;
}

interface ArticleData {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: any;
    featured_image: string | null;
    featured_image_alt: string | null;
    published_at: string | null;
    reading_time: number;
    view_count: number;
    seo_title: string | null;
    seo_description: string | null;
    author: AuthorData | null;
    category: CategoryData | null;
    tags: TagData[];
}

interface Props {
    article: ArticleData;
    related: ArticleData[];
    popular: ArticleData[];
    categories: CategoryData[];
    structuredData: Record<string, any>;
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function TiptapRenderer({ content }: { content: any }) {
    return useMemo(() => {
        if (!content) return null;

        function renderNode(node: any, key: number): JSX.Element | null {
            if (!node) return null;

            const children = node.content?.map((child: any, i: number) => renderNode(child, i)) ?? null;

            switch (node.type) {
                case 'doc':
                    return <div key={key} className="space-y-4">{children}</div>;

                case 'paragraph':
                    return <p key={key} className="text-base leading-relaxed text-neutral-700">{children}</p>;

                case 'heading':
                    const level = node.attrs?.level || 2;
                    const headingClass = level === 1
                        ? 'text-2xl font-bold text-neutral-900 mt-8 mb-4'
                        : level === 2
                            ? 'text-xl font-semibold text-neutral-900 mt-6 mb-3'
                            : 'text-lg font-semibold text-neutral-900 mt-5 mb-2';
                    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
                    return <Tag key={key} className={headingClass}>{children}</Tag>;

                case 'bulletList':
                    return <ul key={key} className="list-disc space-y-1 pl-5 text-neutral-700">{children}</ul>;

                case 'orderedList':
                    return <ol key={key} className="list-decimal space-y-1 pl-5 text-neutral-700">{children}</ol>;

                case 'listItem':
                    return <li key={key} className="text-base leading-relaxed">{children}</li>;

                case 'taskList':
                    return <ul key={key} className="space-y-2 pl-0">{children}</ul>;

                case 'taskItem': {
                    const checked = node.attrs?.checked ?? false;
                    return (
                        <li key={key} className="flex items-start gap-2 text-base text-neutral-700">
                            <input type="checkbox" checked={checked} readOnly className="mt-1 size-4 rounded border-neutral-300 text-brand-navy-500" />
                            <span>{children}</span>
                        </li>
                    );
                }

                case 'blockquote':
                    return (
                        <blockquote key={key} className="border-l-4 border-brand-navy-300 bg-brand-navy-50/50 px-5 py-4 italic text-neutral-600 rounded-r-xl">
                            {children}
                        </blockquote>
                    );

                case 'codeBlock':
                    return (
                        <pre key={key} className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-sm text-neutral-100">
                            <code>{node.text || children}</code>
                        </pre>
                    );

                case 'horizontalRule':
                    return <hr key={key} className="my-8 border-neutral-200" />;

                case 'image': {
                    const src = node.attrs?.src || '';
                    const alt = node.attrs?.alt || '';
                    return (
                        <figure key={key} className="my-6">
                            <img src={src} alt={alt} className="w-full rounded-xl object-cover" loading="lazy" />
                            {alt && <figcaption className="mt-2 text-center text-xs text-neutral-500">{alt}</figcaption>}
                        </figure>
                    );
                }

                case 'table':
                    return (
                        <div key={key} className="my-6 overflow-x-auto rounded-xl border border-neutral-200">
                            <table className="w-full text-sm">
                                {children}
                            </table>
                        </div>
                    );

                case 'tableRow':
                    return <tr key={key} className="border-b border-neutral-200 last:border-0">{children}</tr>;

                case 'tableHeader':
                    return <th key={key} className="bg-neutral-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">{children}</th>;

                case 'tableCell':
                    return <td key={key} className="px-4 py-3 text-neutral-700">{children}</td>;

                case 'text': {
                    let text = node.text ?? '';
                    const marks = node.marks ?? [];
                    let el = <span key={key}>{text}</span>;

                    for (const mark of marks) {
                        switch (mark.type) {
                            case 'bold':
                                el = <strong key={key}>{el}</strong>;
                                break;
                            case 'italic':
                                el = <em key={key}>{el}</em>;
                                break;
                            case 'underline':
                                el = <span key={key} className="underline">{el}</span>;
                                break;
                            case 'strike':
                                el = <span key={key} className="line-through">{el}</span>;
                                break;
                            case 'code':
                                el = <code key={key} className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-sm font-mono text-brand-navy-600">{el}</code>;
                                break;
                            case 'highlight':
                                const highlightColor = mark.attrs?.color || '#fef08a';
                                el = <mark key={key} style={{ backgroundColor: highlightColor }} className="px-0.5 rounded">{el}</mark>;
                                break;
                            case 'link': {
                                const href = mark.attrs?.href || '#';
                                el = <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-brand-navy-500 underline underline-offset-2 hover:text-brand-navy-700">{el}</a>;
                                break;
                            }
                            case 'textStyle': {
                                const color = mark.attrs?.color;
                                if (color) {
                                    el = <span key={key} style={{ color }}>{el}</span>;
                                }
                                break;
                            }
                        }
                    }

                    return el;
                }

                default:
                    return children || null;
            }
        }

        return <div className="prose-article">{renderNode(content, 0)}</div>;
    }, [content]);
}

function ArticleJsonLd({ data }: { data: Record<string, any> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export default function BlogDetails({ article, related, popular, categories, structuredData }: Props) {
    const { locale } = useI18n();

    function shareArticle() {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    }

    return (
        <>
            <Head title={article.seo_title || article.title}>
                {article.seo_description && (
                    <meta name="description" content={article.seo_description} />
                )}
                {article.featured_image && (
                    <>
                        <meta property="og:image" content={`/storage/${article.featured_image}`} />
                        <meta name="twitter:card" content="summary_large_image" />
                        <meta name="twitter:image" content={`/storage/${article.featured_image}`} />
                    </>
                )}
            </Head>

            <ArticleJsonLd data={structuredData} />

            {/* Progress bar */}
            <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
                <div id="reading-progress" className="h-full bg-brand-gold-500 transition-all" style={{ width: '0%' }} />
            </div>

            {/* Hero */}
            <Section className="relative overflow-hidden pt-28 pb-12 md:pt-36 md:pb-16">
                {article.featured_image && (
                    <>
                        <img
                            src={`/storage/${article.featured_image}`}
                            alt={article.featured_image_alt || article.title}
                            className="absolute inset-0 size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                    </>
                )}
                <Container className="relative">
                    <div className={cn('mx-auto max-w-3xl', !article.featured_image && 'text-center')}>
                        <nav className="mb-6 flex items-center gap-2 text-xs text-neutral-400">
                            <Link href="/insights" className="hover:text-white transition-colors">
                                {locale === 'ar' ? 'الرؤى والموارد' : 'Insights & Resources'}
                            </Link>
                            <ChevronRight className="size-3 rtl:rotate-180" />
                            <Link href="/insights/blog" className="hover:text-white transition-colors">
                                {locale === 'ar' ? 'المدونة' : 'Blog'}
                            </Link>
                            {article.category && (
                                <>
                                    <ChevronRight className="size-3 rtl:rotate-180" />
                                    <span style={{ color: article.category.color }}>
                                        {article.category.name}
                                    </span>
                                </>
                            )}
                        </nav>

                        {article.category && (
                            <span
                                className="mb-4 inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white"
                                style={{ backgroundColor: article.category.color }}
                            >
                                {article.category.name}
                            </span>
                        )}

                        <Heading level="h1" className={cn('mt-2', article.featured_image ? 'text-white' : 'text-neutral-900')}>
                            {article.title}
                        </Heading>

                        {article.excerpt && (
                            <Text variant="body-lg" className={cn('mt-4 max-w-2xl', article.featured_image ? 'text-neutral-300' : 'text-neutral-600')}>
                                {article.excerpt}
                            </Text>
                        )}

                        <div className={cn('mt-6 flex flex-wrap items-center gap-4 text-sm', article.featured_image ? 'text-neutral-400' : 'text-neutral-500')}>
                            {article.author && (
                                <span className="flex items-center gap-2">
                                    {article.author.avatar ? (
                                        <img src={`/storage/${article.author.avatar}`} alt={article.author.name} className="size-8 rounded-full object-cover" />
                                    ) : (
                                        <span className="flex size-8 items-center justify-center rounded-full bg-brand-navy-100 text-brand-navy-600">
                                            <User className="size-4" />
                                        </span>
                                    )}
                                    <span className="font-medium">{article.author.name}</span>
                                    {article.author.title && (
                                        <span className="hidden text-xs sm:inline">{article.author.title}</span>
                                    )}
                                </span>
                            )}
                            {article.published_at && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="size-4" />
                                    {formatDate(article.published_at)}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Clock className="size-4" />
                                {article.reading_time} min read
                            </span>
                        </div>
                    </div>
                </Container>
            </Section>

            {/* Article content */}
            <Section>
                <Container>
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                        <article className="prose-container lg:col-span-2">
                            <div className="mx-auto max-w-3xl">
                                {/* Tags */}
                                {article.tags.length > 0 && (
                                    <div className="mb-8 flex flex-wrap items-center gap-2">
                                        <TagIcon className="size-3.5 text-neutral-400" />
                                        {article.tags.map((tag) => (
                                            <Link
                                                key={tag.id}
                                                href={`/insights/blog?tag=${tag.name}`}
                                                className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-200"
                                            >
                                                {tag.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="article-content">
                                    <TiptapRenderer content={article.content} />
                                </div>

                                {/* Share */}
                                <div className="mt-12 flex items-center gap-4 border-t border-neutral-100 pt-6">
                                    <button
                                        onClick={shareArticle}
                                        className="inline-flex items-center gap-2 rounded-xl bg-brand-navy-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-navy-600"
                                    >
                                        <Share2 className="size-3.5" />
                                        {locale === 'ar' ? 'مشاركة' : 'Share'}
                                    </button>
                                    {article.author && (
                                        <div className="flex items-center gap-3 ml-auto">
                                            {article.author.avatar ? (
                                                <img src={`/storage/${article.author.avatar}`} alt={article.author.name} className="size-10 rounded-full object-cover" />
                                            ) : (
                                                <span className="flex size-10 items-center justify-center rounded-full bg-brand-navy-100 text-brand-navy-600">
                                                    <User className="size-5" />
                                                </span>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-neutral-900">{article.author.name}</p>
                                                {article.author.title && (
                                                    <p className="text-xs text-neutral-500">{article.author.title}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>

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
                                            <Link
                                                key={c.id}
                                                href={`/insights/blog?category=${c.slug}`}
                                                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
                                                    {c.name}
                                                </span>
                                                <ChevronRight className="size-3" />
                                            </Link>
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
                        </aside>
                    </div>
                </Container>
            </Section>

            {/* Related articles */}
            {related.length > 0 && (
                <Section background="muted">
                    <Container>
                        <div className="mb-8 flex items-center justify-between">
                            <Heading level="h2">
                                {locale === 'ar' ? 'مقالات ذات صلة' : 'Related Articles'}
                            </Heading>
                            <Button asChild variant="link" className="text-brand-navy-500">
                                <Link href="/insights/blog">
                                    {locale === 'ar' ? 'عرض الكل' : 'View All'}
                                    <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((a) => (
                                <Link
                                    key={a.id}
                                    href={`/insights/blog/${a.slug}`}
                                    className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-all hover:shadow-lg"
                                >
                                    <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                                        {a.featured_image ? (
                                            <img src={`/storage/${a.featured_image}`} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="flex size-full items-center justify-center">
                                                <BookOpen className="size-8 text-neutral-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs text-neutral-400 mb-1">{a.reading_time} min read</p>
                                        <Heading level="h3" className="text-base text-neutral-900 group-hover:text-brand-navy-500 transition-colors line-clamp-2">
                                            {a.title}
                                        </Heading>
                                        {a.excerpt && (
                                            <Text variant="body-sm" className="mt-2 text-neutral-500 line-clamp-2">
                                                {a.excerpt}
                                            </Text>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Container>
                </Section>
            )}

            {/* Back link */}
            <Section>
                <Container>
                    <Button asChild variant="link" className="text-brand-navy-500">
                        <Link href="/insights/blog">
                            <ArrowLeft className="mr-2 size-4 rtl:rotate-180" />
                            {locale === 'ar' ? 'العودة إلى المدونة' : 'Back to Blog'}
                        </Link>
                    </Button>
                </Container>
            </Section>

            {/* Reading progress script */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        document.addEventListener('scroll', function() {
                            var scrollTop = window.scrollY;
                            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
                            var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                            var bar = document.getElementById('reading-progress');
                            if (bar) bar.style.width = progress + '%';
                        });
                    `,
                }}
            />
        </>
    );
}
