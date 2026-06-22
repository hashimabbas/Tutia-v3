<?php

namespace App\Http\Controllers\Crm\Workflows;

use App\Http\Controllers\Controller;
use App\Http\Requests\Crm\Workflows\StoreWorkflowRequest;
use App\Http\Requests\Crm\Workflows\UpdateWorkflowRequest;
use App\Http\Resources\WorkflowResource;
use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowAction;
use App\Models\CrmWorkflowCondition;
use App\Models\CrmWorkflowTrigger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WorkflowController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CrmWorkflow::class);

        $workflows = CrmWorkflow::with(['triggers', 'conditions', 'actions'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return WorkflowResource::collection($workflows)->response();
    }

    public function show(CrmWorkflow $workflow): JsonResponse
    {
        $this->authorize('view', $workflow);

        $workflow->load(['triggers', 'conditions', 'actions']);

        return response()->json([
            'workflow' => new WorkflowResource($workflow),
        ]);
    }

    public function store(StoreWorkflowRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;
        $data['slug'] ??= Str::slug($data['name']);
        $workflow = CrmWorkflow::create($data)->fresh();

        return response()->json([
            'workflow' => new WorkflowResource($workflow),
        ], 201);
    }

    public function update(UpdateWorkflowRequest $request, CrmWorkflow $workflow): JsonResponse
    {
        $workflow->update($request->validated());

        return response()->json([
            'workflow' => new WorkflowResource($workflow->fresh()->load(['triggers', 'conditions', 'actions'])),
        ]);
    }

    public function destroy(CrmWorkflow $workflow): JsonResponse
    {
        $this->authorize('delete', $workflow);

        $workflow->delete();

        return response()->json(null, 204);
    }

    public function duplicate(Request $request, CrmWorkflow $workflow): JsonResponse
    {
        $this->authorize('duplicate', $workflow);

        $workflow->load(['triggers', 'conditions', 'actions']);

        $copy = CrmWorkflow::create([
            'name' => $workflow->name.' (copy)',
            'description' => $workflow->description,
            'entity_type' => $workflow->entity_type,
            'is_active' => false,
            'version' => 1,
            'created_by' => $request->user()->id,
            'slug' => Str::slug($workflow->name.'-copy').'-'.Str::random(6),
        ]);

        foreach ($workflow->triggers as $trigger) {
            CrmWorkflowTrigger::create([
                'workflow_id' => $copy->id,
                'event_key' => $trigger->event_key,
            ]);
        }

        foreach ($workflow->conditions as $condition) {
            CrmWorkflowCondition::create([
                'workflow_id' => $copy->id,
                'field' => $condition->field,
                'operator' => $condition->operator,
                'value' => $condition->value,
                'group_order' => $condition->group_order,
            ]);
        }

        foreach ($workflow->actions as $action) {
            CrmWorkflowAction::create([
                'workflow_id' => $copy->id,
                'action_type' => $action->action_type,
                'configuration_json' => $action->configuration_json,
                'sort_order' => $action->sort_order,
                'stop_on_fail' => $action->stop_on_fail,
            ]);
        }

        return response()->json([
            'workflow' => new WorkflowResource($copy->load(['triggers', 'conditions', 'actions'])),
        ], 201);
    }

    public function toggle(CrmWorkflow $workflow): JsonResponse
    {
        $this->authorize('toggle', $workflow);

        $workflow->update([
            'is_active' => ! $workflow->is_active,
        ]);

        return response()->json([
            'workflow' => new WorkflowResource($workflow->fresh()),
        ]);
    }
}
