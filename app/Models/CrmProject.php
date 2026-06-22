<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'deal_id', 'organization_id', 'template_id', 'name', 'status',
        'contract_value', 'change_order_total', 'billed_amount', 'collected_amount',
        'start_date', 'target_end_date', 'actual_end_date',
        'customer_sentiment', 'visibility', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'contract_value' => 'decimal:2',
            'change_order_total' => 'decimal:2',
            'billed_amount' => 'decimal:2',
            'collected_amount' => 'decimal:2',
            'start_date' => 'date',
            'target_end_date' => 'date',
            'actual_end_date' => 'date',
        ];
    }

    public function deal(): BelongsTo
    {
        return $this->belongsTo(CrmDeal::class, 'deal_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(CrmOrganization::class, 'organization_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(CrmProjectTemplate::class, 'template_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function portalAccounts(): BelongsToMany
    {
        return $this->belongsToMany(CrmPortalAccount::class, 'crm_portal_account_project', 'project_id', 'portal_account_id')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(CrmMilestone::class, 'project_id')->orderBy('sort_order');
    }

    public function stakeholders(): HasMany
    {
        return $this->hasMany(CrmProjectStakeholder::class, 'project_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(CrmProjectMember::class, 'project_id');
    }

    public function risks(): HasMany
    {
        return $this->hasMany(CrmProjectRisk::class, 'project_id');
    }

    public function issues(): HasMany
    {
        return $this->hasMany(CrmIssue::class, 'project_id');
    }

    public function changeOrders(): HasMany
    {
        return $this->hasMany(CrmChangeOrder::class, 'project_id');
    }

    public function getTotalValueAttribute(): float
    {
        return (float) ($this->contract_value + $this->change_order_total);
    }

    public function getBilledPercentAttribute(): float
    {
        if ($this->totalValue === 0.0) {
            return 0;
        }

        return round(($this->billed_amount / $this->totalValue) * 100, 1);
    }

    public function getCollectedPercentAttribute(): float
    {
        if ($this->billed_amount === 0.0) {
            return 0;
        }

        return round(($this->collected_amount / $this->billed_amount) * 100, 1);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['planned', 'initiating', 'active', 'at_risk']);
    }

    public function scopeByOrganization($query, int $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }
}
