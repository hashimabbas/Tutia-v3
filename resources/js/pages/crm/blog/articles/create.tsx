import { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    Loader2,
    X,
    Upload,
    Camera,
    FileText,
    Clock,
    Calendar,
    Eye,
    EyeOff,
    Star,
    Sparkles,
    Globe,
    Hash,
    Image as ImageIcon,
    ChevronDown,
    Check,
} from 'lucide-react';
import { BlogEditor } from '@/components/blog/editor';

interface Author {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
}

interface Tag {
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
    author_id: number | null;
    category_id: number | null;
    status: string;
    published_at: string | null;
    scheduled_at: string | null;
    is_featured: boolean;
    featured_order: number;
    view_count: number;
    reading_time: number;
    seo_title: string | null;
    seo_description: string | null;
    seo_keywords: string | null;
    canonical_url: string | null;
    og_image: string | null;
    twitter_card: string;
    author: Author | null;
    category: Category | null;
    tags: Tag[];
}

interface Props {
    article?: ArticleData;
    categories: Category[];
    tags: Tag[];
    authors: Author[];
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

const statuses = [
    { value: 'draft', label: 'Draft', color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { value: 'review', label: 'Review', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { value: 'published', label: 'Published', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-50 text-gray-600 border-gray-200' },
];

const twitterCardOptions = [
    { value: 'summary', label: 'Summary' },
    { value: 'summary_large_image', label: 'Large Image' },
    { value: 'app', label: 'App' },
    { value: 'player', label: 'Player' },
];

export default function ArticleCreate({ article, categories, tags, authors }: Props) {
    const isEditing = !!article;

    const [form, setForm] = useState({
        title: article?.title ?? '',
        slug: article?.slug ?? '',
        excerpt: article?.excerpt ?? '',
        content: article?.content ? JSON.stringify(article.content) : '',
        author_id: article?.author_id ?? null,
        category_id: article?.category_id ?? null,
        tags: article?.tags?.map((t) => t.name) ?? [] as string[],
        status: article?.status ?? 'draft',
        scheduled_at: article?.scheduled_at ?? '',
        is_featured: article?.is_featured ?? false,
        featured_order: article?.featured_order ?? 0,
        featured_image_alt: article?.featured_image_alt ?? '',
        seo_title: article?.seo_title ?? '',
        seo_description: article?.seo_description ?? '',
        seo_keywords: article?.seo_keywords ?? '',
        canonical_url: article?.canonical_url ?? '',
        twitter_card: article?.twitter_card ?? 'summary_large_image',
    });

    const [featuredImage, setFeaturedImage] = useState<string | null>(article?.featured_image ?? null);
    const [featuredFile, setFeaturedFile] = useState<File | null>(null);
    const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);

    const [ogImage, setOgImage] = useState<string | null>(article?.og_image ?? null);
    const [ogFile, setOgFile] = useState<File | null>(null);
    const [ogPreview, setOgPreview] = useState<string | null>(null);

    const [tagInput, setTagInput] = useState('');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const featuredInputRef = useRef<HTMLInputElement>(null);
    const ogInputRef = useRef<HTMLInputElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (featuredFile) {
            const url = URL.createObjectURL(featuredFile);
            setFeaturedPreview(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [featuredFile]);

    useEffect(() => {
        if (ogFile) {
            const url = URL.createObjectURL(ogFile);
            setOgPreview(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [ogFile]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
                setShowStatusDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleChange(field: string, value: any) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

    function autoSlug() {
        if (!isEditing && !form.slug) {
            handleChange('slug', form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    }

    function addTag(name: string) {
        const trimmed = name.trim();
        if (trimmed && !form.tags.includes(trimmed)) {
            handleChange('tags', [...form.tags, trimmed]);
        }
        setTagInput('');
    }

    function removeTag(name: string) {
        handleChange('tags', form.tags.filter((t) => t !== name));
    }

    function addExistingTag(tagName: string) {
        if (!form.tags.includes(tagName)) {
            handleChange('tags', [...form.tags, tagName]);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        data.append('title', form.title);
        data.append('slug', form.slug);
        data.append('excerpt', form.excerpt);
        data.append('content', form.content || '');
        data.append('author_id', String(form.author_id ?? ''));
        data.append('category_id', String(form.category_id ?? ''));
        data.append('status', form.status);
        data.append('scheduled_at', form.scheduled_at || '');
        data.append('is_featured', form.is_featured ? '1' : '0');
        data.append('featured_order', String(form.featured_order));
        data.append('featured_image_alt', form.featured_image_alt);
        data.append('seo_title', form.seo_title);
        data.append('seo_description', form.seo_description);
        data.append('seo_keywords', form.seo_keywords);
        data.append('canonical_url', form.canonical_url);
        data.append('twitter_card', form.twitter_card);

        form.tags.forEach((tag) => data.append('tags[]', tag));

        if (featuredFile) {
            data.append('featured_image', featuredFile);
        }

        if (ogFile) {
            data.append('og_image', ogFile);
        }

        const url = isEditing ? `/crm/blog/articles/${article!.id}` : '/crm/blog/articles';
        const method = 'post';

        if (isEditing) {
            data.append('_method', 'PATCH');
        }

        router[method](url, data, {
            onSuccess: () => setSaving(false),
            onError: (errs) => {
                setErrors(errs);
                setSaving(false);
            },
        });
    }

    const statusLabel = statuses.find((s) => s.value === form.status);

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <Head title={isEditing ? `Edit: ${article!.title}` : 'New Article'} />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/crm/blog/articles"
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                        <ArrowLeft className="size-3.5" />
                        Back
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">
                            {isEditing ? 'Edit Article' : 'New Article'}
                        </h1>
                        <p className="mt-0.5 text-xs text-gray-500">
                            {isEditing ? `Editing: ${article!.title}` : 'Create a new blog article.'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main content area */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Left: Title, Content, Excerpt */}
                    <div className="col-span-2 space-y-6">
                        {/* Title + Slug */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        onBlur={autoSlug}
                                        className={cn(
                                            'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:ring-1',
                                            errors.title
                                                ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                                                : 'border-gray-200 focus:border-[#2B4C8C] focus:ring-[#2B4C8C]/20'
                                        )}
                                        placeholder="Enter article title"
                                    />
                                    {errors.title && <p className="mt-1 text-[10px] text-red-500">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">/insights/blog/</span>
                                        <input
                                            type="text"
                                            value={form.slug}
                                            onChange={(e) => handleChange('slug', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-[6.5rem] pr-3 text-sm text-gray-900 font-mono text-[11px] outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                            placeholder="article-url-slug"
                                        />
                                    </div>
                                    {errors.slug && <p className="mt-1 text-[10px] text-red-500">{errors.slug}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Excerpt</label>
                                    <textarea
                                        value={form.excerpt}
                                        onChange={(e) => handleChange('excerpt', e.target.value)}
                                        rows={2}
                                        maxLength={500}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20 resize-y"
                                        placeholder="Short description for cards and previews..."
                                    />
                                    <p className="mt-1 text-right text-[10px] text-gray-400">{form.excerpt.length}/500</p>
                                </div>
                            </div>
                        </div>

                        {/* Tiptap Editor */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="size-4 text-gray-400" />
                                    <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Content</span>
                                </div>
                            </div>
                            <BlogEditor
                                content={form.content}
                                onChange={(json) => handleChange('content', json)}
                                placeholder="Start writing your article..."
                            />
                            {errors.content && (
                                <div className="px-5 pb-3">
                                    <p className="text-[10px] text-red-500">{errors.content}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-6">
                        {/* Publish Controls */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">Publish</h2>

                            <div className="space-y-4">
                                {/* Status */}
                                <div ref={statusRef} className="relative">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors hover:border-gray-300"
                                    >
                                        <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-medium border', statusLabel?.color)}>
                                            {statusLabel?.label}
                                        </span>
                                        <ChevronDown className="size-3.5 text-gray-400" />
                                    </button>
                                    {showStatusDropdown && (
                                        <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
                                            {statuses.map((s) => (
                                                <button
                                                    key={s.value}
                                                    type="button"
                                                    onClick={() => {
                                                        handleChange('status', s.value);
                                                        setShowStatusDropdown(false);
                                                    }}
                                                    className={cn(
                                                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors hover:bg-gray-50',
                                                        form.status === s.value && 'bg-gray-50'
                                                    )}
                                                >
                                                    <span className={cn('rounded-md px-2 py-0.5 font-medium border', s.color)}>{s.label}</span>
                                                    {form.status === s.value && <Check className="size-3.5 text-[#2B4C8C]" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {errors.status && <p className="mt-1 text-[10px] text-red-500">{errors.status}</p>}
                                </div>

                                {/* Schedule */}
                                {form.status === 'scheduled' && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            <Clock className="mr-1 inline size-3" />
                                            Schedule Date
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={form.scheduled_at}
                                            onChange={(e) => handleChange('scheduled_at', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                        />
                                        {errors.scheduled_at && <p className="mt-1 text-[10px] text-red-500">{errors.scheduled_at}</p>}
                                    </div>
                                )}

                                {/* Featured toggle */}
                                <div className="flex items-center justify-between">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.is_featured}
                                            onChange={(e) => handleChange('is_featured', e.target.checked)}
                                            className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500/20"
                                        />
                                        <span className="text-xs font-medium text-gray-700">Featured</span>
                                    </label>
                                    {form.is_featured && (
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.featured_order}
                                            onChange={(e) => handleChange('featured_order', parseInt(e.target.value) || 0)}
                                            className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-xs text-center outline-none focus:border-[#2B4C8C]"
                                            title="Featured order"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Author */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">Author</h2>
                            <select
                                value={form.author_id ?? ''}
                                onChange={(e) => handleChange('author_id', e.target.value ? Number(e.target.value) : null)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                            >
                                <option value="">No author</option>
                                {authors.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">Category</h2>
                            <select
                                value={form.category_id ?? ''}
                                onChange={(e) => handleChange('category_id', e.target.value ? Number(e.target.value) : null)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                            >
                                <option value="">No category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">Tags</h2>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {form.tags.map((tag) => (
                                    <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500">
                                            <X className="size-2.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-1">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); }
                                    }}
                                    className="flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-[#2B4C8C]"
                                    placeholder="Add tag..."
                                />
                                <button type="button" onClick={() => addTag(tagInput)} className="rounded-lg bg-[#2B4C8C] px-2.5 py-1.5 text-[10px] font-medium text-white hover:bg-[#1e3a6e]">Add</button>
                            </div>
                            {tags.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-[9px] text-gray-400 mb-1">Existing tags:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {tags.filter((t) => !form.tags.includes(t.name)).map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => addExistingTag(t.name)}
                                                className="rounded-md bg-gray-50 px-1.5 py-0.5 text-[9px] text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                            >
                                                +{t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Featured Image */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">Featured Image</h2>
                            <div
                                onClick={() => featuredInputRef.current?.click()}
                                className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 transition-colors hover:border-[#2B4C8C]/30 hover:bg-[#2B4C8C]/5"
                            >
                                {featuredPreview || featuredImage ? (
                                    <div className="relative w-full">
                                        <img
                                            src={featuredPreview ?? `/storage/${featuredImage}`}
                                            alt="Featured preview"
                                            className="max-h-40 w-full rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFeaturedFile(null);
                                                setFeaturedPreview(null);
                                                setFeaturedImage(null);
                                            }}
                                            className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="mb-2 size-7 text-gray-300" />
                                        <p className="text-xs font-medium text-gray-600">Click to upload</p>
                                        <p className="text-[9px] text-gray-400 mt-0.5">JPEG, PNG, or WebP &middot; Max 5MB</p>
                                    </>
                                )}
                                <input ref={featuredInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setFeaturedFile(e.target.files?.[0] ?? null)} />
                            </div>
                            {isEditing && form.featured_image_alt !== undefined && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={form.featured_image_alt}
                                        onChange={(e) => handleChange('featured_image_alt', e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-[#2B4C8C]"
                                        placeholder="Alt text for image"
                                    />
                                </div>
                            )}
                            {errors.featured_image && <p className="mt-1 text-[10px] text-red-500">{errors.featured_image}</p>}
                        </div>
                    </div>
                </div>

                {/* SEO Section */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="size-4 text-gray-400" />
                        <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">SEO & Metadata</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">SEO Title</label>
                            <input
                                type="text"
                                value={form.seo_title}
                                onChange={(e) => handleChange('seo_title', e.target.value)}
                                maxLength={70}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                placeholder="Custom title for search engines"
                            />
                            <p className="mt-1 text-right text-[10px] text-gray-400">{form.seo_title.length}/70</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Twitter Card</label>
                            <select
                                value={form.twitter_card}
                                onChange={(e) => handleChange('twitter_card', e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                            >
                                {twitterCardOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Meta Description</label>
                            <textarea
                                value={form.seo_description}
                                onChange={(e) => handleChange('seo_description', e.target.value)}
                                maxLength={160}
                                rows={2}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20 resize-y"
                                placeholder="Meta description for search engines"
                            />
                            <p className="mt-1 text-right text-[10px] text-gray-400">{form.seo_description.length}/160</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                <Hash className="mr-1 inline size-3" />
                                Keywords
                            </label>
                            <input
                                type="text"
                                value={form.seo_keywords}
                                onChange={(e) => handleChange('seo_keywords', e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                placeholder="keyword1, keyword2"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Canonical URL</label>
                            <input
                                type="url"
                                value={form.canonical_url}
                                onChange={(e) => handleChange('canonical_url', e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                placeholder="https://example.com/original-article"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">OG Image</label>
                            <div
                                onClick={() => ogInputRef.current?.click()}
                                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 p-4 transition-colors hover:border-[#2B4C8C]/30 hover:bg-[#2B4C8C]/5"
                            >
                                {ogPreview || ogImage ? (
                                    <div className="relative">
                                        <img src={ogPreview ?? `/storage/${ogImage}`} alt="OG preview" className="max-h-16 rounded object-cover" />
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setOgFile(null); setOgPreview(null); setOgImage(null); }} className="absolute -top-1.5 -right-1.5 rounded-full bg-black/50 p-0.5 text-white"><X className="size-2.5" /></button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto size-5 text-gray-300" />
                                        <p className="text-[9px] text-gray-500 mt-1">Upload</p>
                                    </div>
                                )}
                                <input ref={ogInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setOgFile(e.target.files?.[0] ?? null)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                    <Link
                        href="/crm/blog/articles"
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#2B4C8C] px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#1f3a6e] disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                        {isEditing ? 'Update Article' : 'Create Article'}
                    </button>
                </div>
            </form>
        </div>
    );
}
