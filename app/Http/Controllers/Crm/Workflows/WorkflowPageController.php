<?php

namespace App\Http\Controllers\Crm\Workflows;

use App\Http\Controllers\Controller;
use App\Models\CrmApprovalFlow;
use App\Models\CrmWorkflow;
use App\Services\Crm\Communications\Registry\NotificationEventCatalog;
use App\Services\Crm\Expressions\Catalogs\ExpressionFieldCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowActionCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowConditionsVersion;
use App\Services\Crm\Workflows\Catalogs\WorkflowOperatorCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use ReflectionClass;

class WorkflowPageController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', CrmWorkflow::class);

        if ($request->wantsJson()) {
            return app(WorkflowController::class)->index($request);
        }

        $query = CrmWorkflow::withCount(['triggers', 'conditions', 'actions']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $workflows = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $entityTypes = CrmWorkflow::select('entity_type')->distinct()->orderBy('entity_type')->pluck('entity_type');

        return inertia('crm/workflows/index', [
            'workflows' => $workflows,
            'entity_types' => $entityTypes,
            'filters' => $request->only(['search', 'entity_type', 'is_active']),
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', CrmWorkflow::class);

        $workflow = CrmWorkflow::create([
            'name' => 'New Workflow',
            'entity_type' => 'lead',
            'slug' => Str::slug('New Workflow').'-'.Str::random(6),
            'is_active' => false,
            'version' => 1,
            'created_by' => request()->user()->id,
        ]);

        return redirect()->route('crm.workflows.show', $workflow);
    }

    public function show(CrmWorkflow $workflow)
    {
        $this->authorize('view', $workflow);

        if (request()->wantsJson()) {
            return app(WorkflowController::class)->show($workflow);
        }

        $workflow->load(['triggers', 'conditions', 'actions']);

        $events = collect((new ReflectionClass(NotificationEventCatalog::class))->getConstants())
            ->map(fn (string $key) => [
                'key' => $key,
                'label' => Str::of($key)->replace(['.', '_'], ' ')->title()->value(),
            ])->sortBy('label')->values()->all();

        $operatorLabels = [
            'eq' => 'Equals',
            'neq' => 'Not Equals',
            'gt' => 'Greater Than',
            'gte' => 'Greater Than Or Equal',
            'lt' => 'Less Than',
            'lte' => 'Less Than Or Equal',
            'in' => 'In',
            'not_in' => 'Not In',
            'contains' => 'Contains',
            'is_empty' => 'Is Empty',
            'not_empty' => 'Not Empty',
        ];

        $operators = collect(WorkflowOperatorCatalog::ALL)->map(fn (string $key) => [
            'key' => $key,
            'label' => $operatorLabels[$key] ?? Str::of($key)->replace(['.', '_'], ' ')->title()->value(),
        ])->values();

        $actionTypes = collect(WorkflowActionCatalog::ALL)->map(fn (string $key) => [
            'key' => $key,
            'label' => Str::of($key)->replace(['.', '_'], ' ')->title()->value(),
        ])->values();

        $approvalFlows = CrmApprovalFlow::withCount('steps')
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (CrmApprovalFlow $flow) => [
                'id' => $flow->id,
                'name' => $flow->name,
                'strategy' => $flow->strategy,
                'steps_count' => $flow->steps_count,
            ]);

        $expressionFields = collect(ExpressionFieldCatalog::all())->map(fn (string $path) => [
            'path' => $path,
            'type' => ExpressionFieldCatalog::find($path)?->type,
            'operators' => ExpressionFieldCatalog::find($path)?->supportedOperators,
            'suggested_min' => ExpressionFieldCatalog::find($path)?->suggestedMin,
            'suggested_max' => ExpressionFieldCatalog::find($path)?->suggestedMax,
        ])->values();

        $expressionOperatorLabels = [
            '=' => 'Equals',
            '!=' => 'Not Equals',
            '>' => 'Greater Than',
            '>=' => 'Greater Than Or Equal',
            '<' => 'Less Than',
            '<=' => 'Less Than Or Equal',
            'in' => 'In',
            'not_in' => 'Not In',
            'contains' => 'Contains',
            'starts_with' => 'Starts With',
            'ends_with' => 'Ends With',
        ];

        $expressionOperators = collect(ExpressionFieldCatalog::stringOperators())
            ->merge(ExpressionFieldCatalog::numericOperators())
            ->merge(ExpressionFieldCatalog::booleanOperators())
            ->unique()
            ->values()
            ->map(fn (string $op) => [
                'key' => $op,
                'label' => $expressionOperatorLabels[$op] ?? $op,
            ]);

        $conditionsVersions = [
            ['key' => WorkflowConditionsVersion::V1->value, 'label' => 'Legacy Conditions (v1)'],
            ['key' => WorkflowConditionsVersion::V2->value, 'label' => 'Expression Engine (v2)'],
        ];

        return inertia('crm/workflows/show', [
            'workflow' => $workflow,
            'meta' => [
                'events' => $events,
                'operators' => $operators,
                'actions' => $actionTypes,
                'approval_flows' => $approvalFlows,
                'expression_fields' => $expressionFields,
                'expression_operators' => $expressionOperators,
                'conditions_versions' => $conditionsVersions,
            ],
        ]);
    }
}
