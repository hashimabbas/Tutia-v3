<?php

namespace App\Http\Requests\Crm\Workflows;

use App\Services\Crm\Workflows\Catalogs\WorkflowOperatorCatalog;
use Illuminate\Foundation\Http\FormRequest;

class StoreWorkflowConditionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('workflow'));
    }

    public function rules(): array
    {
        return [
            'field' => ['required', 'string', 'max:255'],
            'operator' => ['required', 'string', 'in:'.implode(',', WorkflowOperatorCatalog::ALL)],
            'value' => ['nullable', 'string'],
            'group_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
