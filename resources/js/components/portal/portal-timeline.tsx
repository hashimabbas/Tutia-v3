import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, FileText, Calendar } from 'lucide-react';

const iconMap: Record<string, typeof CheckCircle2> = {
    milestone_completed: CheckCircle2,
    milestone_reopened: ArrowRight,
    deliverable_completed: CheckCircle2,
    deliverable_approved: CheckCircle2,
    risk_closed: CheckCircle2,
    issue_resolved: CheckCircle2,
    issue_escalated: AlertTriangle,
    change_order_created: FileText,
    change_order_approved: CheckCircle2,
    project_created: Calendar,
    project_at_risk: AlertTriangle,
    project_archived: FileText,
};

const colorMap: Record<string, string> = {
    milestone_completed: '#34d399',
    milestone_reopened: '#fbbf24',
    deliverable_completed: '#34d399',
    deliverable_approved: '#a78bfa',
    risk_closed: '#34d399',
    issue_resolved: '#34d399',
    issue_escalated: '#ef4444',
    change_order_created: '#3b6cdb',
    change_order_approved: '#34d399',
    project_created: '#3b6cdb',
    project_at_risk: '#ef4444',
    project_archived: '#555570',
};

interface TimelineEvent {
    id: number;
    type: string;
    subject: string;
    created_at: string;
}

interface PortalTimelineProps {
    projectId: number;
}

export function PortalTimeline({ projectId }: PortalTimelineProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/portal/api/timeline?project_id=${projectId}`)
            .then(res => res.json())
            .then(data => setEvents(data.data ?? data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [projectId]);

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-[#1a1a24]" />
                ))}
            </div>
        );
    }

    if (events.length === 0) {
        return <p className="py-4 text-center text-[11px] text-[#555570]">No recent activity</p>;
    }

    return (
        <div className="space-y-0">
            {events.map((event, idx) => {
                const Icon = iconMap[event.type] ?? FileText;
                const color = colorMap[event.type] ?? '#555570';
                const isLast = idx === events.length - 1;

                return (
                    <div key={event.id} className="relative flex gap-3 pb-4">
                        {!isLast && (
                            <div className="absolute bottom-0 left-[11px] top-6 w-px bg-[#1e1e2a]" />
                        )}
                        <div
                            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${color}14` }}
                        >
                            <Icon className="h-3 w-3" style={{ color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[12px] text-[#e8e8ed]">{event.subject}</p>
                            <p className="mt-0.5 text-[10px] text-[#555570]">
                                {new Date(event.created_at).toLocaleDateString('en-US', {
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
    );
}
