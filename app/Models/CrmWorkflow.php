<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmWorkflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'entity_type', 'is_active',
        'conditions_version', 'expression', 'version', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'version' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function triggers(): HasMany
    {
        return $this->hasMany(CrmWorkflowTrigger::class, 'workflow_id');
    }

    public function conditions(): HasMany
    {
        return $this->hasMany(CrmWorkflowCondition::class, 'workflow_id');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(CrmWorkflowAction::class, 'workflow_id')
            ->orderBy('sort_order');
    }

    public function runs(): HasMany
    {
        return $this->hasMany(CrmWorkflowRun::class, 'workflow_id');
    }
}
