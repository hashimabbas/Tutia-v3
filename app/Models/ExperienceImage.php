<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExperienceImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'experience_event_id',
        'image',
        'caption',
        'alt_text',
        'sort_order',
        'is_featured',
        'is_visible',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'is_visible' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(ExperienceEvent::class, 'experience_event_id');
    }
}
