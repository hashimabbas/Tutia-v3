import { Head } from '@inertiajs/react';
import { Bell, CheckCircle2, AlertTriangle, FileText, Calendar } from 'lucide-react';
import PortalShell from '@/components/portal/portal-shell';
import { PortalEmptyState } from '@/components/portal/portal-empty-state';

interface NotificationItem {
    id: number;
    type: string;
    title: string;
    body: string | null;
    read_at: string | null;
    created_at: string;
}

interface NotificationsProps {
    notifications: NotificationItem[];
}

const iconMap: Record<string, typeof Bell> = {
    milestone_completed: CheckCircle2,
    deliverable_completed: CheckCircle2,
    issue_escalated: AlertTriangle,
    project_at_risk: AlertTriangle,
    change_order_created: FileText,
    change_order_approved: CheckCircle2,
    project_created: Calendar,
};

const colorMap: Record<string, string> = {
    milestone_completed: '#34d399',
    deliverable_completed: '#34d399',
    issue_escalated: '#ef4444',
    project_at_risk: '#ef4444',
    change_order_created: '#eab308',
    change_order_approved: '#34d399',
    project_created: '#3b6cdb',
};

export default function PortalNotifications({ notifications }: NotificationsProps) {
    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
        <PortalShell title="Notifications">
            <Head title="Notifications" />
            <div className="space-y-4 p-4 pb-20 md:p-6">
                {unreadCount > 0 && (
                    <div className="rounded-lg border border-[#3b6cdb]/20 bg-[#3b6cdb]/5 px-4 py-2 text-[11px] text-[#3b6cdb]">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </div>
                )}

                {notifications.length === 0 ? (
                    <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-8">
                        <PortalEmptyState title="No notifications" description="You're all caught up!" icon={Bell} />
                    </div>
                ) : (
                    <div className="space-y-1">
                        {notifications.map(n => {
                            const Icon = iconMap[n.type] ?? Bell;
                            const color = colorMap[n.type] ?? '#555570';
                            return (
                                <div
                                    key={n.id}
                                    className={`flex gap-3 rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3 ${
                                        !n.read_at ? 'border-l-[#3b6cdb] border-l-2' : ''
                                    }`}
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}14` }}>
                                        <Icon className="h-4 w-4" style={{ color }} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[12px] font-medium text-[#e8e8ed]">{n.title}</p>
                                        {n.body && <p className="mt-0.5 text-[11px] text-[#8b8b9e] line-clamp-2">{n.body}</p>}
                                        <p className="mt-1 text-[10px] text-[#555570]">
                                            {new Date(n.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </PortalShell>
    );
}
