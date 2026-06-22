<?php

namespace App\Services\Crm\Communications\Templates;

use App\Services\Crm\Communications\Contracts\TemplateRendererInterface;
use App\Services\Crm\Communications\Registry\NotificationEventCatalog;

class TemplateRenderer implements TemplateRendererInterface
{
    /** @param array<string, mixed> $payload */
    public function render(string $template, array $payload, string $locale): string
    {
        $resolved = $this->resolve($template);

        if ($resolved === null) {
            return '';
        }

        return $resolved($payload, $locale);
    }

    private function resolve(string $template): ?callable
    {
        return match ($template) {
            NotificationEventCatalog::DEAL_CONVERTED => $this->dealConverted(...),
            NotificationEventCatalog::PROJECT_CREATED => $this->projectCreated(...),
            NotificationEventCatalog::MILESTONE_COMPLETED => $this->milestoneCompleted(...),
            NotificationEventCatalog::DELIVERABLE_COMPLETED => $this->deliverableCompleted(...),
            NotificationEventCatalog::RISK_CLOSED => $this->riskClosed(...),
            NotificationEventCatalog::ISSUE_RESOLVED => $this->issueResolved(...),
            NotificationEventCatalog::ISSUE_ESCALATED => $this->issueEscalated(...),
            NotificationEventCatalog::PROJECT_AT_RISK => $this->projectAtRisk(...),
            NotificationEventCatalog::HEALTH_DEGRADED => $this->healthDegraded(...),
            NotificationEventCatalog::CHANGE_ORDER_APPROVED => $this->changeOrderApproved(...),
            NotificationEventCatalog::CHANGE_ORDER_REJECTED => $this->changeOrderRejected(...),
            default => null,
        };
    }

    /** @param array<string, mixed> $payload */
    private function dealConverted(array $payload, string $locale): string
    {
        return $locale === 'ar'
            ? 'تم تحويل الصفقة: '.($payload['deal_title'] ?? '')
            : 'Deal converted: '.($payload['deal_title'] ?? '');
    }

    /** @param array<string, mixed> $payload */
    private function projectCreated(array $payload, string $locale): string
    {
        return $locale === 'ar'
            ? 'تم إنشاء المشروع: '.($payload['project_name'] ?? '')
            : 'Project created: '.($payload['project_name'] ?? '');
    }

    /** @param array<string, mixed> $payload */
    private function milestoneCompleted(array $payload, string $locale): string
    {
        return $locale === 'ar'
            ? 'تم إكمال المرحلة: '.($payload['milestone_name'] ?? '')
            : 'Milestone completed: '.($payload['milestone_name'] ?? '');
    }

    /** @param array<string, mixed> $payload */
    private function issueEscalated(array $payload, string $locale): string
    {
        return $locale === 'ar'
            ? 'تم تصعيد مشكلة: '.($payload['issue_title'] ?? '')
            : 'Issue escalated: '.($payload['issue_title'] ?? '');
    }

    /** @param array<string, mixed> $payload */
    private function projectAtRisk(array $payload, string $locale): string
    {
        $score = $payload['health_score'] ?? '?';

        return $locale === 'ar'
            ? "تنبيه: المشروع في خطر (درجة الصحة: {$score})"
            : "Alert: Project at risk (health score: {$score})";
    }

    /** @param array<string, mixed> $payload */
    private function healthDegraded(array $payload, string $locale): string
    {
        $score = $payload['health_score'] ?? '?';
        $drop = $payload['drop'] ?? '?';

        return $locale === 'ar'
            ? "انخفاض صحة المشروع إلى {$score} (انخفاض: {$drop})"
            : "Project health dropped to {$score} (drop: {$drop})";
    }

    /** @param array<string, mixed> $payload */
    private function changeOrderApproved(array $payload, string $locale): string
    {
        return $locale === 'ar'
            ? 'تمت الموافقة على أمر التغيير: '.($payload['change_order_title'] ?? '')
            : 'Change order approved: '.($payload['change_order_title'] ?? '');
    }

    /** @param array<string, mixed> $payload */
    private function changeOrderRejected(array $payload, string $locale): string
    {
        return $locale === 'ar'
            ? 'تم رفض أمر التغيير: '.($payload['change_order_title'] ?? '')
            : 'Change order rejected: '.($payload['change_order_title'] ?? '');
    }

    /** @param array<string, mixed> $payload */
    private function deliverableCompleted(array $payload, string $locale): string
    {
        return $locale === 'ar'
            ? 'تم إكمال التسليم: '.($payload['deliverable_name'] ?? '')
            : 'Deliverable completed: '.($payload['deliverable_name'] ?? '');
    }

    /** @param array<string, mixed> $payload */
    private function riskClosed(array $payload, string $locale): string
    {
        return $locale === 'ar'
            ? 'تم إغلاق المخاطرة: '.($payload['risk_description'] ?? '')
            : 'Risk closed: '.($payload['risk_description'] ?? '');
    }

    /** @param array<string, mixed> $payload */
    private function issueResolved(array $payload, string $locale): string
    {
        return $locale === 'ar'
            ? 'تم حل المشكلة: '.($payload['issue_description'] ?? '')
            : 'Issue resolved: '.($payload['issue_description'] ?? '');
    }
}
