<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmProjectRisk extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', 'description', 'severity', 'probability',
        'impact', 'status', 'owner_id', 'mitigation_plan',
        'is_visible_to_customer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(CrmProject::class, 'project_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['identified', 'being_mitigated']);
    }

    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }
}
