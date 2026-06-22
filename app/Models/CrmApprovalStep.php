<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmApprovalStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'approval_flow_id', 'step_order', 'approver_type',
        'approver_id', 'required',
    ];

    protected function casts(): array
    {
        return [
            'step_order' => 'integer',
            'required' => 'boolean',
        ];
    }

    public function flow(): BelongsTo
    {
        return $this->belongsTo(CrmApprovalFlow::class, 'approval_flow_id');
    }

    public function decisions(): HasMany
    {
        return $this->hasMany(CrmApprovalDecision::class, 'approval_step_id');
    }
}
