import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    Image as ImageIcon,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface EventData {
    id: number;
    title: string;
    subtitle: string | null;
    description: string | null;
    event_date: string;
    cover_image: string | null;
    slug: string;
    images_count: number;
    excerpt: string;
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
    events: PaginatedData<EventData>;
    featured: EventData[];
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function GalleryIndex({ events, featured }: Props) {
    const [heroIndex, setHeroIndex] = useState(0);

    const hasHero = featured.length > 0;
    const hero = featured[heroIndex] ?? featured[0];

    return (
        <div className="min-h-screen bg-white">
            <Head title="Gallery - Tutia">
                <meta name="description" content="Explore Tutia's journey through our experience gallery — events, achievements, and moments that define who we are." />
                <meta property="og:title" content="Gallery - Tutia" />
                <meta property="og:description" content="Explore Tutia's journey through our experience gallery." />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="/gallery" />
            </Head>

            {hasHero && (
                <section className="relative h-[70vh] min-h-[500px] overflow-hidden bg-gray-900">
                    <div className="absolute inset-0">
                        <img
                            src={`/storage/${hero.cover_image}`}
                            alt={hero.title}
                            className="size-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    </div>

                    <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-20 sm:px-12 lg:px-20">
                        <div className="max-w-2xl">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-medium tracking-wider text-white uppercase backdrop-blur-sm">
                                    Featured Event
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-white/60">
                                    <ImageIcon className="size-3" />
                                    {hero.images_count} {hero.images_count === 1 ? 'photo' : 'photos'}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                                {hero.title}
                            </h1>
                            {hero.subtitle && (
                                <p className="mt-2 text-lg text-white/70">{hero.subtitle}</p>
                            )}
                            <p className="mt-4 text-sm leading-relaxed text-white/60 line-clamp-2">
                                {hero.excerpt}
                            </p>
                            <div className="mt-6 flex items-center gap-4">
                                <Link
                                    href={`/gallery/${hero.slug}`}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-900 shadow-lg transition-all hover:bg-gray-100"
                                >
                                    View Gallery
                                    <ArrowRight className="size-4" />
                                </Link>
                                <span className="inline-flex items-center gap-1.5 text-sm text-white/50">
                                    <Calendar className="size-4" />
                                    {formatDate(hero.event_date)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {featured.length > 1 && (
                        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setHeroIndex((i) => (i - 1 + featured.length) % featured.length)}
                                className="rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <div className="flex gap-1.5">
                                {featured.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setHeroIndex(i)}
                                        className={cn(
                                            'h-1.5 rounded-full transition-all',
                                            i === heroIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                                        )}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setHeroIndex((i) => (i + 1) % featured.length)}
                                className="rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    )}
                </section>
            )}

            <section className="mx-auto max-w-7xl px-6 py-16 sm:px-12 lg:px-20">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">All Experiences</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Discover moments and milestones from our journey.
                    </p>
                </div>

                {events.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <ImageIcon className="size-12 text-gray-200" />
                        <p className="mt-4 text-sm font-medium text-gray-500">No experiences yet</p>
                        <p className="text-xs text-gray-400">Check back soon for new stories and events.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {events.data.map((event, i) => (
                            <Link
                                key={event.id}
                                href={`/gallery/${event.slug}`}
                                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg"
                            >
                                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                                    {event.cover_image ? (
                                        <img
                                            src={`/storage/${event.cover_image}`}
                                            alt={event.title}
                                            loading={i < 4 ? 'eager' : 'lazy'}
                                            className="size-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center">
                                            <ImageIcon className="size-8 text-gray-300" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>

                                <div className="p-4">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                        <Calendar className="size-3" />
                                        {formatDate(event.event_date)}
                                        <span className="mx-1">&middot;</span>
                                        <ImageIcon className="size-3" />
                                        {event.images_count} {event.images_count === 1 ? 'photo' : 'photos'}
                                    </div>
                                    <h3 className="mt-1.5 text-sm font-semibold text-gray-900 group-hover:text-[#2B4C8C] transition-colors">
                                        {event.title}
                                    </h3>
                                    {event.subtitle && (
                                        <p className="mt-0.5 text-xs text-gray-500">{event.subtitle}</p>
                                    )}
                                    <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-[#2B4C8C] opacity-0 transition-opacity group-hover:opacity-100">
                                        View Gallery
                                        <ArrowRight className="size-3" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {events.last_page > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                        {Array.from({ length: events.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/gallery?page=${page}`}
                                className={cn(
                                    'flex size-9 items-center justify-center rounded-xl text-xs font-medium transition-colors',
                                    page === events.current_page
                                        ? 'bg-[#2B4C8C] text-white'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                )}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
