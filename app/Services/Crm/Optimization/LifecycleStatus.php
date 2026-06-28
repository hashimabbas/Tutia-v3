<?php

namespace App\Services\Crm\Optimization;

enum LifecycleStatus: string
{
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

    public function label(): string
    {
        return match ($this) {
            self::Generated => 'Generated',
            self::Viewed => 'Viewed',
            self::Dismissed => 'Dismissed',
            self::Accepted => 'Accepted',
            self::Rejected => 'Rejected',
            self::Applied => 'Applied',
            self::Verified => 'Verified',
            self::Completed => 'Completed',
            self::Failed => 'Failed',
            self::Expired => 'Expired',
            self::Cancelled => 'Cancelled',
        };
    }
}
