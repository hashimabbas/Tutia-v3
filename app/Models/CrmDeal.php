<?php

namespace App\Models;

use App\Services\Crm\Health\CrmHealthService;
use App\Services\Crm\Health\HealthResult;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrmDeal extends Model
{
    /** @use HasFactory<CrmDealFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'value', 'currency', 'stage', 'probability',
        'lead_id', 'organization_id', 'contact_id',
        'contact_name', 'contact_email', 'contact_phone',
        'company', 'notes', 'expected_close_date', 'closed_at',
        'converted_to_project_at',
        'lost_reason', 'owner_id', 'forecast_category', 'quota_id',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'probability' => 'integer',
            'expected_close_date' => 'date',
            'closed_at' => 'date',
            'converted_to_project_at' => 'datetime',
        ];
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(CrmLead::class, 'lead_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(CrmOrganization::class, 'organization_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(CrmContact::class, 'contact_id');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(CrmActivity::class, 'activitable');
    }

    public function tags()
    {
        return $this->morphToMany(CrmTag::class, 'taggable', 'crm_taggables');
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(CrmQuotation::class, 'deal_id');
    }

    public function project(): HasOne
    {
        return $this->hasOne(CrmProject::class, 'deal_id');
    }

    public function risks(): HasMany
    {
        return $this->hasMany(CrmDealRisk::class, 'deal_id');
    }

    public function competitors(): HasMany
    {
        return $this->hasMany(CrmDealCompetitor::class, 'deal_id');
    }

    public function quota(): BelongsTo
    {
        return $this->belongsTo(CrmQuota::class, 'quota_id');
    }

    public function auditLogs(): MorphMany
    {
        return $this->morphMany(CrmAuditLog::class, 'auditable');
    }

    public function healthScore(): ?HealthResult
    {
        return app(CrmHealthService::class)->calculate($this);
    }
}
