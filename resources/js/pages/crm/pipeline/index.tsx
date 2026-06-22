import { Head, router } from '@inertiajs/react';
import { Search, Filter, AlertTriangle, Users, Clock, Target, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface FunnelStage {
    stage: string;
    count: number;
    value: number;
}

interface Props {
    funnel: FunnelStage[];
    velocity: Record<string, number>;
    bottleneck_stage: string | null;
    health_distribution: { healthy: number; at_risk: number; critical: number };
    stale_deals_count: number;
    missing_stakeholder_count: number;
    stuck_deals_count: number;
    win_rate: number;
    avg_deal_size: number;
    total_active_deals: number;
    total_pipeline_value: number;
    is_manager: boolean;
}

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
}

function stageColor(stage: string): string {
    const colors: Record<string, string> = {
        qualification: '#3b6cdb',
        meeting: '#fbbf24',
        proposal: '#f97316',
        negotiation: '#f87171',
    };
    return colors[stage] ?? '#555570';
}

function stageLabel(stage: string): string {
    return stage.replace(/_/g, ' ');
}

export default function PipelineIndex({
    funnel, velocity, bottleneck_stage, health_distribution,
    stale_deals_count, missing_stakeholder_count, stuck_deals_count,
    win_rate, avg_deal_size, total_active_deals, total_pipeline_value, is_manager,
}: Props) {
    const maxFunnelValue = Math.max(...funnel.map(f => f.value), 1);

    return (
        <>
            <Head title="CRM · Pipeline" />
            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-3">
                    <h1 className="text-base font-medium text-[#e8e8ed]">Pipeline Command Center</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Stage Funnel */}
                    <div className="mb-6">
                        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#555570]">Stage Funnel</h2>
                        <div className="space-y-1.5">
                            {funnel.map(f => {
                                const pct = maxFunnelValue > 0 ? (f.value / maxFunnelValue) * 100 : 0;
                                const color = stageColor(f.stage);
                                return (
                                    <div key={f.stage} className="rounded-lg bg-[#0f0f14] px-4 py-2.5">
                                        <div className="mb-1 flex items-center justify-between text-xs">
                                            <span className="font-medium text-[#e8e8ed] capitalize">{stageLabel(f.stage)}</span>
                                            <span className="text-[#8b8b9e]">{f.count} deals · {formatCurrency(f.value)}</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a24]">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Metrics grid */}
                    <div className="mb-6 grid grid-cols-4 gap-3">
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                            <div className="flex items-center gap-2 text-[10px] text-[#555570]">
                                <DollarSign className="h-3 w-3" />
                                Total Pipeline
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#e8e8ed]">{formatCurrency(total_pipeline_value)}</div>
                        </div>
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                            <div className="flex items-center gap-2 text-[10px] text-[#555570]">
                                <Target className="h-3 w-3" />
                                Win Rate
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#34d399]">{win_rate}%</div>
                        </div>
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                            <div className="flex items-center gap-2 text-[10px] text-[#555570]">
                                <Clock className="h-3 w-3" />
                                Avg Deal Size
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#e8e8ed]">{formatCurrency(avg_deal_size)}</div>
                        </div>
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                            <div className="flex items-center gap-2 text-[10px] text-[#555570]">
                                <Users className="h-3 w-3" />
                                Active Deals
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#e8e8ed]">{total_active_deals}</div>
                        </div>
                    </div>

                    {/* Bottom row: velocity, bottlenecks, health, NBA */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Stage Velocity */}
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                            <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Stage Velocity (avg days)</h3>
                            <div className="space-y-1.5">
                                {Object.entries(velocity).map(([stage, days]) => (
                                    <div key={stage} className="flex items-center justify-between text-xs">
                                        <span className="capitalize text-[#8b8b9e]">{stageLabel(stage)}</span>
                                        <span className={stage === bottleneck_stage ? 'font-medium text-[#f87171]' : 'text-[#e8e8ed]'}>{days}d</span>
                                    </div>
                                ))}
                            </div>
                            {bottleneck_stage && (
                                <div className="mt-2 flex items-center gap-1.5 rounded bg-[#f87171]/10 px-2 py-1 text-[10px] text-[#f87171]">
                                    <AlertTriangle className="h-3 w-3 shrink-0" />
                                    Bottleneck: {stageLabel(bottleneck_stage)}
                                </div>
                            )}
                        </div>

                        {/* Health Distribution */}
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                            <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Health Overview</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1.5 text-[#34d399]"><span className="h-2 w-2 rounded-full bg-[#34d399]" />Healthy</span>
                                    <span className="text-[#e8e8ed]">{health_distribution.healthy}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1.5 text-[#fbbf24]"><span className="h-2 w-2 rounded-full bg-[#fbbf24]" />At Risk</span>
                                    <span className="text-[#e8e8ed]">{health_distribution.at_risk}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1.5 text-[#f87171]"><span className="h-2 w-2 rounded-full bg-[#f87171]" />Critical</span>
                                    <span className="text-[#e8e8ed]">{health_distribution.critical}</span>
                                </div>
                            </div>
                        </div>

                        {/* NBA Feed / Alerts */}
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                            <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Pipeline Alerts</h3>
                            <div className="space-y-1.5">
                                {stale_deals_count > 0 && (
                                    <button className="flex w-full items-center gap-1.5 rounded bg-[#f87171]/10 px-2 py-1.5 text-[10px] text-[#f87171] transition-colors hover:bg-[#f87171]/20">
                                        <AlertTriangle className="h-3 w-3 shrink-0" />
                                        {stale_deals_count} deals inactive 14d
                                    </button>
                                )}
                                {missing_stakeholder_count > 0 && (
                                    <button className="flex w-full items-center gap-1.5 rounded bg-[#fbbf24]/10 px-2 py-1.5 text-[10px] text-[#fbbf24] transition-colors hover:bg-[#fbbf24]/20">
                                        <Users className="h-3 w-3 shrink-0" />
                                        {missing_stakeholder_count} missing stakeholders
                                    </button>
                                )}
                                {stuck_deals_count > 0 && (
                                    <button className="flex w-full items-center gap-1.5 rounded bg-[#3b6cdb]/10 px-2 py-1.5 text-[10px] text-[#3b6cdb] transition-colors hover:bg-[#3b6cdb]/20">
                                        <Clock className="h-3 w-3 shrink-0" />
                                        {stuck_deals_count} stuck stages
                                    </button>
                                )}
                                {stale_deals_count === 0 && missing_stakeholder_count === 0 && stuck_deals_count === 0 && (
                                    <p className="text-[11px] text-[#555570]">No alerts. Pipeline is healthy.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
