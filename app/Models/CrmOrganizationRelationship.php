<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmOrganizationRelationship extends Model
{
    protected $fillable = [
        'source_org_id', 'target_org_id',
        'relationship_type_id', 'strength', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'strength' => 'integer',
        ];
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(CrmOrganization::class, 'source_org_id');
    }

    public function target(): BelongsTo
    {
        return $this->belongsTo(CrmOrganization::class, 'target_org_id');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(CrmOrganizationRelationshipType::class, 'relationship_type_id');
    }
}
