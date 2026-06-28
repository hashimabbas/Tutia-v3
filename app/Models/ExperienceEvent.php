<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ExperienceEvent extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'subtitle',
        'description',
        'event_date',
        'cover_image',
        'display_order',
        'is_published',
        'is_featured',
        'slug',
        'seo_title',
        'seo_description',
        'og_image',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function images(): HasMany
    {
        return $this->hasMany(ExperienceImage::class, 'experience_event_id')->orderBy('sort_order');
    }

    public function visibleImages(): HasMany
    {
        return $this->hasMany(ExperienceImage::class, 'experience_event_id')->where('is_visible', true)->orderBy('sort_order');
    }

    public function featuredImage(): HasMany
    {
        return $this->hasMany(ExperienceImage::class, 'experience_event_id')->where('is_featured', true)->orderBy('sort_order')->limit(1);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('event_date', 'desc');
    }

    protected static function booted(): void
    {
        static::creating(function (ExperienceEvent $event) {
            if (empty($event->slug)) {
                $event->slug = Str::slug($event->title);
            }
        });
    }

    public function getImageCountAttribute(): int
    {
        return $this->images()->count();
    }

    public function getExcerptAttribute(): string
    {
        return Str::limit(strip_tags($this->description ?? ''), 150);
    }
}
