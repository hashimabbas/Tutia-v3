<?php

namespace App\Services\Crm\Analytics\Catalogs;

use App\Services\Crm\Expressions\DTOs\FieldDefinition;

final class ApprovalAnalyticsFieldCatalog
{
    private const FIELDS = [
        'approval.status' => ['type' => 'string', 'operators' => ['=', '!=', 'in']],
        'approval.total' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'approval.approved' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'approval.rejected' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'approval.pending' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'approval.escalated' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'approval.approval_rate' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<='], 'min' => 0, 'max' => 100],
        'approval.rejection_rate' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<='], 'min' => 0, 'max' => 100],
        'approval.escalation_rate' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<='], 'min' => 0, 'max' => 100],
        'approval.avg_resolution_minutes' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'approval.health_score' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<='], 'min' => 0, 'max' => 100],
        'approval.approver_count' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<=']],
        'approval.sla_compliance' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<='], 'min' => 0, 'max' => 100],
        'approval.expiry_rate' => ['type' => 'numeric', 'operators' => ['=', '!=', '>', '>=', '<', '<='], 'min' => 0, 'max' => 100],
    ];

    private const DATA_MAP = [
        'approval.total' => 'total',
        'approval.approved' => 'approved',
        'approval.rejected' => 'rejected',
        'approval.pending' => 'pending',
        'approval.escalated' => 'escalated',
        'approval.approval_rate' => 'approvalRate',
        'approval.rejection_rate' => 'rejectionRate',
        'approval.escalation_rate' => 'escalationRate',
        'approval.avg_resolution_minutes' => 'avgResolutionMinutes',
        'approval.health_score' => 'score',
        'approval.status' => 'status',
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
