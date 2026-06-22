<?php

namespace App\Http\Controllers\Crm\Workflows;

use App\Http\Controllers\Controller;
use App\Http\Requests\Crm\Workflows\StoreWorkflowConditionRequest;
use App\Http\Requests\Crm\Workflows\UpdateWorkflowConditionRequest;
use App\Http\Resources\WorkflowConditionResource;
use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowCondition;
use Illuminate\Http\JsonResponse;

class ConditionBuilderController extends Controller
{
    public function index(CrmWorkflow $workflow): JsonResponse
    {
        $this->authorize('view', $workflow);

        return response()->json([
            'conditions' => WorkflowConditionResource::collection($workflow->conditions),
        ]);
    }

    public function store(StoreWorkflowConditionRequest $request, CrmWorkflow $workflow): JsonResponse
    {
        $condition = $workflow->conditions()->create($request->validated());

        return response()->json([
            'condition' => new WorkflowConditionResource($condition),
        ], 201);
    }

    public function update(UpdateWorkflowConditionRequest $request, CrmWorkflow $workflow, CrmWorkflowCondition $condition): JsonResponse
    {
        $this->authorize('update', $workflow);

        $condition->update($request->validated());

        return response()->json([
            'condition' => new WorkflowConditionResource($condition->fresh()),
        ]);
    }

    public function destroy(CrmWorkflow $workflow, CrmWorkflowCondition $condition): JsonResponse
    {
        $this->authorize('update', $workflow);

        $condition->delete();

        return response()->json(null, 204);
    }
}
