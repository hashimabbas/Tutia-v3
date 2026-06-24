<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrmOrganization extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'domain', 'industry', 'size', 'phone', 'website',
        'logo_url', 'notes', 'owner_id', 'created_by',
    ];

    public function classifications(): BelongsToMany
    {
        return $this->belongsToMany(CrmClassification::class, 'crm_organization_classification', 'organization_id', 'classification_id')
            ->withTimestamps();
    }

    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(CrmContact::class, 'crm_organization_contact', 'organization_id', 'contact_id')
            ->withPivot(['contact_role_id', 'is_primary', 'job_title'])
            ->withTimestamps();
    }

    public function primaryContacts(): BelongsToMany
    {
        return $this->contacts()->wherePivot('is_primary', true);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(CrmLead::class, 'organization_id');
    }

    public function deals(): HasMany
    {
        return $this->hasMany(CrmDeal::class, 'organization_id');
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

    public function dismissedActions(): MorphMany
    {
        return $this->morphMany(CrmDismissedAction::class, 'dismissable');
    }

    // ---- Relationship Graph ----

    public function relationshipsAsSource(): HasMany
    {
        return $this->hasMany(CrmOrganizationRelationship::class, 'source_org_id');
    }

    public function relationshipsAsTarget(): HasMany
    {
        return $this->hasMany(CrmOrganizationRelationship::class, 'target_org_id');
    }

    public function relatedOrganizations(): BelongsToMany
    {
        return $this->belongsToMany(
            CrmOrganization::class,
            'crm_organization_relationships',
            'source_org_id',
            'target_org_id',
        )->withPivot(['relationship_type_id', 'strength', 'notes']);
    }

    public function relatedFromOrganizations(): BelongsToMany
    {
        return $this->belongsToMany(
            CrmOrganization::class,
            'crm_organization_relationships',
            'target_org_id',
            'source_org_id',
        )->withPivot(['relationship_type_id', 'strength', 'notes']);
    }

    public function getAllRelatedOrganizations()
    {
        return $this->relatedOrganizations
            ->concat($this->relatedFromOrganizations)
            ->unique('id')
            ->values();
    }
}
