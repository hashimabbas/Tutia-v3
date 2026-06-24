<?php

use App\Services\Crm\Analytics\Explainability\RecommendationExplanation;
use App\Services\Crm\Analytics\Explainability\RecommendationExplanationFactory;
use App\Services\Crm\Analytics\Explainability\RecommendationReason;

describe('RecommendationReason', function () {
    it('creates a reason with all properties', function () {
        $reason = new RecommendationReason('Failure Rate', '31%', 'critical');

        expect($reason->label)->toBe('Failure Rate')
            ->and($reason->value)->toBe('31%')
            ->and($reason->severity)->toBe('critical');
    });

    it('json serializes correctly', function () {
        $reason = new RecommendationReason('Failed Runs', '42', 'warning');
        $json = json_decode(json_encode($reason), true);

        expect($json)->toBe([
            'label' => 'Failed Runs',
            'value' => '42',
            'severity' => 'warning',
        ]);
    });

    it('is immutable', function () {
        $reason = new RecommendationReason('R', 'V', 'info');

        expect(fn () => $reason->label = 'Changed')->toThrow(Error::class);
    });
});

describe('RecommendationExplanation', function () {
    it('creates an explanation with all properties', function () {
        $reasons = [new RecommendationReason('Rate', '50%', 'critical')];
        $actions = ['Review logs', 'Enable retries'];

        $explanation = new RecommendationExplanation(
            summary: 'High failure rate detected',
            reasons: $reasons,
            recommendedActions: $actions,
        );

        expect($explanation->summary)->toBe('High failure rate detected')
            ->and($explanation->reasons)->toHaveCount(1)
            ->and($explanation->recommendedActions)->toHaveCount(2);
    });

    it('handles empty reasons and actions', function () {
        $explanation = new RecommendationExplanation(
            summary: 'Test',
            reasons: [],
            recommendedActions: [],
        );

        expect($explanation->reasons)->toBeEmpty()
            ->and($explanation->recommendedActions)->toBeEmpty();
    });

    it('json serializes reasons and actions', function () {
        $explanation = new RecommendationExplanation(
            summary: 'Test',
            reasons: [new RecommendationReason('Rate', '50%', 'critical')],
            recommendedActions: ['Action 1'],
        );

        $json = json_decode(json_encode($explanation), true);

        expect($json)->toHaveKeys(['summary', 'reasons', 'recommendedActions'])
            ->and($json['reasons'][0]['label'])->toBe('Rate')
            ->and($json['recommendedActions'][0])->toBe('Action 1');
    });

    it('is immutable', function () {
        $explanation = new RecommendationExplanation('S', [], []);

        expect(fn () => $explanation->summary = 'X')->toThrow(Error::class);
    });
});

describe('RecommendationExplanationFactory', function () {
    beforeEach(function () {
        $this->factory = new RecommendationExplanationFactory;
    });

    describe('workflow types', function () {
        it('explains orphaned_workflow', function () {
            $r = ['type' => 'orphaned_workflow', 'entityName' => 'Test Wf'];
            $ex = $this->factory->explain($r);

            expect($ex)->not->toBeNull()
                ->and($ex->summary)->toContain('active')
                ->and($ex->reasons)->not->toBeEmpty()
                ->and($ex->recommendedActions)->not->toBeEmpty();
        });

        it('explains high_failure_rate', function () {
            $r = [
                'type' => 'high_failure_rate',
                'failureRate' => 45.0,
                'failedRuns' => 9,
                'totalRuns' => 20,
                'entityName' => 'Test Wf',
            ];
            $ex = $this->factory->explain($r);

            expect($ex)->not->toBeNull()
                ->and($ex->summary)->toContain('45%');
            expect($ex->reasons[0]->value)->toBe('45%');
            expect($ex->reasons[1]->value)->toBe('9');
        });

        it('explains retry_candidate', function () {
            $r = [
                'type' => 'retry_candidate',
                'failureRate' => 35.0,
                'failureCount' => 7,
                'totalCount' => 20,
                'entityName' => 'email',
            ];
            $ex = $this->factory->explain($r);

            expect($ex)->not->toBeNull()
                ->and($ex->summary)->toContain('email')
                ->and($ex->summary)->toContain('35%');
        });

        it('explains disabled_with_history', function () {
            $r = ['type' => 'disabled_with_history', 'entityName' => 'Old Wf'];
            $ex = $this->factory->explain($r);

            expect($ex)->not->toBeNull()
                ->and($ex->summary)->toContain('Disabled');
        });

        it('explains frequent_failure', function () {
            $r = [
                'type' => 'frequent_failure',
                'failCount' => 15,
                'entityName' => 'sms',
            ];
            $ex = $this->factory->explain($r);

            expect($ex)->not->toBeNull()
                ->and($ex->summary)->toContain('15')
                ->and($ex->summary)->toContain('sms');
        });
    });

    describe('approval types', function () {
        it('explains bottleneck_step', function () {
            $r = [
                'type' => 'bottleneck_step',
                'stepOrder' => 2,
                'stepName' => 'Review',
                'avgTimeMinutes' => 120,
                'flowAvgMinutes' => 45,
                'ratio' => 2.7,
                'entityName' => 'Flow A',
            ];
            $ex = $this->factory->explain($r);

            expect($ex)->not->toBeNull()
                ->and($ex->summary)->toContain('2.7x')
                ->and($ex->reasons[0]->value)->toBe('120m');
        });

        it('explains sla_risk with warning severity', function () {
            $r = [
                'type' => 'sla_risk',
                'avgResolutionMinutes' => 120,
                'slaBreachMinutes' => 240,
                'breachCount' => 3,
                'ratio' => 0.5,
                'entityName' => 'Flow A',
            ];
            $ex = $this->factory->explain($r);

            expect($ex)->not->toBeNull()
                ->and($ex->summary)->toContain('120m');
            expect($ex->reasons[0]->severity)->toBe('warning');
        });

        it('explains sla_risk with critical severity when ratio >= 1', function () {
            $r = [
                'type' => 'sla_risk',
                'avgResolutionMinutes' => 300,
                'slaBreachMinutes' => 240,
                'breachCount' => 10,
                'ratio' => 1.25,
                'entityName' => 'Flow A',
            ];
            $ex = $this->factory->explain($r);

            expect($ex->reasons[0]->severity)->toBe('critical');
        });

        it('explains high_escalation', function () {
            $r = [
                'type' => 'high_escalation',
                'escalationRate' => 30.0,
                'escalatedCount' => 15,
                'totalRequests' => 50,
                'stepsCount' => 3,
                'entityName' => 'Flow A',
            ];
            $ex = $this->factory->explain($r);

            expect($ex)->not->toBeNull()
                ->and($ex->summary)->toContain('30%')
                ->and($ex->reasons[0]->value)->toBe('30%');
        });

        it('explains single_approver_risk', function () {
            $r = [
                'type' => 'single_approver_risk',
                'stepOrder' => 1,
                'slowDecisions' => 5,
                'entityName' => 'Flow A',
            ];
            $ex = $this->factory->explain($r);

            expect($ex)->not->toBeNull()
                ->and($ex->summary)->toContain('5')
                ->and($ex->reasons[0]->value)->toBe('5');
        });

        it('explains strategy_change', function () {
            $r = [
                'type' => 'strategy_change',
                'escalationRate' => 20.0,
                'currentStrategy' => 'all_must_approve',
                'entityName' => 'Flow A',
            ];
            $ex = $this->factory->explain($r);

            expect($ex)->not->toBeNull()
                ->and($ex->summary)->toContain('20%')
                ->and($ex->reasons[1]->value)->toBe('all_must_approve');
        });
    });

    describe('edge cases', function () {
        it('returns null for unknown type', function () {
            $r = ['type' => 'unknown_type'];
            $ex = $this->factory->explain($r);

            expect($ex)->toBeNull();
        });

        it('returns null for empty type', function () {
            $r = ['type' => ''];
            $ex = $this->factory->explain($r);

            expect($ex)->toBeNull();
        });

        it('all explanations have at least one reason', function () {
            $types = [
                ['type' => 'orphaned_workflow', 'entityName' => 'Wf'],
                ['type' => 'high_failure_rate', 'failureRate' => 50, 'failedRuns' => 5, 'totalRuns' => 10, 'entityName' => 'Wf'],
                ['type' => 'retry_candidate', 'failureRate' => 30, 'failureCount' => 3, 'totalCount' => 10, 'entityName' => 'a'],
                ['type' => 'disabled_with_history', 'entityName' => 'Wf'],
                ['type' => 'frequent_failure', 'failCount' => 10, 'entityName' => 'a'],
                ['type' => 'bottleneck_step', 'stepOrder' => 1, 'stepName' => 'S', 'avgTimeMinutes' => 10, 'flowAvgMinutes' => 5, 'ratio' => 2, 'entityName' => 'F'],
                ['type' => 'sla_risk', 'avgResolutionMinutes' => 10, 'slaBreachMinutes' => 20, 'breachCount' => 1, 'ratio' => 0.5, 'entityName' => 'F'],
                ['type' => 'high_escalation', 'escalationRate' => 25, 'escalatedCount' => 5, 'totalRequests' => 20, 'stepsCount' => 3, 'entityName' => 'F'],
                ['type' => 'single_approver_risk', 'stepOrder' => 1, 'slowDecisions' => 3, 'entityName' => 'F'],
                ['type' => 'strategy_change', 'escalationRate' => 15, 'currentStrategy' => 'all_must_approve', 'entityName' => 'F'],
            ];

            foreach ($types as $r) {
                $ex = $this->factory->explain($r);
                expect($ex)->not->toBeNull("Type {$r['type']} returned null");
                expect($ex->reasons)->not->toBeEmpty("Type {$r['type']} has no reasons");
                expect($ex->recommendedActions)->not->toBeEmpty("Type {$r['type']} has no actions");
            }
        });

        it('each reason has valid severity', function () {
            $r = ['type' => 'high_failure_rate', 'failureRate' => 50, 'failedRuns' => 5, 'totalRuns' => 10, 'entityName' => 'Wf'];
            $ex = $this->factory->explain($r);
            $valid = ['critical', 'warning', 'info'];

            foreach ($ex->reasons as $reason) {
                expect($reason->severity)->toBeIn($valid);
            }
        });
    });
});
