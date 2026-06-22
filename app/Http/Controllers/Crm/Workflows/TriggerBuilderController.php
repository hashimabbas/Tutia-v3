<?php

namespace App\Http\Controllers\Crm\Workflows;

use App\Http\Controllers\Controller;
use App\Http\Requests\Crm\Workflows\StoreWorkflowTriggerRequest;
use App\Http\Resources\WorkflowTriggerResource;
use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowTrigger;
use Illuminate\Http\JsonResponse;

class TriggerBuilderController extends Controller
{
    public function index(CrmWorkflow $workflow): JsonResponse
    {
        $this->authorize('view', $workflow);

        return response()->json([
            'triggers' => WorkflowTriggerResource::collection($workflow->triggers),
        ]);
    }

    public function store(StoreWorkflowTriggerRequest $request, CrmWorkflow $workflow): JsonResponse
    {
        $trigger = $workflow->triggers()->create($request->validated());

        return response()->json([
            'trigger' => new WorkflowTriggerResource($trigger),
        ], 201);
    }

    public function update(StoreWorkflowTriggerRequest $request, CrmWorkflow $workflow, CrmWorkflowTrigger $trigger): JsonResponse
    {
        $this->authorize('update', $workflow);

        $trigger->update($request->validated());

        return response()->json([
            'trigger' => new WorkflowTriggerResource($trigger->fresh()),
        ]);
    }

    public function destroy(CrmWorkflow $workflow, CrmWorkflowTrigger $trigger): JsonResponse
    {
        $this->authorize('update', $workflow);

        $trigger->delete();

        return response()->json(null, 204);
    }
}
