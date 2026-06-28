<?php

namespace App\Http\Controllers;

use App\Services\Experience\ExperienceService;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function __construct(
        private readonly ExperienceService $experienceService,
    ) {}

    public function index(Request $request)
    {
        $events = $this->experienceService->listPublished();

        $featured = $this->experienceService->listFeatured();

        return inertia('gallery/index', [
            'events' => $events,
            'featured' => $featured,
        ]);
    }

    public function show(Request $request, string $slug)
    {
        $event = $this->experienceService->findBySlug($slug);

        if (! $event) {
            abort(404);
        }

        $recent = $this->experienceService->listFeatured(3);

        $structuredData = [
            '@context' => 'https://schema.org',
            '@type' => 'Event',
            'name' => $event->title,
            'description' => $event->excerpt,
            'startDate' => $event->event_date?->toIso8601String(),
            'image' => $event->cover_image ? asset('storage/'.$event->cover_image) : null,
        ];

        return inertia('gallery/event', [
            'event' => $event->loadCount('images'),
            'images' => $event->visibleImages,
            'recent' => $recent,
            'structuredData' => $structuredData,
        ]);
    }
}
