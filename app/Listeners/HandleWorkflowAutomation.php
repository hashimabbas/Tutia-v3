<?php

namespace App\Listeners;

use App\Services\Crm\Workflows\WorkflowEngine;
use Illuminate\Support\Str;

class HandleWorkflowAutomation
{
    public function __construct(
        private readonly WorkflowEngine $engine,
    ) {}

    public function handle(object $event): void
    {
        $payload = $this->buildPayload($event);
        $correlationId = Str::uuid()->toString();

        $this->engine->handle($event, $payload, $correlationId);
    }

    private function buildPayload(object $event): array
    {
        $payload = [];

        foreach (get_object_vars($event) as $key => $value) {
            if (is_object($value) && method_exists($value, 'toArray')) {
                $payload[$key] = $value->toArray();
            } elseif (! is_object($value) && ! is_callable($value)) {
                $payload[$key] = $value;
            }
        }

        return $payload;
    }
}
