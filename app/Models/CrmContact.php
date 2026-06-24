<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrmContact extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name', 'last_name', 'email', 'phone', 'mobile',
        'job_title', 'department', 'linkedin_url', 'avatar_url',
        'influence_type_id', 'owner_id', 'created_by',
    ];

    public function getNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function influenceType(): BelongsTo
    {
        return $this->belongsTo(CrmContactInfluenceType::class, 'influence_type_id');
    }

    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(CrmOrganization::class, 'crm_organization_contact', 'contact_id', 'organization_id')
            ->withPivot(['contact_role_id', 'is_primary', 'job_title'])
            ->withTimestamps();
    }

    public function primaryOrganization()
    {
        return $this->organizations()->wherePivot('is_primary', true)->first();
    }

    public function deals(): HasMany
    {
        return $this->hasMany(CrmDeal::class, 'contact_id');
    }

    public function addresses(): MorphMany
    {
        return $this->morphMany(CrmAddress::class, 'addressable');
    }

    public function tags()
    {
        return $this->morphToMany(CrmTag::class, 'taggable', 'crm_taggables', 'taggable_id', 'tag_id');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(CrmActivity::class, 'activitable');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function auditLogs(): MorphMany
    {
        return $this->morphMany(CrmAuditLog::class, 'auditable');
    }

    public function healthSnapshots(): MorphMany
    {
        return $this->morphMany(CrmHealthSnapshot::class, 'healthable');
    }
}
