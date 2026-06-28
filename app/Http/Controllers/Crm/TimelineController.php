<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Services\Crm\Timeline\CrmTimelineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class TimelineController extends Controller
{
    public function __construct(
        private readonly CrmTimelineService $timeline,
    ) {}

    public function __invoke(Request $request): JsonResponse|Response
    {
        if ($request->wantsJson() || $request->has('entity_type')) {
            $request->validate([
                'entity_type' => 'required|string|in:lead,deal,organization,contact,project',
                'entity_id' => 'required|integer|min:1',
                'cursor' => 'nullable|string',
                'limit' => 'nullable|integer|min:1|max:100',
                'filters' => 'nullable|array',
                'filters.*' => 'string',
            ]);

            $collection = $this->timeline->getTimeline(
                $request->entity_type,
                (int) $request->entity_id,
                $request->cursor,
                $request->limit ?? 20,
                $request->filters ?? ['all'],
            );

            return response()->json($collection);
        }

        return inertia('crm/timeline/index');
    }
}
