<?php

namespace App\Services\Crm\Optimization\Impact\DTO;

use JsonSerializable;

readonly class MetricImpact implements JsonSerializable
{
    public function __construct(
        public string $metric,
        public float $before,
        public float $after,
        public float $delta,
        public float $percentage,
        public string $direction,
        public float $weight,
        public float $score,
    ) {}

    public static function compare(
        string $metric,
        float $before,
        float $after,
        float $weight,
        string $direction,
    ): self {
        $rawDelta = $after - $before;

        $delta = self::normalizeDelta($rawDelta, $direction);

        $percentage = $before !== 0.0 ? round(($rawDelta / $before) * 100, 1) : 0.0;

        $score = max(0, min(100, round($delta * 100 * $weight, 1)));

        $dirLabel = match (true) {
            $rawDelta > 0 => 'increased',
            $rawDelta < 0 => 'decreased',
            default => 'unchanged',
        };

        return new self(
            metric: $metric,
            before: $before,
            after: $after,
            delta: round($rawDelta, 4),
            percentage: $percentage,
            direction: $dirLabel,
            weight: $weight,
            score: $score,
        );
    }

    private static function normalizeDelta(float $rawDelta, string $direction): float
    {
        if ($direction === 'higher_is_better') {
            return $rawDelta;
        }

        return -$rawDelta;
    }

    public function isImprovement(): bool
    {
        return $this->score > 0;
    }

    public function jsonSerialize(): array
    {
        return [
            'metric' => $this->metric,
            'before' => $this->before,
            'after' => $this->after,
            'delta' => $this->delta,
            'percentage' => $this->percentage,
            'direction' => $this->direction,
            'weight' => $this->weight,
            'score' => $this->score,
            'is_improvement' => $this->isImprovement(),
        ];
    }
}
