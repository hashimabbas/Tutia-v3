<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmTag extends Model
{
    protected $fillable = ['name', 'color'];

    public function organizations()
    {
        return $this->morphedByMany(CrmOrganization::class, 'taggable', 'crm_taggables', 'tag_id', 'taggable_id');
    }

    public function contacts()
    {
        return $this->morphedByMany(CrmContact::class, 'taggable', 'crm_taggables', 'tag_id', 'taggable_id');
    }

    public function leads()
    {
        return $this->morphedByMany(CrmLead::class, 'taggable', 'crm_taggables', 'tag_id', 'taggable_id');
    }

    public function deals()
    {
        return $this->morphedByMany(CrmDeal::class, 'taggable', 'crm_taggables', 'tag_id', 'taggable_id');
    }
}
