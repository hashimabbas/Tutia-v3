<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CrmClassification extends Model
{
    protected $fillable = ['slug', 'name'];

    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(CrmOrganization::class, 'crm_organization_classification');
    }
}
