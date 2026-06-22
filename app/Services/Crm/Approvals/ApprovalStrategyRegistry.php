<?php

namespace App\Services\Crm\Approvals;

use App\Services\Crm\Approvals\Contracts\ApprovalStrategyInterface;
use RuntimeException;

class ApprovalStrategyRegistry
{
    private array $strategies = [];

    public function __construct(array $strategies = [])
    {
        foreach ($strategies as $strategy) {
            $this->register($strategy);
        }
    }

    public function register(ApprovalStrategyInterface $strategy): void
    {
        $this->strategies[$strategy->handles()] = $strategy;
    }

    public function hasStrategy(string $key): bool
    {
        return isset($this->strategies[$key]);
    }

    public function get(string $key): ApprovalStrategyInterface
    {
        return $this->strategies[$key]
            ?? throw new RuntimeException("No strategy registered for: {$key}");
    }
}
