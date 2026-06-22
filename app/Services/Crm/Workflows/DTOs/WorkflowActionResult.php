<?php

namespace App\Services\Crm\Workflows\DTOs;

class WorkflowActionResult
{
    /**
     * @param  array<string, mixed>  $configuration
     * @param  array<string, mixed>|null  $response
     */
    public function __construct(
        public readonly int $actionId,
        public readonly string $actionType,
        public readonly array $configuration,
        public readonly bool $success,
        public readonly ?array $response = null,
        public readonly ?string $errorMessage = null,
        public readonly bool $isPending = false,
    ) {}
}
