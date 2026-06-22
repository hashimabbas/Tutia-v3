<?php

namespace App\Http\Requests\Crm\Workflows;

use App\Services\Crm\Communications\Registry\NotificationEventCatalog;
use Illuminate\Foundation\Http\FormRequest;
use ReflectionClass;

class StoreWorkflowTriggerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('workflow'));
    }

    public function rules(): array
    {
        $events = (new ReflectionClass(NotificationEventCatalog::class))
            ->getConstants();

        return [
            'event_key' => ['required', 'string', 'in:'.implode(',', $events)],
        ];
    }
}
