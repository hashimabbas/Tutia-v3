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
            <div className="flex items-center justify-between border-b border-[#1e1e2a] px-4 py-2.5">
                <h2 className="text-[11px] font-medium uppercase tracking-wider text-[#555570]">Timeline</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1 rounded border border-[#1e1e2a] bg-[#0f0f14] px-2 py-1 text-[11px] text-[#8b8b9e] transition-colors hover:border-[#2a2a3a] hover:text-[#e8e8ed]"
                >
                    <MessageSquare className="h-3 w-3" />
                    Add note
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAddActivity} className="border-b border-[#1e1e2a] bg-[#0f0f14] px-4 py-2.5">
                    <div className="mb-2 flex gap-1.5">
                        {['note', 'call', 'email', 'meeting', 'task'].map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setActivityType(t)}
                                className={`rounded px-2 py-0.5 text-[10px] capitalize transition-colors ${activityType === t ? 'bg-[#2B4C8C] text-white' : 'bg-[#1a1a24] text-[#555570] hover:bg-[#1e1e2a]'}`}
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
                            className="flex-1 rounded border border-[#1e1e2a] bg-[#0a0a0f] px-2.5 py-1.5 text-xs text-[#e8e8ed] placeholder-[#555570] outline-none focus:border-[#3b6cdb]"
                        />
                        <button
                            type="submit"
                            disabled={adding}
                            className="rounded bg-[#2B4C8C] px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#3b5d9c] disabled:opacity-50"
                        >
                            {adding ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            )}

            <div className="flex gap-1.5 border-b border-[#1e1e2a] px-4 py-2">
                {filterOptions.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilters(f === 'all' ? ['all'] : [f === 'system' ? 'created' : f])}
                        className={`rounded px-2 py-0.5 text-[10px] capitalize transition-colors ${filters.includes(f === 'system' ? 'created' : f) || (f === 'all' && filters.includes('all')) ? 'bg-[#1e1e2a] text-[#e8e8ed]' : 'text-[#555570] hover:text-[#8b8b9e]'}`}
                    >
                        {f.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {loading && events.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-[11px] text-[#555570]">Loading...</div>
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="mx-auto mb-2 h-6 w-6 text-[#1e1e2a]" />
                            <p className="text-xs text-[#555570]">No events yet</p>
                            <button onClick={() => setShowForm(true)} className="mt-2 text-[11px] text-[#3b6cdb] hover:text-[#5b8cfb]">
                                Log your first activity
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {Object.entries(groupByDate(events)).map(([dateLabel, dateEvents]) => (
                            <div key={dateLabel} className="mb-4">
                                <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#555570]">{dateLabel}</div>
                                <div className="relative space-y-0">
                                    <div className="absolute left-[11px] top-0 h-full w-px bg-[#1e1e2a]" />
                                    {dateEvents.map(ev => {
                                        const Icon = iconMap[ev.icon] ?? FileText;
                                        return (
                                            <div key={ev.event_id} className="relative flex gap-3 pb-3">
                                                <div className="relative z-10 mt-0.5">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a24]" style={{ backgroundColor: ev.color + '20' }}>
                                                        <Icon className="h-3 w-3" style={{ color: ev.color }} />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-medium text-[#e8e8ed]">{ev.summary}</div>
                                                    {ev.description && <div className="mt-0.5 text-[11px] text-[#8b8b9e]">{ev.description}</div>}
                                                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#555570]">
                                                        <span className="capitalize">{ev.event_type.replace(/_/g, ' ')}</span>
                                                        <span>·</span>
                                                        <span>{formatTimeAgo(ev.occurred_at)}</span>
                                                        {ev.actor.name !== 'System' && <><span>·</span><span>{ev.actor.name}</span></>}
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
                                    className="rounded border border-[#1e1e2a] bg-[#0f0f14] px-3 py-1.5 text-[11px] text-[#8b8b9e] transition-colors hover:border-[#2a2a3a] disabled:opacity-50"
                                >
                                    {loading ? 'Loading...' : 'Load more'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
