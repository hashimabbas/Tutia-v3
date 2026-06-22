<?php

namespace App\Services;

use App\Models\CrmAuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class CrmAuditLogService
{
    public function log(
        Model $auditable,
        string $event,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Request $request = null,
    ): CrmAuditLog {
        $data = [
            'user_id' => $request?->user()?->id ?? auth()->id(),
            'auditable_type' => $auditable->getMorphClass(),
            'auditable_id' => $auditable->getKey(),
            'event' => $event,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ];

        return CrmAuditLog::create($data);
    }

    public function logCreated(Model $auditable, ?Request $request = null): CrmAuditLog
    {
        return $this->log($auditable, 'created', null, $auditable->toArray(), $request);
    }

    public function logUpdated(Model $auditable, array $oldValues, ?Request $request = null): CrmAuditLog
    {
        return $this->log($auditable, 'updated', $oldValues, $auditable->fresh()->toArray(), $request);
    }

    public function logDeleted(Model $auditable, ?Request $request = null): CrmAuditLog
    {
        return $this->log($auditable, 'deleted', $auditable->toArray(), null, $request);
    }

    public function logStageChanged(Model $auditable, string $oldStage, string $newStage, ?Request $request = null): CrmAuditLog
    {
        return $this->log(
            $auditable,
            'stage_changed',
            ['stage' => $oldStage],
            ['stage' => $newStage],
            $request,
        );
    }

    public function logAssigned(Model $auditable, ?int $oldUserId, ?int $newUserId, ?Request $request = null): CrmAuditLog
    {
        return $this->log(
            $auditable,
            'assigned',
            ['assigned_to' => $oldUserId],
            ['assigned_to' => $newUserId],
            $request,
        );
    }
}
