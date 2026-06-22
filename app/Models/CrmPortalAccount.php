<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmPortalAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'contact_id', 'enabled_at', 'enabled_by', 'last_login_at',
        'login_count', 'locale', 'disabled_at', 'disabled_reason',
        'email_snapshot', 'name_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'enabled_at' => 'datetime',
            'last_login_at' => 'datetime',
            'disabled_at' => 'datetime',
        ];
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(CrmContact::class, 'contact_id');
    }

    public function enabledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enabled_by');
    }

    public function tokens(): HasMany
    {
        return $this->hasMany(CrmPortalToken::class, 'portal_account_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(CrmPortalSession::class, 'portal_account_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(CrmPortalNotification::class, 'portal_account_id');
    }

    public function preferences(): HasMany
    {
        return $this->hasMany(CrmPortalNotificationPreference::class, 'portal_account_id');
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(CrmProject::class, 'crm_portal_account_project', 'portal_account_id', 'project_id')
            ->withPivot('role')
            ->withTimestamps();
    }
}
