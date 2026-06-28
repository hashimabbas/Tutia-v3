import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    RefreshCw,
    DollarSign,
    Target,
    TrendingUp,
    BarChart3,
    Activity,
    AlertTriangle,
    Users,
    Clock,
    Gauge,
    Plus,
    Eye,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FunnelStage {
    stage: string;
    count: number;
    value: number;
    percentage: number;
}

interface Deal {
    id: number;
    title: string;
    value: number;
    stage: string;
    forecast_category: string | null;
    owner: { id: number; name: string } | null;
    organization: { id: number; name: string } | null;
    days_in_stage: number;
    confidence: number;
    suggested_category: string;
    health_tier: string | null;
    expected_close_date: string | null;
}

interface HealthDistribution {
    healthy: number;
    at_risk: number;
    critical: number;
}

interface PipelinePageProps {
    funnel: FunnelStage[];
    velocity: Record<string, number>;
    bottleneck_stage: string | null;
    health_distribution: HealthDistribution;
    stale_deals_count: number;
    missing_stakeholder_count: number;
    stuck_deals_count: number;
    win_rate: number;
    avg_deal_size: number;
    total_active_deals: number;
    total_pipeline_value: number;
    deals: Deal[];
    is_manager: boolean;
}

const STAGE_LABELS: Record<string, string> = {
    qualification: 'Qualification',
    meeting: 'Meeting',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
};

const STAGE_COLORS: Record<string, string> = {
    qualification: '#3b82f6',
    meeting: '#f59e0b',
    proposal: '#f97316',
    negotiation: '#ef4444',
};

const STAGE_BG: Record<string, string> = {
    qualification: 'bg-blue-50 text-blue-700 border-blue-200',
    meeting: 'bg-amber-50 text-amber-700 border-amber-200',
    proposal: 'bg-orange-50 text-orange-700 border-orange-200',
    negotiation: 'bg-rose-50 text-rose-700 border-rose-200',
};

const HEALTH_COLORS: Record<string, string> = {
    healthy: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    at_risk: 'text-amber-600 bg-amber-50 border-amber-200',
    critical: 'text-rose-600 bg-rose-50 border-rose-200',
};

const HEALTH_DOT: Record<string, string> = {
    healthy: 'bg-emerald-500',
    at_risk: 'bg-amber-500',
    critical: 'bg-rose-500',
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SDG',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function MetricCard({
    icon: Icon,
    label,
    value,
    sublabel,
    color,
    trend,
}: {
    icon: any;
    label: string;
    value: string | number;
    sublabel?: string;
    color: string;
    trend?: { value: string; positive: boolean };
}) {
    return (
        <div className="group rounded-xl border border-[#e2e6ef] bg-white p-4 shadow-sm transition-all hover:border-[#c8cce0] hover:shadow-md">
            <div className="mb-2.5 flex items-center justify-between">
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
            <div className="mb-0.5 text-lg font-bold tracking-tight text-[#1a1a2e]">
                {typeof value === 'number' ? formatCurrency(value) : value}
            </div>
            <div className="flex items-center gap-2">
                {sublabel && (
                    <span className="text-[11px] text-[#9ca3af]">
                        {sublabel}
                    </span>
                )}
                {trend && (
                    <span
                        className={cn(
                            'text-[10px] font-medium',
                            trend.positive
                                ? 'text-emerald-600'
                                : 'text-rose-600',
                        )}
                    >
                        {trend.positive ? '↑' : '↓'} {trend.value}
                    </span>
                )}
            </div>
        </div>
    );
}

function ConfidenceBadge({ value }: { value: number }) {
    const color =
        value >= 70
            ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
            : value >= 40
              ? 'text-amber-600 bg-amber-50 border-amber-200'
              : 'text-rose-600 bg-rose-50 border-rose-200';
    return (
        <span
            className={cn(
                'inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
                color,
            )}
        >
            {value}%
        </span>
    );
}

function HealthDot({ tier }: { tier: string | null }) {
    if (!tier)
        return <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />;
    return (
        <span
            className={cn(
                'h-1.5 w-1.5 rounded-full',
                HEALTH_DOT[tier] ?? 'bg-slate-300',
            )}
        />
    );
}

function StageBadge({ stage }: { stage: string }) {
    return (
        <span
            className={cn(
                'inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize',
                STAGE_BG[stage] ??
                    'border-slate-200 bg-slate-50 text-slate-600',
            )}
        >
            {STAGE_LABELS[stage] ?? stage.replace(/_/g, ' ')}
        </span>
    );
}

export default function PipelineIndex({
    funnel,
    velocity,
    bottleneck_stage,
    health_distribution,
    stale_deals_count,
    missing_stakeholder_count,
    stuck_deals_count,
    win_rate,
    avg_deal_size,
    total_active_deals,
    total_pipeline_value,
    deals,
    is_manager,
}: PipelinePageProps) {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<string>('days_in_stage');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

    const healthTotal =
        health_distribution.healthy +
        health_distribution.at_risk +
        health_distribution.critical;

    const maxFunnelValue = Math.max(...funnel.map((f) => f.value), 1);
    const atRiskTotal =
        health_distribution.at_risk + health_distribution.critical;

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

        result.sort((a, b) => {
            let cmp = 0;
            switch (sortBy) {
                case 'value':
                    cmp = a.value - b.value;
                    break;
                case 'title':
                    cmp = a.title.localeCompare(b.title);
                    break;
                case 'days_in_stage':
                    cmp = a.days_in_stage - b.days_in_stage;
                    break;
                case 'confidence':
                    cmp = a.confidence - b.confidence;
                    break;
                default:
                    cmp = a.days_in_stage - b.days_in_stage;
            }
            return sortDir === 'desc' ? -cmp : cmp;
        });

        return result;
    }, [deals, search, sortBy, sortDir]);

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

    return (
        <>
            <Head title="CRM · Pipeline" />

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
                                        Pipeline Command Center
                                    </h1>
                                    <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                                        {total_active_deals} active
                                    </span>
                                </div>
                                <p className="text-xs text-[#6b7280]">
                                    {formatCurrency(total_pipeline_value)} total
                                    · {win_rate}% win rate ·{' '}
                                    {bottleneck_stage
                                        ? `bottleneck at ${STAGE_LABELS[bottleneck_stage] ?? bottleneck_stage}`
                                        : 'balanced flow'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
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
                                    Refresh pipeline data
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-6 p-6">
                        {/* ── Summary Cards ── */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                            <MetricCard
                                icon={DollarSign}
                                label="Pipeline Value"
                                value={total_pipeline_value}
                                color="#2B4C8C"
                            />
                            <MetricCard
                                icon={BarChart3}
                                label="Active Deals"
                                value={String(total_active_deals)}
                                color="#3b82f6"
                            />
                            <MetricCard
                                icon={Target}
                                label="Win Rate"
                                value={`${win_rate}%`}
                                sublabel={`${avg_deal_size > 0 ? `avg ${formatCurrency(avg_deal_size)}` : ''}`}
                                color="#34d399"
                            />
                            <MetricCard
                                icon={TrendingUp}
                                label="Weighted Pipeline"
                                value={deals.reduce(
                                    (s, d) =>
                                        s + d.value * (d.confidence / 100),
                                    0,
                                )}
                                color="#8b5cf6"
                            />
                            <MetricCard
                                icon={Activity}
                                label="At Risk"
                                value={String(atRiskTotal)}
                                sublabel={
                                    healthTotal > 0
                                        ? `${Math.round((atRiskTotal / healthTotal) * 100)}% of deals`
                                        : 'No data'
                                }
                                color="#f59e0b"
                            />
                        </div>

                        {/* ── Main: Two Columns ── */}
                        <div className="flex flex-col gap-6 xl:flex-row">
                            {/* ── Left Column ── */}
                            <div className="min-w-0 flex-1 space-y-6">
                                {/* Stage Funnel */}
                                <div className="rounded-xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4 text-[#6b7280]" />
                                            <h2 className="text-sm font-semibold text-[#1a1a2e]">
                                                Stage Funnel
                                            </h2>
                                        </div>
                                        <span className="text-[11px] text-[#6b7280]">
                                            {deals.length} deals ·{' '}
                                            {formatCurrency(
                                                total_pipeline_value,
                                            )}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {funnel.map((f) => {
                                            const pct =
                                                maxFunnelValue > 0
                                                    ? (f.value /
                                                          maxFunnelValue) *
                                                      100
                                                    : 0;
                                            const color =
                                                STAGE_COLORS[f.stage] ??
                                                '#6b7280';
                                            return (
                                                <div
                                                    key={f.stage}
                                                    className="group"
                                                >
                                                    <div className="mb-1.5 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="h-2 w-2 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        color,
                                                                }}
                                                            />
                                                            <span className="text-xs font-medium text-[#1a1a2e] capitalize">
                                                                {
                                                                    STAGE_LABELS[
                                                                        f.stage
                                                                    ]
                                                                }
                                                            </span>
                                                            <span className="rounded-md bg-[#f0f2f7] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">
                                                                {f.count}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-semibold text-[#1a1a2e]">
                                                                {formatCurrency(
                                                                    f.value,
                                                                )}
                                                            </span>
                                                            <span className="w-10 text-right text-[10px] text-[#9ca3af]">
                                                                {f.percentage}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f2f7]">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-700 group-hover:brightness-110"
                                                            style={{
                                                                width: `${Math.min(pct, 100)}%`,
                                                                backgroundColor:
                                                                    color,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Deals in Pipeline Table */}
                                <div className="rounded-xl border border-[#e2e6ef] bg-white shadow-sm">
                                    <div className="flex items-center justify-between border-b border-[#e2e6ef] px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-sm font-semibold text-[#1a1a2e]">
                                                Deals in Pipeline
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
                                                    className="h-8 w-44 rounded-lg border border-[#e2e6ef] bg-[#f8f9fc] pr-3 pl-3 text-[11px] text-[#1a1a2e] placeholder-[#9ca3af] transition-all outline-none focus:border-[#2B4C8C] focus:ring-[3px] focus:ring-[#2B4C8C]/10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {filteredDeals.length === 0 ? (
                                        <div className="flex flex-col items-center gap-2 px-5 py-14">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f2f7]">
                                                <BarChart3 className="h-6 w-6 text-[#9ca3af]" />
                                            </div>
                                            <p className="text-sm font-medium text-[#6b7280]">
                                                No deals in pipeline
                                            </p>
                                            <p className="text-xs text-[#9ca3af]">
                                                {search
                                                    ? 'Try a different search term'
                                                    : 'Create a new deal to get started'}
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
                                                        <Th
                                                            sortable
                                                            active={
                                                                sortBy ===
                                                                'days_in_stage'
                                                            }
                                                            dir={sortDir}
                                                            onClick={() =>
                                                                toggleSort(
                                                                    'days_in_stage',
                                                                )
                                                            }
                                                        >
                                                            Days
                                                        </Th>
                                                        <Th>Health</Th>
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

                                {/* Stage Velocity */}
                                <div className="rounded-xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-[#6b7280]" />
                                            <h2 className="text-sm font-semibold text-[#1a1a2e]">
                                                Stage Velocity
                                            </h2>
                                        </div>
                                        {bottleneck_stage && (
                                            <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1">
                                                <AlertTriangle className="h-3 w-3 text-rose-500" />
                                                <span className="text-[10px] font-medium text-rose-600">
                                                    Bottleneck:{' '}
                                                    {
                                                        STAGE_LABELS[
                                                            bottleneck_stage
                                                        ]
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {Object.entries(velocity).map(
                                            ([stage, days]) => {
                                                const maxDays = Math.max(
                                                    ...Object.values(velocity),
                                                    1,
                                                );
                                                const pct =
                                                    (days / maxDays) * 100;
                                                const isBottleneck =
                                                    stage === bottleneck_stage;
                                                const color =
                                                    STAGE_COLORS[stage] ??
                                                    '#6b7280';
                                                return (
                                                    <div key={stage}>
                                                        <div className="mb-1 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={cn(
                                                                        'h-2 w-2 rounded-full',
                                                                        isBottleneck &&
                                                                            'ring-2 ring-rose-300 ring-offset-1',
                                                                    )}
                                                                    style={{
                                                                        backgroundColor:
                                                                            color,
                                                                    }}
                                                                />
                                                                <span
                                                                    className={cn(
                                                                        'text-xs capitalize',
                                                                        isBottleneck
                                                                            ? 'font-semibold text-rose-600'
                                                                            : 'font-medium text-[#1a1a2e]',
                                                                    )}
                                                                >
                                                                    {
                                                                        STAGE_LABELS[
                                                                            stage
                                                                        ]
                                                                    }
                                                                </span>
                                                                {isBottleneck && (
                                                                    <span className="rounded bg-rose-50 px-1 py-0.5 text-[9px] font-medium text-rose-600">
                                                                        BOTTLENECK
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    'text-xs font-semibold tabular-nums',
                                                                    isBottleneck
                                                                        ? 'text-rose-600'
                                                                        : 'text-[#1a1a2e]',
                                                                )}
                                                            >
                                                                {days}d
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f2f7]">
                                                            <div
                                                                className={cn(
                                                                    'h-full rounded-full transition-all',
                                                                    isBottleneck
                                                                        ? 'bg-rose-400'
                                                                        : '',
                                                                )}
                                                                style={{
                                                                    width: `${Math.min(pct, 100)}%`,
                                                                    backgroundColor:
                                                                        isBottleneck
                                                                            ? undefined
                                                                            : color,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Right Column: Sidebar ── */}
                            <div className="w-full shrink-0 space-y-5 xl:w-80">
                                {/* Pipeline Alerts */}
                                <div className="rounded-xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-[#6b7280]" />
                                        <h3 className="text-sm font-semibold text-[#1a1a2e]">
                                            Pipeline Alerts
                                        </h3>
                                    </div>
                                    <div className="space-y-2">
                                        <AlertButton
                                            icon={Clock}
                                            label="Stale deals"
                                            count={stale_deals_count}
                                            detail="No activity in 14+ days"
                                            color="rose"
                                            active={selectedAlert === 'stale'}
                                            onClick={() =>
                                                setSelectedAlert(
                                                    selectedAlert === 'stale'
                                                        ? null
                                                        : 'stale',
                                                )
                                            }
                                        />
                                        <AlertButton
                                            icon={Users}
                                            label="Missing stakeholders"
                                            count={missing_stakeholder_count}
                                            detail="No DM or champion identified"
                                            color="amber"
                                            active={
                                                selectedAlert === 'stakeholders'
                                            }
                                            onClick={() =>
                                                setSelectedAlert(
                                                    selectedAlert ===
                                                        'stakeholders'
                                                        ? null
                                                        : 'stakeholders',
                                                )
                                            }
                                        />
                                        <AlertButton
                                            icon={AlertTriangle}
                                            label="Stuck stages"
                                            count={stuck_deals_count}
                                            detail="No movement in 14+ days"
                                            color="blue"
                                            active={selectedAlert === 'stuck'}
                                            onClick={() =>
                                                setSelectedAlert(
                                                    selectedAlert === 'stuck'
                                                        ? null
                                                        : 'stuck',
                                                )
                                            }
                                        />
                                        {stale_deals_count === 0 &&
                                            missing_stakeholder_count === 0 &&
                                            stuck_deals_count === 0 && (
                                                <div className="flex flex-col items-center gap-2 py-4 text-center">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                                                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                                                    </div>
                                                    <p className="text-xs font-medium text-emerald-600">
                                                        Pipeline is healthy
                                                    </p>
                                                    <p className="text-[10px] text-[#9ca3af]">
                                                        No alerts to address
                                                    </p>
                                                </div>
                                            )}
                                    </div>
                                </div>

                                {/* Health Overview */}
                                {healthTotal > 0 && (
                                    <div className="rounded-xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-[#6b7280]" />
                                            <h3 className="text-sm font-semibold text-[#1a1a2e]">
                                                Health Overview
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
                                                color="bg-emerald-500"
                                                label="Healthy"
                                                count={
                                                    health_distribution.healthy
                                                }
                                                total={healthTotal}
                                            />
                                            <HealthRow
                                                color="bg-amber-500"
                                                label="At Risk"
                                                count={
                                                    health_distribution.at_risk
                                                }
                                                total={healthTotal}
                                            />
                                            <HealthRow
                                                color="bg-rose-500"
                                                label="Critical"
                                                count={
                                                    health_distribution.critical
                                                }
                                                total={healthTotal}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="rounded-xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                    <h3 className="mb-4 text-sm font-semibold text-[#1a1a2e]">
                                        Quick Actions
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        <Link
                                            href="/crm/deals/create"
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2B4C8C] px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#2B4C8C]/90 hover:shadow-md"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add New Deal
                                        </Link>
                                        <Link
                                            href="/crm/forecast"
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e6ef] bg-white px-4 py-2.5 text-xs font-medium text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View Forecast
                                        </Link>
                                        <Link
                                            href="/crm/deals"
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e6ef] bg-white px-4 py-2.5 text-xs font-medium text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                                        >
                                            <BarChart3 className="h-3.5 w-3.5" />
                                            All Deals
                                        </Link>
                                    </div>
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
    const daysColor =
        deal.days_in_stage >= 30
            ? 'text-rose-600 font-medium'
            : deal.days_in_stage >= 14
              ? 'text-amber-600'
              : 'text-[#6b7280]';

    return (
        <tr className="group border-b border-[#f0f2f7] transition-colors last:border-0 hover:bg-[#f8f9fc]">
            <td className="px-4 py-3">
                <Link href={`/crm/deals/${deal.id}`} className="group/link">
                    <span className="text-sm font-medium text-[#1a1a2e] transition-colors group-hover/link:text-[#2B4C8C]">
                        {deal.title}
                    </span>
                    {deal.organization && (
                        <div className="text-[10px] text-[#9ca3af]">
                            {deal.organization.name}
                        </div>
                    )}
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
                <ConfidenceBadge value={deal.confidence} />
            </td>
            <td className="px-4 py-3">
                <span className={cn('text-xs tabular-nums', daysColor)}>
                    {deal.days_in_stage}d
                </span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                    <HealthDot tier={deal.health_tier} />
                    <span className="text-[11px] text-[#6b7280] capitalize">
                        {deal.health_tier ?? 'N/A'}
                    </span>
                </div>
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

function AlertButton({
    icon: Icon,
    label,
    count,
    detail,
    color,
    active,
    onClick,
}: {
    icon: any;
    label: string;
    count: number;
    detail: string;
    color: 'rose' | 'amber' | 'blue';
    active: boolean;
    onClick: () => void;
}) {
    const colors = {
        rose: {
            bg: 'bg-rose-50',
            text: 'text-rose-600',
            dot: 'bg-rose-500',
            hover: 'hover:bg-rose-100',
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            dot: 'bg-amber-500',
            hover: 'hover:bg-amber-100',
        },
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            dot: 'bg-blue-500',
            hover: 'hover:bg-blue-100',
        },
    };

    const c = colors[color];

    if (count === 0) return null;

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full rounded-xl px-3.5 py-2.5 text-left transition-all',
                active
                    ? `${c.bg} ring-1 ring-${color}-200`
                    : `${c.bg} opacity-80 ${c.hover}`,
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className={cn('h-3.5 w-3.5', c.text)} />
                    <span className={cn('text-xs font-medium', c.text)}>
                        {label}
                    </span>
                </div>
                <span
                    className={cn(
                        'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white',
                        c.dot.replace('bg-', 'bg-').replace('500', '500'),
                    )}
                    style={{
                        backgroundColor:
                            color === 'rose'
                                ? '#f43f5e'
                                : color === 'amber'
                                  ? '#f59e0b'
                                  : '#3b82f6',
                    }}
                >
                    {count}
                </span>
            </div>
            <p className="mt-0.5 text-[10px] text-[#6b7280]">{detail}</p>
        </button>
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
