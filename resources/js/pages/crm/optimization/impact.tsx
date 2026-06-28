import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Minus,
    Activity,
    BarChart3,
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface MetricImpactData {
    metric: string;
    before: number;
    after: number;
    delta: number;
    percentage: number;
    direction: string;
    weight: number;
    score: number;
    is_improvement: boolean;
}

interface ImpactResultData {
    overall_score: number;
    health_delta: number;
    metrics: MetricImpactData[];
    improvements: {
        metric: string;
        before: number;
        after: number;
        delta: number;
        percentage: number;
        direction: string;
    }[];
    regressions: {
        metric: string;
        before: number;
        after: number;
        delta: number;
        percentage: number;
        direction: string;
    }[];
    summary: string;
    classification: string;
    total_weight: number;
}

interface Props {
    recommendationId: number;
    recommendationType: string;
    targetType: string;
    targetId: number;
}

function formatPercent(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(1)}%`;
}

function formatDelta(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}`;
}

export default function ImpactPage({
    recommendationId,
    recommendationType,
    targetType,
    targetId,
}: Props) {
    const [impact, setImpact] = useState<ImpactResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(
            `/api/crm/optimization/recommendations/${recommendationId}/impact`,
        )
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to load impact data');
                }
                return res.json();
            })
            .then((data) => {
                setImpact(data);
                setLoading(null);
            })
            .catch((e) => {
                setError(e.message);
                setLoading(false);
            });
    }, [recommendationId]);

    const classificationColors: Record<string, string> = {
        excellent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        good: 'text-blue-600 bg-blue-50 border-blue-200',
        neutral: 'text-amber-600 bg-amber-50 border-amber-200',
        negative: 'text-orange-600 bg-orange-50 border-orange-200',
        critical: 'text-red-600 bg-red-50 border-red-200',
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#2B4C8C]" />
            </div>
        );
    }

    if (error || !impact) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm text-red-600">
                    {error ?? 'No impact data available.'}
                </p>
                <button
                    type="button"
                    onClick={() => router.visit(`/crm/optimization`)}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                >
                    <ArrowLeft className="size-3" /> Back to Optimization Center
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button
                type="button"
                onClick={() => router.visit(`/crm/optimization`)}
                className="inline-flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
            >
                <ArrowLeft className="size-3" /> Back to Optimization Center
            </button>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                        Recommendation Impact
                    </h1>
                    <p className="mt-0.5 text-xs text-gray-500">
                        {recommendationType} &middot; {targetType}#{targetId}
                    </p>
                </div>
                <span
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${classificationColors[impact.classification] ?? 'border-gray-200 bg-gray-50 text-gray-600'}`}
                >
                    <Activity className="size-3" />
                    {impact.classification.charAt(0).toUpperCase() +
                        impact.classification.slice(1)}
                </span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Overall Impact Score
                    </p>
                    <p
                        className={`mt-1 text-2xl font-bold ${impact.overall_score >= 50 ? 'text-emerald-600' : impact.overall_score >= 20 ? 'text-amber-600' : 'text-red-600'}`}
                    >
                        {impact.overall_score}/100
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Health Score Change
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                        {impact.health_delta > 0 ? (
                            <TrendingUp className="size-5 text-emerald-500" />
                        ) : impact.health_delta < 0 ? (
                            <TrendingDown className="size-5 text-red-500" />
                        ) : (
                            <Minus className="size-5 text-gray-400" />
                        )}
                        <p
                            className={`text-2xl font-bold ${impact.health_delta > 0 ? 'text-emerald-600' : impact.health_delta < 0 ? 'text-red-600' : 'text-gray-600'}`}
                        >
                            {formatDelta(impact.health_delta)}
                        </p>
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Metrics Tracked
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                        <BarChart3 className="size-5 text-[#2B4C8C]" />
                        <p className="text-2xl font-bold text-gray-900">
                            {impact.metrics.length}
                        </p>
                        <span className="text-xs text-gray-500">
                            ({impact.improvements.length} improved,{' '}
                            {impact.regressions.length} regressed)
                        </span>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Summary
                </p>
                <p className="text-sm text-gray-700">{impact.summary}</p>
            </div>

            {/* Metrics Comparison Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Metrics Comparison
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-gray-50 text-left tracking-wider text-gray-500 uppercase">
                                <th className="px-4 py-2 font-medium">
                                    Metric
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Before
                                </th>
                                <th className="px-4 py-2 font-medium">After</th>
                                <th className="px-4 py-2 font-medium">Delta</th>
                                <th className="px-4 py-2 font-medium">
                                    Change
                                </th>
                                <th className="px-4 py-2 font-medium">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {impact.metrics.map((metric) => (
                                <tr
                                    key={metric.metric}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-2 font-medium text-gray-900 capitalize">
                                        {metric.metric.replace(/_/g, ' ')}
                                    </td>
                                    <td className="px-4 py-2 text-gray-600">
                                        {metric.before.toFixed(4)}
                                    </td>
                                    <td className="px-4 py-2 text-gray-600">
                                        {metric.after.toFixed(4)}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={
                                                metric.is_improvement
                                                    ? 'text-emerald-600'
                                                    : 'text-red-600'
                                            }
                                        >
                                            {formatDelta(metric.delta)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`inline-flex items-center gap-0.5 ${metric.is_improvement ? 'text-emerald-600' : 'text-red-600'}`}
                                        >
                                            {metric.direction ===
                                            'increased' ? (
                                                <TrendingUp className="size-3" />
                                            ) : metric.direction ===
                                              'decreased' ? (
                                                <TrendingDown className="size-3" />
                                            ) : (
                                                <Minus className="size-3" />
                                            )}
                                            {metric.direction} (
                                            {metric.percentage}%)
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="font-medium text-gray-900">
                                            {metric.score.toFixed(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {impact.metrics.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-6 text-center text-gray-500"
                                    >
                                        No metrics available for comparison.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Improvements & Regressions */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {impact.improvements.length > 0 && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="mb-2 text-xs font-medium tracking-wider text-emerald-700 uppercase">
                            Improvements ({impact.improvements.length})
                        </p>
                        <ul className="space-y-1.5">
                            {impact.improvements.map((imp) => (
                                <li
                                    key={imp.metric}
                                    className="flex items-center gap-2 text-xs text-emerald-800"
                                >
                                    <TrendingUp className="size-3 shrink-0" />
                                    <span className="capitalize">
                                        {imp.metric.replace(/_/g, ' ')}
                                    </span>
                                    <span className="font-medium">
                                        {formatDelta(imp.delta)}
                                    </span>
                                    <span>
                                        ({imp.percentage > 0 ? '+' : ''}
                                        {imp.percentage}%)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {impact.regressions.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="mb-2 text-xs font-medium tracking-wider text-red-700 uppercase">
                            Regressions ({impact.regressions.length})
                        </p>
                        <ul className="space-y-1.5">
                            {impact.regressions.map((reg) => (
                                <li
                                    key={reg.metric}
                                    className="flex items-center gap-2 text-xs text-red-800"
                                >
                                    <TrendingDown className="size-3 shrink-0" />
                                    <span className="capitalize">
                                        {reg.metric.replace(/_/g, ' ')}
                                    </span>
                                    <span className="font-medium">
                                        {formatDelta(reg.delta)}
                                    </span>
                                    <span>
                                        ({reg.percentage > 0 ? '+' : ''}
                                        {reg.percentage}%)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
