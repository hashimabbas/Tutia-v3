<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmContactInfluenceType extends Model
{
    protected $fillable = ['slug', 'name', 'description'];

    public function contacts(): HasMany
    {
        return $this->hasMany(CrmContact::class, 'influence_type_id');
    }
}
