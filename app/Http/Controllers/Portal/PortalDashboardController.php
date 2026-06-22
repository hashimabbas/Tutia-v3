<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Services\Crm\Portal\CustomerVisibilityService;
use Illuminate\Http\Request;

class PortalDashboardController extends Controller
{
    public function __construct(
        private CustomerVisibilityService $visibility,
    ) {}

    public function index(Request $request)
    {
        $account = $request->get('portal_account');
        $projects = $this->visibility->visibleProjects($account);

        return inertia('portal/dashboard', [
            'projects' => $projects->map(fn ($project) => $this->visibility->projectData($account, $project)),
        ]);
    }
}
