<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\CrmProject;
use App\Services\Crm\Portal\CustomerVisibilityService;
use Illuminate\Http\Request;

class PortalProjectController extends Controller
{
    public function __construct(
        private CustomerVisibilityService $visibility,
    ) {}

    public function show(Request $request, CrmProject $project)
    {
        $account = $request->get('portal_account');

        if (! $this->visibility->canAccessProject($account, $project)) {
            abort(403);
        }

        return inertia('portal/projects/show', [
            'project' => $this->visibility->projectData($account, $project),
        ]);
    }
}
