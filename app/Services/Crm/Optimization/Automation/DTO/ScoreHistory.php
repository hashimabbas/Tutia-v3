<?php

namespace App\Services\Crm\Optimization\Automation\DTO;

use JsonSerializable;

readonly class ScoreHistory implements JsonSerializable
{
    public function __construct(
        public array $snapshots,
        public ?ScoreTrend $trend = null,
        public array $regressionEvents = [],
        public array $milestones = [],
    ) {}

    public function earliest(): ?AutomationScoreSnapshot
    {
        return $this->snapshots[0] ?? null;
    }

    public function latest(): ?AutomationScoreSnapshot
    {
        $snapshots = array_values($this->snapshots);

        return ! empty($snapshots) ? $snapshots[count($snapshots) - 1] : null;
    }

    public function overallChange(): float
    {
        $earliest = $this->earliest();
        $latest = $this->latest();

        if ($earliest === null || $latest === null) {
            return 0.0;
        }

        return round($latest->overallScore - $earliest->overallScore, 2);
    }

    public function jsonSerialize(): array
    {
        return [
            'snapshots' => array_map(fn (AutomationScoreSnapshot $s) => $s->jsonSerialize(), $this->snapshots),
            'trend' => $this->trend?->jsonSerialize(),
            'regression_events' => $this->regressionEvents,
            'milestones' => $this->milestones,
            'overall_change' => $this->overallChange(),
        ];
    }
}
