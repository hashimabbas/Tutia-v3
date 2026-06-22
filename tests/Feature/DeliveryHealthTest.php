<?php

use App\Models\CrmChangeOrder;
use App\Models\CrmHealthSnapshot;
use App\Models\CrmIssue;
use App\Models\CrmMilestone;
use App\Models\CrmOrganization;
use App\Models\CrmProject;
use App\Models\CrmProjectRisk;
use App\Models\User;
use App\Services\Crm\Projects\Health\Contributors\ContributorInterface;
use App\Services\Crm\Projects\Health\DeliveryHealthResult;
use App\Services\Crm\Projects\Health\DeliveryHealthService;
use App\Services\Crm\Projects\Health\RuleBasedDeliveryHealthScorer;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

function createTestProject(array $overrides = []): CrmProject
{
    $user = User::factory()->create();
    $org = CrmOrganization::factory()->create(['name' => 'Test Org', 'created_by' => $user->id]);

    return CrmProject::create(array_merge([
        'name' => 'Test Project',
        'organization_id' => $org->id,
        'status' => 'active',
        'customer_sentiment' => 'positive',
        'created_by' => $user->id,
    ], $overrides));
}

it('calculates healthy tier for well-running project', function () {
    $project = createTestProject(['customer_sentiment' => 'positive']);

    CrmMilestone::create(['project_id' => $project->id, 'name' => 'M1', 'status' => 'completed', 'start_date' => '2026-01-01', 'end_date' => '2026-01-15', 'actual_end_date' => '2026-01-14', 'sort_order' => 1]);
    CrmMilestone::create(['project_id' => $project->id, 'name' => 'M2', 'status' => 'completed', 'start_date' => '2026-01-16', 'end_date' => '2026-02-01', 'actual_end_date' => '2026-01-30', 'sort_order' => 2]);

    $result = app(DeliveryHealthService::class)->calculate($project);

    expect($result->score)->toBeGreaterThanOrEqual(80);
    expect($result->tier)->toBe('healthy');
    expect(count($result->factors))->toBe(6);
});

it('calculates critical tier for troubled project', function () {
    $project = createTestProject(['customer_sentiment' => 'negative']);

    CrmMilestone::create(['project_id' => $project->id, 'name' => 'M1', 'status' => 'pending', 'sort_order' => 1]);
    CrmMilestone::create(['project_id' => $project->id, 'name' => 'M2', 'status' => 'completed', 'end_date' => '2026-01-15', 'actual_end_date' => '2026-02-01', 'sort_order' => 2]);

    CrmProjectRisk::create(['project_id' => $project->id, 'description' => 'Critical risk', 'severity' => 'critical', 'status' => 'identified']);
    CrmProjectRisk::create(['project_id' => $project->id, 'description' => 'High risk', 'severity' => 'high', 'status' => 'identified']);
    CrmProjectRisk::create(['project_id' => $project->id, 'description' => 'Medium risk', 'severity' => 'medium', 'status' => 'identified']);

    CrmIssue::create(['project_id' => $project->id, 'description' => 'Blocker issue', 'severity' => 'blocker', 'status' => 'open']);
    CrmIssue::create(['project_id' => $project->id, 'description' => 'Critical issue', 'severity' => 'critical', 'status' => 'open']);

    CrmChangeOrder::create(['project_id' => $project->id, 'title' => 'CO1', 'cost_impact' => 1000, 'timeline_impact_days' => 5, 'status' => 'approved', 'approved_at' => now()]);
    CrmChangeOrder::create(['project_id' => $project->id, 'title' => 'CO2', 'cost_impact' => 2000, 'timeline_impact_days' => 3, 'status' => 'approved', 'approved_at' => now()]);
    CrmChangeOrder::create(['project_id' => $project->id, 'title' => 'CO3', 'cost_impact' => 500, 'timeline_impact_days' => 2, 'status' => 'approved', 'approved_at' => now()]);

    $result = app(DeliveryHealthService::class)->calculate($project);

    expect($result->score)->toBeLessThan(50);
    expect($result->tier)->toBe('critical');
});

it('calculates at_risk tier for mixed project', function () {
    $project = createTestProject(['customer_sentiment' => 'neutral']);

    CrmMilestone::create(['project_id' => $project->id, 'name' => 'M1', 'status' => 'completed', 'end_date' => '2026-01-15', 'actual_end_date' => '2026-01-14', 'sort_order' => 1]);
    CrmMilestone::create(['project_id' => $project->id, 'name' => 'M2', 'status' => 'pending', 'sort_order' => 2]);

    CrmProjectRisk::create(['project_id' => $project->id, 'description' => 'High risk', 'severity' => 'high', 'status' => 'identified']);
    CrmProjectRisk::create(['project_id' => $project->id, 'description' => 'Medium risk', 'severity' => 'medium', 'status' => 'identified']);
    CrmProjectRisk::create(['project_id' => $project->id, 'description' => 'Medium risk 2', 'severity' => 'medium', 'status' => 'identified']);

    CrmIssue::create(['project_id' => $project->id, 'description' => 'Major issue', 'severity' => 'major', 'status' => 'open']);

    $result = app(DeliveryHealthService::class)->calculate($project);

    expect($result->score)->toBeGreaterThanOrEqual(50);
    expect($result->score)->toBeLessThan(80);
    expect($result->tier)->toBe('at_risk');
});

it('handles project with no milestones gracefully', function () {
    $project = createTestProject();

    $result = app(DeliveryHealthService::class)->calculate($project);

    expect($result->score)->toBeGreaterThanOrEqual(0);
    expect($result->tier)->toBeIn(['healthy', 'at_risk', 'critical']);
});

it('persists snapshot on recalculate', function () {
    $project = createTestProject();
    CrmMilestone::create(['project_id' => $project->id, 'name' => 'M1', 'status' => 'completed', 'end_date' => '2026-01-15', 'actual_end_date' => '2026-01-14', 'sort_order' => 1]);

    $result = app(DeliveryHealthService::class)->recalculate($project);

    $snapshot = CrmHealthSnapshot::where('healthable_type', $project->getMorphClass())
        ->where('healthable_id', $project->id)
        ->first();

    expect($snapshot)->not->toBeNull();
    expect($snapshot->score)->toBe($result->score);
    expect($snapshot->tier)->toBe($result->tier);
    expect($snapshot->scorer)->toBe('RuleBasedDeliveryHealthScorer');
});

it('returns latest snapshot as DeliveryHealthResult', function () {
    $project = createTestProject();
    CrmMilestone::create(['project_id' => $project->id, 'name' => 'M1', 'status' => 'completed', 'end_date' => '2026-01-15', 'actual_end_date' => '2026-01-14', 'sort_order' => 1]);

    app(DeliveryHealthService::class)->recalculate($project);

    $latest = app(DeliveryHealthService::class)->latest($project);

    expect($latest)->not->toBeNull();
    expect($latest)->toBeInstanceOf(DeliveryHealthResult::class);
    expect($latest->score)->toBeGreaterThan(0);
});

it('returns null for latest when no snapshots exist', function () {
    $project = createTestProject();

    $latest = app(DeliveryHealthService::class)->latest($project);

    expect($latest)->toBeNull();
});

it('returns history of snapshots', function () {
    $project = createTestProject();
    CrmMilestone::create(['project_id' => $project->id, 'name' => 'M1', 'status' => 'completed', 'end_date' => '2026-01-15', 'actual_end_date' => '2026-01-14', 'sort_order' => 1]);

    $service = app(DeliveryHealthService::class);
    $service->recalculate($project);
    $service->recalculate($project);
    $service->recalculate($project);

    $history = $service->history($project, 2);

    expect(count($history))->toBe(2);
    foreach ($history as $h) {
        expect($h)->toBeInstanceOf(DeliveryHealthResult::class);
    }
});

it('allows adding custom contributors via scorer', function () {
    $project = createTestProject();

    $scorer = app(RuleBasedDeliveryHealthScorer::class);
    $scorer->addContributor(
        new class implements ContributorInterface
        {
            public function calculate(CrmProject $project): array
            {
                return ['name' => 'Custom Check', 'weight' => 5, 'score' => 5, 'details' => []];
            }
        },
    );

    $result = $scorer->calculate($project);

    $customFactor = collect($result->factors)->firstWhere('name', 'Custom Check');
    expect($customFactor)->not->toBeNull();
    expect($customFactor['score'])->toBe(5);
});

it('returns correct milestone progress factor details', function () {
    $project = createTestProject();
    CrmMilestone::create(['project_id' => $project->id, 'name' => 'M1', 'status' => 'completed', 'sort_order' => 1]);
    CrmMilestone::create(['project_id' => $project->id, 'name' => 'M2', 'status' => 'in_progress', 'sort_order' => 2]);
    CrmMilestone::create(['project_id' => $project->id, 'name' => 'M3', 'status' => 'pending', 'sort_order' => 3]);

    $result = app(DeliveryHealthService::class)->calculate($project);

    $factor = collect($result->factors)->firstWhere('name', 'Milestone Progress');
    expect($factor['details']['total'])->toBe(3);
    expect($factor['details']['completed'])->toBe(1);
    expect($factor['details']['percent_complete'])->toBe(33);
});

it('correctly calculates schedule variance for delayed milestones', function () {
    $project = createTestProject();
    CrmMilestone::create(['project_id' => $project->id, 'name' => 'On time', 'status' => 'completed', 'end_date' => '2026-01-15', 'actual_end_date' => '2026-01-14', 'sort_order' => 1]);
    CrmMilestone::create(['project_id' => $project->id, 'name' => 'Delayed', 'status' => 'completed', 'end_date' => '2026-01-15', 'actual_end_date' => '2026-02-01', 'sort_order' => 2]);
    CrmMilestone::create(['project_id' => $project->id, 'name' => 'Pending', 'status' => 'pending', 'sort_order' => 3]);

    $result = app(DeliveryHealthService::class)->calculate($project);

    $factor = collect($result->factors)->firstWhere('name', 'Schedule Variance');
    expect($factor['details']['on_time'])->toBe(1);
    expect($factor['details']['delayed'])->toBe(1);
});
