<?php

namespace App\Http\Requests\Crm\Workflows;

use App\Services\Crm\Workflows\Catalogs\WorkflowActionCatalog;
use Illuminate\Foundation\Http\FormRequest;

class StoreWorkflowActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('workflow'));
    }

    public function rules(): array
    {
        return [
            'action_type' => ['required', 'string', 'in:'.implode(',', WorkflowActionCatalog::ALL)],
            'configuration_json' => ['nullable', 'array'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'stop_on_fail' => ['sometimes', 'boolean'],
        ];
    }
}
