import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Minus,
    Activity,
    BarChart3,
    Target,
    Lightbulb,
    ChevronDown,
    ChevronUp,
    Award,
    AlertTriangle,
    Clock,
    Zap,
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface BreakdownItem {
    label: string;
    score: number;
    weight: number;
    description: string;
    weighted_score: number;
}

interface SnapshotData {
    date: string;
    overall_score: number;
    classification: string;
    breakdown: BreakdownItem[];
}

interface TrendData {
    direction: string;
    magnitude: number;
    period: string;
    percentage: number;
}

interface ScoreHistoryData {
    snapshots: SnapshotData[];
    trend: TrendData | null;
    regression_events: { metric: string; date: string; severity: string }[];
    milestones: { label: string; date: string; score: number }[];
    overall_change: number;
}

interface TimelinePoint {
    date: string;
    score: number;
    classification: string;
}

interface InsightPeriod {
    period: { from: string; to: string };
    insights: { type: string; message: string; severity: string }[];
}

const CLASSIFICATION_COLORS: Record<string, string> = {
    excellent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    good: 'text-blue-600 bg-blue-50 border-blue-200',
    fair: 'text-amber-600 bg-amber-50 border-amber-200',
    poor: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
};

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
}

function getBarColor(score: number): string {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
}

export default function AutomationScoreHistoryPage() {
    const [history, setHistory] = useState<ScoreHistoryData | null>(null);
    const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
    const [trendData, setTrendData] = useState<{ daily: TimelinePoint[]; weekly: TimelinePoint[]; monthly: TimelinePoint[]; rolling_7day: TimelinePoint[] } | null>(null);
    const [insights, setInsights] = useState<InsightPeriod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trendView, setTrendView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch('/api/crm/optimization/automation-score/history').then((r) => r.ok ? r.json() : null),
            fetch('/api/crm/optimization/automation-score/timeline').then((r) => r.ok ? r.json() : null),
            fetch('/api/crm/optimization/automation-score/trends').then((r) => r.ok ? r.json() : null),
            fetch('/api/crm/optimization/automation-score/insights').then((r) => r.ok ? r.json() : null),
        ])
            .then(([h, tl, tr, ins]) => {
                if (h) setHistory(h);
                if (tl) setTimeline(tl.timeline ?? []);
                if (tr) setTrendData(tr);
                if (ins) setInsights(ins.periods ?? []);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="size-6 animate-spin rounded-full border-4 border-gray-200 border-t-[#2B4C8C]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const snapshots = history?.snapshots ?? [];
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.visit('/crm/optimization/automation-score')}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                        <ArrowLeft className="size-3.5" />
                        Back to Score
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">Score History</h1>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Track automation score changes over time &middot; {snapshots.length} snapshots
                        </p>
                    </div>
                </div>
            </div>

            {snapshots.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-12">
                    <BarChart3 className="size-8 text-gray-300" />
                    <p className="mt-3 text-sm font-medium text-gray-900">No history available</p>
                    <p className="mt-1 text-xs text-gray-500">
                        Score snapshots will appear here as the automation score is calculated over time.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-[#e2e6ef] bg-[#e2e6ef] shadow-sm">
                        <div className="flex flex-col items-center gap-0.5 bg-white px-3 py-3">
                            <span className="text-lg font-semibold tracking-tight text-[#1a1a2e]">
                                {last?.overall_score ?? '—'}
                            </span>
                            <span className="text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">Current Score</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 bg-white px-3 py-3">
                            <span className={`text-lg font-semibold tracking-tight ${history && history.overall_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {history ? `${history.overall_change >= 0 ? '+' : ''}${history.overall_change}` : '—'}
                            </span>
                            <span className="text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">Overall Change</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 bg-white px-3 py-3">
                            {history?.trend ? (
                                <span className={`inline-flex items-center gap-1 text-lg font-semibold tracking-tight ${history.trend.direction === 'up' ? 'text-emerald-600' : history.trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                                    {history.trend.direction === 'up' ? <TrendingUp className="size-4" /> : history.trend.direction === 'down' ? <TrendingDown className="size-4" /> : <Minus className="size-4" />}
                                    {history.trend.percentage}%
                                </span>
                            ) : (
                                <span className="text-lg font-semibold tracking-tight text-gray-400">—</span>
                            )}
                            <span className="text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">Trend</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 bg-white px-3 py-3">
                            <span className="text-lg font-semibold tracking-tight text-[#1a1a2e]">
                                {first?.overall_score ?? '—'}
                            </span>
                            <span className="text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">Earliest Score</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Score Timeline</h2>
                            <div className="flex gap-1">
                                {(['daily', 'weekly', 'monthly'] as const).map((view) => (
                                    <button
                                        key={view}
                                        type="button"
                                        onClick={() => setTrendView(view)}
                                        className={cn(
                                            'rounded-md px-2 py-1 text-[10px] font-medium transition-colors',
                                            trendView === view
                                                ? 'bg-[#2B4C8C] text-white'
                                                : 'text-gray-500 hover:bg-gray-100'
                                        )}
                                    >
                                        {view.charAt(0).toUpperCase() + view.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1">
                            {(trendData?.[trendView] ?? timeline).map((point, i) => {
                                const maxScore = Math.max(...(trendData?.[trendView] ?? timeline).map((p) => p.score), 100);
                                const barWidth = Math.max((point.score / maxScore) * 100, 2);
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-24 text-[10px] text-gray-500 shrink-0">{formatDate(point.date)}</span>
                                        <div className="h-5 flex-1 rounded-md bg-gray-100">
                                            <div
                                                className={`h-full rounded-md ${getBarColor(point.score)} transition-all`}
                                                style={{ width: `${barWidth}%` }}
                                            />
                                        </div>
                                        <span className={`w-10 text-right text-xs font-semibold ${getScoreColor(point.score)}`}>
                                            {point.score}
                                        </span>
                                        <span className={cn(
                                            'w-16 rounded-full px-1.5 py-0.5 text-[9px] font-medium text-center',
                                            CLASSIFICATION_COLORS[point.classification]?.split(' ').slice(0, 2).join(' ') ?? ''
                                        )}>
                                            {point.classification}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {snapshots.length > 0 && (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-4 py-2.5">
                                <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Snapshot Comparison</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/80">
                                            <th className="px-4 py-2 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">Metric</th>
                                            {snapshots.map((s) => (
                                                <th key={s.date} className="px-4 py-2 text-right text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                                                    {formatDate(s.date)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {snapshots[0]?.breakdown.map((b, i) => (
                                            <tr key={i} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-2.5 text-xs font-medium text-gray-700">{b.label}</td>
                                                {snapshots.map((s) => {
                                                    const metric = s.breakdown.find((m) => m.label === b.label);
                                                    return (
                                                        <td key={s.date} className="px-4 py-2.5 text-right">
                                                            <span className={`text-xs font-semibold ${metric ? getScoreColor(metric.score) : 'text-gray-300'}`}>
                                                                {metric?.score ?? '—'}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                        <tr className="border-t-2 border-gray-100 bg-gray-50/50">
                                            <td className="px-4 py-2.5 text-xs font-bold text-gray-800">Overall Score</td>
                                            {snapshots.map((s) => (
                                                <td key={s.date} className="px-4 py-2.5 text-right">
                                                    <span className={`text-xs font-bold ${getScoreColor(s.overall_score)}`}>
                                                        {s.overall_score}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {(history?.milestones && history.milestones.length > 0) && (
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                <Award className="size-3.5" />
                                Milestones
                            </h2>
                            <div className="space-y-2">
                                {history.milestones.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <Zap className="size-3.5 text-amber-500" />
                                            <span className="text-xs font-medium text-gray-900">{m.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-gray-400">{formatDate(m.date)}</span>
                                            <span className={`text-xs font-semibold ${getScoreColor(m.score)}`}>{m.score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(history?.regression_events && history.regression_events.length > 0) && (
                        <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm">
                            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-red-500 uppercase">
                                <AlertTriangle className="size-3.5" />
                                Regression Events
                            </h2>
                            <div className="space-y-2">
                                {history.regression_events.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <TrendingDown className="size-3.5 text-red-500" />
                                            <span className="text-xs font-medium text-gray-900 capitalize">{r.metric.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full px-1.5 py-0.5 text-[9px] font-medium bg-red-100 text-red-600 capitalize">{r.severity}</span>
                                            <span className="text-[10px] text-gray-400">{formatDate(r.date)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {insights.length > 0 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                <Lightbulb className="size-3.5" />
                                Insights
                            </h2>
                            <div className="space-y-1.5">
                                {insights.map((period, i) => (
                                    <div key={i} className="overflow-hidden rounded-lg border border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}
                                            className="flex w-full items-center justify-between bg-gray-50 px-3 py-2 text-left transition-colors hover:bg-gray-100"
                                        >
                                            <span className="text-[10px] font-medium text-gray-600">
                                                {formatDate(period.period.from)} &rarr; {formatDate(period.period.to)}
                                            </span>
                                            {expandedInsight === i ? <ChevronUp className="size-3 text-gray-400" /> : <ChevronDown className="size-3 text-gray-400" />}
                                        </button>
                                        {expandedInsight === i && (
                                            <div className="space-y-1.5 px-3 py-2">
                                                {period.insights.length === 0 ? (
                                                    <p className="text-xs text-gray-400">No insights for this period.</p>
                                                ) : (
                                                    period.insights.map((ins, j) => (
                                                        <div key={j} className="flex items-start gap-2 text-xs">
                                                            <span className={cn(
                                                                'mt-0.5 size-1.5 shrink-0 rounded-full',
                                                                ins.severity === 'positive' ? 'bg-emerald-500' : ins.severity === 'negative' ? 'bg-red-500' : 'bg-amber-500'
                                                            )} />
                                                            <div>
                                                                <p className="text-gray-700">{ins.message}</p>
                                                                <span className="text-[9px] text-gray-400 capitalize">{ins.type.replace(/_/g, ' ')}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
