<?php

namespace App\Services\Crm\Approvals\Catalogs;

final class ApprovalStatusCatalog
{
    // Request statuses
    public const REQUEST_PENDING = 'pending';

    public const REQUEST_APPROVED = 'approved';

    public const REQUEST_REJECTED = 'rejected';

    public const REQUEST_EXPIRED = 'expired';

    public const REQUEST_ESCALATED = 'escalated';

    public const REQUEST_CANCELLED = 'cancelled';

    // Decision statuses
    public const DECISION_PENDING = 'pending';

    public const DECISION_APPROVED = 'approved';

    public const DECISION_REJECTED = 'rejected';

    public const DECISION_ABSTAINED = 'abstained';

    public const REQUEST_ALL = [
        self::REQUEST_PENDING,
        self::REQUEST_APPROVED,
        self::REQUEST_REJECTED,
        self::REQUEST_EXPIRED,
        self::REQUEST_ESCALATED,
        self::REQUEST_CANCELLED,
    ];

    public const DECISION_ALL = [
        self::DECISION_PENDING,
        self::DECISION_APPROVED,
        self::DECISION_REJECTED,
        self::DECISION_ABSTAINED,
    ];

    public static function isValidRequestStatus(string $status): bool
    {
        return in_array($status, self::REQUEST_ALL, true);
    }

    public static function isValidDecision(string $decision): bool
    {
        return in_array($decision, self::DECISION_ALL, true);
    }

    public static function isRequestTerminal(string $status): bool
    {
        return in_array($status, [
            self::REQUEST_APPROVED,
            self::REQUEST_REJECTED,
            self::REQUEST_EXPIRED,
            self::REQUEST_CANCELLED,
        ], true);
    }
}
