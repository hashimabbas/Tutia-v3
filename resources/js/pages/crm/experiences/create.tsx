import { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    Upload,
    Trash2,
    GripVertical,
    Image as ImageIcon,
    Star,
    StarOff,
    Eye,
    EyeOff,
    MoveVertical,
    Camera,
    Loader2,
    X,
    Globe,
    Calendar,
    Hash,
} from 'lucide-react';

interface ImageData {
    id: number;
    image: string;
    caption: string | null;
    alt_text: string | null;
    sort_order: number;
    is_featured: boolean;
    is_visible: boolean;
}

interface EventData {
    id: number;
    title: string;
    subtitle: string | null;
    description: string | null;
    event_date: string;
    cover_image: string | null;
    display_order: number;
    is_published: boolean;
    is_featured: boolean;
    slug: string;
    seo_title: string | null;
    seo_description: string | null;
    images: ImageData[];
}

interface Props {
    event?: EventData;
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

export default function ExperienceCreate({ event }: Props) {
    const isEditing = !!event;

    const [form, setForm] = useState({
        title: event?.title ?? '',
        subtitle: event?.subtitle ?? '',
        description: event?.description ?? '',
        event_date: event?.event_date ?? '',
        display_order: event?.display_order ?? 0,
        is_published: event?.is_published ?? false,
        is_featured: event?.is_featured ?? false,
        slug: event?.slug ?? '',
        seo_title: event?.seo_title ?? '',
        seo_description: event?.seo_description ?? '',
    });

    const [images, setImages] = useState<ImageData[]>(event?.images ?? []);
    const [coverImage, setCoverImage] = useState<string | null>(event?.cover_image ?? null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [editingImage, setEditingImage] = useState<number | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    const coverInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (coverFile) {
            const url = URL.createObjectURL(coverFile);
            setCoverPreview(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [coverFile]);

    function handleChange(field: string, value: string | number | boolean) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

    function autoSlug() {
        if (!isEditing && !form.slug) {
            handleChange(
                'slug',
                form.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, ''),
            );
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        data.append('title', form.title);
        data.append('subtitle', form.subtitle);
        data.append('description', form.description);
        data.append('event_date', form.event_date);
        data.append('display_order', String(form.display_order));
        data.append('is_published', form.is_published ? '1' : '0');
        data.append('is_featured', form.is_featured ? '1' : '0');
        data.append('slug', form.slug);
        data.append('seo_title', form.seo_title);
        data.append('seo_description', form.seo_description);
        if (coverFile) {
            data.append('cover_image', coverFile);
        }

        const url = isEditing ? `/crm/experiences/${event!.id}` : '/crm/experiences';
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

    async function uploadImages(files: FileList | null) {
        if (!files || files.length === 0) return;
        setUploading(true);
        setUploadProgress(0);

        const total = files.length;
        let completed = 0;

        for (const file of Array.from(files)) {
            const data = new FormData();
            data.append('image', file);

            try {
                const res = await fetch(`/crm/experiences/${event!.id}/images`, {
                    method: 'POST',
                    headers: { Accept: 'application/json' },
                    body: data,
                });

                if (res.ok) {
                    const img = await res.json();
                    setImages((prev) => [...prev, img]);
                }
            } catch {
            }

            completed++;
            setUploadProgress(Math.round((completed / total) * 100));
        }

        setUploading(false);
        setUploadProgress(0);
    }

    async function reorderImages(order: number[]) {
        const res = await fetch(`/crm/experiences/${event!.id}/images/reorder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ order }),
        });

        if (res.ok) {
            setImages((prev) => {
                const sorted = [...prev].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
                return sorted;
            });
        }
    }

    async function deleteImage(image: ImageData) {
        const res = await fetch(`/crm/experiences/images/${image.id}`, { method: 'DELETE' });
        if (res.ok) {
            setImages((prev) => prev.filter((img) => img.id !== image.id));
        }
    }

    async function updateImage(imageId: number, data: Partial<ImageData>) {
        const res = await fetch(`/crm/experiences/images/${imageId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            const updated = await res.json();
            setImages((prev) => prev.map((img) => (img.id === imageId ? updated : img)));
        }
        setEditingImage(null);
    }

    function handleDragStart(index: number) {
        setDragIndex(index);
    }

    function handleDragOver(e: React.DragEvent, index: number) {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;

        const newImages = [...images];
        const [moved] = newImages.splice(dragIndex, 1);
        newImages.splice(index, 0, moved);
        setImages(newImages);
        setDragIndex(index);
    }

    function handleDragEnd() {
        if (dragIndex !== null) {
            reorderImages(images.map((img) => img.id));
        }
        setDragIndex(null);
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <Head title={isEditing ? `Edit: ${event!.title}` : 'New Event'} />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/crm/experiences"
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                        <ArrowLeft className="size-3.5" />
                        Back
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">
                            {isEditing ? 'Edit Event' : 'New Event'}
                        </h1>
                        <p className="mt-0.5 text-xs text-gray-500">
                            {isEditing ? `Editing: ${event!.title}` : 'Create a new experience event for the gallery.'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="col-span-2 space-y-6">
                        {/* Title + Subtitle + Description */}
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
                                                : 'border-gray-200 focus:border-[#2B4C8C] focus:ring-[#2B4C8C]/20',
                                        )}
                                        placeholder="Enter event title"
                                    />
                                    {errors.title && <p className="mt-1 text-[10px] text-red-500">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
                                    <input
                                        type="text"
                                        value={form.subtitle}
                                        onChange={(e) => handleChange('subtitle', e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                        placeholder="A short subtitle for the event"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        rows={5}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20 resize-y"
                                        placeholder="Describe the event in detail..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cover Image */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Camera className="size-4 text-gray-400" />
                                <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Cover Image</h2>
                            </div>
                            <div
                                onClick={() => coverInputRef.current?.click()}
                                className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 transition-colors hover:border-[#2B4C8C]/30 hover:bg-[#2B4C8C]/5"
                            >
                                {coverPreview || coverImage ? (
                                    <div className="relative w-full max-w-md">
                                        <img
                                            src={coverPreview ?? `/storage/${coverImage}`}
                                            alt="Cover preview"
                                            className="max-h-48 w-full rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCoverFile(null);
                                                setCoverPreview(null);
                                                setCoverImage(null);
                                            }}
                                            className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="mb-2 size-7 text-gray-300" />
                                        <p className="text-sm font-medium text-gray-600">Click to upload cover image</p>
                                        <p className="text-[10px] text-gray-400 mt-1">JPEG, PNG, or WebP &middot; Max 5MB</p>
                                    </>
                                )}
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                                />
                            </div>
                            {errors.cover_image && <p className="mt-1 text-[10px] text-red-500">{errors.cover_image}</p>}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Publish Controls */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">Publish</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Event Date</label>
                                    <input
                                        type="date"
                                        value={form.event_date}
                                        onChange={(e) => handleChange('event_date', e.target.value)}
                                        className={cn(
                                            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:ring-1',
                                            errors.event_date
                                                ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                                                : 'border-gray-200 focus:border-[#2B4C8C] focus:ring-[#2B4C8C]/20',
                                        )}
                                    />
                                    {errors.event_date && <p className="mt-1 text-[10px] text-red-500">{errors.event_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.display_order}
                                        onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.is_published}
                                            onChange={(e) => handleChange('is_published', e.target.checked)}
                                            className="rounded border-gray-300 text-[#2B4C8C] focus:ring-[#2B4C8C]/20"
                                        />
                                        <span className="text-xs font-medium text-gray-700">Published</span>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.is_featured}
                                            onChange={(e) => handleChange('is_featured', e.target.checked)}
                                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500/20"
                                        />
                                        <span className="text-xs font-medium text-gray-700">Featured</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* URL / Slug */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Hash className="size-4 text-gray-400" />
                                <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">URL</h2>
                            </div>
                            <div>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                                        /gallery/
                                    </span>
                                    <input
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) => handleChange('slug', e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-[4.2rem] pr-3 text-sm text-gray-900 font-mono text-[11px] outline-none transition-colors focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                                        placeholder="event-url-slug"
                                    />
                                </div>
                                {errors.slug && <p className="mt-1 text-[10px] text-red-500">{errors.slug}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery Images (edit only) */}
                {isEditing && (
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="size-4 text-gray-400" />
                                <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Gallery Images</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                disabled={uploading}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2B4C8C] px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-[#1f3a6e] disabled:opacity-50"
                            >
                                {uploading ? (
                                    <Loader2 className="size-3 animate-spin" />
                                ) : (
                                    <Upload className="size-3" />
                                )}
                                Upload Images
                            </button>
                            <input
                                ref={imageInputRef}
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => uploadImages(e.target.files)}
                            />
                        </div>

                        {uploading && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-gray-500">Uploading...</span>
                                    <span className="text-[10px] text-gray-500">{uploadProgress}%</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-[#2B4C8C] transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {images.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-10">
                                <ImageIcon className="mb-2 size-8 text-gray-300" />
                                <p className="text-sm font-medium text-gray-600">No images yet</p>
                                <p className="text-[10px] text-gray-400 mt-1">Upload images to build the gallery.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {images.map((image, index) => (
                                    <div
                                        key={image.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg border bg-white px-3 py-2 transition-all',
                                            dragIndex === index
                                                ? 'border-[#2B4C8C] shadow-md'
                                                : 'border-gray-100 hover:border-gray-200',
                                        )}
                                    >
                                        <button type="button" className="cursor-grab text-gray-300 hover:text-gray-500">
                                            <GripVertical className="size-4" />
                                        </button>

                                        <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                            <img
                                                src={`/storage/${image.image}`}
                                                alt={image.alt_text ?? ''}
                                                className="size-full object-cover"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            {editingImage === image.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        defaultValue={image.caption ?? ''}
                                                        placeholder="Caption"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                updateImage(image.id, {
                                                                    caption: (e.target as HTMLInputElement).value,
                                                                    alt_text: image.alt_text,
                                                                    is_visible: image.is_visible,
                                                                });
                                                            }
                                                        }}
                                                        className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-[#2B4C8C]"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingImage(null)}
                                                        className="rounded p-1 text-gray-400 hover:bg-gray-100"
                                                    >
                                                        <X className="size-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <p
                                                    className="cursor-pointer text-xs text-gray-600 hover:text-gray-900 truncate"
                                                    onClick={() => setEditingImage(image.id)}
                                                >
                                                    {image.caption || <span className="italic text-gray-300">Add caption...</span>}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                Order {index + 1}
                                                {image.is_featured && ' · Featured'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateImage(image.id, {
                                                        is_featured: !image.is_featured,
                                                        caption: image.caption,
                                                        alt_text: image.alt_text,
                                                        is_visible: image.is_visible,
                                                    })
                                                }
                                                className={cn(
                                                    'rounded p-1.5 transition-colors',
                                                    image.is_featured
                                                        ? 'text-amber-500 hover:bg-amber-50'
                                                        : 'text-gray-300 hover:text-amber-400',
                                                )}
                                            >
                                                {image.is_featured ? (
                                                    <Star className="size-3 fill-amber-400" />
                                                ) : (
                                                    <StarOff className="size-3" />
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateImage(image.id, {
                                                        is_visible: !image.is_visible,
                                                        caption: image.caption,
                                                        alt_text: image.alt_text,
                                                    })
                                                }
                                                className={cn(
                                                    'rounded p-1.5 transition-colors',
                                                    image.is_visible
                                                        ? 'text-gray-400 hover:text-gray-600'
                                                        : 'text-red-300 hover:text-red-500',
                                                )}
                                            >
                                                {image.is_visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteImage(image)}
                                                className="rounded p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                                            >
                                                <Trash2 className="size-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {images.length > 1 && (
                            <p className="mt-3 flex items-center gap-1 text-[10px] text-gray-400">
                                <MoveVertical className="size-3" />
                                Drag to reorder images
                            </p>
                        )}
                    </div>
                )}

                {/* SEO section */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="size-4 text-gray-400" />
                        <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">SEO & Metadata</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                    <Link
                        href="/crm/experiences"
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
                        {isEditing ? 'Update Event' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
