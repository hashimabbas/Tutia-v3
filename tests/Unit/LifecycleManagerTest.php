<?php

use App\Services\Crm\Optimization\LifecycleStatus;
use App\Services\Crm\Optimization\RecommendationLifecycleManager;

describe('RecommendationLifecycleManager', function () {
    it('allows generated to viewed', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Generated, LifecycleStatus::Viewed))->toBeTrue();
    });

    it('allows generated to dismissed', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Generated, LifecycleStatus::Dismissed))->toBeTrue();
    });

    it('allows generated to cancelled', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Generated, LifecycleStatus::Cancelled))->toBeTrue();
    });

    it('allows viewed to accepted', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Viewed, LifecycleStatus::Accepted))->toBeTrue();
    });

    it('allows viewed to dismissed', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Viewed, LifecycleStatus::Dismissed))->toBeTrue();
    });

    it('allows viewed to cancelled', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Viewed, LifecycleStatus::Cancelled))->toBeTrue();
    });

    it('allows accepted to applied', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Accepted, LifecycleStatus::Applied))->toBeTrue();
    });

    it('allows accepted to rejected', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Accepted, LifecycleStatus::Rejected))->toBeTrue();
    });

    it('allows accepted to expired', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Accepted, LifecycleStatus::Expired))->toBeTrue();
    });

    it('allows applied to verified', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Applied, LifecycleStatus::Verified))->toBeTrue();
    });

    it('allows applied to expired', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Applied, LifecycleStatus::Expired))->toBeTrue();
    });

    it('allows verified to completed', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Verified, LifecycleStatus::Completed))->toBeTrue();
    });

    it('allows verified to failed', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Verified, LifecycleStatus::Failed))->toBeTrue();
    });

    it('disallows generated to completed directly', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Generated, LifecycleStatus::Completed))->toBeFalse();
    });

    it('disallows dismissed to any status', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Dismissed, LifecycleStatus::Accepted))->toBeFalse();
        expect($manager->canTransition(LifecycleStatus::Dismissed, LifecycleStatus::Viewed))->toBeFalse();
    });

    it('disallows rejected to any status', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Rejected, LifecycleStatus::Accepted))->toBeFalse();
        expect($manager->canTransition(LifecycleStatus::Rejected, LifecycleStatus::Applied))->toBeFalse();
    });

    it('disallows completed to any status', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Completed, LifecycleStatus::Verified))->toBeFalse();
    });

    it('disallows failed to any status', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Failed, LifecycleStatus::Applied))->toBeFalse();
    });

    it('disallows expired to any status', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Expired, LifecycleStatus::Accepted))->toBeFalse();
    });

    it('disallows cancelled to any status', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->canTransition(LifecycleStatus::Cancelled, LifecycleStatus::Generated))->toBeFalse();
    });

    it('performs transition without exception when valid', function () {
        $manager = new RecommendationLifecycleManager;
        $manager->transition(LifecycleStatus::Generated, LifecycleStatus::Viewed);
        expect(true)->toBeTrue();
    });

    it('throws exception on invalid transition', function () {
        $manager = new RecommendationLifecycleManager;
        expect(fn () => $manager->transition(LifecycleStatus::Generated, LifecycleStatus::Completed))
            ->toThrow(InvalidArgumentException::class);
    });

    it('returns allowed transitions from generated', function () {
        $manager = new RecommendationLifecycleManager;
        $allowed = $manager->allowedTransitions(LifecycleStatus::Generated);

        expect($allowed)->toHaveCount(3);
        expect($allowed)->toContain(LifecycleStatus::Viewed);
        expect($allowed)->toContain(LifecycleStatus::Dismissed);
        expect($allowed)->toContain(LifecycleStatus::Cancelled);
    });

    it('returns allowed transitions from viewed', function () {
        $manager = new RecommendationLifecycleManager;
        $allowed = $manager->allowedTransitions(LifecycleStatus::Viewed);

        expect($allowed)->toHaveCount(3);
        expect($allowed)->toContain(LifecycleStatus::Accepted);
        expect($allowed)->toContain(LifecycleStatus::Dismissed);
        expect($allowed)->toContain(LifecycleStatus::Cancelled);
    });

    it('returns empty allowed transitions from terminal states', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->allowedTransitions(LifecycleStatus::Completed))->toBeEmpty();
        expect($manager->allowedTransitions(LifecycleStatus::Failed))->toBeEmpty();
        expect($manager->allowedTransitions(LifecycleStatus::Dismissed))->toBeEmpty();
        expect($manager->allowedTransitions(LifecycleStatus::Rejected))->toBeEmpty();
        expect($manager->allowedTransitions(LifecycleStatus::Expired))->toBeEmpty();
        expect($manager->allowedTransitions(LifecycleStatus::Cancelled))->toBeEmpty();
    });

    it('identifies terminal states', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->isTerminal(LifecycleStatus::Completed))->toBeTrue();
        expect($manager->isTerminal(LifecycleStatus::Failed))->toBeTrue();
        expect($manager->isTerminal(LifecycleStatus::Dismissed))->toBeTrue();
        expect($manager->isTerminal(LifecycleStatus::Rejected))->toBeTrue();
        expect($manager->isTerminal(LifecycleStatus::Expired))->toBeTrue();
        expect($manager->isTerminal(LifecycleStatus::Cancelled))->toBeTrue();
    });

    it('identifies non-terminal states', function () {
        $manager = new RecommendationLifecycleManager;
        expect($manager->isTerminal(LifecycleStatus::Generated))->toBeFalse();
        expect($manager->isTerminal(LifecycleStatus::Viewed))->toBeFalse();
        expect($manager->isTerminal(LifecycleStatus::Accepted))->toBeFalse();
        expect($manager->isTerminal(LifecycleStatus::Applied))->toBeFalse();
        expect($manager->isTerminal(LifecycleStatus::Verified))->toBeFalse();
    });

    it('returns active statuses', function () {
        $manager = new RecommendationLifecycleManager;
        $active = $manager->activeStatuses();

        expect($active)->toHaveCount(5);
        expect($active)->toContain(LifecycleStatus::Generated);
        expect($active)->toContain(LifecycleStatus::Viewed);
        expect($active)->toContain(LifecycleStatus::Accepted);
        expect($active)->toContain(LifecycleStatus::Applied);
        expect($active)->toContain(LifecycleStatus::Verified);
    });
});
