import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    AlertTriangle,
    Building2,
    FileText,
    ChevronDown,
    Pencil,
} from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(val);
}

const stages = [
    { key: 'qualification', label: 'Qualification' },
    { key: 'meeting', label: 'Meeting' },
    { key: 'proposal', label: 'Proposal Sent' },
    { key: 'negotiation', label: 'Negotiation' },
    { key: 'closed_won', label: 'Closed Won' },
    { key: 'closed_lost', label: 'Closed Lost' },
];

export default function DealShow({
    deal,
    health_score = null,
    recommendations = [],
    stakeholders = [],
    products = [],
    quotations = [],
    risks = [],
    competitors = [],
    coverage = null,
    confidence = null,
}: Props) {
    const handleStageChange = (stage: string) => {
        router.patch(
            `/crm/deals/${deal.id}`,
            { stage },
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleDismiss = (ruleKey: string) => {
        router.post(
            '/crm/next-best-action/dismiss',
            { rule_key: ruleKey, entity_type: 'deal', entity_id: deal.id },
            { preserveState: true },
        );
    };

    const coveragePct = coverage?.score ?? 0;

    return (
        <>
            <Head title={`CRM · ${deal.title}`} />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 px-6 py-3 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/crm/deals"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e2e6ef] bg-white text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <Link
                                href="/crm/deals"
                                className="text-[#6b7280] hover:text-[#374151]"
                            >
                                Deals
                            </Link>
                            <span className="text-[#d1d5db]">/</span>
                            <span className="font-medium text-[#1a1a2e]">
                                {deal.title}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {health_score && (
                            <HealthScoreBadge
                                score={health_score.score}
                                tier={health_score.tier}
                                size="sm"
                            />
                        )}
                        <Link href={`/crm/deals/${deal.id}/edit`}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 border-[#e2e6ef] text-xs text-[#6b7280] hover:bg-[#f0f2f7] hover:text-[#1a1a2e]"
                            >
                                <Pencil className="h-3 w-3" />
                                Edit
                            </Button>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex h-8 items-center gap-1.5 rounded-xl border border-[#e2e6ef] bg-white px-3 text-xs font-medium text-[#374151] capitalize shadow-sm transition-all hover:border-[#c8cce0] hover:shadow-md">
                                    {deal.stage.replace(/_/g, ' ')}
                                    <ChevronDown className="h-3 w-3 text-[#9ca3af]" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-44 text-xs">
                                {stages.map((s) => (
                                    <DropdownMenuItem
                                        key={s.key}
                                        onClick={() => handleStageChange(s.key)}
                                        className="cursor-pointer capitalize"
                                    >
                                        {s.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* 3-panel layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left panel: Coverage + Stakeholders + Products + Risks + Competitors */}
                    <div className="w-72 shrink-0 space-y-5 overflow-y-auto border-r border-[#e2e6ef] bg-white p-4">
                        {/* Coverage Index */}
                        {coverage && (
                            <section>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-[10px] font-semibold tracking-wider text-[#6b7280] uppercase">
                                        Stakeholder Coverage
                                    </span>
                                    <span
                                        className={cn(
                                            'text-xs font-bold',
                                            coveragePct >= 70
                                                ? 'text-emerald-600'
                                                : coveragePct >= 40
                                                  ? 'text-amber-600'
                                                  : 'text-rose-600',
                                        )}
                                    >
                                        {coveragePct}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0f2f7]">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${coveragePct}%`,
                                            backgroundColor:
                                                coveragePct >= 70
                                                    ? '#059669'
                                                    : coveragePct >= 40
                                                      ? '#d97706'
                                                      : '#e11d48',
                                        }}
                                    />
                                </div>
                            </section>
                        )}

                        {/* Stakeholders */}
                        <section>
                            <h2 className="mb-2 text-[10px] font-semibold tracking-wider text-[#6b7280] uppercase">
                                Stakeholders ({stakeholders.length})
                            </h2>
                            {stakeholders.length === 0 ? (
                                <p className="text-[11px] text-[#9ca3af]">
                                    No stakeholders mapped
                                </p>
                            ) : (
                                <div className="space-y-1.5">
                                    {stakeholders.map((s) => (
                                        <div
                                            key={s.id}
                                            className="flex items-center gap-2 rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] px-3 py-2 shadow-sm"
                                        >
                                            <span className="text-xs font-medium text-[#1a1a2e]">
                                                {s.name}
                                            </span>
                                            {s.influence_type && (
                                                <InfluenceBadge
                                                    slug={s.influence_type.slug}
                                                    name={s.influence_type.name}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Products sidebar */}
                        <section>
                            <h2 className="mb-2 text-[10px] font-semibold tracking-wider text-[#6b7280] uppercase">
                                Products ({products.length})
                            </h2>
                            {products.length === 0 ? (
                                <p className="text-[11px] text-[#9ca3af]">
                                    No products added
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {products.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center justify-between rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] px-3 py-2 shadow-sm"
                                        >
                                            <span className="text-xs text-[#1a1a2e]">
                                                {p.name}
                                            </span>
                                            <span className="text-[11px] font-medium text-[#6b7280]">
                                                {formatCurrency(p.total)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Risks */}
                        {risks.length > 0 && (
                            <section>
                                <h2 className="mb-2 text-[10px] font-semibold tracking-wider text-[#6b7280] uppercase">
                                    Risks ({risks.length})
                                </h2>
                                <div className="space-y-1.5">
                                    {risks.map((r) => (
                                        <div
                                            key={r.id}
                                            className="flex items-start gap-2 rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] px-3 py-2 shadow-sm"
                                        >
                                            <AlertTriangle
                                                className={cn(
                                                    'mt-0.5 h-3.5 w-3.5 shrink-0',
                                                    r.severity === 'high'
                                                        ? 'text-rose-500'
                                                        : r.severity ===
                                                            'medium'
                                                          ? 'text-amber-500'
                                                          : 'text-blue-500',
                                                )}
                                            />
                                            <span className="text-xs text-[#6b7280]">
                                                {r.description}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Competitors */}
                        {competitors.length > 0 && (
                            <section>
                                <h2 className="mb-2 text-[10px] font-semibold tracking-wider text-[#6b7280] uppercase">
                                    Competitors ({competitors.length})
                                </h2>
                                <div className="space-y-1.5">
                                    {competitors.map((c) => (
                                        <div
                                            key={c.id}
                                            className="flex items-center gap-2 rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] px-3 py-2 shadow-sm"
                                        >
                                            <Building2 className="h-3.5 w-3.5 text-[#6b7280]" />
                                            <span className="text-xs text-[#1a1a2e]">
                                                {c.name}
                                            </span>
                                            <span className="ml-auto text-[10px] text-[#9ca3af] capitalize">
                                                ({c.position})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Center panel: Deal info + NBA + Products Table + Quotes + Notes */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Deal Header */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#1a1a2e]">
                                    {deal.title}
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6b7280]">
                                    <span className="text-2xl font-bold text-[#1a1a2e]">
                                        {formatCurrency(deal.value)}
                                    </span>
                                    <span className="h-3.5 w-px bg-[#e2e6ef]" />
                                    <span>
                                        Probability:{' '}
                                        <strong className="text-[#1a1a2e]">
                                            {deal.probability}%
                                        </strong>
                                    </span>
                                    {deal.forecast_category && (
                                        <>
                                            <span className="h-3.5 w-px bg-[#e2e6ef]" />
                                            <span className="capitalize">
                                                Forecast:{' '}
                                                <strong className="text-[#1a1a2e]">
                                                    {deal.forecast_category.replace(
                                                        /_/g,
                                                        ' ',
                                                    )}
                                                </strong>
                                            </span>
                                        </>
                                    )}
                                    {deal.owner && (
                                        <>
                                            <span className="h-3.5 w-px bg-[#e2e6ef]" />
                                            <span>
                                                Owner:{' '}
                                                <strong className="text-[#1a1a2e]">
                                                    {deal.owner.name}
                                                </strong>
                                            </span>
                                        </>
                                    )}
                                    {deal.expected_close_date && (
                                        <>
                                            <span className="h-3.5 w-px bg-[#e2e6ef]" />
                                            <span>
                                                Close:{' '}
                                                <strong className="text-[#1a1a2e]">
                                                    {new Date(
                                                        deal.expected_close_date,
                                                    ).toLocaleDateString()}
                                                </strong>
                                            </span>
                                        </>
                                    )}
                                </div>
                                {confidence && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#f0f2f7]">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full transition-all',
                                                    confidence.confidence >= 70
                                                        ? 'bg-emerald-500'
                                                        : confidence.confidence >=
                                                            40
                                                          ? 'bg-amber-500'
                                                          : 'bg-rose-500',
                                                )}
                                                style={{
                                                    width: `${confidence.confidence}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-[#6b7280]">
                                            Confidence:{' '}
                                            <strong className="text-[#1a1a2e]">
                                                {confidence.confidence}%
                                            </strong>
                                        </span>
                                        {confidence.mismatch && (
                                            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-xs text-amber-600">
                                                suggested:{' '}
                                                {confidence.suggested_category}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* NBA Strip */}
                            {recommendations.length > 0 && (
                                <div className="mb-5">
                                    <div className="space-y-2">
                                        {recommendations
                                            .slice(0, 2)
                                            .map((r) => (
                                                <RecommendationCard
                                                    key={r.rule_key}
                                                    ruleKey={r.rule_key}
                                                    priority={r.priority}
                                                    title={r.title}
                                                    context={r.context}
                                                    suggestedAction={
                                                        r.suggested_action
                                                    }
                                                    onDismiss={() =>
                                                        handleDismiss(
                                                            r.rule_key,
                                                        )
                                                    }
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Products Table */}
                            <section className="mb-5 rounded-2xl border border-[#e2e6ef] bg-white shadow-sm">
                                <div className="flex gap-1 border-b border-[#f0f2f7] px-4 py-2.5">
                                    <span className="rounded-lg bg-[#f0f2f7] px-2.5 py-0.5 text-[11px] font-medium text-[#374151]">
                                        Products
                                    </span>
                                    <span className="rounded-lg px-2.5 py-0.5 text-[11px] text-[#9ca3af]">
                                        Quotes
                                    </span>
                                </div>
                                <div className="p-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-[11px] tracking-wider text-[#6b7280] uppercase">
                                                <th className="pb-2 text-left font-medium">
                                                    Product
                                                </th>
                                                <th className="pb-2 text-right font-medium">
                                                    Qty
                                                </th>
                                                <th className="pb-2 text-right font-medium">
                                                    Price
                                                </th>
                                                <th className="pb-2 text-right font-medium">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((p) => (
                                                <tr
                                                    key={p.id}
                                                    className="border-t border-[#f0f2f7]"
                                                >
                                                    <td className="py-2 font-medium text-[#1a1a2e]">
                                                        {p.name}
                                                    </td>
                                                    <td className="py-2 text-right text-[#6b7280]">
                                                        {p.quantity}
                                                    </td>
                                                    <td className="py-2 text-right text-[#6b7280]">
                                                        {formatCurrency(
                                                            p.unit_price,
                                                        )}
                                                    </td>
                                                    <td className="py-2 text-right font-semibold text-[#1a1a2e]">
                                                        {formatCurrency(
                                                            p.total,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {products.length === 0 && (
                                        <p className="py-3 text-xs text-[#9ca3af]">
                                            No products configured. Add from
                                            catalog.
                                        </p>
                                    )}
                                </div>
                            </section>

                            {/* Quotations */}
                            {quotations.length > 0 && (
                                <section className="mb-5">
                                    <h2 className="mb-2.5 text-xs font-semibold tracking-wider text-[#6b7280] uppercase">
                                        Quotation Versions
                                    </h2>
                                    <div className="space-y-1.5">
                                        {quotations.map((q) => (
                                            <Link
                                                key={q.id}
                                                href={`/crm/quotations/${q.id}`}
                                                className="flex items-center justify-between rounded-xl border border-[#e2e6ef] bg-white px-4 py-2.5 shadow-sm transition-all hover:border-[#c8cce0] hover:shadow-md"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f0f2f7]">
                                                        <FileText className="h-3.5 w-3.5 text-[#6b7280]" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-[#1a1a2e]">
                                                            v{q.version}
                                                        </span>
                                                        <span className="ml-2 rounded-md bg-[#f0f2f7] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280] capitalize">
                                                            {q.status.replace(
                                                                /_/g,
                                                                ' ',
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-semibold text-[#1a1a2e]">
                                                    {formatCurrency(
                                                        q.grand_total,
                                                    )}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Notes */}
                            {deal.notes && (
                                <section>
                                    <h2 className="mb-2 text-xs font-semibold tracking-wider text-[#6b7280] uppercase">
                                        Notes
                                    </h2>
                                    <div className="rounded-xl border border-[#e2e6ef] bg-white px-4 py-3 shadow-sm">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#6b7280]">
                                            {deal.notes}
                                        </p>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Right panel: Timeline */}
                    <div className="w-80 shrink-0 border-l border-[#e2e6ef] bg-[#f8f9fc]">
                        <ActivityTimeline
                            entityType="deal"
                            entityId={deal.id}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
