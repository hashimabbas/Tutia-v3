import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Phone, Mail, Calendar, MessageSquare, CheckCircle2, PlusCircle, Edit3, ArrowRight, ArrowUp, UserCheck, Trash2, FileText, AlertTriangle, type LucideIcon } from 'lucide-react';

interface TimelineEvent {
    event_id: string;
    event_type: string;
    event_category: string;
    icon: string;
    color: string;
    occurred_at: string;
    actor_id: number | null;
    actor: { id: number; name: string; avatar: string | null };
    summary: string;
    description: string | null;
    source: string;
    entity_type: string;
    entity_id: number;
    entity_breadcrumb: { entity_type: string; entity_id: number; label: string }[];
    metadata: Record<string, unknown>;
}

interface ActivityTimelineProps {
    entityType: string;
    entityId: number;
}

const iconMap: Record<string, LucideIcon> = {
    PlusCircle, Edit3, Trash2, ArrowRight, ArrowUp, UserCheck,
    Phone, Mail, Calendar, MessageSquare, CheckCircle2, FileText, AlertTriangle,
};

function formatTimeAgo(dateStr: string): string {
    const now = Date.now();
    const d = new Date(dateStr).getTime();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByDate(events: TimelineEvent[]): Record<string, TimelineEvent[]> {
    const groups: Record<string, TimelineEvent[]> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    for (const ev of events) {
        const date = new Date(ev.occurred_at).toDateString();
        let key: string;
        if (date === today) key = 'Today';
        else if (date === yesterday) key = 'Yesterday';
        else if (Date.now() - new Date(date).getTime() < 604800000) key = 'This Week';
        else key = new Date(ev.occurred_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        if (!groups[key]) groups[key] = [];
        groups[key].push(ev);
    }
    return groups;
}

export default function ActivityTimeline({ entityType, entityId }: ActivityTimelineProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [filters, setFilters] = useState<string[]>(['all']);
    const [showForm, setShowForm] = useState(false);
    const [activityType, setActivityType] = useState('note');
    const [activitySubject, setActivitySubject] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadEvents(true);
    }, [entityType, entityId, filters]);

    const loadEvents = async (reset = false) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ entity_type: entityType, entity_id: String(entityId), limit: '20' });
            if (!reset && cursor) params.set('cursor', cursor);
            if (!filters.includes('all')) params.set('filters', filters.join(','));

            const res = await fetch(`/crm/timeline?${params}`);
            const data = await res.json();

            if (reset) {
                setEvents(data.events ?? []);
            } else {
                setEvents(prev => [...prev, ...(data.events ?? [])]);
            }
            setCursor(data.next_cursor ?? null);
            setHasMore(data.has_more ?? false);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const handleAddActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activitySubject.trim()) return;
        setAdding(true);

        const morphMap: Record<string, string> = {
            organization: 'App\\Models\\CrmOrganization',
            contact: 'App\\Models\\CrmContact',
            lead: 'App\\Models\\CrmLead',
            deal: 'App\\Models\\CrmDeal',
            project: 'App\\Models\\CrmProject',
        };

        router.post('/crm/activities', {
            activitable_type: morphMap[entityType] ?? 'App\\Models\\CrmLead',
            activitable_id: entityId,
            type: activityType,
            subject: activitySubject,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setActivitySubject('');
                setShowForm(false);
                setAdding(false);
                loadEvents(true);
            },
            onError: () => {
                setAdding(false);
            },
        });
    };

    const filterOptions = ['all', 'call', 'email', 'note', 'meeting', 'task', 'system'];

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-[#e2e6ef] px-6 py-3">
                <div className="flex items-center gap-2.5">
                    <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                        Activity Timeline
                    </h2>
                    {events.length > 0 && (
                        <span className="rounded-md bg-[#e2e6ef] px-1.5 py-0.5 text-[9px] font-medium text-[#6b7280]">{events.length}</span>
                    )}
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-[11px] text-[#6b7280] transition-all hover:border-[#c8cce0] hover:text-[#374151] hover:shadow-sm"
                >
                    <MessageSquare className="h-3 w-3" />
                    Log activity
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAddActivity} className="border-b border-[#e2e6ef] bg-[#f0f2f7] px-6 py-3">
                    <div className="mb-2.5 flex gap-1.5">
                        {['note', 'call', 'email', 'meeting', 'task'].map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setActivityType(t)}
                                className={`rounded-lg px-2.5 py-1 text-[10px] font-medium capitalize transition-all ${
                                    activityType === t
                                        ? 'bg-[#2B4C8C] text-white shadow-sm'
                                        : 'border border-[#e2e6ef] bg-white text-[#6b7280] hover:border-[#c8cce0] hover:text-[#374151]'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={activitySubject}
                            onChange={e => setActivitySubject(e.target.value)}
                            placeholder="What happened?"
                            className="flex-1 rounded-lg border border-[#e2e6ef] bg-white px-3 py-1.5 text-xs text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition-all focus:border-[#2B4C8C] focus:ring-[3px] focus:ring-[#2B4C8C]/10"
                        />
                        <button
                            type="submit"
                            disabled={adding}
                            className="rounded-lg bg-[#2B4C8C] px-3.5 py-1.5 text-[11px] font-medium text-white shadow-sm transition-all hover:bg-[#2B4C8C]/90 hover:shadow-md disabled:opacity-50"
                        >
                            {adding ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            )}

            <div className="flex gap-1.5 border-b border-[#e2e6ef] bg-[#f8f9fc] px-6 py-2">
                {filterOptions.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilters(f === 'all' ? ['all'] : [f === 'system' ? 'created' : f])}
                        className={`rounded-md px-2 py-0.5 text-[10px] capitalize transition-all ${
                            filters.includes(f === 'system' ? 'created' : f) || (f === 'all' && filters.includes('all'))
                                ? 'bg-[#e2e6ef] text-[#374151] font-medium'
                                : 'text-[#6b7280] hover:bg-[#eef1f8] hover:text-[#374151]'
                        }`}
                    >
                        {f.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                {loading && events.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="flex items-center gap-2 text-[11px] text-[#6b7280]">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#e2e6ef] border-t-[#2B4C8C]" />
                            Loading...
                        </div>
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef1f8]">
                                <MessageSquare className="h-5 w-5 text-[#6b7280]" />
                            </div>
                            <p className="text-xs text-[#6b7280]">No activity recorded yet</p>
                            <button onClick={() => setShowForm(true)} className="mt-2 text-[11px] font-medium text-[#2B4C8C] hover:text-[#2B4C8C]/80">
                                Log your first activity
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {Object.entries(groupByDate(events)).map(([dateLabel, dateEvents]) => (
                            <div key={dateLabel} className="mb-5">
                                <div className="mb-2.5 flex items-center gap-2">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">{dateLabel}</span>
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                </div>
                                <div className="relative space-y-0">
                                    <div className="absolute left-[15px] top-2 h-[calc(100%-16px)] w-px bg-[#e2e6ef]" />
                                    {dateEvents.map(ev => {
                                        const Icon = iconMap[ev.icon] ?? FileText;
                                        return (
                                            <div key={ev.event_id} className="relative flex gap-3 pb-4 pl-1">
                                                <div className="relative z-10 mt-0.5">
                                                    <div
                                                        className="flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-white"
                                                        style={{ backgroundColor: ev.color + '15' }}
                                                    >
                                                        <Icon className="h-3.5 w-3.5" style={{ color: ev.color }} />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-0.5">
                                                    <div className="text-xs font-medium text-[#1a1a2e]">{ev.summary}</div>
                                                    {ev.description && (
                                                        <div className="mt-0.5 text-[11px] leading-relaxed text-[#6b7280]">{ev.description}</div>
                                                    )}
                                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#9ca3af]">
                                                        <span className="capitalize">{ev.event_type.replace(/_/g, ' ')}</span>
                                                        <span>·</span>
                                                        <span>{formatTimeAgo(ev.occurred_at)}</span>
                                                        {ev.actor.name !== 'System' && (
                                                            <>
                                                                <span>·</span>
                                                                <span>{ev.actor.name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <div className="flex justify-center py-3">
                                <button
                                    onClick={() => loadEvents(false)}
                                    disabled={loading}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e6ef] bg-white px-3.5 py-2 text-[11px] text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#374151] disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#e2e6ef] border-t-[#2B4C8C]" />
                                            Loading...
                                        </>
                                    ) : (
                                        'Load more'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
