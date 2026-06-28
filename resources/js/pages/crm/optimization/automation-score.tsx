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
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface BreakdownItem {
    label: string;
    score: number;
    weight: number;
    description: string;
    weighted_score: number;
}

interface AutomationScoreData {
    overall_score: number;
    breakdown: BreakdownItem[];
    classification: string;
    summary: string;
    trend: {
        direction: string;
        magnitude: number;
        period: string;
        percentage: number;
    } | null;
    metadata: Record<string, unknown>;
}

export default function AutomationScorePage() {
    const [data, setData] = useState<AutomationScoreData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch('/api/crm/optimization/automation-score')
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to load automation score');
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

    const classificationColors: Record<string, string> = {
        excellent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        good: 'text-blue-600 bg-blue-50 border-blue-200',
        fair: 'text-amber-600 bg-amber-50 border-amber-200',
        poor: 'text-orange-600 bg-orange-50 border-orange-200',
        critical: 'text-red-600 bg-red-50 border-red-200',
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-blue-500';
        if (score >= 40) return 'bg-amber-500';
        if (score >= 20) return 'bg-orange-500';
        return 'bg-red-500';
    };

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
                    {error ?? 'No automation score available.'}
                </p>
                <button
                    type="button"
                    onClick={() => router.visit('/crm/optimization/center')}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                >
                    <ArrowLeft className="size-3" /> Back to Optimization Center
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={() => router.visit('/crm/optimization')}
                className="inline-flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
            >
                <ArrowLeft className="size-3" /> Back to Optimization Center
            </button>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                        Automation Score
                    </h1>
                    <p className="mt-0.5 text-xs text-gray-500">
                        Overall automation health for this workflow
                    </p>
                </div>
                <span
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${classificationColors[data.classification] ?? 'border-gray-200 bg-gray-50 text-gray-600'}`}
                >
                    <Activity className="size-3" />
                    {data.classification.charAt(0).toUpperCase() +
                        data.classification.slice(1)}
                </span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Automation Score
                </p>
                <p
                    className={`text-5xl font-bold ${data.overall_score >= 60 ? 'text-emerald-600' : data.overall_score >= 40 ? 'text-amber-600' : 'text-red-600'}`}
                >
                    {data.overall_score}
                    <span className="text-2xl text-gray-400">/100</span>
                </p>
                {data.trend && (
                    <div
                        className={`mt-2 inline-flex items-center gap-1 text-xs ${data.trend.direction === 'up' ? 'text-emerald-600' : data.trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'}`}
                    >
                        {data.trend.direction === 'up' ? (
                            <TrendingUp className="size-3" />
                        ) : data.trend.direction === 'down' ? (
                            <TrendingDown className="size-3" />
                        ) : (
                            <Minus className="size-3" />
                        )}
                        {data.trend.direction === 'up' ? '+' : ''}
                        {data.trend.percentage}% over {data.trend.period}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.breakdown.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                                {item.label}
                            </p>
                            <span className="text-xs text-gray-400">
                                {item.weight * 100}%
                            </span>
                        </div>
                        <p
                            className={`text-2xl font-bold ${item.score >= 60 ? 'text-emerald-600' : item.score >= 40 ? 'text-amber-600' : 'text-red-600'}`}
                        >
                            {item.score}
                            <span className="text-sm text-gray-400">/100</span>
                        </p>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
                            <div
                                className={`h-1.5 rounded-full transition-all ${getScoreBarColor(item.score)}`}
                                style={{ width: `${item.score}%` }}
                            />
                        </div>
                        <p className="mt-1.5 text-xs text-gray-500">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2">
                    <Lightbulb className="size-4 text-amber-500" />
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Summary & Insights
                    </p>
                </div>
                <p className="text-sm whitespace-pre-line text-gray-700">
                    {data.summary}
                </p>
            </div>

            {data.breakdown.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-100 px-4 py-3">
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Detailed Breakdown
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-gray-50 text-left tracking-wider text-gray-500 uppercase">
                                    <th className="px-4 py-2 font-medium">
                                        Component
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Score
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Weight
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Weighted Score
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.breakdown.map((item) => (
                                    <tr
                                        key={item.label}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-2 font-medium text-gray-900">
                                            {item.label}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`font-medium ${item.score >= 60 ? 'text-emerald-600' : item.score >= 40 ? 'text-amber-600' : 'text-red-600'}`}
                                            >
                                                {item.score}/100
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-gray-600">
                                            {item.weight * 100}%
                                        </td>
                                        <td className="px-4 py-2 text-gray-900">
                                            {item.weighted_score.toFixed(1)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
