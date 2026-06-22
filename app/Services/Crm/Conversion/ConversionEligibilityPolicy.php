<?php

namespace App\Services\Crm\Conversion;

use App\Models\CrmDeal;
use App\Models\CrmProject;
use Illuminate\Validation\ValidationException;

class ConversionEligibilityPolicy
{
    public function isEligible(CrmDeal $deal): bool
    {
        if ($deal->trashed()) {
            return false;
        }

        if ($deal->stage !== 'closed_won') {
            return false;
        }

        if ($deal->converted_to_project_at !== null) {
            return false;
        }

        if ($deal->organization_id === null) {
            return false;
        }

        if (CrmProject::where('deal_id', $deal->id)->exists()) {
            return false;
        }

        return true;
    }

    public function validateOrFail(CrmDeal $deal): void
    {
        $failures = [];

        if ($deal->trashed()) {
            $failures['deal'][] = 'Cannot convert a deleted deal.';
        }

        if ($deal->stage !== 'closed_won') {
            $failures['stage'][] = 'Only won deals can be converted to projects.';
        }

        if ($deal->converted_to_project_at !== null) {
            $failures['deal'][] = 'This deal has already been converted to a project.';
        }

        if ($deal->organization_id === null) {
            $failures['organization_id'][] = 'Deal must have an organization to convert.';
        }

        if (CrmProject::where('deal_id', $deal->id)->exists()) {
            $failures['deal'][] = 'A project already exists for this deal.';
        }

        if (! empty($failures)) {
            throw ValidationException::withMessages($failures);
        }
    }
}
