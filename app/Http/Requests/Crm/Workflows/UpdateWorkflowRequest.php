<?php

namespace App\Http\Requests\Crm\Workflows;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkflowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('workflow'));
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'entity_type' => ['sometimes', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            'conditions_version' => ['sometimes', 'string', 'in:v1,v2'],
            'expression' => ['nullable', 'string'],
        ];
    }

    protected function passedValidation(): void
    {
        $workflow = $this->route('workflow');
        $workflow->increment('version');
    }
}
