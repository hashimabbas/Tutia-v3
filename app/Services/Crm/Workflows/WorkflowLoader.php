<?php

namespace App\Services\Crm\Workflows;

use App\Models\CrmWorkflow;
use Illuminate\Database\Eloquent\Collection;

class WorkflowLoader
{
    /**
     * @return Collection<int, CrmWorkflow>
     */
    public function findActiveByEventKey(string $eventKey): Collection
    {
        return CrmWorkflow::where('is_active', true)
            ->whereHas('triggers', fn ($q) => $q->where('event_key', $eventKey))
            ->with(['triggers', 'conditions', 'actions'])
            ->get();
    }

    public function findById(int $id): ?CrmWorkflow
    {
        return CrmWorkflow::with(['triggers', 'conditions', 'actions'])->find($id);
    }
}
