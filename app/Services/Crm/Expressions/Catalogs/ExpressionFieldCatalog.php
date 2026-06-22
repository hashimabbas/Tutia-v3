<?php

namespace App\Services\Crm\Expressions\Catalogs;

use App\Services\Crm\Expressions\DTOs\FieldDefinition;

final class ExpressionFieldCatalog
{
    public const TYPE_STRING = 'string';

    public const TYPE_NUMERIC = 'numeric';

    public const TYPE_BOOLEAN = 'boolean';

    public const OP_EQ = '=';

    public const OP_NEQ = '!=';

    public const OP_GT = '>';

    public const OP_GTE = '>=';

    public const OP_LT = '<';

    public const OP_LTE = '<=';

    public const OP_IN = 'in';

    public const OP_NOT_IN = 'not_in';

    public const OP_CONTAINS = 'contains';

    public const OP_STARTS_WITH = 'starts_with';

    public const OP_ENDS_WITH = 'ends_with';

    private const FIELDS = [
        'deal.amount' => [
            'type' => self::TYPE_NUMERIC,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_GT, self::OP_GTE, self::OP_LT, self::OP_LTE],
            'max' => 1000000000,
        ],
        'deal.status' => [
            'type' => self::TYPE_STRING,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_IN, self::OP_CONTAINS],
        ],
        'deal.owner_id' => [
            'type' => self::TYPE_NUMERIC,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_IN, self::OP_NOT_IN],
        ],
        'deal.stage' => [
            'type' => self::TYPE_STRING,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_IN],
        ],
        'project.status' => [
            'type' => self::TYPE_STRING,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_IN],
        ],
        'project.health_score' => [
            'type' => self::TYPE_NUMERIC,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_GT, self::OP_GTE, self::OP_LT, self::OP_LTE],
            'max' => 100,
            'min' => 0,
        ],
        'project.risk_score' => [
            'type' => self::TYPE_NUMERIC,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_GT, self::OP_GTE, self::OP_LT, self::OP_LTE],
            'max' => 100,
            'min' => 0,
        ],
        'customer.type' => [
            'type' => self::TYPE_STRING,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_IN],
        ],
        'customer.segment' => [
            'type' => self::TYPE_STRING,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_IN],
        ],
        'customer.vip' => [
            'type' => self::TYPE_BOOLEAN,
            'operators' => [self::OP_EQ, self::OP_NEQ],
        ],
        'name' => [
            'type' => self::TYPE_STRING,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_CONTAINS, self::OP_STARTS_WITH, self::OP_ENDS_WITH],
        ],
        'code' => [
            'type' => self::TYPE_STRING,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_STARTS_WITH, self::OP_ENDS_WITH],
        ],
        'amount' => [
            'type' => self::TYPE_NUMERIC,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_GT, self::OP_GTE, self::OP_LT, self::OP_LTE],
            'max' => 999999999,
        ],
        'vip' => [
            'type' => self::TYPE_BOOLEAN,
            'operators' => [self::OP_EQ, self::OP_NEQ],
        ],
        'status' => [
            'type' => self::TYPE_STRING,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_IN, self::OP_CONTAINS],
        ],
        'score' => [
            'type' => self::TYPE_NUMERIC,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_GT, self::OP_GTE, self::OP_LT, self::OP_LTE],
            'max' => 100,
            'min' => 0,
        ],
        'active' => [
            'type' => self::TYPE_BOOLEAN,
            'operators' => [self::OP_EQ, self::OP_NEQ],
        ],
        'price' => [
            'type' => self::TYPE_NUMERIC,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_GT, self::OP_GTE, self::OP_LT, self::OP_LTE],
            'max' => 10000000,
        ],
        'temperature' => [
            'type' => self::TYPE_NUMERIC,
            'operators' => [self::OP_EQ, self::OP_NEQ, self::OP_GT, self::OP_GTE, self::OP_LT, self::OP_LTE],
        ],
    ];

    public static function all(): array
    {
        return array_keys(self::FIELDS);
    }

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
            suggestedMax: $config['max'] ?? null,
            suggestedMin: $config['min'] ?? null,
        );
    }

    public static function has(string $path): bool
    {
        return isset(self::FIELDS[$path]);
    }

    public static function numericOperators(): array
    {
        return [self::OP_EQ, self::OP_NEQ, self::OP_GT, self::OP_GTE, self::OP_LT, self::OP_LTE];
    }

    public static function stringOperators(): array
    {
        return [self::OP_EQ, self::OP_NEQ, self::OP_IN, self::OP_NOT_IN, self::OP_CONTAINS, self::OP_STARTS_WITH, self::OP_ENDS_WITH];
    }

    public static function booleanOperators(): array
    {
        return [self::OP_EQ, self::OP_NEQ];
    }

    public static function operatorsByType(string $type): array
    {
        return match ($type) {
            self::TYPE_STRING => self::stringOperators(),
            self::TYPE_NUMERIC => self::numericOperators(),
            self::TYPE_BOOLEAN => self::booleanOperators(),
            default => [],
        };
    }
}
