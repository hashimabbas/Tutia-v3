<?php

namespace App\Services\Crm\Workflows\Catalogs;

final class WorkflowActionCatalog
{
    // Communication actions (reuse CRM-5 channels via NotificationCoordinator)
    public const SEND_EMAIL = 'send_email';

    public const SEND_WHATSAPP = 'send_whatsapp';

    public const SEND_SMS = 'send_sms';

    public const SEND_PORTAL_NOTIFICATION = 'send_portal_notification';

    // CRM actions (managed by CrmActionService)
    public const CREATE_ACTIVITY = 'create_activity';

    public const CREATE_TASK = 'create_task';

    public const CREATE_NOTE = 'create_note';

    public const ASSIGN_OWNER = 'assign_owner';

    public const UPDATE_STATUS = 'update_status';

    // Project actions (new business state via services)
    public const CREATE_RISK = 'create_risk';

    public const CREATE_ISSUE = 'create_issue';

    public const CREATE_CHANGE_ORDER = 'create_change_order';

    // Approval action (pauses workflow, resumes on decision)
    public const REQUEST_APPROVAL = 'request_approval';

    public const COMMUNICATION_ACTIONS = [
        self::SEND_EMAIL,
        self::SEND_WHATSAPP,
        self::SEND_SMS,
        self::SEND_PORTAL_NOTIFICATION,
    ];

    public const CRM_ACTIONS = [
        self::CREATE_ACTIVITY,
        self::CREATE_TASK,
        self::CREATE_NOTE,
        self::ASSIGN_OWNER,
        self::UPDATE_STATUS,
    ];

    public const PROJECT_ACTIONS = [
        self::CREATE_RISK,
        self::CREATE_ISSUE,
        self::CREATE_CHANGE_ORDER,
    ];

    public const ALL = [
        self::SEND_EMAIL,
        self::SEND_WHATSAPP,
        self::SEND_SMS,
        self::SEND_PORTAL_NOTIFICATION,
        self::CREATE_ACTIVITY,
        self::CREATE_TASK,
        self::CREATE_NOTE,
        self::ASSIGN_OWNER,
        self::UPDATE_STATUS,
        self::CREATE_RISK,
        self::CREATE_ISSUE,
        self::CREATE_CHANGE_ORDER,
        self::REQUEST_APPROVAL,
    ];

    public static function isValid(string $actionType): bool
    {
        return in_array($actionType, self::ALL, true);
    }

    public static function isCommunication(string $actionType): bool
    {
        return in_array($actionType, self::COMMUNICATION_ACTIONS, true);
    }
}
