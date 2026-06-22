<?php

namespace App\Services\Crm\Portal;

use App\Models\CrmPortalAccount;
use App\Models\CrmProject;

class PortalRoleResolver
{
    private const ROLES = [
        'primary_contact' => [
            'permissions' => ['view_project', 'view_details', 'approve_co', 'manage_prefs', 'view_timeline'],
        ],
        'stakeholder' => [
            'permissions' => ['view_project', 'view_details', 'approve_co', 'manage_prefs', 'view_timeline'],
        ],
        'approver' => [
            'permissions' => ['view_project', 'view_timeline', 'approve_co'],
        ],
        'viewer' => [
            'permissions' => ['view_project', 'view_timeline'],
        ],
    ];

    public function role(CrmPortalAccount $account, CrmProject $project): ?string
    {
        $access = $account->projects()
            ->where('crm_projects.id', $project->id)
            ->first();

        return $access?->pivot->role;
    }

    public function hasPermission(CrmPortalAccount $account, CrmProject $project, string $permission): bool
    {
        $role = $this->role($account, $project);

        if (! $role || ! isset(self::ROLES[$role])) {
            return false;
        }

        return in_array($permission, self::ROLES[$role]['permissions'], true);
    }

    public function permissions(string $role): array
    {
        return self::ROLES[$role]['permissions'] ?? [];
    }

    public function allRoles(): array
    {
        return array_keys(self::ROLES);
    }
}
