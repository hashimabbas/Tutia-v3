<?php

namespace App\Models;

use Database\Factories\CrmLeadFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrmLead extends Model
{
    /** @use HasFactory<CrmLeadFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'source', 'name', 'email', 'phone', 'company', 'service',
        'project_type', 'budget', 'timeline', 'time_slot',
        'message', 'brief', 'requirements',
        'stage', 'priority', 'assigned_to', 'last_contacted_at', 'converted_at',
        'organization_id',
    ];

    protected function casts(): array
    {
        return [
            'last_contacted_at' => 'datetime',
            'converted_at' => 'datetime',
        ];
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function deals()
    {
        return $this->hasMany(CrmDeal::class, 'lead_id');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(CrmActivity::class, 'activitable');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(CrmOrganization::class, 'organization_id');
    }

    public function tags()
    {
        return $this->morphToMany(CrmTag::class, 'taggable', 'crm_taggables');
    }
}
