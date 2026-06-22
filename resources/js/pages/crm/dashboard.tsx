import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    Target,
    TrendingUp,
    ChevronRight,
} from 'lucide-react';

interface Stat {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ElementType;
}

interface Lead {
    id: number;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    source: string;
    stage: string;
    priority: string;
    created_at: string;
}

interface Deal {
    id: number;
    title: string;
    value: number;
    stage: string;
    company?: string;
    contact_name?: string;
}

interface PipelineStage {
    stage: string;
    count: number;
    total: number;
}

interface DashboardProps {
    stats: {
        total_leads: number;
        new_leads: number;
        qualified_leads: number;
        total_pipeline: number;
        won_this_month: number;
    };
    pipeline_by_stage: PipelineStage[];
    recent_leads: Lead[];
    recent_deals: Deal[];
    lead_trend: { month: string; count: number }[];
}

function MiniSparkline({ data }: { data: { month: string; count: number }[] }) {
    const max = Math.max(...data.map((d) => d.count), 1);
    const h = 32;
    const w = 80;

    if (data.length < 2) {
        return <div className="h-8 w-20" />;
    }

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (d.count / max) * h;

        return `${x},${y}`;
    });

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-20">
            <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                points={points.join(' ')}
                className="text-emerald-500"
            />
        </svg>
    );
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function getStageColor(stage: string): string {
    const colors: Record<string, string> = {
        new: 'text-blue-400 bg-blue-500/10',
        contacted: 'text-amber-400 bg-amber-500/10',
        qualified: 'text-violet-400 bg-violet-500/10',
        proposal: 'text-orange-400 bg-orange-500/10',
        negotiation: 'text-rose-400 bg-rose-500/10',
        converted: 'text-emerald-400 bg-emerald-500/10',
        lost: 'text-red-400 bg-red-500/10',
        qualification: 'text-sky-400 bg-sky-500/10',
        meeting: 'text-amber-400 bg-amber-500/10',
        closed_won: 'text-emerald-400 bg-emerald-500/10',
        closed_lost: 'text-red-400 bg-red-500/10',
    };

    return colors[stage] ?? 'text-gray-400 bg-gray-500/10';
}

export default function CrmDashboard({ stats, pipeline_by_stage, recent_leads, recent_deals, lead_trend }: DashboardProps) {
    const statCards: Stat[] = [
        {
            label: 'Total Leads',
            value: stats.total_leads.toLocaleString(),
            change: `+${stats.new_leads} new`,
            trend: 'up',
            icon: Users,
        },
        {
            label: 'Qualified',
            value: stats.qualified_leads.toLocaleString(),
            change: 'Ready to engage',
            trend: 'up',
            icon: UserPlus,
        },
        {
            label: 'Pipeline Value',
            value: formatCurrency(stats.total_pipeline),
            change: `${stats.total_pipeline > 0 ? `${pipeline_by_stage.filter(s => !['closed_won', 'closed_lost'].includes(s.stage)).length} active deals` : 'No active deals'}`,
            trend: 'up',
            icon: Target,
        },
        {
            label: 'Won This Month',
            value: formatCurrency(stats.won_this_month),
            change: stats.won_this_month > 0 ? 'Closed' : 'This month',
            trend: stats.won_this_month > 0 ? 'up' : 'down',
            icon: TrendingUp,
        },
    ];

    return (
        <>
            <Head title="CRM · Dashboard" />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-lg font-medium text-[#e8e8ed]">Command Center</h1>
                    <p className="mt-0.5 text-xs text-[#555570]">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>

                {/* KPI Row */}
                <div className="mb-8 grid grid-cols-4 gap-3">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-[11px] font-medium uppercase tracking-wider text-[#555570]">
                                    {stat.label}
                                </span>
                                <stat.icon className="h-4 w-4 text-[#3b6cdb]" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-semibold text-[#e8e8ed]">
                                    {stat.value}
                                </span>
                                <span
                                    className={`text-[11px] ${
                                        stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                                    }`}
                                >
                                    {stat.change}
                                </span>
                            </div>
                            {lead_trend.length > 1 && stat.label === 'Total Leads' && (
                                <div className="mt-1 text-emerald-500">
                                    <MiniSparkline data={lead_trend} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {/* Pipeline by Stage */}
                    <div className="col-span-2">
                        <div className="mb-1 flex items-center justify-between">
                            <h2 className="text-xs font-medium uppercase tracking-wider text-[#555570]">
                                Pipeline
                            </h2>
                            <Link
                                href="/crm/deals"
                                className="flex items-center gap-1 text-[11px] text-[#3b6cdb] hover:text-[#5b8cfb]"
                            >
                                View all <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                            {pipeline_by_stage.length > 0 ? (
                                <div className="space-y-3">
                                    {pipeline_by_stage.map((stage) => (
                                        <div key={stage.stage}>
                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                <span className="text-[#8b8b9e] capitalize">
                                                    {stage.stage.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-[#555570]">
                                                    {formatCurrency(stage.total)} · {stage.count}
                                                </span>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-[#1a1a24]">
                                                <div
                                                    className="h-full rounded-full bg-[#3b6cdb] transition-all"
                                                    style={{
                                                        width: `${Math.min(
                                                            (stage.total /
                                                                Math.max(
                                                                    ...pipeline_by_stage.map((s) =>
                                                                        ['closed_won', 'closed_lost'].includes(s.stage)
                                                                            ? 0
                                                                            : s.total
                                                                    )
                                                                )) *
                                                                100,
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-xs text-[#555570]">
                                    No deals in pipeline yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <h2 className="text-xs font-medium uppercase tracking-wider text-[#555570]">
                                Recent Leads
                            </h2>
                            <Link
                                href="/crm/leads"
                                className="flex items-center gap-1 text-[11px] text-[#3b6cdb] hover:text-[#5b8cfb]"
                            >
                                View all <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14]">
                            {recent_leads.length > 0 ? (
                                <div className="divide-y divide-[#1e1e2a]">
                                    {recent_leads.slice(0, 6).map((lead) => (
                                        <Link
                                            key={lead.id}
                                            href={`/crm/leads/${lead.id}`}
                                            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#1a1a24]"
                                        >
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a24]">
                                                <span className="text-[11px] font-medium text-[#8b8b9e]">
                                                    {lead.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate text-[13px] font-medium text-[#e8e8ed]">
                                                        {lead.name}
                                                    </span>
                                                    <span
                                                        className={`rounded px-1 py-0.5 text-[10px] font-medium capitalize ${getStageColor(lead.stage)}`}
                                                    >
                                                        {lead.stage}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#555570]">
                                                    {lead.company && (
                                                        <span>{lead.company}</span>
                                                    )}
                                                    <span>{lead.source}</span>
                                                    <span>{formatDate(lead.created_at)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center text-xs text-[#555570]">
                                    No leads yet — website forms will appear here
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Deals */}
                {recent_deals.length > 0 && (
                    <div className="mt-6">
                        <div className="mb-1 flex items-center justify-between">
                            <h2 className="text-xs font-medium uppercase tracking-wider text-[#555570]">
                                Recent Deals
                            </h2>
                        </div>
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14]">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#1e1e2a] text-left text-[11px] text-[#555570]">
                                        <th className="px-4 py-2.5 font-medium">Deal</th>
                                        <th className="px-4 py-2.5 font-medium">Company</th>
                                        <th className="px-4 py-2.5 font-medium">Value</th>
                                        <th className="px-4 py-2.5 font-medium">Stage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1e1e2a]">
                                    {recent_deals.map((deal) => (
                                        <tr
                                            key={deal.id}
                                            className="text-[13px] text-[#e8e8ed] transition-colors hover:bg-[#1a1a24]"
                                        >
                                            <td className="px-4 py-2.5">
                                                <Link href={`/crm/deals/${deal.id}`} className="hover:text-[#3b6cdb]">
                                                    {deal.title}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-2.5 text-[#8b8b9e]">
                                                {deal.company ?? '—'}
                                            </td>
                                            <td className="px-4 py-2.5 font-medium">
                                                {formatCurrency(deal.value)}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span
                                                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${getStageColor(deal.stage)}`}
                                                >
                                                    {deal.stage.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
