import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Activity,
    BarChart3,
    Target,
    Lightbulb,
    ArrowLeft,
    CheckCircle,
    Clock,
    AlertTriangle,
    Zap,
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface OverallStats {
    total_recommendations: number;
    active_recommendations: number;
    completed_recommendations: number;
    avg_impact_score: number;
}

interface AutoScore {
    overall_score?: number;
    classification?: string;
}

interface HealthData {
    maturity: number;
    components: {
        name: string;
        score: number;
        weight: number;
        status: string;
    }[];
    status_distribution: { healthy: number; warning: number; critical: number };
    recent_changes: { metric: string; label: string; status: string }[];
}

interface TrendData {
    direction?: string;
    percentage?: number;
    period?: string;
}

interface ActivityItem {
    type: string;
    count: number;
    label: string;
}

interface DashboardData {
    overall_stats: OverallStats;
    automation_score: AutoScore;
    health: HealthData | Record<string, never>;
    trend: TrendData;
    recent_activity: ActivityItem[];
}

interface OpportunityData {
    id: string;
    title: string;
    priority: string;
    expected_gain: number;
    confidence: number;
    estimated_effort: string;
    category: string;
}

interface RoadmapPhase {
    phase: string;
    title: string;
    items: {
        opportunity_id: string;
        title: string;
        expected_gain: number;
        effort: string;
        steps: string[];
    }[];
}

interface CenterData {
    dashboard: DashboardData;
    opportunities: OpportunityData[];
    roadmap: { phases: RoadmapPhase[] };
    health: HealthData;
}

export default function OptimizationCenterPage() {
    const [data, setData] = useState<CenterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch('/api/crm/optimization/center')
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to load optimization center');
                }
                return res.json();
            })
            .then((d) => {
                setData(d);
                setLoading(null);
            })
            .catch((e) => {
                setError(e.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#2B4C8C]" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm text-red-600">
                    {error ?? 'No optimization data available.'}
                </p>
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

    const { dashboard, opportunities, roadmap, health } = data;

    const getScoreColor = (s: number) =>
        s >= 70
            ? 'text-emerald-600'
            : s >= 40
              ? 'text-amber-600'
              : 'text-red-600';
    const getBarColor = (s: number) =>
        s >= 70 ? 'bg-emerald-500' : s >= 40 ? 'bg-amber-500' : 'bg-red-500';

    const effortColors: Record<string, string> = {
        high: 'text-red-600 bg-red-50 border-red-200',
        medium: 'text-amber-600 bg-amber-50 border-amber-200',
        low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    };

    const priorityColors: Record<string, string> = {
        critical: 'text-red-600 bg-red-50 border-red-200',
        high: 'text-orange-600 bg-orange-50 border-orange-200',
        medium: 'text-amber-600 bg-amber-50 border-amber-200',
        low: 'text-gray-600 bg-gray-50 border-gray-200',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                        Optimization Center
                    </h1>
                    <p className="mt-0.5 text-xs text-gray-500">
                        Continuous Optimization Platform
                    </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                    <Activity className="size-3" />
                    Live
                </span>
            </div>

            {/* Executive Summary */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs tracking-wider text-gray-500 uppercase">
                        Auto Score
                    </p>
                    <div className="mt-1 flex items-baseline gap-1">
                        <p
                            className={`text-2xl font-bold ${getScoreColor(dashboard.automation_score.overall_score ?? 0)}`}
                        >
                            {dashboard.automation_score.overall_score ?? '-'}
                        </p>
                        {dashboard.trend.direction && (
                            <span
                                className={`inline-flex items-center text-xs ${dashboard.trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}
                            >
                                {dashboard.trend.direction === 'up' ? (
                                    <TrendingUp className="size-3" />
                                ) : (
                                    <TrendingDown className="size-3" />
                                )}
                                {dashboard.trend.percentage}%
                            </span>
                        )}
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs tracking-wider text-gray-500 uppercase">
                        Maturity
                    </p>
                    <p
                        className={`mt-1 text-2xl font-bold ${getScoreColor(health.maturity)}`}
                    >
                        {health.maturity}/100
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs tracking-wider text-gray-500 uppercase">
                        Active Recs
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                        {dashboard.overall_stats.active_recommendations}
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs tracking-wider text-gray-500 uppercase">
                        Avg Impact
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                        {dashboard.overall_stats.avg_impact_score}/100
                    </p>
                </div>
            </div>

            {/* Priority Opportunities */}
            {opportunities.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4 text-amber-500" />
                            <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Priority Opportunities ({opportunities.length})
                            </p>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {opportunities.map((opp) => (
                            <div
                                key={opp.id}
                                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {opp.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-500 capitalize">
                                        {opp.category} &middot;{' '}
                                        {opp.estimated_effort} effort
                                    </p>
                                </div>
                                <div className="ml-4 flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">
                                            Gain
                                        </p>
                                        <p className="text-sm font-semibold text-emerald-600">
                                            +{opp.expected_gain}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">
                                            Confidence
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {opp.confidence}%
                                        </p>
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${priorityColors[opp.priority] ?? ''}`}
                                    >
                                        {opp.priority}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Roadmap / Recent Activity */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Roadmap */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                        <Clock className="size-4 text-[#2B4C8C]" />
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Roadmap
                        </p>
                    </div>
                    <div className="space-y-4 p-4">
                        {roadmap.phases.map((phase) => (
                            <div key={phase.phase}>
                                <p className="mb-2 text-xs font-semibold text-gray-900 uppercase">
                                    {phase.title}
                                </p>
                                <div className="space-y-2">
                                    {phase.items.map((item) => (
                                        <div
                                            key={item.opportunity_id}
                                            className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                                        >
                                            <p className="text-xs font-medium text-gray-900">
                                                {item.title}
                                            </p>
                                            <div className="mt-1.5 flex items-center gap-2">
                                                {item.steps.map((step) => (
                                                    <span
                                                        key={step}
                                                        className="inline-flex items-center gap-0.5 text-xs text-gray-500"
                                                    >
                                                        <CheckCircle className="size-3 text-gray-400" />{' '}
                                                        {step}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {roadmap.phases.length === 0 && (
                            <p className="py-4 text-center text-xs text-gray-500">
                                No roadmap items.
                            </p>
                        )}
                    </div>
                </div>

                {/* System Health */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                        <BarChart3 className="size-4 text-[#2B4C8C]" />
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                            System Health
                        </p>
                    </div>
                    <div className="space-y-3 p-4">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                                <CheckCircle className="size-3" />{' '}
                                {health.status_distribution.healthy} Healthy
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                                <AlertTriangle className="size-3" />{' '}
                                {health.status_distribution.warning} Warning
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-700">
                                <AlertTriangle className="size-3" />{' '}
                                {health.status_distribution.critical} Critical
                            </span>
                        </div>

                        <div className="space-y-2">
                            {health.components.map((comp) => (
                                <div
                                    key={comp.name}
                                    className="flex items-center gap-3"
                                >
                                    <span className="w-40 truncate text-xs text-gray-600">
                                        {comp.name}
                                    </span>
                                    <div className="h-2 flex-1 rounded-full bg-gray-100">
                                        <div
                                            className={`h-2 rounded-full ${getBarColor(comp.score)}`}
                                            style={{ width: `${comp.score}%` }}
                                        />
                                    </div>
                                    <span
                                        className={`w-12 text-right text-xs font-medium ${getScoreColor(comp.score)}`}
                                    >
                                        {comp.score}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        {dashboard.recent_activity.length > 0 && (
                            <div className="border-t border-gray-100 pt-3">
                                <p className="mb-2 text-xs font-medium text-gray-500 uppercase">
                                    Recent Activity
                                </p>
                                <div className="space-y-1.5">
                                    {dashboard.recent_activity.map((act, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 text-xs text-gray-700"
                                        >
                                            <Activity className="size-3 text-[#2B4C8C]" />
                                            {act.label} ({act.count})
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
