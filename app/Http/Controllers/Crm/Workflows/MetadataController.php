<?php

namespace App\Http\Controllers\Crm\Workflows;

use App\Http\Controllers\Controller;
use App\Models\CrmApprovalFlow;
use App\Services\Crm\Communications\Registry\NotificationEventCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowActionCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowOperatorCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Inertia\Response;
use ReflectionClass;

class MetadataController extends Controller
{
    public function events(): JsonResponse|Response
    {
        $events = (new ReflectionClass(NotificationEventCatalog::class))->getConstants();
        $catalog = collect($events)->map(fn (string $key) => [
            'key' => $key,
            'label' => Str::of($key)->replace(['.', '_'], ' ')->title()->value(),
        ])->sortBy('label')->values();

        if (request()->wantsJson()) {
            return response()->json(['events' => $catalog]);
        }

        return inertia('crm/workflows/meta/events', ['events' => $catalog]);
    }

    public function operators(): JsonResponse|Response
    {
        $labels = [
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

        $catalog = collect(WorkflowOperatorCatalog::ALL)->map(fn (string $key) => [
            'key' => $key,
            'label' => $labels[$key] ?? Str::of($key)->replace(['.', '_'], ' ')->title()->value(),
        ])->values();

        if (request()->wantsJson()) {
            return response()->json(['operators' => $catalog]);
        }

        return inertia('crm/workflows/meta/operators', ['operators' => $catalog]);
    }

    public function actions(): JsonResponse|Response
    {
        $catalog = collect(WorkflowActionCatalog::ALL)->map(fn (string $key) => [
            'key' => $key,
            'label' => Str::of($key)->replace(['.', '_'], ' ')->title()->value(),
        ])->values();

        if (request()->wantsJson()) {
            return response()->json(['actions' => $catalog]);
        }

        return inertia('crm/workflows/meta/actions', ['actions' => $catalog]);
    }

    public function approvalFlows(): JsonResponse|Response
    {
        $flows = CrmApprovalFlow::withCount('steps')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $catalog = $flows->map(fn (CrmApprovalFlow $flow) => [
            'id' => $flow->id,
            'name' => $flow->name,
            'strategy' => $flow->strategy,
            'steps_count' => $flow->steps_count,
        ]);

        if (request()->wantsJson()) {
            return response()->json(['approvalFlows' => $catalog]);
        }

        return inertia('crm/workflows/meta/approval-flows', ['approvalFlows' => $catalog]);
    }
}
