<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmContactRole extends Model
{
    protected $fillable = ['slug', 'name', 'description'];

    public function organizationContacts(): HasMany
    {
        return $this->hasMany(CrmOrganizationContact::class, 'contact_role_id');
    }
}
