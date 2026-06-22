<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmApprovalFlow extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'strategy', 'escalation_model',
        'escalation_config', 'sla_warning_minutes', 'sla_breach_minutes', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'escalation_config' => 'json',
            'is_active' => 'boolean',
            'sla_warning_minutes' => 'integer',
            'sla_breach_minutes' => 'integer',
        ];
    }

    public function steps(): HasMany
    {
        return $this->hasMany(CrmApprovalStep::class, 'approval_flow_id')
            ->orderBy('step_order');
    }

    public function requests(): HasMany
    {
        return $this->hasMany(CrmApprovalRequest::class, 'approval_flow_id');
    }
}
