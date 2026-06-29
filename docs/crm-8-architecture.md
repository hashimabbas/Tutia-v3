# CRM-8 Automation Intelligence Platform — Architecture Document

## 1. Vision & Philosophy

### What CRM-8 Answers

CRM-7 answered: *ماذا حدث؟ ولماذا؟ وما الذي ينبغي فعله؟*

CRM-8 answers: *هل أدى ما اقترحناه إلى تحسين حقيقي؟*

This is a fundamental shift — from **diagnosis & recommendation** to **measurement & verification**. The system no longer stops at "here's what to do"; it tracks whether recommendations were accepted, whether they worked, and builds cumulative knowledge about what improves automation health.

### What CRM-8 Is

An **Optimization Feedback Layer** that sits above execution (CRM-6) and analysis (CRM-7):

```
CRM-3/4 (Domain) → CRM-5 (Communications) → CRM-6 (Automation) → CRM-7 (Intelligence) → CRM-8 (Optimization)
                                          Execution Layer          Analysis Layer         Feedback Layer
```

### Architecture Layers

```
RecommendationService (CRM-7)          WorkflowEngine (CRM-6)          AnalyticsService (CRM-7)
        │                                      │                              │
        ▼ (read only)                          ▼ (read only)                  ▼ (read only)
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                              CRM-8 Optimization Feedback Layer                             │
│                                                                                           │
│  ┌────────────────────────────────────┐  ┌────────────────────────────────────────────┐   │
│  │ Phase 1: Recommendation Lifecycle  │  │ Phase 2: Impact Measurement                │   │
│  │ - State machine (8 states)         │  │ - Before/after snapshot comparison          │   │
│  │ - Snapshot DTO with typed fields   │  │ - Impact score (0-100) per recommendation   │   │
│  │ - Version tracking per rec         │  │ - Verification window with scheduling       │   │
│  │ - Target (polymorphic: workflow,   │  │                                            │   │
│  │   approval, project, ...)          │  │                                            │   │
│  └──────────────────┬─────────────────┘  └──────────────────┬─────────────────────────┘   │
│                     │                                        │                            │
│                     ▼                                        ▼                            │
│  ┌────────────────────────────────────┐  ┌────────────────────────────────────────────┐   │
│  │ Phase 3: Automation Score          │  │ Phase 4: Optimization Center UI             │   │
│  │ - Score 0-100 (NOT impact)         │  │ - Unified dashboard                         │   │
│  │ - Components: health, stability,   │  │ - Lifecycle timeline viewer                  │   │
│  │   retry, intervention, adoption    │  │ - Score breakdown per target                │   │
│  │ - Trend detection                  │  │ - Filters by type/status/score              │   │
│  └────────────────────────────────────┘  └────────────────────────────────────────────┘   │
│                                                                                           │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ Phase 5: Continuous Improvement                                                     │   │
│  │ - Automation Maturity model (manual → semi → automated → optimized → self-monitor)  │   │
│  │ - Cumulative knowledge base of what improves automation health                      │   │
│  └────────────────────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Read-only from CRM-6/CRM-7** | CRM-8 consumes data only. No modification to workflows, expressions, analytics, or recommendations. |
| **Target instead of workflow_id** | `target_type` + `target_id` (polymorphic) keeps CRM-8 module-agnostic for future use with approvals, customers, or projects. |
| **Snapshot as typed DTO, not JSON blob** | Phase 4+ reads snapshots frequently. Typed DTO ensures schema stability and queryability. |
| **State Machine, not just status** | Enables automation later: auto-verify, auto-expire, re-surface dismissed recommendations. |
| **Score ≠ Impact** | Impact = "did it improve?" (per recommendation). Score = "how valuable is this target overall?" (aggregated). |

---

## 2. Phase 1 — Recommendation Lifecycle

This is the foundation of CRM-8. Everything else builds on lifecycle data.

### State Machine

```
                    ┌──────────────────────────────────────────────┐
                    │                                              │
                    ▼                                              │
    ┌─────────┐  ┌──────┐  ┌──────────┐  ┌────────┐  ┌─────────┐ │
    │GENERATED──▶│VIEWED──▶│ACCEPTED───▶│APPLIED───▶│VERIFIED──┤ │
    └─────────┘  └──────┘  └──┬───────┘  └────────┘  └────┬────┘ │
                              │                            │      │
                              ▼                            ▼      │
                        ┌──────────┐                  ┌─────────┐│
                        │REJECTED  │                  │COMPLETED││
                        └──────────┘                  └─────────┘│
                                                      ┌─────────┐│
                                                      │  FAILED │┘
                                          ┌────────┐  └─────────┘
                                          │EXPIRED │
                                          └────────┘
                                    ┌───────────┐
                                    │CANCELLED  │
                                    └───────────┘
```

### Valid Transitions

| From | To | Trigger |
|------|----|---------|
| `generated` | `viewed` | User views recommendation in UI |
| `generated` | `dismissed` | User dismisses without viewing |
| `viewed` | `accepted` | User explicitly accepts |
| `viewed` | `dismissed` | User dismisses after viewing |
| `accepted` | `applied` | Recommendation action is implemented |
| `accepted` | `rejected` | User rejects recommendation |
| `applied` | `verified` | System verifies the application (enters verification window) |
| `verified` | `completed` | Impact measurement confirms improvement |
| `verified` | `failed` | Impact measurement shows no improvement or regression |
| `accepted` | `expired` | Acceptance window expires without application |
| `applied` | `expired` | Verification deadline passes |
| `generated` | `cancelled` | System cancels (e.g., condition resolved automatically) |
| `viewed` | `cancelled` | System cancels |

### Lifecycle Event Record

Each transition creates an immutable event:

```php
readonly class RecommendationLifecycleEvent {
    public function __construct(
        public string $recommendationType,     // Maps to CRM-7 RecommendationType
        public LifecycleStatus $status,
        public RecommendationTarget $target,
        public RecommendationSnapshot $snapshot,
        public ?RecommendationVersion $version,
        public array $metadata,                 // User ID, UI context, timestamps
        public Carbon $statusChangedAt,
    ) {}
}
```

### LifecycleStatus Enum

```php
enum LifecycleStatus: string {
    case Generated = 'generated';
    case Viewed = 'viewed';
    case Dismissed = 'dismissed';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Applied = 'applied';
    case Verified = 'verified';
    case Completed = 'completed';
    case Failed = 'failed';
    case Expired = 'expired';
    case Cancelled = 'cancelled';
}
```

### RecommendationTarget (Polymorphic)

```php
readonly class RecommendationTarget {
    public function __construct(
        public string $targetType,     // workflow, approval, project, customer
        public int $targetId,
        public ?string $targetLabel,   // Human-readable name for UI
    ) {}
}
```

### RecommendationSnapshot (Typed DTO)

```php
readonly class RecommendationSnapshot {
    public function __construct(
        public array $metrics,               // {failure_rate: 0.31, avg_retries: 2.4, ...}
        public ?float $healthScore,
        public ?string $trend,               // improving, degrading, stable
        public string $recommendationVersion, // e.g., "reduce_retries.v1"
        public Carbon $generatedAt,
        public array $context,               // Free-form context from CRM-7 recommendation
    ) {}
}
```

### RecommendationVersion

```php
readonly class RecommendationVersion {
    public function __construct(
        public string $type,          // e.g., "reduce_retries"
        public int $versionNumber,    // 1, 2, 3...
        public int $priority,         // 0–100 (captures changing priority over time)
        public array $parameters,     // {retry_limit: 3, sla_hours: 48, ...}
        public Carbon $generatedAt,
    ) {}
}
```

### Database Migration

```php
// Migration 800001 — Recommendation Lifecycle Foundation
Schema::create('crm_recommendation_lifecycle_events', function (Blueprint $table) {
    $table->id();
    $table->string('recommendation_type', 100);
    $table->string('status', 30);                    // LifecycleStatus
    $table->string('target_type', 50);               // Polymorphic target
    $table->unsignedBigInteger('target_id');
    $table->json('snapshot');                         // RecommendationSnapshot DTO
    $table->json('version')->nullable();              // RecommendationVersion DTO
    $table->json('metadata')->nullable();
    $table->timestamp('status_changed_at');
    $table->timestamps();

    $table->index(['target_type', 'target_id']);
    $table->index(['recommendation_type', 'status']);
    $table->index('status_changed_at');
});
```

---

## 3. Phase 2 — Impact Measurement

Builds on Phase 1 lifecycle data.

### Impact Flow

```
1. Recommendation reaches "applied" status
        │
        ▼
2. SnapshotService.captureBefore()
   - Reads CRM-6 workflow_runs for 7 days before application date
   - Computes: failure_rate, avg_retries, sla_breach_rate, human_intervention
        │
        ▼
3. Verification window begins (configurable per rec type, default: 7 days)
        │
        ▼
4. After window: SnapshotService.captureAfter()
   - Same metrics, same period duration, same computation
        │
        ▼
5. ImpactCalculator.compute()
   - For each metric: improvement = (before - after) / before
   - Impact Score = weighted average of improvements (capped 0–100)
   - delta = {failure_rate: -0.22, avg_retries: -1.1, ...}
        │
        ▼
6. Lifecycle transitions to "completed" (positive impact) or "failed" (no/negative impact)
```

### Impact Score Formula

```
impact_score = Σ(max(0, metric_improvement_i) × weight_i) × 100

metric_improvement = (before - after) / before  (capped at 1.0)

Weights:
  failure_rate:        0.40
  avg_retries:         0.20
  sla_breach_rate:     0.30
  human_intervention:  0.10
```

### ImpactResult DTO

```php
readonly class ImpactResult {
    public function __construct(
        public ?float $impactScore,           // 0–100, null if not yet calculated
        public array $beforeMetrics,          // {failure_rate: 0.31, ...}
        public array $afterMetrics,           // {failure_rate: 0.11, ...}
        public array $delta,                  // {failure_rate: -0.20, ...}
        public string $verificationStatus,    // pending, in_progress, completed, failed
        public int $verificationWindowDays,
        public Carbon $appliedAt,
        public ?Carbon $verifiedAt,
    ) {}
}
```

### Impact ≠ Score

| Concept | Scope | Scale | Update Frequency |
|---------|-------|-------|-----------------|
| **Impact** | Single recommendation × single application | 0–100 | Once per verification |
| **Score** | Aggregate across all recommendations for a target | 0–100 | Hourly (scheduled) |

Impact answers: "Did this specific recommendation improve things?"
Score answers: "How well-optimized is this target overall?"

---

## 4. Phase 3 — Automation Score

### Score Components

```
AutomationScore = Σ(component_score × weight) / Σ(weights)

Component               Weight    Source
──────────────────────── ───────   ───────────────────────────
Health                   0.25     CRM-7 HealthScoreService
Stability                0.20     Inverse of failure_rate (30 days)
Retry Efficiency         0.15     Inverse of avg_retries (30 days)
Human Intervention       0.10     Inverse of manual intervention ratio
Recommendation Adoption  0.10     % accepted of all non-expired recommendations
Recommendation Success   0.10     % completed of all applied recommendations
SLA Compliance           0.10     % runs within expected duration
```

### AutomationScore DTO

```php
readonly class AutomationScore {
    public function __construct(
        public RecommendationTarget $target,
        public int $score,                            // 0–100
        public AutomationScoreComponents $components,
        public AutomationTrend $trend,
        public Carbon $calculatedAt,
    ) {}
}

readonly class AutomationScoreComponents {
    public function __construct(
        public float $health,
        public float $stability,
        public float $retryEfficiency,
        public float $humanIntervention,
        public float $recommendationAdoption,
        public float $recommendationSuccess,
        public float $slaCompliance,
    ) {}
}

readonly class AutomationTrend {
    public function __construct(
        public string $direction,    // up, down, stable
        public int $delta,           // change from last score
        public int $previousScore,
    ) {}
}
```

---

## 5. Phase 4 — Optimization Center UI

### Pages

```
resources/js/pages/crm/optimization/
└── index.tsx                              ← Single-page Optimization Center (Inertia)
    └── components/
        ├── OverviewCards.tsx              ← 4 KPI cards
        ├── LifecycleTimeline.tsx           ← Vertical timeline for single recommendation
        ├── RecommendationTable.tsx        ← All recommendations with status/impact/score
        ├── ScoreBreakdown.tsx             ← Score bar chart per component
        ├── TrendIndicator.tsx             ← ↑/→/↓ arrow with colour
        ├── ImpactBadge.tsx               ← +22% green / -5% red badge
        ├── StatusBadge.tsx               ← Coloured badge per lifecycle status (8 states)
        ├── SnapshotViewer.tsx            ← Before/after metric comparison
        └── FilterBar.tsx                 ← By type, status, target, date range
```

### StatusBadge Color Map

| Status | Colour |
|--------|--------|
| `generated` | Gray |
| `viewed` | Blue |
| `accepted` | Indigo |
| `rejected` | Red/outline |
| `applied` | Purple |
| `verified` | Amber |
| `completed` | Emerald |
| `failed` | Red |
| `dismissed` | Slate |
| `expired` | Amber/outline |
| `cancelled` | Slate/outline |

---

## 6. Implementation Roadmap

```
Phase 1 — Recommendation Lifecycle  ⭐ (CURRENT)
  3 migrations
  RecommendationLifecycleEvent model
  LifecycleStatus enum
  RecommendationTarget DTO
  RecommendationSnapshot DTO
  RecommendationVersion DTO
  RecommendationLifecycleService
  RecommendationLifecycleManager (state machine)
  RecommendationSnapshotService
  LifecycleController + Resource
  Lifecycle Timeline UI
  Snapshot Viewer
  Audit Timeline
  35–45 tests

Phase 2 — Impact Measurement
  SnapshotService (captureBefore/captureAfter)
  ImpactCalculator
  ImpactResult DTO
  ImpactVerificationService
  php artisan crm:process-verifications command
  ImpactController
  25–30 tests

Phase 3 — Automation Score
  AutomationScore DTO + Components + Trend
  AutomationScoreService + Calculator
  php artisan crm:recalculate-scores command
  AutomationScoreController
  20–25 tests

Phase 4 — Optimization Center UI
  Inertia page + 10 components
  OptimizationController
  Integration with Phase 1–3 APIs
  10 feature tests

Phase 5 — Continuous Improvement
  Automation Maturity model
  Cumulative knowledge base
  Trend analysis (30/60/90 day)
  Scheduled degradation alerts
```

---

## 7. What Does NOT Change

| System | What Does NOT Change | Reason |
|--------|---------------------|--------|
| CRM-6 WorkflowEngine | Nothing | CRM-8 reads workflow_runs only |
| CRM-6 ApprovalEngine | Nothing | CRM-8 reads approval data only |
| CRM-7 RecommendationService | Nothing | CRM-8 tracks lifecycle externally |
| CRM-7 RecommendationExplanationFactory | Nothing | CRM-8 reads explanation output, doesn't modify it |
| CRM-7 Expression Engine | Nothing | CRM-8 doesn't evaluate expressions |
| CRM-7 Analytics Service | Nothing | CRM-8 reads health scores as data |
| CRM-7 HealthScoreService | Nothing | CRM-8 consumes health scores, doesn't compute them |
| CRM-5 Communications | Nothing | CRM-8 has no notification features |
| CRM-4 Delivery OS | Nothing | No interaction |
| CRM-3 Sales OS | Nothing | No interaction |
| All existing migrations | Nothing | CRM-8 adds new tables only |

---

> **Approved for Phase 1 — Recommendation Lifecycle.** Implementation begins with the 3 migrations and core services. All feedback integrated: state machine, typed snapshot DTO, version tracking, polymorphic target, score/impact separation, lifecycle-first ordering.
