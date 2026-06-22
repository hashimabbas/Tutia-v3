import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Building2, Globe, Phone, Mail, Users, DollarSign, Activity, Tag, Plus, UserPlus, Briefcase } from 'lucide-react';
import { useState } from 'react';

import HealthScoreBadge from '@/components/crm/health-score-badge';
import RecommendationCard from '@/components/crm/recommendation-card';
import RelationshipGraph from '@/components/crm/relationship-graph';
import ActivityTimeline from '@/components/crm/activity-timeline';
import KpiGrid from '@/components/crm/kpi-grid';

interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    phone: string | null;
    job_title: string | null;
    influence_type: { id: number; slug: string; name: string } | null;
    pivot: { contact_role_id: number | null; is_primary: boolean; job_title: string | null };
}

interface Deal {
    id: number;
    title: string;
    value: number;
    stage: string;
    owner: { id: number; name: string } | null;
    created_at: string;
}

interface Classification {
    id: number;
    slug: string;
    name: string;
}

interface Address {
    id: number;
    line1: string;
    city: string;
    country: string;
}

interface Tag {
    id: number;
    name: string;
    color: string | null;
}

interface HealthFactor {
    name: string;
    weight: number;
    score: number;
}

interface HealthScore {
    score: number;
    tier: string;
    factors: HealthFactor[];
    trend: string;
}

interface RecommendedAction {
    rule_key: string;
    priority: string;
    title: string;
    context: string;
    suggested_action: string;
}

interface RelationshipGraphData {
    nodes: { id: number; name: string; influence_type: string | null; influence_type_name: string | null; avatar_url: string | null; is_primary: boolean; org_role: number | null }[];
    edges: { from: number; to: string; weight: number; label: string | null }[];
    influence_summary: Record<string, number>;
    organization_relationships: any[];
}

interface Organization {
    id: number;
    name: string;
    domain: string | null;
    industry: string | null;
    size: string | null;
    phone: string | null;
    website: string | null;
    notes: string | null;
    logo_url: string | null;
    owner_id: number | null;
    created_by: number;
    created_at: string;
    owner: { id: number; name: string } | null;
    contacts: Contact[];
    classifications: Classification[];
    addresses: Address[];
    tags: Tag[];
    deals: Deal[];
}

interface Props {
    organization: Organization;
    health_score: HealthScore | null;
    recommendations: RecommendedAction[];
    relationship_graph: RelationshipGraphData;
}

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
}

export default function OrganizationShow({ organization: org, health_score, recommendations, relationship_graph }: Props) {
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const activeDeals = org.deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const wonDeals = org.deals.filter(d => d.stage === 'closed_won');
    const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
    const lastActivityDays = 0; // placeholder — computed on backend in CRM-3

    const stakeholderCoverage = (() => {
        const total = org.contacts.length;
        if (total === 0) return 0;
        const withInfluence = org.contacts.filter(c => c.influence_type).length;
        return Math.round((withInfluence / total) * 100);
    })();

    const relationshipStrength = org.contacts.reduce((sum, c) => {
        return sum + (relationship_graph.edges.find(e => e.from === c.id)?.weight ?? 0);
    }, 0);

    const handleDismiss = (ruleKey: string) => {
        router.post('/crm/next-best-action/dismiss', { rule_key: ruleKey, entity_type: 'organization', entity_id: org.id }, { preserveState: true });
    };

    const stages = ['qualification', 'meeting', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

    return (
        <>
            <Head title={`CRM · ${org.name}`} />

            <div className="flex h-full flex-col">
                {/* Breadcrumb bar */}
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-2.5">
                    <div className="flex items-center gap-3">
                        <Link href="/crm/organizations" className="flex h-7 w-7 items-center justify-center rounded text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <Link href="/crm/organizations" className="text-[#555570] hover:text-[#8b8b9e]">Organizations</Link>
                            <span className="text-[#555570]">/</span>
                            <span className="text-[#e8e8ed]">{org.name}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className="rounded border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1 text-[11px] text-[#8b8b9e] transition-colors hover:border-[#2a2a3a] hover:text-[#e8e8ed]"
                    >
                        {editMode ? 'Done' : 'Edit'}
                    </button>
                </div>

                {/* 3-panel layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left panel: Relationship Intelligence */}
                    {leftPanelOpen && (
                        <div className="w-72 shrink-0 border-r border-[#1e1e2a] bg-[#0a0a0f]">
                            <RelationshipGraph
                                nodes={relationship_graph.nodes}
                                edges={relationship_graph.edges}
                                influenceSummary={relationship_graph.influence_summary}
                                orgRelationships={relationship_graph.organization_relationships}
                            />
                        </div>
                    )}

                    {/* Collapse toggle */}
                    <button
                        onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                        className="flex w-4 shrink-0 items-center justify-center border-r border-[#1e1e2a] bg-[#0a0a0f] text-[#555570] hover:bg-[#0f0f14]"
                    >
                        <div className="h-8 w-0.5 rounded-full bg-[#1e1e2a]" />
                    </button>

                    {/* Center panel: Profile + KPIs + Deals + Contacts */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Profile Header */}
                            <div className="mb-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a1a24]">
                                            <Building2 className="h-5 w-5 text-[#555570]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2.5">
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        defaultValue={org.name}
                                                        className="rounded border border-[#1e1e2a] bg-[#0f0f14] px-2 py-1 text-sm font-medium text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                                                    />
                                                ) : (
                                                    <h1 className="text-lg font-medium text-[#e8e8ed]">{org.name}</h1>
                                                )}
                                                {health_score && (
                                                    <HealthScoreBadge
                                                        score={health_score.score}
                                                        tier={health_score.tier}
                                                        size="md"
                                                        trend={health_score.trend}
                                                        factors={health_score.factors}
                                                    />
                                                )}
                                            </div>
                                            <div className="mt-1 flex items-center gap-3 text-xs text-[#555570]">
                                                {org.domain && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{org.domain}</span>}
                                                {org.industry && <span>{org.industry}</span>}
                                                {org.size && <span>{org.size}</span>}
                                                {org.owner && <span>Owner: {org.owner.name}</span>}
                                            </div>
                                            <div className="mt-1 flex gap-1.5">
                                                {org.classifications.map(c => (
                                                    <span key={c.id} className="rounded bg-[#1a1a24] px-1.5 py-0.5 text-[10px] text-[#555570]">{c.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="mb-5">
                                <KpiGrid
                                    items={[
                                        { label: 'Active Deals', value: activeDeals.length, color: '#3b6cdb' },
                                        { label: 'Pipeline Value', value: formatCurrency(pipelineValue), color: '#34d399' },
                                        { label: 'Stakeholder Coverage', value: `${stakeholderCoverage}%`, color: '#a78bfa' },
                                        { label: 'Relationship Strength', value: relationshipStrength, color: '#fbbf24' },
                                    ]}
                                />
                            </div>

                            {/* Next Best Action Strip */}
                            {recommendations.length > 0 && (
                                <div className="mb-5">
                                    <h2 className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-[#555570]">Recommendations</h2>
                                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                                        {recommendations.map(r => (
                                            <div key={r.rule_key} className="w-64 shrink-0">
                                                <RecommendationCard
                                                    ruleKey={r.rule_key}
                                                    priority={r.priority}
                                                    title={r.title}
                                                    context={r.context}
                                                    suggestedAction={r.suggested_action}
                                                    onDismiss={() => handleDismiss(r.rule_key)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Contact Info */}
                            {org.contacts.length > 0 && (
                                <section className="mb-5">
                                    <h2 className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-[#555570]">
                                        Contacts ({org.contacts.length})
                                    </h2>
                                    <div className="space-y-1.5">
                                        {org.contacts.map(contact => (
                                            <Link
                                                key={contact.id}
                                                href={`/crm/contacts/${contact.id}`}
                                                className="flex items-center gap-3 rounded-lg border border-[#1e1e2a] bg-[#0f0f14] px-3 py-2 transition-colors hover:border-[#2a2a3a]"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a24] text-xs font-medium text-[#8b8b9e]">
                                                    {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-medium text-[#e8e8ed]">{contact.name}</span>
                                                        {contact.pivot.is_primary && <span className="rounded bg-[#3b6cdb]/10 px-1 py-0.5 text-[9px] text-[#3b6cdb]">PRIMARY</span>}
                                                    </div>
                                                    <div className="text-[11px] text-[#555570]">
                                                        {contact.job_title ?? contact.pivot.job_title ?? ''}
                                                        {contact.email && <> · {contact.email}</>}
                                                    </div>
                                                </div>
                                                <Users className="h-4 w-4 text-[#555570]" />
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Deals Pipeline */}
                            <section>
                                <h2 className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-[#555570]">
                                    Deals ({org.deals.length})
                                </h2>
                                {org.deals.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-[#1e1e2a] bg-[#0f0f14] p-4 text-center">
                                        <Briefcase className="mx-auto mb-2 h-5 w-5 text-[#1e1e2a]" />
                                        <p className="text-xs text-[#555570]">No deals yet</p>
                                        <button className="mt-1.5 text-[11px] text-[#3b6cdb] hover:text-[#5b8cfb]">Create first deal</button>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {org.deals.map(deal => (
                                            <Link
                                                key={deal.id}
                                                href={`/crm/deals/${deal.id}`}
                                                className="flex items-center justify-between rounded-lg border border-[#1e1e2a] bg-[#0f0f14] px-3 py-2 transition-colors hover:border-[#2a2a3a]"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded bg-[#1a1a24] text-[9px] text-[#555570]">
                                                        {deal.stage.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-[#e8e8ed]">{deal.title}</div>
                                                        <div className="text-[10px] text-[#555570] capitalize">{deal.stage.replace(/_/g, ' ')}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-medium text-[#e8e8ed]">{formatCurrency(deal.value)}</div>
                                                    {deal.owner && <div className="text-[10px] text-[#555570]">{deal.owner.name}</div>}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>

                    {/* Right panel: Universal Timeline */}
                    <div className="w-80 shrink-0 border-l border-[#1e1e2a] bg-[#0a0a0f]">
                        <ActivityTimeline entityType="organization" entityId={org.id} />
                    </div>
                </div>
            </div>
        </>
    );
}
