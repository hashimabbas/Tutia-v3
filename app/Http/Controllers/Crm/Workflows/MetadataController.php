<?php

namespace App\Http\Controllers\Crm\Workflows;

use App\Http\Controllers\Controller;
use App\Models\CrmApprovalFlow;
use App\Services\Crm\Communications\Registry\NotificationEventCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowActionCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowOperatorCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use ReflectionClass;

class MetadataController extends Controller
{
    public function events(): JsonResponse
    {
        $events = (new ReflectionClass(NotificationEventCatalog::class))->getConstants();

        return response()->json([
            'events' => Arr::sort(collect($events)->map(fn (string $key) => [
                'key' => $key,
                'label' => Str::of($key)->replace(['.', '_'], ' ')->title()->value(),
            ])->values()),
        ]);
    }

    public function operators(): JsonResponse
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

        return response()->json([
            'operators' => collect(WorkflowOperatorCatalog::ALL)->map(fn (string $key) => [
                'key' => $key,
                'label' => $labels[$key] ?? Str::of($key)->replace(['.', '_'], ' ')->title()->value(),
            ])->values(),
        ]);
    }

    public function actions(): JsonResponse
    {
        return response()->json([
            'actions' => collect(WorkflowActionCatalog::ALL)->map(fn (string $key) => [
                'key' => $key,
                'label' => Str::of($key)->replace(['.', '_'], ' ')->title()->value(),
            ])->values(),
        ]);
    }

    public function approvalFlows(): JsonResponse
    {
        $flows = CrmApprovalFlow::withCount('steps')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'approvalFlows' => $flows->map(fn (CrmApprovalFlow $flow) => [
                'id' => $flow->id,
                'name' => $flow->name,
                'strategy' => $flow->strategy,
                'steps_count' => $flow->steps_count,
            ]),
        ]);
    }
}
