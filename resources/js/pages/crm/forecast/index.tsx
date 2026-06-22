import { Head, Link, router } from '@inertiajs/react';
import { DollarSign, TrendingUp, Target, ChevronLeft, ChevronRight, AlertTriangle, Users, Clock } from 'lucide-react';

interface DealForecast {
    id: number;
    title: string;
    value: number;
    stage: string;
    forecast_category: string | null;
    owner: { id: number; name: string } | null;
    organization: { id: number; name: string } | null;
    confidence: number;
    suggested_category: string;
    mismatch: boolean;
}

interface TeamMember {
    name: string;
    commit: number;
    best_case: number;
    pipeline: number;
    total: number;
}

interface Props {
    period: string;
    summary: { commit: number; best_case: number; pipeline: number; uncategorized: number; weighted: number };
    quota: number;
    deals: DealForecast[];
    team_breakdown: TeamMember[];
    health_distribution: { healthy: number; at_risk: number; critical: number };
    is_manager: boolean;
}

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
}

function nextPeriod(p: string, dir: number): string {
    const [year, q] = p.split('-Q');
    const y = parseInt(year);
    const qn = parseInt(q) + dir;
    if (qn < 1) return `${y - 1}-Q4`;
    if (qn > 4) return `${y + 1}-Q1`;
    return `${y}-Q${qn}`;
}

export default function ForecastIndex({
    period, summary, quota, deals, team_breakdown, health_distribution, is_manager,
}: Props) {
    return (
        <>
            <Head title="CRM · Forecast" />
            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-base font-medium text-[#e8e8ed]">Forecast {period}</h1>
                        <div className="flex items-center gap-1">
                            <button onClick={() => router.get('/crm/forecast', { period: nextPeriod(period, -1) }, { preserveState: true })}
                                className="flex h-6 w-6 items-center justify-center rounded text-[#555570] hover:bg-[#1a1a24]">
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => router.get('/crm/forecast', { period: nextPeriod(period, 1) }, { preserveState: true })}
                                className="flex h-6 w-6 items-center justify-center rounded text-[#555570] hover:bg-[#1a1a24]">
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Summary cards */}
                    <div className="mb-6 grid grid-cols-5 gap-3">
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                            <div className="text-[10px] text-[#34d399] font-medium uppercase tracking-wider">Commit</div>
                            <div className="mt-1 text-lg font-semibold text-[#34d399]">{formatCurrency(summary.commit)}</div>
                        </div>
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                            <div className="text-[10px] text-[#fbbf24] font-medium uppercase tracking-wider">Best Case</div>
                            <div className="mt-1 text-lg font-semibold text-[#fbbf24]">{formatCurrency(summary.best_case)}</div>
                        </div>
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                            <div className="text-[10px] text-[#555570] font-medium uppercase tracking-wider">Pipeline</div>
                            <div className="mt-1 text-lg font-semibold text-[#e8e8ed]">{formatCurrency(summary.pipeline)}</div>
                        </div>
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                            <div className="text-[10px] text-[#3b6cdb] font-medium uppercase tracking-wider">Weighted</div>
                            <div className="mt-1 text-lg font-semibold text-[#3b6cdb]">{formatCurrency(summary.weighted)}</div>
                        </div>
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                            <div className="text-[10px] text-[#e8e8ed] font-medium uppercase tracking-wider">Quota</div>
                            <div className="mt-1 text-lg font-semibold text-[#e8e8ed]">
                                {quota > 0 ? formatCurrency(quota) : '—'}
                            </div>
                            {quota > 0 && (
                                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#1a1a24]">
                                    <div className="h-full rounded-full bg-[#3b6cdb]" style={{ width: `${Math.min((summary.commit + summary.best_case) / quota * 100, 100)}%` }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2-panel content */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Deal-level forecast */}
                        <div className="rounded-lg border border-[#1e1e2a]">
                            <div className="border-b border-[#1e1e2a] px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-[#555570]">
                                Deal-Level Forecast
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-xs">
                                    <thead className="sticky top-0 bg-[#0a0a0f]">
                                        <tr className="text-[10px] text-[#555570] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left">
                                            <th>Deal</th>
                                            <th>Value</th>
                                            <th>Stage</th>
                                            <th>Cat</th>
                                            <th>Conf</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deals.map(d => (
                                            <tr key={d.id} className="border-t border-[#1e1e2a] [&_td]:px-3 [&_td]:py-2 transition-colors hover:bg-[#0f0f14]">
                                                <td>
                                                    <Link href={`/crm/deals/${d.id}`} className="text-[#e8e8ed] hover:text-[#3b6cdb]">{d.title}</Link>
                                                </td>
                                                <td className="text-[#e8e8ed]">{formatCurrency(d.value)}</td>
                                                <td className="capitalize text-[#8b8b9e]">{d.stage.replace(/_/g, ' ')}</td>
                                                <td className={`capitalize ${d.forecast_category === 'commit' ? 'text-[#34d399]' : d.forecast_category === 'best_case' ? 'text-[#fbbf24]' : 'text-[#555570]'}`}>
                                                    {d.forecast_category ?? '—'}
                                                    {d.mismatch && <span className="ml-1 text-[10px] text-[#f87171]">⚠</span>}
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-1 w-12 overflow-hidden rounded-full bg-[#1a1a24]">
                                                            <div className="h-full rounded-full bg-[#3b6cdb]" style={{ width: `${d.confidence}%` }} />
                                                        </div>
                                                        <span className="text-[#555570]">{d.confidence}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {deals.length === 0 && <p className="p-6 text-center text-xs text-[#555570]">No active deals this period.</p>}
                            </div>
                        </div>

                        {/* Right column: team + health */}
                        <div className="space-y-4">
                            {/* Team breakdown */}
                            {is_manager && team_breakdown.length > 0 && (
                                <div className="rounded-lg border border-[#1e1e2a]">
                                    <div className="border-b border-[#1e1e2a] px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-[#555570]">
                                        Team Breakdown
                                    </div>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-[10px] text-[#555570] [&_th]:px-3 [&_th]:py-2 [&_th]:text-right [&_th:first-child]:text-left">
                                                <th>Rep</th>
                                                <th>Commit</th>
                                                <th>Best</th>
                                                <th>Pipe</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {team_breakdown.map(t => (
                                                <tr key={t.name} className="border-t border-[#1e1e2a] [&_td]:px-3 [&_td]:py-2 [&_td]:text-right [&_td:first-child]:text-left">
                                                    <td className="text-[#e8e8ed]">{t.name}</td>
                                                    <td className="text-[#34d399]">{formatCurrency(t.commit)}</td>
                                                    <td className="text-[#fbbf24]">{formatCurrency(t.best_case)}</td>
                                                    <td className="text-[#555570]">{formatCurrency(t.pipeline)}</td>
                                                    <td className="font-medium text-[#e8e8ed]">{formatCurrency(t.total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Health */}
                            <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                                <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Health Distribution</h3>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5 text-[#34d399]"><span className="h-2 w-2 rounded-full bg-[#34d399]" />Healthy</span>
                                        <span>{health_distribution.healthy}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5 text-[#fbbf24]"><span className="h-2 w-2 rounded-full bg-[#fbbf24]" />At Risk</span>
                                        <span>{health_distribution.at_risk}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5 text-[#f87171]"><span className="h-2 w-2 rounded-full bg-[#f87171]" />Critical</span>
                                        <span>{health_distribution.critical}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick actions */}
                            <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                                <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Quick Actions</h3>
                                <div className="space-y-1.5">
                                    {deals.filter(d => d.mismatch).length > 0 && (
                                        <div className="flex items-center gap-1.5 rounded bg-[#fbbf24]/10 px-2 py-1.5 text-[10px] text-[#fbbf24]">
                                            <AlertTriangle className="h-3 w-3 shrink-0" />
                                            {deals.filter(d => d.mismatch).length} deals with category mismatch
                                        </div>
                                    )}
                                    {deals.length === 0 && (
                                        <p className="text-[11px] text-[#555570]">No active deals for this period.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
