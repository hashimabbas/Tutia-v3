<?php

use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('Recommendation Lifecycle API', function () {
    it('tracks a generated event', function () {
        $response = $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'generated',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => [
                'metrics' => ['failure_rate' => 0.31],
            ],
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'recommendation_type' => 'reduce_retries',
            'status' => 'generated',
            'target' => [
                'target_type' => 'workflow',
                'target_id' => 1,
            ],
            'snapshot' => [
                'metrics' => ['failure_rate' => 0.31],
                'recommendation_version' => 'v1',
            ],
        ]);
    });

    it('tracks an event with all optional fields', function () {
        $response = $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'increase_sla',
            'status' => 'generated',
            'target_type' => 'workflow',
            'target_id' => 5,
            'target_label' => 'Critical Escalation',
            'snapshot' => [
                'metrics' => ['failure_rate' => 0.15, 'avg_retries' => 1.2],
                'health_score' => 88.0,
                'trend' => 'improving',
                'recommendation_version' => 'v2',
                'context' => ['source' => 'dashboard'],
            ],
            'version' => [
                'type' => 'increase_sla',
                'version_number' => 2,
                'priority' => 75,
                'parameters' => ['sla_hours' => 24],
            ],
            'metadata' => ['user_id' => 42, 'ui' => 'optimization_center'],
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('snapshot.health_score', 88.0);
        $response->assertJsonPath('version.priority', 75);
        $response->assertJsonPath('metadata.user_id', 42);
    });

    it('requires tracking fields', function () {
        $response = $this->postJson('/crm/optimization/recommendations/track', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['recommendation_type', 'status', 'target_type', 'target_id', 'snapshot']);
    });

    it('requires valid status', function () {
        $response = $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'invalid_status',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $response->assertStatus(422);
    });

    it('allows empty snapshot metrics', function () {
        $response = $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'generated',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => []],
        ]);

        $response->assertStatus(201);
    });

    it('lists events', function () {
        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'generated',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'increase_sla',
            'status' => 'generated',
            'target_type' => 'workflow',
            'target_id' => 2,
            'snapshot' => ['metrics' => ['failure_rate' => 0.15]],
        ]);

        $response = $this->getJson('/crm/optimization/recommendations');
        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
    });

    it('filters events by type', function () {
        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'generated',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'increase_sla',
            'status' => 'generated',
            'target_type' => 'workflow',
            'target_id' => 2,
            'snapshot' => ['metrics' => ['failure_rate' => 0.15]],
        ]);

        $response = $this->getJson('/crm/optimization/recommendations?recommendation_type=reduce_retries');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        expect($response->json('data.0.recommendation_type'))->toBe('reduce_retries');
    });

    it('filters events by status', function () {
        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'generated',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'viewed',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $response = $this->getJson('/crm/optimization/recommendations?status=viewed');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        expect($response->json('data.0.status'))->toBe('viewed');
    });

    it('gets status for recommendation type and target', function () {
        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'generated',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $response = $this->getJson('/crm/optimization/recommendations/reduce_retries/status?target_type=workflow&target_id=1');
        $response->assertStatus(200);
        $response->assertJson([
            'current_status' => 'generated',
            'is_terminal' => false,
        ]);
        expect($response->json('allowed_transitions'))->toHaveCount(3);
    });

    it('requires target_type and target_id for status endpoint', function () {
        $response = $this->getJson('/crm/optimization/recommendations/reduce_retries/status');
        $response->assertStatus(422);
        expect($response->json('error'))->toBe('target_type and target_id are required');
    });

    it('returns empty status for non-existent recommendation', function () {
        $response = $this->getJson('/crm/optimization/recommendations/unknown/status?target_type=workflow&target_id=999');
        $response->assertStatus(200);
        expect($response->json('current_status'))->toBeNull();
        expect($response->json('allowed_transitions'))->toBeEmpty();
    });

    it('gets snapshot from event', function () {
        $trackResponse = $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'generated',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => [
                'metrics' => ['failure_rate' => 0.31],
                'health_score' => 72.0,
                'trend' => 'degrading',
            ],
        ]);

        $eventId = $trackResponse->json('id') ?? 1;

        $response = $this->getJson("/crm/optimization/recommendations/{$eventId}/snapshot");
        $response->assertStatus(200);
        $response->assertJson([
            'metrics' => ['failure_rate' => 0.31],
            'health_score' => 72.0,
            'trend' => 'degrading',
        ]);
    });

    it('returns 404 for non-existent event snapshot', function () {
        $response = $this->getJson('/crm/optimization/recommendations/99999/snapshot');
        $response->assertStatus(404);
    });

    it('tracks full lifecycle via API', function () {
        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'generated',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'viewed',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'accepted',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'applied',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'verified',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'completed',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $response = $this->getJson('/crm/optimization/recommendations/reduce_retries/status?target_type=workflow&target_id=1');
        $response->assertJson([
            'current_status' => 'completed',
            'is_terminal' => true,
        ]);
    });

    it('rejects invalid state transition via API', function () {
        $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'generated',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $response = $this->postJson('/crm/optimization/recommendations/track', [
            'recommendation_type' => 'reduce_retries',
            'status' => 'completed',
            'target_type' => 'workflow',
            'target_id' => 1,
            'snapshot' => ['metrics' => ['failure_rate' => 0.31]],
        ]);

        $response->assertStatus(500);
    });

    it('requires authentication for all endpoints', function () {
        auth()->logout();
        $this->getJson('/crm/optimization/recommendations')->assertStatus(302);
        $this->postJson('/crm/optimization/recommendations/track', [])->assertStatus(302);
    });
});
