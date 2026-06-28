<?php

namespace App\Services\Experience;

use App\Models\ExperienceEvent;
use App\Models\ExperienceImage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExperienceService
{
    public function listPublished(int $perPage = 12)
    {
        return ExperienceEvent::published()
            ->ordered()
            ->withCount('images')
            ->paginate($perPage);
    }

    public function listFeatured(int $limit = 6)
    {
        return ExperienceEvent::published()
            ->featured()
            ->ordered()
            ->withCount('images')
            ->take($limit)
            ->get();
    }

    public function findBySlug(string $slug): ?ExperienceEvent
    {
        return ExperienceEvent::where('slug', $slug)
            ->published()
            ->with(['visibleImages' => function ($query) {
                $query->orderBy('sort_order');
            }])
            ->first();
    }

    public function findById(int $id): ?ExperienceEvent
    {
        return ExperienceEvent::with('images')->find($id);
    }

    public function create(array $data, ?string $coverPath = null): ExperienceEvent
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $event = ExperienceEvent::create($data);

        if ($coverPath) {
            $event->update(['cover_image' => $coverPath]);
        }

        return $event;
    }

    public function update(ExperienceEvent $event, array $data): ExperienceEvent
    {
        $event->update($data);

        return $event->fresh();
    }

    public function delete(ExperienceEvent $event): void
    {
        foreach ($event->images as $image) {
            Storage::disk('public')->delete($image->image);
        }

        if ($event->cover_image) {
            Storage::disk('public')->delete($event->cover_image);
        }

        $event->delete();
    }

    public function addImage(ExperienceEvent $event, string $path, ?string $caption = null, ?string $altText = null, bool $isFeatured = false): ExperienceImage
    {
        $maxOrder = $event->images()->max('sort_order') ?? 0;

        return $event->images()->create([
            'image' => $path,
            'caption' => $caption,
            'alt_text' => $altText,
            'sort_order' => $maxOrder + 1,
            'is_featured' => $isFeatured,
            'is_visible' => true,
        ]);
    }

    public function reorderImages(ExperienceEvent $event, array $order): void
    {
        foreach ($order as $index => $imageId) {
            ExperienceImage::where('id', $imageId)
                ->where('experience_event_id', $event->id)
                ->update(['sort_order' => $index + 1]);
        }
    }

    public function setCoverImage(ExperienceEvent $event, string $path): void
    {
        $event->update(['cover_image' => $path]);
    }

    public function togglePublished(ExperienceEvent $event): bool
    {
        $event->update(['is_published' => ! $event->is_published]);

        return $event->is_published;
    }

    public function toggleFeatured(ExperienceEvent $event): bool
    {
        $event->update(['is_featured' => ! $event->is_featured]);

        return $event->is_featured;
    }

    public function getStats(): array
    {
        return [
            'total_events' => ExperienceEvent::count(),
            'published_events' => ExperienceEvent::published()->count(),
            'featured_events' => ExperienceEvent::featured()->count(),
            'total_images' => ExperienceImage::count(),
            'recent_events' => ExperienceEvent::published()->ordered()->take(5)->get(),
        ];
    }
}
