<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\CrmActivity;
use App\Models\CrmProject;
use App\Services\Crm\Portal\CustomerVisibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalTimelineController extends Controller
{
    public function __construct(
        private CustomerVisibilityService $visibility,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $account = $request->get('portal_account');
        $project = CrmProject::findOrFail($request->get('project_id'));

        if (! $this->visibility->canAccessProject($account, $project)) {
            abort(403);
        }

        $events = CrmActivity::where('activitable_type', 'project')
            ->where('activitable_id', $project->id)
            ->where('customer_safe', true)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($events);
    }
}
