<?php

namespace App\Http\Requests\Crm\Workflows;

use App\Models\CrmWorkflow;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreWorkflowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', CrmWorkflow::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'entity_type' => ['required', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name') && ! $this->has('slug')) {
            $base = Str::slug($this->input('name'));
            $slug = $base;
            $i = 1;
            while (CrmWorkflow::where('slug', $slug)->exists()) {
                $slug = $base.'-'.$i;
                $i++;
            }
            $this->merge(['slug' => $slug]);
        }
    }

    protected function passedValidation(): void
    {
        $this->merge([
            'created_by' => $this->user()->id,
        ]);
    }
}
