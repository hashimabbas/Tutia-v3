<?php

namespace App\Services\Crm\Workflows\Contracts;

use App\Services\Crm\Workflows\DTOs\WorkflowContext;

interface WorkflowContextBuilderInterface
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function build(object $event, array $payload, string $correlationId): WorkflowContext;
}
