<?php

namespace App\Http\Controllers\Crm\Workflows;

use App\Http\Controllers\Controller;
use App\Http\Requests\Crm\Workflows\StoreWorkflowActionRequest;
use App\Http\Requests\Crm\Workflows\UpdateWorkflowActionRequest;
use App\Http\Resources\WorkflowActionResource;
use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowAction;
use Illuminate\Http\JsonResponse;

class ActionBuilderController extends Controller
{
    public function index(CrmWorkflow $workflow): JsonResponse
    {
        $this->authorize('view', $workflow);

        return response()->json([
            'actions' => WorkflowActionResource::collection($workflow->actions),
        ]);
    }

    public function store(StoreWorkflowActionRequest $request, CrmWorkflow $workflow): JsonResponse
    {
        $action = $workflow->actions()->create($request->validated());

        return response()->json([
            'action' => new WorkflowActionResource($action),
        ], 201);
    }

    public function update(UpdateWorkflowActionRequest $request, CrmWorkflow $workflow, CrmWorkflowAction $action): JsonResponse
    {
        $this->authorize('update', $workflow);

        $action->update($request->validated());

        return response()->json([
            'action' => new WorkflowActionResource($action->fresh()),
        ]);
    }

    public function destroy(CrmWorkflow $workflow, CrmWorkflowAction $action): JsonResponse
    {
        $this->authorize('update', $workflow);

        $action->delete();

        return response()->json(null, 204);
    }
}
