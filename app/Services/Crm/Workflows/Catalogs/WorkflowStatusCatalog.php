<?php

namespace App\Services\Crm\Workflows\Catalogs;

final class WorkflowStatusCatalog
{
    // Workflow run statuses
    public const RUN_PENDING = 'pending';

    public const RUN_RUNNING = 'running';

    public const RUN_COMPLETED = 'completed';

    public const RUN_FAILED = 'failed';

    public const RUN_SKIPPED = 'skipped';

    public const RUN_PAUSED = 'paused';

    public const RUN_ALL = [
        self::RUN_PENDING,
        self::RUN_RUNNING,
        self::RUN_COMPLETED,
        self::RUN_FAILED,
        self::RUN_SKIPPED,
        self::RUN_PAUSED,
    ];

    // Action run statuses
    public const ACTION_PENDING = 'pending';

    public const ACTION_RUNNING = 'running';

    public const ACTION_COMPLETED = 'completed';

    public const ACTION_FAILED = 'failed';

    public const ACTION_SKIPPED = 'skipped';

    public const ACTION_WAITING = 'waiting';

    public const ACTION_ALL = [
        self::ACTION_PENDING,
        self::ACTION_RUNNING,
        self::ACTION_COMPLETED,
        self::ACTION_FAILED,
        self::ACTION_SKIPPED,
        self::ACTION_WAITING,
    ];

    public static function isValidRunStatus(string $status): bool
    {
        return in_array($status, self::RUN_ALL, true);
    }

    public static function isValidActionStatus(string $status): bool
    {
        return in_array($status, self::ACTION_ALL, true);
    }

    public static function isTerminal(string $status): bool
    {
        return in_array($status, [self::RUN_COMPLETED, self::RUN_FAILED, self::RUN_SKIPPED], true);
    }
}
