<?php

namespace App\Http\Requests\Crm\Workflows;

use App\Services\Crm\Workflows\Catalogs\WorkflowOperatorCatalog;
use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkflowConditionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('workflow'));
    }

    public function rules(): array
    {
        return [
            'field' => ['sometimes', 'string', 'max:255'],
            'operator' => ['sometimes', 'string', 'in:'.implode(',', WorkflowOperatorCatalog::ALL)],
            'value' => ['nullable', 'string'],
            'group_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
