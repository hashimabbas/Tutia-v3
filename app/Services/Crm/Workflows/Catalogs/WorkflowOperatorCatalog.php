<?php

namespace App\Services\Crm\Workflows\Catalogs;

final class WorkflowOperatorCatalog
{
    public const EQ = 'eq';

    public const NEQ = 'neq';

    public const GT = 'gt';

    public const GTE = 'gte';

    public const LT = 'lt';

    public const LTE = 'lte';

    public const IN = 'in';

    public const NOT_IN = 'not_in';

    public const CONTAINS = 'contains';

    public const IS_EMPTY = 'is_empty';

    public const NOT_EMPTY = 'not_empty';

    public const ALL = [
        self::EQ,
        self::NEQ,
        self::GT,
        self::GTE,
        self::LT,
        self::LTE,
        self::IN,
        self::NOT_IN,
        self::CONTAINS,
        self::IS_EMPTY,
        self::NOT_EMPTY,
    ];

    public static function isValid(string $operator): bool
    {
        return in_array($operator, self::ALL, true);
    }

    public static function requiresArrayValue(string $operator): bool
    {
        return in_array($operator, [self::IN, self::NOT_IN], true);
    }
}
