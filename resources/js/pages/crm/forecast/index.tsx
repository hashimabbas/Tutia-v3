import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BarChart3,
    Calendar,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Users,
    Activity,
    Target,
    Download,
    RefreshCw,
    HelpCircle,
    Gauge,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Owner {
    id: number;
    name: string;
}

interface Organization {
    id: number;
    name: string;
}

interface ConfidenceFactor {
    name: string;
    weight: number;
    score: number;
}

interface Deal {
    id: number;
    title: string;
    value: number;
    stage: string;
    forecast_category: string | null;
    probability: number;
    expected_close_date: string | null;
    owner: Owner | null;
    organization: Organization | null;
    confidence: number;
    suggested_category: string;
    mismatch: boolean;
    factors: ConfidenceFactor[];
}

interface TeamMember {
    name: string;
    commit: number;
    best_case: number;
    pipeline: number;
    total: number;
}

interface HealthDistribution {
    healthy: number;
    at_risk: number;
    critical: number;
}

interface Summary {
    commit: number;
    best_case: number;
    pipeline: number;
    uncategorized: number;
    weighted: number;
}

interface ForecastPageProps {
    period: string;
    summary: Summary;
    quota: number;
    deals: Deal[];
    team_breakdown: TeamMember[];
    health_distribution: HealthDistribution;
    is_manager: boolean;
}

const STAGE_LABELS: Record<string, string> = {
    qualification: 'Qualification',
    meeting: 'Meeting',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost',
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SDG',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function parsePeriod(period: string): { year: number; quarter: number } {
    const [y, q] = period.split('-Q');
    return { year: parseInt(y, 10), quarter: parseInt(q, 10) };
}

function formatPeriodLabel(period: string): string {
    const { year, quarter } = parsePeriod(period);
    const qLabels: Record<number, string> = {
        1: 'Q1',
        2: 'Q2',
        3: 'Q3',
        4: 'Q4',
    };
    return `${qLabels[quarter]} ${year}`;
}

function shiftPeriod(period: string, delta: number): string {
    const { year, quarter } = parsePeriod(period);
    let newQ = quarter + delta;
    let newY = year;
    while (newQ < 1) {
        newQ += 4;
        newY -= 1;
    }
    while (newQ > 4) {
        newQ -= 4;
        newY += 1;
    }
    return `${newY}-Q${newQ}`;
}

function generatePeriodOptions(): string[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
    const options: string[] = [];
    for (let y = currentYear - 1; y <= currentYear + 1; y++) {
        for (let q = 1; q <= 4; q++) {
            options.push(`${y}-Q${q}`);
        }
    }
    return options;
}

function ConfidenceBar({ value }: { value: number }) {
    const color =
        value >= 80
            ? 'bg-emerald-500'
            : value >= 50
              ? 'bg-amber-500'
              : 'bg-slate-400';

    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#f0f2f7]">
                <div
                    className={cn('h-full rounded-full transition-all', color)}
                    style={{ width: `${Math.min(value, 100)}%` }}
                />
            </div>
            <span
                className={cn(
                    'text-[11px] font-semibold tabular-nums',
                    value >= 80
                        ? 'text-emerald-600'
                        : value >= 50
                          ? 'text-amber-600'
                          : 'text-slate-500',
                )}
            >
                {value}%
            </span>
        </div>
    );
}

function ConfidenceFactors({ factors }: { factors: ConfidenceFactor[] }) {
    const maxWeight = factors.reduce((m, f) => m + f.weight, 0) || 1;
    return (
        <div className="space-y-1.5">
            {factors.map((f) => {
                const pct = (f.weight / maxWeight) * 100;
                const scoreColor =
                    f.score >= 70
                        ? 'text-emerald-600'
                        : f.score >= 40
                          ? 'text-amber-600'
                          : 'text-rose-600';
                return (
                    <div
                        key={f.name}
                        className="flex items-center justify-between gap-2"
                    >
                        <div className="flex min-w-0 items-center gap-1.5">
                            <span
                                className="h-1 w-1 shrink-0 rounded-full"
                                style={{
                                    backgroundColor: `hsl(${pct * 1.2}, 60%, 50%)`,
                                }}
                            />
                            <span className="truncate text-[11px] text-[#6b7280]">
                                {f.name}
                            </span>
                        </div>
                        <span
                            className={cn(
                                'text-[11px] font-medium tabular-nums',
                                scoreColor,
                            )}
                        >
                            {f.score}/100
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function CategoryBadge({
    category,
    suggested,
}: {
    category: string | null;
    suggested?: string;
}) {
    const config: Record<string, { label: string; classes: string }> = {
        commit: {
            label: 'Commit',
            classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        best_case: {
            label: 'Best Case',
            classes: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        pipeline: {
            label: 'Pipeline',
            classes: 'bg-amber-50 text-amber-700 border-amber-200',
        },
    };

    const isMismatch = suggested && category && category !== suggested;
    const display = category ?? 'Uncategorized';

    const cfg = config[display] ?? {
        label: 'Uncategorized',
        classes: 'bg-slate-50 text-slate-600 border-slate-200',
    };

    return (
        <div className="flex items-center gap-1.5">
            <span
                className={cn(
                    'rounded-md border px-2 py-0.5 text-[10px] font-medium',
                    cfg.classes,
                )}
            >
                {cfg.label}
            </span>
            {isMismatch && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent
                        side="bottom"
                        className="border-[#e2e6ef] bg-white p-2 text-[11px] text-[#6b7280] shadow-lg"
                    >
                        Suggested:{' '}
                        <span className="font-medium text-[#1a1a2e] capitalize">
                            {suggested}
                        </span>
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    );
}

function StageBadge({ stage }: { stage: string }) {
    const colors: Record<string, string> = {
        qualification: 'bg-slate-50 text-slate-700 border-slate-200',
        meeting: 'bg-blue-50 text-blue-700 border-blue-200',
        proposal: 'bg-violet-50 text-violet-700 border-violet-200',
        negotiation: 'bg-amber-50 text-amber-700 border-amber-200',
        closed_won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        closed_lost: 'bg-rose-50 text-rose-700 border-rose-200',
    };

    return (
        <span
            className={cn(
                'rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize',
                colors[stage] ?? 'border-slate-200 bg-slate-50 text-slate-600',
            )}
        >
            {STAGE_LABELS[stage] ?? stage}
        </span>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
    sublabel,
    progress,
    color,
}: {
    icon: any;
    label: string;
    value: number | string;
    sublabel?: string;
    progress?: number;
    color: string;
}) {
    return (
        <div className="group rounded-xl border border-[#e2e6ef] bg-white p-4 shadow-sm transition-all hover:border-[#c8cce0] hover:shadow-md">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-wider text-[#6b7280] uppercase">
                    {label}
                </span>
                <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors group-hover:brightness-95"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
            </div>
            <div className="mb-1 text-lg font-bold tracking-tight text-[#1a1a2e]">
                {typeof value === 'number' ? formatCurrency(value) : value}
            </div>
            {sublabel && (
                <p className="text-[11px] text-[#9ca3af]">{sublabel}</p>
            )}
            {typeof progress === 'number' && (
                <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0f2f7]">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${Math.min(progress, 100)}%`,
                                backgroundColor: color,
                            }}
                        />
                    </div>
                    <p className="mt-1 text-[10px] text-[#9ca3af]">
                        {progress.toFixed(1)}% attained
                    </p>
                </div>
            )}
        </div>
    );
}

export default function ForecastIndex({
    period,
    summary,
    quota,
    deals,
    team_breakdown,
    health_distribution,
    is_manager,
}: ForecastPageProps) {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('confidence');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const periodOptions = useMemo(() => generatePeriodOptions(), []);

    const navigatePeriod = (delta: number) => {
        const newPeriod = shiftPeriod(period, delta);
        router.get(
            `/crm/forecast?period=${newPeriod}`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const setPeriod = (p: string) => {
        router.get(
            `/crm/forecast?period=${p}`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const totalDeals = deals.length;
    const quotaAttainment = quota > 0 ? (summary.weighted / quota) * 100 : 0;

    const filteredDeals = useMemo(() => {
        let result = [...deals];

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (d) =>
                    d.title.toLowerCase().includes(q) ||
                    d.organization?.name.toLowerCase().includes(q) ||
                    d.owner?.name.toLowerCase().includes(q),
            );
        }

        if (categoryFilter !== 'all') {
            if (categoryFilter === 'uncategorized') {
                result = result.filter((d) => !d.forecast_category);
            } else {
                result = result.filter(
                    (d) => d.forecast_category === categoryFilter,
                );
            }
        }

        result.sort((a, b) => {
            let cmp = 0;
            switch (sortBy) {
                case 'confidence':
                    cmp = a.confidence - b.confidence;
                    break;
                case 'value':
                    cmp = a.value - b.value;
                    break;
                case 'title':
                    cmp = a.title.localeCompare(b.title);
                    break;
                default:
                    cmp = a.confidence - b.confidence;
            }
            return sortDir === 'desc' ? -cmp : cmp;
        });

        return result;
    }, [deals, search, categoryFilter, sortBy, sortDir]);

    const toggleSort = (field: string) => {
        if (sortBy === field) {
            setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
        } else {
            setSortBy(field);
            setSortDir('desc');
        }
    };

    const handleRefresh = () => {
        router.reload();
    };

    const totalTeamValues = useMemo(() => {
        if (!team_breakdown.length)
            return { commit: 0, best_case: 0, pipeline: 0, total: 0 };
        return team_breakdown.reduce(
            (acc, m) => ({
                commit: acc.commit + m.commit,
                best_case: acc.best_case + m.best_case,
                pipeline: acc.pipeline + m.pipeline,
                total: acc.total + m.total,
            }),
            { commit: 0, best_case: 0, pipeline: 0, total: 0 },
        );
    }, [team_breakdown]);

    const healthTotal =
        health_distribution.healthy +
        health_distribution.at_risk +
        health_distribution.critical;

    return (
        <>
            <Head title={`CRM · Forecast ${formatPeriodLabel(period)}`} />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* ── Sticky Header ── */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-white/90 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/crm"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2e6ef] bg-white text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-lg font-semibold tracking-tight text-[#1a1a2e]">
                                        Forecast
                                    </h1>
                                    <span className="rounded-lg bg-[#2B4C8C]/10 px-2 py-0.5 text-[10px] font-medium text-[#2B4C8C]">
                                        {formatPeriodLabel(period)}
                                    </span>
                                </div>
                                <p className="text-xs text-[#6b7280]">
                                    {totalDeals} active deal
                                    {totalDeals !== 1 ? 's' : ''} in pipeline ·{' '}
                                    {formatCurrency(summary.weighted)} weighted
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Period Navigation */}
                            <div className="flex items-center gap-1 rounded-xl border border-[#e2e6ef] bg-white p-1 shadow-sm">
                                <button
                                    onClick={() => navigatePeriod(-1)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6b7280] transition-all hover:bg-[#f0f2f7] hover:text-[#1a1a2e]"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <Select
                                    value={period}
                                    onValueChange={setPeriod}
                                >
                                    <SelectTrigger className="h-7 border-0 bg-transparent px-2 text-xs font-medium text-[#1a1a2e] shadow-none focus:ring-0 [&>svg]:hidden">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {periodOptions.map((p) => (
                                            <SelectItem
                                                key={p}
                                                value={p}
                                                className="text-xs"
                                            >
                                                {formatPeriodLabel(p)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <button
                                    onClick={() => navigatePeriod(1)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6b7280] transition-all hover:bg-[#f0f2f7] hover:text-[#1a1a2e]"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRefresh}
                                        className="h-9 border-[#e2e6ef] text-[#6b7280] hover:bg-[#f0f2f7] hover:text-[#1a1a2e]"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="bottom"
                                    className="border-[#e2e6ef] bg-white text-[11px] text-[#6b7280] shadow-lg"
                                >
                                    Refresh forecast
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-6 p-6">
                        {/* ── Summary Cards ── */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                            <SummaryCard
                                icon={Target}
                                label="Quota"
                                value={formatCurrency(quota)}
                                sublabel={
                                    quota > 0
                                        ? `${formatCurrency(summary.weighted)} weighted`
                                        : 'No quota set'
                                }
                                progress={
                                    quota > 0 ? quotaAttainment : undefined
                                }
                                color="#2B4C8C"
                            />
                            <SummaryCard
                                icon={CheckCircle2}
                                label="Commit"
                                value={summary.commit}
                                sublabel={
                                    quota > 0
                                        ? `${((summary.commit / quota) * 100).toFixed(1)}% of quota`
                                        : undefined
                                }
                                color="#34d399"
                            />
                            <SummaryCard
                                icon={TrendingUp}
                                label="Best Case"
                                value={summary.best_case}
                                sublabel={
                                    quota > 0
                                        ? `${(((summary.commit + summary.best_case) / quota) * 100).toFixed(1)}% with upside`
                                        : undefined
                                }
                                color="#3b82f6"
                            />
                            <SummaryCard
                                icon={BarChart3}
                                label="Pipeline"
                                value={summary.pipeline}
                                sublabel={
                                    summary.uncategorized > 0
                                        ? `${formatCurrency(summary.uncategorized)} uncategorized`
                                        : undefined
                                }
                                color="#f59e0b"
                            />
                            <SummaryCard
                                icon={DollarSign}
                                label="Weighted"
                                value={summary.weighted}
                                sublabel={
                                    quota > 0
                                        ? `${quotaAttainment - 100 > 0 ? '+' : ''}${(quotaAttainment - 100).toFixed(1)}% vs quota`
                                        : undefined
                                }
                                color="#8b5cf6"
                            />
                        </div>

                        {/* ── Main Content: Two Columns ── */}
                        <div className="flex flex-col gap-6 xl:flex-row">
                            {/* Left: Deals Table */}
                            <div className="min-w-0 flex-1">
                                <div className="rounded-xl border border-[#e2e6ef] bg-white shadow-sm">
                                    {/* Table Header */}
                                    <div className="flex items-center justify-between border-b border-[#e2e6ef] px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-sm font-semibold text-[#1a1a2e]">
                                                Deals
                                            </h2>
                                            <span className="rounded-lg bg-[#f0f2f7] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">
                                                {filteredDeals.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={search}
                                                    onChange={(e) =>
                                                        setSearch(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Search deals..."
                                                    className="h-8 w-40 rounded-lg border border-[#e2e6ef] bg-[#f8f9fc] pr-3 pl-3 text-[11px] text-[#1a1a2e] placeholder-[#9ca3af] transition-all outline-none focus:border-[#2B4C8C] focus:ring-[3px] focus:ring-[#2B4C8C]/10"
                                                />
                                            </div>
                                            <Select
                                                value={categoryFilter}
                                                onValueChange={
                                                    setCategoryFilter
                                                }
                                            >
                                                <SelectTrigger className="h-8 w-32 border-[#e2e6ef] text-[11px] text-[#6b7280] shadow-none">
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        value="all"
                                                        className="text-xs"
                                                    >
                                                        All Categories
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="commit"
                                                        className="text-xs"
                                                    >
                                                        Commit
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="best_case"
                                                        className="text-xs"
                                                    >
                                                        Best Case
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="pipeline"
                                                        className="text-xs"
                                                    >
                                                        Pipeline
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="uncategorized"
                                                        className="text-xs"
                                                    >
                                                        Uncategorized
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    {filteredDeals.length === 0 ? (
                                        <div className="flex flex-col items-center gap-2 px-5 py-16">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f2f7]">
                                                <BarChart3 className="h-6 w-6 text-[#9ca3af]" />
                                            </div>
                                            <p className="text-sm font-medium text-[#6b7280]">
                                                No deals match your filters
                                            </p>
                                            <p className="text-xs text-[#9ca3af]">
                                                Try adjusting your search or
                                                category filter
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-[#f0f2f7]">
                                                        <Th
                                                            sortable
                                                            active={
                                                                sortBy ===
                                                                'title'
                                                            }
                                                            dir={sortDir}
                                                            onClick={() =>
                                                                toggleSort(
                                                                    'title',
                                                                )
                                                            }
                                                        >
                                                            Deal
                                                        </Th>
                                                        <Th
                                                            sortable
                                                            active={
                                                                sortBy ===
                                                                'value'
                                                            }
                                                            dir={sortDir}
                                                            onClick={() =>
                                                                toggleSort(
                                                                    'value',
                                                                )
                                                            }
                                                            className="text-right"
                                                        >
                                                            Value
                                                        </Th>
                                                        <Th>Stage</Th>
                                                        <Th
                                                            sortable
                                                            active={
                                                                sortBy ===
                                                                'confidence'
                                                            }
                                                            dir={sortDir}
                                                            onClick={() =>
                                                                toggleSort(
                                                                    'confidence',
                                                                )
                                                            }
                                                        >
                                                            Confidence
                                                        </Th>
                                                        <Th>Forecast</Th>
                                                        <Th>Owner</Th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredDeals.map(
                                                        (deal) => (
                                                            <DealRow
                                                                key={deal.id}
                                                                deal={deal}
                                                            />
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Sidebar */}
                            <div className="w-full shrink-0 space-y-5 xl:w-80">
                                {/* Team Breakdown */}
                                {is_manager && team_breakdown.length > 0 && (
                                    <div className="rounded-xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Users className="h-4 w-4 text-[#6b7280]" />
                                            <h3 className="text-sm font-semibold text-[#1a1a2e]">
                                                Team Breakdown
                                            </h3>
                                        </div>
                                        <div className="space-y-3">
                                            {team_breakdown.map((member) => {
                                                const maxTotal =
                                                    totalTeamValues.total || 1;
                                                const pct =
                                                    (member.total / maxTotal) *
                                                    100;
                                                return (
                                                    <div key={member.name}>
                                                        <div className="mb-1.5 flex items-center justify-between">
                                                            <span className="text-xs font-medium text-[#1a1a2e]">
                                                                {member.name}
                                                            </span>
                                                            <span className="text-[11px] font-medium text-[#6b7280]">
                                                                {formatCurrency(
                                                                    member.total,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f2f7]">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-blue-400 to-amber-400 transition-all"
                                                                style={{
                                                                    width: `${Math.min(pct, 100)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-3 text-[10px] text-[#9ca3af]">
                                                            <span>
                                                                Commit:{' '}
                                                                {formatCurrency(
                                                                    member.commit,
                                                                )}
                                                            </span>
                                                            <span>
                                                                Best:{' '}
                                                                {formatCurrency(
                                                                    member.best_case,
                                                                )}
                                                            </span>
                                                            <span>
                                                                Pipe:{' '}
                                                                {formatCurrency(
                                                                    member.pipeline,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Health Distribution */}
                                {healthTotal > 0 && (
                                    <div className="rounded-xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-[#6b7280]" />
                                            <h3 className="text-sm font-semibold text-[#1a1a2e]">
                                                Health Distribution
                                            </h3>
                                        </div>

                                        {/* Stacked bar */}
                                        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-[#f0f2f7]">
                                            {health_distribution.healthy >
                                                0 && (
                                                <div
                                                    className="inline-block h-full rounded-l-full bg-emerald-400 align-top transition-all"
                                                    style={{
                                                        width: `${(health_distribution.healthy / healthTotal) * 100}%`,
                                                    }}
                                                />
                                            )}
                                            {health_distribution.at_risk >
                                                0 && (
                                                <div
                                                    className="inline-block h-full bg-amber-400 align-top transition-all"
                                                    style={{
                                                        width: `${(health_distribution.at_risk / healthTotal) * 100}%`,
                                                    }}
                                                />
                                            )}
                                            {health_distribution.critical >
                                                0 && (
                                                <div
                                                    className="inline-block h-full rounded-r-full bg-rose-400 align-top transition-all"
                                                    style={{
                                                        width: `${(health_distribution.critical / healthTotal) * 100}%`,
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <HealthRow
                                                color="bg-emerald-400"
                                                label="Healthy"
                                                count={
                                                    health_distribution.healthy
                                                }
                                                total={healthTotal}
                                            />
                                            <HealthRow
                                                color="bg-amber-400"
                                                label="At Risk"
                                                count={
                                                    health_distribution.at_risk
                                                }
                                                total={healthTotal}
                                            />
                                            <HealthRow
                                                color="bg-rose-400"
                                                label="Critical"
                                                count={
                                                    health_distribution.critical
                                                }
                                                total={healthTotal}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Summary */}
                                <div className="rounded-xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex items-center gap-2">
                                        <Gauge className="h-4 w-4 text-[#6b7280]" />
                                        <h3 className="text-sm font-semibold text-[#1a1a2e]">
                                            Forecast Summary
                                        </h3>
                                    </div>
                                    <div className="space-y-2.5">
                                        <SummaryRow
                                            label="Commit"
                                            value={summary.commit}
                                            color="text-emerald-600"
                                        />
                                        <SummaryRow
                                            label="Best Case"
                                            value={summary.best_case}
                                            color="text-blue-600"
                                        />
                                        <SummaryRow
                                            label="Pipeline"
                                            value={summary.pipeline}
                                            color="text-amber-600"
                                        />
                                        <SummaryRow
                                            label="Uncategorized"
                                            value={summary.uncategorized}
                                            color="text-slate-500"
                                        />
                                        <div className="border-t border-[#e2e6ef] pt-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-[#1a1a2e]">
                                                    Total Pipeline
                                                </span>
                                                <span className="text-sm font-bold text-[#1a1a2e]">
                                                    {formatCurrency(
                                                        summary.commit +
                                                            summary.best_case +
                                                            summary.pipeline +
                                                            summary.uncategorized,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href="/crm/deals/create"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2B4C8C] px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#2B4C8C]/90 hover:shadow-md"
                                    >
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        Add New Deal
                                    </Link>
                                    <button
                                        onClick={() => window.print()}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e6ef] bg-white px-4 py-2.5 text-xs font-medium text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Export Forecast
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ── Internal Sub-Components ── */

function Th({
    children,
    sortable,
    active,
    dir,
    onClick,
    className,
}: {
    children: React.ReactNode;
    sortable?: boolean;
    active?: boolean;
    dir?: 'asc' | 'desc';
    onClick?: () => void;
    className?: string;
}) {
    return (
        <th
            onClick={sortable ? onClick : undefined}
            className={cn(
                'px-4 py-3 text-[11px] font-medium tracking-wider text-[#6b7280] uppercase',
                sortable &&
                    'cursor-pointer transition-colors select-none hover:text-[#1a1a2e]',
                className,
            )}
        >
            <div
                className={cn(
                    'flex items-center gap-1',
                    className?.includes('text-right') && 'justify-end',
                )}
            >
                {children}
                {sortable && active && (
                    <span className="text-[#2B4C8C]">
                        {dir === 'desc' ? '↓' : '↑'}
                    </span>
                )}
            </div>
        </th>
    );
}

function DealRow({ deal }: { deal: Deal }) {
    return (
        <tr className="group border-b border-[#f0f2f7] transition-colors last:border-0 hover:bg-[#f8f9fc]">
            <td className="px-4 py-3">
                <Link href={`/crm/deals/${deal.id}`} className="group/link">
                    <span className="text-sm font-medium text-[#1a1a2e] transition-colors group-hover/link:text-[#2B4C8C]">
                        {deal.title}
                    </span>
                    <div className="flex items-center gap-2">
                        {deal.organization && (
                            <span className="text-[10px] text-[#9ca3af]">
                                {deal.organization.name}
                            </span>
                        )}
                        {deal.expected_close_date && (
                            <span className="text-[10px] text-[#d1d5db]">
                                · Closes{' '}
                                {new Date(
                                    deal.expected_close_date,
                                ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        )}
                    </div>
                </Link>
            </td>
            <td className="px-4 py-3 text-right">
                <span className="text-sm font-semibold text-[#1a1a2e]">
                    {formatCurrency(deal.value)}
                </span>
            </td>
            <td className="px-4 py-3">
                <StageBadge stage={deal.stage} />
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <ConfidenceBar value={deal.confidence} />
                    {deal.factors.length > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-3 w-3 shrink-0 cursor-help text-[#9ca3af] transition-colors hover:text-[#6b7280]" />
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="w-56 border-[#e2e6ef] bg-white p-3 shadow-lg"
                            >
                                <div className="mb-2 text-[11px] font-medium text-[#1a1a2e]">
                                    Confidence Factors
                                </div>
                                <ConfidenceFactors factors={deal.factors} />
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <CategoryBadge
                    category={deal.forecast_category}
                    suggested={deal.suggested_category}
                />
            </td>
            <td className="px-4 py-3">
                {deal.owner ? (
                    <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2B4C8C]/10 text-[9px] font-medium text-[#2B4C8C]">
                            {deal.owner.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-[#6b7280]">
                            {deal.owner.name}
                        </span>
                    </div>
                ) : (
                    <span className="text-xs text-[#d1d5db]">Unassigned</span>
                )}
            </td>
        </tr>
    );
}

function HealthRow({
    color,
    label,
    count,
    total,
}: {
    color: string;
    label: string;
    count: number;
    total: number;
}) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', color)} />
                <span className="text-xs text-[#6b7280]">{label}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-[#1a1a2e]">
                    {count}
                </span>
                <span className="text-[10px] text-[#9ca3af]">
                    ({pct.toFixed(0)}%)
                </span>
            </div>
        </div>
    );
}

function SummaryRow({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-[#6b7280]">{label}</span>
            <span className={cn('text-xs font-semibold', color)}>
                {formatCurrency(value)}
            </span>
        </div>
    );
}
