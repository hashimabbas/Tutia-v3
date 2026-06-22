<?php

namespace App\Services\Crm\Analytics\Catalogs;

use App\Services\Crm\Expressions\DTOs\FieldDefinition;

final class WorkflowAnalyticsFieldCatalog
{
    private const FIELDS = [
        'workflow.status' => ['type' => 'string', 'operators' => ['=', '!=', 'in']],
        'workflow.total_runs' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'workflow.completed' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'workflow.failed' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'workflow.paused' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'workflow.success_rate' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<='], 'min' => 0, 'max' => 100],
        'workflow.failure_rate' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<='], 'min' => 0, 'max' => 100],
        'workflow.health_score' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<='], 'min' => 0, 'max' => 100],
        'workflow.trigger_count' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'workflow.avg_duration_seconds' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'workflow.action_failure_rate' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<='], 'min' => 0, 'max' => 100],
        'workflow.escalation_count' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'workflow.trend' => ['type' => 'string', 'operators' => ['=', '!=']],
    ];

    private const DATA_MAP = [
        'workflow.total_runs' => 'totalRuns',
        'workflow.completed' => 'completed',
        'workflow.failed' => 'failed',
        'workflow.paused' => 'paused',
        'workflow.success_rate' => 'successRate',
        'workflow.failure_rate' => 'failureRate',
        'workflow.health_score' => 'score',
        'workflow.trigger_count' => 'totalRuns',
        'workflow.status' => 'status',
        'workflow.avg_duration_seconds' => 'avgDurationSeconds',
        'workflow.action_failure_rate' => 'actionFailureRate',
        'workflow.escalation_count' => 'escalationCount',
        'workflow.trend' => 'trend',
    ];

    public static function find(string $path): ?FieldDefinition
    {
        if (! isset(self::FIELDS[$path])) {
            return null;
        }

        $config = self::FIELDS[$path];

        return new FieldDefinition(
            path: $path,
            type: $config['type'],
            supportedOperators: $config['operators'],
            suggestedMin: $config['min'] ?? null,
            suggestedMax: $config['max'] ?? null,
        );
    }

    public static function has(string $path): bool
    {
        return isset(self::FIELDS[$path]);
    }

    /** @return FieldDefinition[] */
    public static function all(): array
    {
        return array_map(fn (string $path) => self::find($path), array_keys(self::FIELDS));
    }

    public static function normalizeData(array $item): array
    {
        $result = [];

        foreach (self::DATA_MAP as $fieldPath => $dataKey) {
            if (array_key_exists($dataKey, $item)) {
                $parts = explode('.', $fieldPath);
                $current = &$result;
                foreach ($parts as $part) {
                    if (! isset($current[$part])) {
                        $current[$part] = [];
                    }
                    $current = &$current[$part];
                }
                $current = $item[$dataKey];
                unset($current);
            }
        }

        return $result + ['status' => 'active'];
    }
}
