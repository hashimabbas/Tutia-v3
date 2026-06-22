<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmWorkflowTrigger extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id', 'event_key',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(CrmWorkflow::class, 'workflow_id');
    }
}
