<?php

use App\Services\Crm\Optimization\Impact\Registries\ApprovalImpactMetricRegistry;
use App\Services\Crm\Optimization\Impact\Registries\ImpactMetricRegistryInterface;
use App\Services\Crm\Optimization\Impact\Registries\WorkflowImpactMetricRegistry;

describe('WorkflowImpactMetricRegistry', function () {
    it('returns all metric keys', function () {
        $registry = new WorkflowImpactMetricRegistry;
        $metrics = $registry->metrics();

        expect($metrics)->toHaveCount(5);
        expect($metrics)->toContain('failure_rate');
        expect($metrics)->toContain('avg_retries');
        expect($metrics)->toContain('sla_breach_rate');
        expect($metrics)->toContain('human_intervention');
        expect($metrics)->toContain('success_rate');
    });

    it('returns weight for known metric', function () {
        $registry = new WorkflowImpactMetricRegistry;
        expect($registry->weight('failure_rate'))->toBe(0.35);
        expect($registry->weight('avg_retries'))->toBe(0.15);
    });

    it('returns direction for known metric', function () {
        $registry = new WorkflowImpactMetricRegistry;
        expect($registry->direction('failure_rate'))->toBe('lower_is_better');
        expect($registry->direction('success_rate'))->toBe('higher_is_better');
    });

    it('returns label for known metric', function () {
        $registry = new WorkflowImpactMetricRegistry;
        expect($registry->label('failure_rate'))->toBe('Failure Rate');
    });

    it('checks supported metrics', function () {
        $registry = new WorkflowImpactMetricRegistry;
        expect($registry->supports('failure_rate'))->toBeTrue();
        expect($registry->supports('unknown_metric'))->toBeFalse();
    });

    it('throws on unknown metric weight', function () {
        $registry = new WorkflowImpactMetricRegistry;
        expect(fn () => $registry->weight('unknown'))->toThrow(InvalidArgumentException::class);
    });

    it('throws on unknown metric direction', function () {
        $registry = new WorkflowImpactMetricRegistry;
        expect(fn () => $registry->direction('unknown'))->toThrow(InvalidArgumentException::class);
    });

    it('throws on unknown metric label', function () {
        $registry = new WorkflowImpactMetricRegistry;
        expect(fn () => $registry->label('unknown'))->toThrow(InvalidArgumentException::class);
    });

    it('prescribes equal weights', function () {
        $registry = new WorkflowImpactMetricRegistry;
        $weights = array_map(fn ($m) => $registry->weight($m), $registry->metrics());
        expect(array_sum($weights))->toBe(1.0);
    });
});

describe('ApprovalImpactMetricRegistry', function () {
    it('returns approval metrics', function () {
        $registry = new ApprovalImpactMetricRegistry;
        expect($registry->metrics())->toHaveCount(4);
        expect($registry->metrics())->toContain('approval_cycle_time');
    });

    it('has correct direction for approval metrics', function () {
        $registry = new ApprovalImpactMetricRegistry;
        expect($registry->direction('approval_cycle_time'))->toBe('lower_is_better');
        expect($registry->direction('sla_compliance'))->toBe('higher_is_better');
    });

    it('prescribes equal weights', function () {
        $registry = new ApprovalImpactMetricRegistry;
        $weights = array_map(fn ($m) => $registry->weight($m), $registry->metrics());
        expect(array_sum($weights))->toBe(1.0);
    });

    it('implements the interface', function () {
        $registry = new ApprovalImpactMetricRegistry;
        expect($registry)->toBeInstanceOf(ImpactMetricRegistryInterface::class);
    });
});
