import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    Image as ImageIcon,
    Share2,
    ArrowLeft,
    MapPin,
    Clock,
} from 'lucide-react';
import Lightbox from '@/components/gallery/Lightbox';

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
    slug: string;
    seo_title: string | null;
    seo_description: string | null;
    images_count: number;
    excerpt: string;
}

interface StructuredData {
    '@context': string;
    '@type': string;
    name: string;
    description: string;
    startDate: string;
    image: string | null;
}

interface Props {
    event: EventData;
    images: ImageData[];
    recent: EventData[];
    structuredData: StructuredData;
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function buildMasonryColumns<T>(items: T[], cols: number): T[][] {
    const columns: T[][] = Array.from({ length: cols }, () => []);
    items.forEach((item, i) => {
        columns[i % cols].push(item);
    });
    return columns;
}

function getAspectClass(index: number): string {
    const patterns = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/3]', 'aspect-[3/2]', 'aspect-[2/3]', 'aspect-[4/5]'];
    return patterns[index % patterns.length];
}

export default function GalleryEvent({ event, images, recent, structuredData }: Props) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [copied, setCopied] = useState(false);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const handlePrev = () => {
        setLightboxIndex((i) => (i - 1 + images.length) % images.length);
    };

    const handleNext = () => {
        setLightboxIndex((i) => (i + 1) % images.length);
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: event.title, url });
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const masonryImages = useMemo(() => {
        const cols = images.length < 4 ? 2 : 4;
        return buildMasonryColumns(images, cols);
    }, [images]);

    return (
        <div className="min-h-screen bg-white">
            <Head title={`${event.seo_title ?? event.title} - Gallery - Tutia`}>
                <meta name="description" content={event.seo_description ?? event.excerpt} />
                <meta property="og:title" content={`${event.title} - Tutia`} />
                <meta property="og:description" content={event.excerpt} />
                {event.cover_image && <meta property="og:image" content={`/storage/${event.cover_image}`} />}
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href={`/gallery/${event.slug}`} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </Head>

            {/* Hero */}
            <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-gray-900">
                <div className="absolute inset-0">
                    {event.cover_image ? (
                        <img
                            src={`/storage/${event.cover_image}`}
                            alt={event.title}
                            className="size-full object-cover opacity-50"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-gray-800">
                            <ImageIcon className="size-16 text-gray-600" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>

                <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 sm:px-12 lg:px-20">
                    <Link
                        href="/gallery"
                        className="absolute top-8 left-6 sm:left-12 lg:left-20 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-medium text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
                    >
                        <ArrowLeft className="size-3.5" />
                        Back to Gallery
                    </Link>
                    <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/50">
                            <span className="inline-flex items-center gap-1">
                                <Calendar className="size-3.5" />
                                {formatDate(event.event_date)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <ImageIcon className="size-3.5" />
                                {event.images_count} {event.images_count === 1 ? 'photo' : 'photos'}
                            </span>
                        </div>
                        <h1 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                            {event.title}
                        </h1>
                        {event.subtitle && (
                            <p className="mt-2 text-lg text-white/60">{event.subtitle}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Description + Meta */}
            <section className="mx-auto max-w-7xl px-6 py-12 sm:px-12 lg:px-20">
                <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
                    <div className="flex-1">
                        {event.description && (
                            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                                {event.description.split('\n').map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:w-64 xl:w-80">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6">
                            <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Details</h3>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-0.5 size-4 shrink-0 text-[#2B4C8C]" />
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-500 uppercase">Date</p>
                                        <p className="text-sm text-gray-900">{formatDate(event.event_date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ImageIcon className="mt-0.5 size-4 shrink-0 text-[#2B4C8C]" />
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-500 uppercase">Photos</p>
                                        <p className="text-sm text-gray-900">{event.images_count}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    <Share2 className="size-3.5" />
                                    {copied ? 'Link Copied!' : 'Share'}
                                </button>
                            </div>
                        </div>

                        {recent.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">More Events</h3>
                                <div className="mt-4 space-y-3">
                                    {recent.map((r) => (
                                        <Link
                                            key={r.id}
                                            href={`/gallery/${r.slug}`}
                                            className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                {r.cover_image ? (
                                                    <img
                                                        src={`/storage/${r.cover_image}`}
                                                        alt={r.title}
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-full items-center justify-center">
                                                        <ImageIcon className="size-4 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 group-hover:text-[#2B4C8C] truncate transition-colors">
                                                    {r.title}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {r.images_count} {r.images_count === 1 ? 'photo' : 'photos'}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            {images.length > 0 && (
                <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-12 lg:px-20">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Gallery</h2>
                            <p className="text-xs text-gray-500">{images.length} {images.length === 1 ? 'photo' : 'photos'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {images.map((image, index) => (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => openLightbox(index)}
                                className="group relative overflow-hidden rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2B4C8C]/50 focus:ring-offset-2"
                            >
                                <div className={cn('relative', getAspectClass(index))}>
                                    <img
                                        src={`/storage/${image.image}`}
                                        alt={image.alt_text ?? image.caption ?? `Photo ${index + 1}`}
                                        loading={index < 8 ? 'eager' : 'lazy'}
                                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                                </div>
                                {image.caption && (
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                                        <p className="text-[10px] text-white/90 line-clamp-1">{image.caption}</p>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            <Lightbox
                images={images.map((img) => ({
                    id: img.id,
                    image: img.image,
                    caption: img.caption,
                    alt_text: img.alt_text,
                }))}
                currentIndex={lightboxIndex}
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                onPrev={handlePrev}
                onNext={handleNext}
            />
        </div>
    );
}
