import { useState, useEffect, useCallback } from 'react';
import {
    Lightbulb,
    Activity,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Minus,
    Target,
    BarChart3,
    Zap,
    Search,
    ChevronDown,
    Filter,
    Eye,
    ThumbsUp,
    ThumbsDown,
    Play,
    CheckCheck,
    Archive,
    ArrowUpDown,
    FileText,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

type LifecycleStatus =
    | 'generated' | 'viewed' | 'dismissed' | 'accepted' | 'rejected'
    | 'applied' | 'verified' | 'completed' | 'failed' | 'expired' | 'cancelled';

interface TargetData {
    target_type: string;
    target_id: number;
}

interface RecommendationVersion {
    type: string;
    version_number: number;
    priority: number;
    parameters?: Record<string, unknown>;
    generated_at?: string;
}

interface RecommendationSnapshot {
    metrics: Record<string, unknown>;
    health_score?: number;
    trend?: string;
    recommendation_version?: string;
    generated_at?: string;
    context?: Record<string, unknown>;
}

interface RecommendationEvent {
    id: number;
    recommendation_type: string;
    status: LifecycleStatus;
    target: TargetData;
    snapshot: RecommendationSnapshot | null;
    version: RecommendationVersion | null;
    metadata: Record<string, unknown> | null;
    status_changed_at: string | null;
    created_at: string | null;
}

interface DashboardData {
    overall_stats: {
        total_recommendations: number;
        active_recommendations: number;
        completed_recommendations: number;
        avg_impact_score: number;
    };
    automation_score?: {
        overall_score?: number;
        classification?: string;
    };
    health?: {
        maturity: number;
    };
    recent_activity?: { type: string; count: number; label: string }[];
}

interface StatusDetail {
    current_status: LifecycleStatus;
    current_status_label: string;
    is_terminal: boolean;
    allowed_transitions: { status: LifecycleStatus; label: string }[];
    history: { id: number; status: LifecycleStatus; status_changed_at: string | null }[];
}

interface ImpactData {
    overall_score: number;
    health_delta: number;
    metrics: {
        metric: string;
        before: number;
        after: number;
        delta: number;
        percentage: number;
        direction: string;
        weight: number;
        score: number;
        is_improvement: boolean;
    }[];
    improvements: { metric: string; percentage: number }[];
    regressions: { metric: string; percentage: number }[];
    summary: string;
    classification: string;
}

const LIFECYCLE_CONFIG: Record<LifecycleStatus, { label: string; color: string; bg: string; border: string }> = {
    generated: { label: 'Generated', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
    viewed: { label: 'Viewed', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    dismissed: { label: 'Dismissed', color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200' },
    accepted: { label: 'Accepted', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    applied: { label: 'Applied', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
    verified: { label: 'Verified', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    failed: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    expired: { label: 'Expired', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    cancelled: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    low: { label: 'Low', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

const HEALTH_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    healthy: { label: 'Healthy', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    warning: { label: 'Warning', color: 'text-amber-600', bg: 'bg-amber-50' },
    critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50' },
};

const LIFECYCLE_FILTERS: { value: LifecycleStatus | ''; label: string }[] = [
    { value: '', label: 'All Statuses' },
    ...Object.entries(LIFECYCLE_CONFIG).map(([value, cfg]) => ({ value: value as LifecycleStatus, label: cfg.label })),
];

const TARGET_TYPE_FILTERS = [
    { value: '', label: 'All Targets' },
    { value: 'workflow', label: 'Workflow' },
    { value: 'approval', label: 'Approval' },
];

const REC_TYPE_FILTERS = [
    { value: '', label: 'All Types' },
    { value: 'workflow', label: 'Workflow' },
    { value: 'approval', label: 'Approval' },
];

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function getPriorityLabel(priority: number): string {
    if (priority >= 80) return 'critical';
    if (priority >= 60) return 'high';
    if (priority >= 30) return 'medium';
    return 'low';
}

function getHealthLabel(score: number | null | undefined): string {
    if (score == null) return 'healthy';
    if (score >= 70) return 'healthy';
    if (score >= 40) return 'warning';
    return 'critical';
}

function getHealthIndicator(score: number | null | undefined) {
    const label = getHealthLabel(score);
    const cfg = HEALTH_CONFIG[label];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>
            <span className={`size-1.5 rounded-full ${label === 'healthy' ? 'bg-emerald-500' : label === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
            {cfg.label}
        </span>
    );
}

function getScoreColor(score: number | null | undefined): string {
    if (score == null) return 'text-gray-400';
    if (score >= 70) return 'text-emerald-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

export default function RecommendationsPage() {
    const [events, setEvents] = useState<RecommendationEvent[]>([]);
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<LifecycleStatus | ''>('');
    const [targetTypeFilter, setTargetTypeFilter] = useState('');
    const [recTypeFilter, setRecTypeFilter] = useState('');
    const [sortField, setSortField] = useState<'created_at' | 'priority'>('created_at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const [selectedEvent, setSelectedEvent] = useState<RecommendationEvent | null>(null);
    const [statusDetail, setStatusDetail] = useState<StatusDetail | null>(null);
    const [impactData, setImpactData] = useState<ImpactData | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            if (recTypeFilter) params.set('recommendation_type', recTypeFilter);

            const [eventsRes, dashRes] = await Promise.all([
                fetch(`/api/crm/optimization/recommendations?${params}`),
                fetch('/api/crm/optimization/center/dashboard').catch(() => null),
            ]);

            if (!eventsRes.ok) throw new Error('Failed to load recommendations');

            const eventsData = await eventsRes.json();
            setEvents(eventsData.data ?? []);

            if (dashRes?.ok) {
                setDashboard(await dashRes.json());
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, recTypeFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredEvents = events.filter((e) => {
        if (targetTypeFilter && e.target.target_type !== targetTypeFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            const matchesId = String(e.id).includes(q);
            const matchesType = e.recommendation_type.toLowerCase().includes(q);
            const matchesTargetType = e.target.target_type.toLowerCase().includes(q);
            if (!matchesId && !matchesType && !matchesTargetType) return false;
        }
        return true;
    });

    const sortedEvents = [...filteredEvents].sort((a, b) => {
        let cmp = 0;
        if (sortField === 'created_at') {
            const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
            cmp = aDate - bDate;
        } else {
            const aP = a.version?.priority ?? 0;
            const bP = b.version?.priority ?? 0;
            cmp = aP - bP;
        }
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const kpiItems = [
        { label: 'Total Recommendations', value: dashboard?.overall_stats.total_recommendations ?? events.length, color: '#1a1a2e' },
        { label: 'Active', value: dashboard?.overall_stats.active_recommendations ?? events.filter((e) => !['completed', 'failed', 'dismissed', 'rejected', 'expired', 'cancelled'].includes(e.status)).length, color: '#2563eb' },
        { label: 'Applied', value: events.filter((e) => e.status === 'applied').length, color: '#06b6d4' },
        { label: 'Verified', value: events.filter((e) => e.status === 'verified').length, color: '#059669' },
        { label: 'Completed', value: dashboard?.overall_stats.completed_recommendations ?? events.filter((e) => e.status === 'completed').length, color: '#16a34a' },
        { label: 'Failed', value: events.filter((e) => e.status === 'failed').length, color: '#dc2626' },
        { label: 'Avg Impact Score', value: dashboard?.overall_stats.avg_impact_score != null ? `${dashboard.overall_stats.avg_impact_score}` : '—', color: dashboard?.overall_stats.avg_impact_score != null ? (dashboard.overall_stats.avg_impact_score >= 70 ? '#059669' : '#d97706') : '#6b7280' },
        { label: 'Maturity', value: dashboard?.health?.maturity != null ? `${dashboard.health.maturity}%` : '—', color: '#7c3aed' },
    ];

    function toggleSort(field: 'created_at' | 'priority') {
        if (sortField === field) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    }

    async function openDetail(event: RecommendationEvent) {
        setSelectedEvent(event);
        setDetailLoading(true);
        setStatusDetail(null);
        setImpactData(null);

        try {
            const [statusRes, impactRes] = await Promise.all([
                fetch(`/api/crm/optimization/recommendations/${event.recommendation_type}/status?target_type=${event.target.target_type}&target_id=${event.target.target_id}`)
                    .then((r) => r.ok ? r.json() : null)
                    .catch(() => null),
                fetch(`/api/crm/optimization/recommendations/${event.id}/comparison`)
                    .then((r) => r.ok ? r.json() : null)
                    .catch(() => null),
            ]);

            if (statusRes) setStatusDetail(statusRes);

            if (impactRes?.snapshot) {
                const metricsRes = await fetch(`/api/crm/optimization/recommendations/${event.id}/metrics`)
                    .then((r) => r.ok ? r.json() : null)
                    .catch(() => null);
                if (metricsRes) {
                    const score = impactRes.snapshot.metrics?.overall_score
                        ?? event.snapshot?.metrics?.impact_score
                        ?? null;
                    setImpactData({
                        overall_score: score ?? 0,
                        health_delta: 0,
                        metrics: metricsRes.metrics ?? [],
                        improvements: [],
                        regressions: [],
                        summary: impactRes.snapshot.metrics?.summary ?? '',
                        classification: score != null ? (score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor') : 'unknown',
                    });
                }
            }
        } catch {
        } finally {
            setDetailLoading(false);
        }
    }

    async function performAction(status: LifecycleStatus) {
        if (!selectedEvent) return;
        setActionLoading(status);
        try {
            const res = await fetch('/api/crm/optimization/recommendations/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    recommendation_type: selectedEvent.recommendation_type,
                    status,
                    target_type: selectedEvent.target.target_type,
                    target_id: selectedEvent.target.target_id,
                    snapshot: selectedEvent.snapshot ?? { metrics: {} },
                }),
            });
            if (res.ok) {
                await fetchData();
                if (selectedEvent) {
                    await openDetail(selectedEvent);
                }
            }
        } catch {
        } finally {
            setActionLoading(null);
        }
    }

    const quickActions: { status: LifecycleStatus; label: string; icon: React.ReactNode; color: string }[] = [
        { status: 'viewed', label: 'Mark Viewed', icon: <Eye className="size-3" />, color: 'text-blue-600 border-blue-200 hover:bg-blue-50' },
        { status: 'accepted', label: 'Accept', icon: <ThumbsUp className="size-3" />, color: 'text-indigo-600 border-indigo-200 hover:bg-indigo-50' },
        { status: 'rejected', label: 'Reject', icon: <ThumbsDown className="size-3" />, color: 'text-red-600 border-red-200 hover:bg-red-50' },
        { status: 'applied', label: 'Apply', icon: <Play className="size-3" />, color: 'text-cyan-600 border-cyan-200 hover:bg-cyan-50' },
        { status: 'verified', label: 'Verify', icon: <CheckCheck className="size-3" />, color: 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' },
        { status: 'completed', label: 'Complete', icon: <CheckCircle className="size-3" />, color: 'text-green-600 border-green-200 hover:bg-green-50' },
        { status: 'cancelled', label: 'Archive', icon: <Archive className="size-3" />, color: 'text-gray-500 border-gray-200 hover:bg-gray-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Recommendation Center</h1>
                    <p className="mt-0.5 text-xs text-gray-500">
                        Manage, track, and verify all CRM-7 & CRM-8 recommendations
                    </p>
                </div>
                <button
                    type="button"
                    onClick={fetchData}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                    <p className="text-sm text-red-600">{error}</p>
                    <button
                        type="button"
                        onClick={fetchData}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                        <RefreshCw className="size-3" /> Retry
                    </button>
                </div>
            )}

            <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-[#e2e6ef] bg-[#e2e6ef] shadow-sm">
                {kpiItems.map((item, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center gap-0.5 bg-white px-3 py-3"
                    >
                        <span className="text-lg font-semibold tracking-tight" style={{ color: item.color }}>
                            {item.value}
                        </span>
                        <span className="text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search recommendations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#2B4C8C] focus:ring-1 focus:ring-[#2B4C8C]/20"
                    />
                </div>

                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as LifecycleStatus | '')}
                        className="appearance-none rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-8 pl-3 text-xs font-medium text-gray-600 outline-none focus:border-[#2B4C8C]"
                    >
                        {LIFECYCLE_FILTERS.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="relative">
                    <select
                        value={targetTypeFilter}
                        onChange={(e) => setTargetTypeFilter(e.target.value)}
                        className="appearance-none rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-8 pl-3 text-xs font-medium text-gray-600 outline-none focus:border-[#2B4C8C]"
                    >
                        {TARGET_TYPE_FILTERS.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="relative">
                    <select
                        value={recTypeFilter}
                        onChange={(e) => setRecTypeFilter(e.target.value)}
                        className="appearance-none rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-8 pl-3 text-xs font-medium text-gray-600 outline-none focus:border-[#2B4C8C]"
                    >
                        {REC_TYPE_FILTERS.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-[#2B4C8C]" />
                </div>
            ) : sortedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-12">
                    <Lightbulb className="size-8 text-gray-300" />
                    <p className="mt-3 text-sm font-medium text-gray-900">No recommendations found</p>
                    <p className="mt-1 text-xs text-gray-500">
                        {search || statusFilter || targetTypeFilter || recTypeFilter
                            ? 'Try adjusting your filters.'
                            : 'Recommendations will appear here once generated by the intelligence engine.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    <th className="px-4 py-2.5 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">Recommendation</th>
                                    <th className="px-4 py-2.5 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                                        <button
                                            type="button"
                                            onClick={() => toggleSort('priority')}
                                            className="inline-flex items-center gap-1 hover:text-gray-700"
                                        >
                                            Priority
                                            <ArrowUpDown className="size-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">Lifecycle Status</th>
                                    <th className="px-4 py-2.5 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">Target</th>
                                    <th className="px-4 py-2.5 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                                        <button
                                            type="button"
                                            onClick={() => toggleSort('created_at')}
                                            className="inline-flex items-center gap-1 hover:text-gray-700"
                                        >
                                            Created
                                            <ArrowUpDown className="size-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">Automation Score</th>
                                    <th className="px-4 py-2.5 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">Impact Score</th>
                                    <th className="px-4 py-2.5 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">Health</th>
                                    <th className="px-4 py-2.5 text-right text-[10px] font-medium tracking-wider text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {sortedEvents.map((event) => {
                                    const priority = event.version?.priority ?? 50;
                                    const priorityLabel = getPriorityLabel(priority);
                                    const priorityCfg = PRIORITY_CONFIG[priorityLabel];
                                    const lcCfg = LIFECYCLE_CONFIG[event.status];
                                    const healthScore = event.snapshot?.health_score;
                                    const impactScore = event.snapshot?.metrics?.impact_score as number | undefined;

                                    return (
                                        <tr
                                            key={event.id}
                                            onClick={() => openDetail(event)}
                                            className="cursor-pointer transition-colors hover:bg-gray-50/80"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                                                        <FileText className="size-3.5 text-gray-500" />
                                                    </span>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-900 capitalize">
                                                            {event.recommendation_type.replace('_', ' ')} #{event.id}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">
                                                            Last updated {formatDate(event.status_changed_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityCfg.bg} ${priorityCfg.color} ${priorityCfg.border}`}>
                                                    {priorityCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${lcCfg.bg} ${lcCfg.color} ${lcCfg.border}`}>
                                                    {lcCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Target className="size-3 text-gray-400" />
                                                    <span className="capitalize">{event.target.target_type}</span>
                                                    <span className="text-gray-300">#</span>
                                                    <span>{event.target.target_id}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                                {formatDate(event.created_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {healthScore != null ? (
                                                    <span className={`text-xs font-semibold ${getScoreColor(healthScore)}`}>
                                                        {healthScore}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {impactScore != null ? (
                                                    <span className={`text-xs font-semibold ${getScoreColor(impactScore)}`}>
                                                        {impactScore}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getHealthIndicator(healthScore)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); openDetail(event); }}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
                                                >
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
                        <p className="text-[10px] text-gray-400">
                            Showing {sortedEvents.length} of {events.length} recommendations
                        </p>
                    </div>
                </div>
            )}

            <Sheet open={selectedEvent !== null} onOpenChange={(open) => { if (!open) { setSelectedEvent(null); setStatusDetail(null); setImpactData(null); } }}>
                <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                    {selectedEvent && (
                        <>
                            <SheetHeader className="border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <SheetTitle className="text-sm font-semibold text-gray-900 capitalize">
                                        {selectedEvent.recommendation_type.replace('_', ' ')} #{selectedEvent.id}
                                    </SheetTitle>
                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${LIFECYCLE_CONFIG[selectedEvent.status].bg} ${LIFECYCLE_CONFIG[selectedEvent.status].color} ${LIFECYCLE_CONFIG[selectedEvent.status].border}`}>
                                        {LIFECYCLE_CONFIG[selectedEvent.status].label}
                                    </span>
                                </div>
                                <SheetDescription className="text-xs text-gray-500">
                                    Target: {selectedEvent.target.target_type} #{selectedEvent.target.target_id}
                                    {selectedEvent.created_at && <> &middot; Created {formatDateTime(selectedEvent.created_at)}</>}
                                </SheetDescription>
                            </SheetHeader>

                            {detailLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="size-5 animate-spin text-[#2B4C8C]" />
                                </div>
                            ) : (
                                <div className="flex-1 space-y-5 p-4">
                                    <div>
                                        <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Quick Actions</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {quickActions.map((action) => {
                                                const isCurrent = selectedEvent.status === action.status;
                                                const isDisabled = isCurrent || actionLoading === action.status;
                                                return (
                                                    <button
                                                        key={action.status}
                                                        type="button"
                                                        disabled={isDisabled}
                                                        onClick={(e) => { e.stopPropagation(); performAction(action.status); }}
                                                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed ${action.color} ${isCurrent ? 'ring-1 ring-inset ring-current' : ''}`}
                                                    >
                                                        {actionLoading === action.status ? (
                                                            <Loader2 className="size-3 animate-spin" />
                                                        ) : action.icon}
                                                        {action.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {statusDetail && (
                                        <div>
                                            <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Lifecycle Timeline</h3>
                                            <div className="space-y-2">
                                                {statusDetail.history.length === 0 ? (
                                                    <p className="text-xs text-gray-400">No history available.</p>
                                                ) : (
                                                    <div className="relative space-y-0">
                                                        {statusDetail.history.map((h, i) => {
                                                            const cfg = LIFECYCLE_CONFIG[h.status as LifecycleStatus] ?? LIFECYCLE_CONFIG.generated;
                                                            return (
                                                                <div key={h.id} className="flex gap-3 pb-3">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className={`size-2 rounded-full ${cfg.bg} ring-2 ring-white`} />
                                                                        {i < statusDetail.history.length - 1 && (
                                                                            <div className="mt-0.5 w-px flex-1 bg-gray-200" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</p>
                                                                        <p className="text-[10px] text-gray-400">{formatDateTime(h.status_changed_at)}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {impactData && (
                                        <div>
                                            <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Impact Measurement</h3>
                                            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                                <div className="flex items-baseline gap-2">
                                                    <span className={`text-2xl font-bold ${getScoreColor(impactData.overall_score)}`}>
                                                        {impactData.overall_score}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">/ 100</span>
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                        impactData.classification === 'excellent' ? 'bg-emerald-50 text-emerald-600' :
                                                        impactData.classification === 'good' ? 'bg-blue-50 text-blue-600' :
                                                        impactData.classification === 'fair' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-red-50 text-red-600'
                                                    }`}>
                                                        {impactData.classification}
                                                    </span>
                                                </div>
                                                {impactData.summary && (
                                                    <p className="mt-1.5 text-[10px] text-gray-500 whitespace-pre-line">{impactData.summary}</p>
                                                )}
                                            </div>
                                            {impactData.metrics.length > 0 && (
                                                <div className="mt-2 space-y-1.5">
                                                    {impactData.metrics.map((m) => (
                                                        <div key={m.metric} className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 text-xs">
                                                            <span className="text-gray-600 capitalize">{m.metric.replace(/_/g, ' ')}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-400">{m.before}</span>
                                                                <span className="text-gray-300">&rarr;</span>
                                                                <span className={m.is_improvement ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                                                                    {m.after}
                                                                </span>
                                                                {m.delta !== 0 && (
                                                                    <span className={`text-[10px] ${m.is_improvement ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                        {m.is_improvement ? '+' : ''}{m.delta.toFixed(1)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedEvent.snapshot?.metrics && Object.keys(selectedEvent.snapshot.metrics).length > 0 && (
                                        <div>
                                            <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Snapshot Metrics</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(selectedEvent.snapshot.metrics).map(([key, val]) => (
                                                    <div key={key} className="rounded-lg border border-gray-100 bg-white px-3 py-2">
                                                        <p className="text-[10px] font-medium text-gray-500 capitalize truncate">{key.replace(/_/g, ' ')}</p>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {typeof val === 'number' ? (typeof val === 'number' && val % 1 !== 0 ? val.toFixed(1) : val) : String(val ?? '—')}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedEvent.version && (
                                        <div>
                                            <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Version Info</h3>
                                            <div className="rounded-lg border border-gray-100 bg-white p-3 text-xs text-gray-600">
                                                <div className="flex items-center justify-between">
                                                    <span>Version {selectedEvent.version.version_number}</span>
                                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${PRIORITY_CONFIG[getPriorityLabel(selectedEvent.version.priority)].bg} ${PRIORITY_CONFIG[getPriorityLabel(selectedEvent.version.priority)].color}`}>
                                                        Priority {selectedEvent.version.priority}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-[10px] text-gray-400 capitalize">Type: {selectedEvent.version.type}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Relationship</h3>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const targetType = selectedEvent.target.target_type;
                                                const targetId = selectedEvent.target.target_id;
                                                if (targetType === 'workflow') {
                                                    router.visit(`/crm/workflows/${targetId}`);
                                                } else if (targetType === 'approval') {
                                                    router.visit(`/crm/approvals/${targetId}`);
                                                }
                                            }}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                        >
                                            <BarChart3 className="size-3.5" />
                                            View related {selectedEvent.target.target_type}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
