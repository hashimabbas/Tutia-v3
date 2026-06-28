<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\ExperienceEvent;
use App\Services\Experience\ExperienceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ExperienceController extends Controller
{
    public function __construct(
        private readonly ExperienceService $experienceService,
    ) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', ExperienceEvent::class);

        $query = ExperienceEvent::withCount('images')->ordered();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        if ($request->has('published')) {
            $query->where('is_published', $request->boolean('published'));
        }

        $events = $query->paginate(15)->withQueryString();

        return inertia('crm/experiences/index', [
            'events' => $events,
            'filters' => $request->only(['search', 'featured', 'published']),
            'stats' => $this->experienceService->getStats(),
        ]);
    }

    public function create()
    {
        $this->authorize('create', ExperienceEvent::class);

        return inertia('crm/experiences/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ExperienceEvent::class);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'event_date' => ['required', 'date'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'is_published' => ['boolean'],
            'is_featured' => ['boolean'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('experience_events')],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'cover_image' => ['nullable', 'file', 'mimes:jpeg,png,webp', 'max:5120'],
        ]);

        $coverPath = null;
        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')->store('experiences/covers', 'public');
        }

        $event = $this->experienceService->create($data, $coverPath);

        return redirect()->route('crm.experiences.edit', $event)
            ->with('success', 'Experience event created successfully.');
    }

    public function edit(ExperienceEvent $experience)
    {
        $this->authorize('update', $experience);

        $experience->load('images');

        return inertia('crm/experiences/create', [
            'event' => $experience,
        ]);
    }

    public function update(Request $request, ExperienceEvent $experience): RedirectResponse
    {
        $this->authorize('update', $experience);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'event_date' => ['required', 'date'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'is_published' => ['boolean'],
            'is_featured' => ['boolean'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('experience_events')->ignore($experience->id)],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'cover_image' => ['nullable', 'file', 'mimes:jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('cover_image')) {
            if ($experience->cover_image) {
                Storage::disk('public')->delete($experience->cover_image);
            }

            $data['cover_image'] = $request->file('cover_image')->store('experiences/covers', 'public');
        }

        $this->experienceService->update($experience, $data);

        return redirect()->route('crm.experiences.index')
            ->with('success', 'Experience event updated successfully.');
    }

    public function destroy(ExperienceEvent $experience): RedirectResponse
    {
        $this->authorize('delete', $experience);

        $this->experienceService->delete($experience);

        return redirect()->route('crm.experiences.index')
            ->with('success', 'Experience event deleted successfully.');
    }

    public function uploadImage(Request $request, ExperienceEvent $experience)
    {
        $this->authorize('update', $experience);

        $data = $request->validate([
            'image' => ['required', 'file', 'mimes:jpeg,png,webp', 'max:10240'],
            'caption' => ['nullable', 'string', 'max:500'],
            'alt_text' => ['nullable', 'string', 'max:500'],
            'is_featured' => ['boolean'],
        ]);

        $path = $request->file('image')->store('experiences/'.$experience->id, 'public');

        $image = $this->experienceService->addImage(
            $experience,
            $path,
            $data['caption'] ?? null,
            $data['alt_text'] ?? null,
            $data['is_featured'] ?? false,
        );

        return response()->json($image->toArray(), 201);
    }

    public function reorderImages(Request $request, ExperienceEvent $experience)
    {
        $this->authorize('update', $experience);

        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:experience_images,id'],
        ]);

        $this->experienceService->reorderImages($experience, $data['order']);

        return response()->json(['message' => 'Images reordered successfully.']);
    }

    public function updateImage(Request $request, ExperienceImage $image)
    {
        $this->authorize('update', $image->event);

        $data = $request->validate([
            'caption' => ['nullable', 'string', 'max:500'],
            'alt_text' => ['nullable', 'string', 'max:500'],
            'is_visible' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        $image->update($data);

        return response()->json($image->fresh()->toArray());
    }

    public function deleteImage(ExperienceImage $image)
    {
        $this->authorize('update', $image->event);

        Storage::disk('public')->delete($image->image);
        $image->delete();

        return response()->json(['message' => 'Image deleted successfully.']);
    }

    public function togglePublished(ExperienceEvent $experience): RedirectResponse
    {
        $this->authorize('update', $experience);

        $published = $this->experienceService->togglePublished($experience);

        return redirect()->back()->with(
            'success',
            $published ? 'Event published.' : 'Event unpublished.',
        );
    }

    public function toggleFeatured(ExperienceEvent $experience): RedirectResponse
    {
        $this->authorize('update', $experience);

        $featured = $this->experienceService->toggleFeatured($experience);

        return redirect()->back()->with(
            'success',
            $featured ? 'Event marked as featured.' : 'Event unmarked as featured.',
        );
    }

    public function bulkDelete(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:experience_events,id'],
        ]);

        foreach (ExperienceEvent::whereIn('id', $data['ids'])->get() as $event) {
            $this->authorize('delete', $event);
            $this->experienceService->delete($event);
        }

        return redirect()->route('crm.experiences.index')
            ->with('success', 'Events deleted successfully.');
    }

    public function bulkPublish(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:experience_events,id'],
            'published' => ['boolean'],
        ]);

        ExperienceEvent::whereIn('id', $data['ids'])->update(['is_published' => $data['published']]);

        return redirect()->route('crm.experiences.index')
            ->with('success', 'Events updated successfully.');
    }
}
