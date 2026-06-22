<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmOrganizationRelationshipType extends Model
{
    protected $fillable = ['slug', 'name', 'description'];

    public function relationships(): HasMany
    {
        return $this->hasMany(CrmOrganizationRelationship::class, 'relationship_type_id');
    }
}
