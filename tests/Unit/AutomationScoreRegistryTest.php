<?php

use App\Services\Crm\Optimization\Automation\Registries\ApprovalAutomationScoreRegistry;
use App\Services\Crm\Optimization\Automation\Registries\WorkflowAutomationScoreRegistry;

describe('WorkflowAutomationScoreRegistry', function () {
    it('lists all workflow metrics', function () {
        $registry = new WorkflowAutomationScoreRegistry;

        $metrics = $registry->metrics();

        expect($metrics)->toContain('impact_success');
        expect($metrics)->toContain('adoption_rate');
        expect($metrics)->toContain('verification_rate');
        expect($metrics)->toContain('lifecycle_completion');
        expect($metrics)->toContain('avg_improvement');
        expect($metrics)->toHaveCount(5);
    });

    it('returns correct weights for all metrics', function () {
        $registry = new WorkflowAutomationScoreRegistry;

        expect($registry->weight('impact_success'))->toBe(0.25);
        expect($registry->weight('adoption_rate'))->toBe(0.20);
        expect($registry->weight('verification_rate'))->toBe(0.20);
        expect($registry->weight('lifecycle_completion'))->toBe(0.15);
        expect($registry->weight('avg_improvement'))->toBe(0.20);
    });

    it('returns threshold for each metric', function () {
        $registry = new WorkflowAutomationScoreRegistry;

        expect($registry->threshold('impact_success'))->toBe(50.0);
        expect($registry->threshold('adoption_rate'))->toBe(30.0);
    });

    it('returns label and description', function () {
        $registry = new WorkflowAutomationScoreRegistry;

        expect($registry->label('impact_success'))->toBe('Impact Success');
        expect($registry->description('adoption_rate'))->toContain('accepted vs viewed');
    });

    it('checks metric support', function () {
        $registry = new WorkflowAutomationScoreRegistry;

        expect($registry->supports('impact_success'))->toBeTrue();
        expect($registry->supports('nonexistent'))->toBeFalse();
    });

    it('throws for unknown metric', function () {
        $registry = new WorkflowAutomationScoreRegistry;

        expect(fn () => $registry->weight('unknown'))->toThrow(InvalidArgumentException::class);
        expect(fn () => $registry->label('unknown'))->toThrow(InvalidArgumentException::class);
    });

    it('has higher_is_better direction for all metrics', function () {
        $registry = new WorkflowAutomationScoreRegistry;

        foreach ($registry->metrics() as $metric) {
            expect($registry->direction($metric))->toBe('higher_is_better');
        }
    });
});

describe('ApprovalAutomationScoreRegistry', function () {
    it('lists all approval metrics', function () {
        $registry = new ApprovalAutomationScoreRegistry;

        $metrics = $registry->metrics();

        expect($metrics)->toContain('impact_success');
        expect($metrics)->toContain('adoption_rate');
        expect($metrics)->toContain('verification_rate');
        expect($metrics)->toContain('lifecycle_completion');
        expect($metrics)->toContain('cycle_time');
        expect($metrics)->toContain('sla_compliance');
        expect($metrics)->toHaveCount(6);
    });

    it('has lower_is_better for cycle_time', function () {
        $registry = new ApprovalAutomationScoreRegistry;

        expect($registry->direction('cycle_time'))->toBe('lower_is_better');
    });

    it('returns correct weights', function () {
        $registry = new ApprovalAutomationScoreRegistry;

        expect($registry->weight('impact_success'))->toBe(0.20);
        expect($registry->weight('sla_compliance'))->toBe(0.10);
    });

    it('throws for unknown metric', function () {
        $registry = new ApprovalAutomationScoreRegistry;

        expect(fn () => $registry->weight('unknown'))->toThrow(InvalidArgumentException::class);
    });

    it('checks metric support', function () {
        $registry = new ApprovalAutomationScoreRegistry;

        expect($registry->supports('cycle_time'))->toBeTrue();
        expect($registry->supports('unknown'))->toBeFalse();
    });
});
