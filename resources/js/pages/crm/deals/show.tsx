import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle, Building2, FileText, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import HealthScoreBadge from '@/components/crm/health-score-badge';
import RecommendationCard from '@/components/crm/recommendation-card';
import ActivityTimeline from '@/components/crm/activity-timeline';
import InfluenceBadge from '@/components/crm/influence-badge';

interface Deal {
    id: number;
    title: string;
    value: number;
    stage: string;
    probability: number;
    forecast_category: string | null;
    expected_close_date: string | null;
    notes: string | null;
    owner: { id: number; name: string } | null;
    organization: { id: number; name: string } | null;
    contact: { id: number; name: string } | null;
}

interface RecommendedAction {
    rule_key: string;
    priority: string;
    title: string;
    context: string;
    suggested_action: string;
}

interface StakeholderInfo {
    id: number;
    name: string;
    influence_type: { slug: string; name: string } | null;
}

interface ProductLine {
    id: number;
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
}

interface QuoteVersion {
    id: number;
    version: number;
    status: string;
    grand_total: number;
    created_at: string;
}

interface RiskItem {
    id: number;
    description: string;
    severity: string;
    mitigation: string | null;
}

interface CompetitorItem {
    id: number;
    name: string;
    position: string;
}

interface HealthScore {
    score: number;
    tier: string;
    factors: { name: string; weight: number; score: number }[];
    trend: string;
}

interface CoverageResult {
    score: number;
    has_decision_maker: boolean;
    has_champion: boolean;
    has_influencer: boolean;
    has_blocker: boolean;
}

interface ConfidenceResult {
    confidence: number;
    suggested_category: string;
    mismatch: boolean;
}

interface Props {
    deal: Deal;
    health_score: HealthScore | null;
    recommendations: RecommendedAction[];
    stakeholders: StakeholderInfo[];
    products: ProductLine[];
    quotations: QuoteVersion[];
    risks: RiskItem[];
    competitors: CompetitorItem[];
    coverage: CoverageResult | null;
    confidence: ConfidenceResult | null;
}

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
}

const stages = [
    { key: 'qualification', label: 'Qualification' },
    { key: 'meeting', label: 'Meeting' },
    { key: 'proposal', label: 'Proposal Sent' },
    { key: 'negotiation', label: 'Negotiation' },
    { key: 'closed_won', label: 'Closed Won' },
    { key: 'closed_lost', label: 'Closed Lost' },
];

export default function DealShow({ deal, health_score, recommendations, stakeholders, products, quotations, risks, competitors, coverage, confidence }: Props) {
    const handleStageChange = (stage: string) => {
        router.patch(`/crm/deals/${deal.id}`, { stage }, { preserveScroll: true, preserveState: true });
    };

    const handleDismiss = (ruleKey: string) => {
        router.post('/crm/next-best-action/dismiss', { rule_key: ruleKey, entity_type: 'deal', entity_id: deal.id }, { preserveState: true });
    };

    const coveragePct = coverage?.score ?? 0;

    return (
        <>
            <Head title={`CRM · ${deal.title}`} />

            <div className="flex h-full flex-col">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-2.5">
                    <div className="flex items-center gap-3">
                        <Link href="/crm/deals" className="flex h-7 w-7 items-center justify-center rounded text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <Link href="/crm/deals" className="text-[#555570] hover:text-[#8b8b9e]">Deals</Link>
                            <span className="text-[#555570]">/</span>
                            <span className="text-[#e8e8ed]">{deal.title}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {health_score && <HealthScoreBadge score={health_score.score} tier={health_score.tier} size="sm" />}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex h-7 items-center gap-1 rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 text-[11px] font-medium text-[#e8e8ed] transition-colors hover:border-[#2a2a3a] capitalize">
                                    {deal.stage.replace(/_/g, ' ')}
                                    <ChevronDown className="h-3 w-3 text-[#555570]" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-44 border-[#1e1e2a] bg-[#0f0f14] text-xs text-[#e8e8ed]">
                                {stages.map(s => (
                                    <DropdownMenuItem key={s.key} onClick={() => handleStageChange(s.key)} className="cursor-pointer focus:bg-[#1a1a24] capitalize">
                                        {s.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* 3-panel layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left panel: Products + Quotes + Risks + Competitors */}
                    <div className="w-72 shrink-0 overflow-y-auto border-r border-[#1e1e2a] p-4">
                        {/* Coverage Index */}
                        {coverage && (
                            <section className="mb-4">
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#555570]">Stakeholder Coverage</span>
                                    <span className="text-xs font-medium" style={{ color: coveragePct >= 70 ? '#34d399' : coveragePct >= 40 ? '#fbbf24' : '#f87171' }}>
                                        {coveragePct}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a24]">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${coveragePct}%`, backgroundColor: coveragePct >= 70 ? '#34d399' : coveragePct >= 40 ? '#fbbf24' : '#f87171' }} />
                                </div>
                            </section>
                        )}

                        {/* Stakeholders */}
                        <section className="mb-4">
                            <h2 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Stakeholders ({stakeholders.length})</h2>
                            {stakeholders.length === 0 ? (
                                <p className="text-[10px] text-[#555570]">No stakeholders mapped</p>
                            ) : (
                                <div className="space-y-1">
                                    {stakeholders.map(s => (
                                        <div key={s.id} className="flex items-center gap-2 rounded border border-[#1e1e2a] bg-[#0f0f14] px-2 py-1.5">
                                            <span className="text-xs text-[#e8e8ed]">{s.name}</span>
                                            {s.influence_type && <InfluenceBadge slug={s.influence_type.slug} name={s.influence_type.name} />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Products */}
                        <section className="mb-4">
                            <h2 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Products</h2>
                            {products.length === 0 ? (
                                <p className="text-[10px] text-[#555570]">No products added</p>
                            ) : (
                                products.map(p => (
                                    <div key={p.id} className="flex items-center justify-between rounded border border-[#1e1e2a] bg-[#0f0f14] px-2 py-1.5 mb-1">
                                        <span className="text-xs text-[#e8e8ed]">{p.name}</span>
                                        <span className="text-[10px] text-[#555570]">{formatCurrency(p.total)}</span>
                                    </div>
                                ))
                            )}
                        </section>

                        {/* Risks */}
                        {risks.length > 0 && (
                            <section className="mb-4">
                                <h2 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Risks</h2>
                                {risks.map(r => (
                                    <div key={r.id} className="flex items-center gap-2 rounded border border-[#1e1e2a] bg-[#0f0f14] px-2 py-1.5 mb-1">
                                        <AlertTriangle className="h-3 w-3 shrink-0" style={{ color: r.severity === 'high' ? '#f87171' : r.severity === 'medium' ? '#fbbf24' : '#3b6cdb' }} />
                                        <span className="text-xs text-[#8b8b9e]">{r.description}</span>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Competitors */}
                        {competitors.length > 0 && (
                            <section>
                                <h2 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Competitors</h2>
                                {competitors.map(c => (
                                    <div key={c.id} className="flex items-center gap-2 rounded border border-[#1e1e2a] bg-[#0f0f14] px-2 py-1.5 mb-1">
                                        <span className="text-xs text-[#e8e8ed]">{c.name}</span>
                                        <span className="text-[9px] text-[#555570] capitalize">({c.position})</span>
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>

                    {/* Center panel */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-5">
                            {/* Header */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-lg font-medium text-[#e8e8ed]">
                                    {deal.title}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[#555570]">
                                    <span className="text-lg font-semibold text-[#e8e8ed]">{formatCurrency(deal.value)}</span>
                                    <span>·</span>
                                    <span>Probability: {deal.probability}%</span>
                                    {deal.forecast_category && <><span>·</span><span className="capitalize">Forecast: {deal.forecast_category.replace(/_/g, ' ')}</span></>}
                                    {deal.owner && <><span>·</span><span>Owner: {deal.owner.name}</span></>}
                                    {deal.expected_close_date && <><span>·</span><span>Close: {new Date(deal.expected_close_date).toLocaleDateString()}</span></>}
                                </div>
                                {confidence && (
                                    <div className="mt-1 flex items-center gap-2">
                                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#1a1a24]">
                                            <div className="h-full rounded-full bg-[#3b6cdb]" style={{ width: `${confidence.confidence}%` }} />
                                        </div>
                                        <span className="text-[10px] text-[#555570]">Confidence: {confidence.confidence}%</span>
                                        {confidence.mismatch && (
                                            <span className="text-[10px] text-[#fbbf24]">
                                                (suggested: {confidence.suggested_category})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* NBA Strip */}
                            {recommendations.length > 0 && (
                                <div className="mb-4">
                                    <div className="space-y-1.5">
                                        {recommendations.slice(0, 2).map(r => (
                                            <RecommendationCard key={r.rule_key} ruleKey={r.rule_key} priority={r.priority} title={r.title} context={r.context} suggestedAction={r.suggested_action} onDismiss={() => handleDismiss(r.rule_key)} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stakeholder Map + Products Lineup + Quotations in tabs */}
                            <div className="mb-4 rounded-lg border border-[#1e1e2a]">
                                <div className="flex gap-1 border-b border-[#1e1e2a] px-3 py-2">
                                    <span className="rounded bg-[#1e1e2a] px-2 py-0.5 text-[10px] text-[#e8e8ed]">Products</span>
                                    <span className="rounded px-2 py-0.5 text-[10px] text-[#555570]">Quotes</span>
                                </div>
                                <div className="p-3">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-[10px] text-[#555570] uppercase tracking-wider">
                                                <th className="pb-1.5 text-left">Product</th>
                                                <th className="pb-1.5 text-right">Qty</th>
                                                <th className="pb-1.5 text-right">Price</th>
                                                <th className="pb-1.5 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(p => (
                                                <tr key={p.id} className="border-t border-[#1e1e2a]">
                                                    <td className="py-1.5 text-[#e8e8ed]">{p.name}</td>
                                                    <td className="py-1.5 text-right text-[#8b8b9e]">{p.quantity}</td>
                                                    <td className="py-1.5 text-right text-[#8b8b9e]">{formatCurrency(p.unit_price)}</td>
                                                    <td className="py-1.5 text-right font-medium text-[#e8e8ed]">{formatCurrency(p.total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {products.length === 0 && <p className="text-[11px] text-[#555570] py-2">No products configured. Add from catalog.</p>}
                                </div>
                            </div>

                            {/* Quotation Versions */}
                            {quotations.length > 0 && (
                                <section className="mb-4">
                                    <h2 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Quotation Versions</h2>
                                    <div className="space-y-1">
                                        {quotations.map(q => (
                                            <Link key={q.id} href={`/crm/quotations/${q.id}`}
                                                className="flex items-center justify-between rounded border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-2 transition-colors hover:border-[#2a2a3a]"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-3.5 w-3.5 text-[#555570]" />
                                                    <span className="text-xs text-[#e8e8ed]">v{q.version}</span>
                                                    <span className="rounded bg-[#1a1a24] px-1 py-0.5 text-[9px] text-[#555570] capitalize">{q.status.replace(/_/g, ' ')}</span>
                                                </div>
                                                <span className="text-xs font-medium text-[#e8e8ed]">{formatCurrency(q.grand_total)}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Notes */}
                            {deal.notes && (
                                <section>
                                    <h2 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Notes</h2>
                                    <p className="rounded border border-[#1e1e2a] bg-[#0f0f14] px-3 py-2 text-xs text-[#8b8b9e]">{deal.notes}</p>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Right panel: Timeline */}
                    <div className="w-80 shrink-0 border-l border-[#1e1e2a] bg-[#0a0a0f]">
                        <ActivityTimeline entityType="deal" entityId={deal.id} />
                    </div>
                </div>
            </div>
        </>
    );
}
