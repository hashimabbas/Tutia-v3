import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, Globe, Linkedin, Building2, Briefcase, MessageSquare, Activity, UserPlus } from 'lucide-react';
import { useState } from 'react';

import HealthScoreBadge from '@/components/crm/health-score-badge';
import RecommendationCard from '@/components/crm/recommendation-card';
import InfluenceBadge from '@/components/crm/influence-badge';
import ActivityTimeline from '@/components/crm/activity-timeline';
import KpiGrid from '@/components/crm/kpi-grid';

interface OrganizationPivot {
    contact_role_id: number | null;
    is_primary: boolean;
    job_title: string | null;
}

interface OrgMembership {
    id: number;
    name: string;
    domain: string | null;
    pivot: OrganizationPivot;
}

interface Deal {
    id: number;
    title: string;
    value: number;
    stage: string;
    owner: { id: number; name: string } | null;
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

interface InfluenceType {
    id: number;
    slug: string;
    name: string;
}

interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    job_title: string | null;
    department: string | null;
    linkedin_url: string | null;
    avatar_url: string | null;
    influence_type: InfluenceType | null;
    notes: string | null;
    owner: { id: number; name: string } | null;
    organizations: OrgMembership[];
    addresses: Address[];
    tags: Tag[];
    deals: Deal[];
}

interface Props {
    contact: Contact;
    health_score: HealthScore | null;
    recommendations: RecommendedAction[];
}

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
}

export default function ContactShow({ contact, health_score, recommendations }: Props) {
    const [editMode, setEditMode] = useState(false);
    const [quickAction, setQuickAction] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');

    const handleDismiss = (ruleKey: string) => {
        router.post('/crm/next-best-action/dismiss', { rule_key: ruleKey, entity_type: 'contact', entity_id: contact.id }, { preserveState: true });
    };

    return (
        <>
            <Head title={`CRM · ${contact.name}`} />

            <div className="flex h-full flex-col">
                {/* Breadcrumb bar */}
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-2.5">
                    <div className="flex items-center gap-3">
                        <Link href="/crm/contacts" className="flex h-7 w-7 items-center justify-center rounded text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <Link href="/crm/contacts" className="text-[#555570] hover:text-[#8b8b9e]">Contacts</Link>
                            <span className="text-[#555570]">/</span>
                            <span className="text-[#e8e8ed]">{contact.name}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className="rounded border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1 text-[11px] text-[#8b8b9e] transition-colors hover:border-[#2a2a3a] hover:text-[#e8e8ed]"
                    >
                        {editMode ? 'Done' : 'Edit'}
                    </button>
                </div>

                {/* 2-panel layout (left: org memberships + deals, right: timeline) */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left panel: Related info */}
                    <div className="w-72 shrink-0 overflow-y-auto border-r border-[#1e1e2a] p-4">
                        {/* Organization Memberships */}
                        <section className="mb-5">
                            <h2 className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-[#555570]">Organizations</h2>
                            {contact.organizations.length === 0 ? (
                                <p className="text-[11px] text-[#555570]">Not linked to any organization</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {contact.organizations.map(org => (
                                        <Link
                                            key={org.id}
                                            href={`/crm/organizations/${org.id}`}
                                            className="flex items-center gap-2 rounded-lg border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-2 transition-colors hover:border-[#2a2a3a]"
                                        >
                                            <Building2 className="h-4 w-4 shrink-0 text-[#555570]" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-[#e8e8ed]">{org.name}</span>
                                                    {org.pivot.is_primary && <span className="rounded bg-[#3b6cdb]/10 px-1 py-0.5 text-[8px] text-[#3b6cdb]">PRIMARY</span>}
                                                </div>
                                                {org.pivot.job_title && <div className="text-[10px] text-[#555570]">{org.pivot.job_title}</div>}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Tags */}
                        {contact.tags.length > 0 && (
                            <section className="mb-5">
                                <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#555570]">Tags</h2>
                                <div className="flex flex-wrap gap-1">
                                    {contact.tags.map(tag => (
                                        <span
                                            key={tag.id}
                                            className="rounded px-1.5 py-0.5 text-[10px] text-[#8b8b9e]"
                                            style={{ backgroundColor: tag.color ? tag.color + '20' : '#1a1a24' }}
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Deals */}
                        <section>
                            <h2 className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-[#555570]">
                                Deals ({contact.deals.length})
                            </h2>
                            {contact.deals.length === 0 ? (
                                <p className="text-[11px] text-[#555570]">No deals linked</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {contact.deals.map(deal => (
                                        <Link
                                            key={deal.id}
                                            href={`/crm/deals/${deal.id}`}
                                            className="flex items-center justify-between rounded-lg border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-2 transition-colors hover:border-[#2a2a3a]"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Briefcase className="h-3.5 w-3.5 shrink-0 text-[#555570]" />
                                                    <span className="text-xs text-[#e8e8ed]">{deal.title}</span>
                                                </div>
                                                <span className="text-[10px] text-[#555570] capitalize">{deal.stage.replace(/_/g, ' ')}</span>
                                            </div>
                                            <span className="text-xs font-medium text-[#e8e8ed]">{formatCurrency(deal.value)}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Center panel: Contact Card — above-fold first */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Header Row: Name + Influence + Health + Owner */}
                            <div className="mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1a1a24] text-base font-medium text-[#8b8b9e]">
                                        {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-base font-medium text-[#e8e8ed]">{contact.name}</h1>
                                            {contact.influence_type && (
                                                <InfluenceBadge slug={contact.influence_type.slug} name={contact.influence_type.name} size="md" />
                                            )}
                                            {health_score && (
                                                <HealthScoreBadge score={health_score.score} tier={health_score.tier} size="sm" />
                                            )}
                                        </div>
                                        <div className="text-xs text-[#555570]">
                                            {contact.job_title}{contact.job_title && contact.department ? ' · ' : ''}{contact.department}
                                            {contact.owner && <> · Owner: {contact.owner.name}</>}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center gap-3 text-xs text-[#8b8b9e]">
                                    {contact.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</span>}
                                    {contact.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{contact.phone}</span>}
                                </div>
                            </div>

                            {/* NBA Strip — above fold */}
                            {recommendations.length > 0 && (
                                <div className="mb-4">
                                    <div className="space-y-1.5">
                                        {recommendations.slice(0, 2).map(r => (
                                            <RecommendationCard
                                                key={r.rule_key}
                                                ruleKey={r.rule_key}
                                                priority={r.priority}
                                                title={r.title}
                                                context={r.context}
                                                suggestedAction={r.suggested_action}
                                                onDismiss={() => handleDismiss(r.rule_key)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Organization Memberships + Active Deals — above fold */}
                            <div className="mb-4 grid grid-cols-2 gap-3">
                                <section>
                                    <h2 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Organizations</h2>
                                    {contact.organizations.length === 0 ? (
                                        <p className="text-[11px] text-[#555570]">Not linked to any organization</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {contact.organizations.map(org => (
                                                <Link
                                                    key={org.id}
                                                    href={`/crm/organizations/${org.id}`}
                                                    className="flex items-center gap-2 rounded border border-[#1e1e2a] bg-[#0f0f14] px-2 py-1.5 transition-colors hover:border-[#2a2a3a]"
                                                >
                                                    <Building2 className="h-3.5 w-3.5 shrink-0 text-[#555570]" />
                                                    <span className="text-xs text-[#e8e8ed]">{org.name}</span>
                                                    {org.pivot.is_primary && <span className="rounded bg-[#3b6cdb]/10 px-1 py-0.5 text-[8px] text-[#3b6cdb]">PRIMARY</span>}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </section>
                                <section>
                                    <h2 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#555570]">
                                        Active Opportunities ({contact.deals.length})
                                    </h2>
                                    {contact.deals.length === 0 ? (
                                        <p className="text-[11px] text-[#555570]">No deals linked</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {contact.deals.slice(0, 3).map(deal => (
                                                <Link
                                                    key={deal.id}
                                                    href={`/crm/deals/${deal.id}`}
                                                    className="flex items-center justify-between rounded border border-[#1e1e2a] bg-[#0f0f14] px-2 py-1.5 transition-colors hover:border-[#2a2a3a]"
                                                >
                                                    <span className="text-xs text-[#e8e8ed] truncate">{deal.title}</span>
                                                    <span className="text-xs font-medium text-[#e8e8ed]">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(deal.value)}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>

                            {/* Quick Actions */}
                            <section className="mb-4">
                                <div className="flex flex-wrap gap-1.5">
                                    {['call', 'email', 'note'].map(action => (
                                        <button
                                            key={action}
                                            onClick={() => setQuickAction(quickAction === action ? null : action)}
                                            className={`rounded-md border px-2.5 py-1 text-[10px] capitalize transition-colors ${
                                                quickAction === action
                                                    ? 'border-[#2B4C8C] bg-[#2B4C8C] text-white'
                                                    : 'border-[#1e1e2a] bg-[#0f0f14] text-[#8b8b9e] hover:border-[#2a2a3a]'
                                            }`}
                                        >
                                            Log {action}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Scroll content: tags, addresses, more */}
                            {contact.tags.length > 0 && (
                                <section className="mb-4">
                                    <h2 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Tags</h2>
                                    <div className="flex flex-wrap gap-1">
                                        {contact.tags.map(tag => (
                                            <span key={tag.id} className="rounded px-1.5 py-0.5 text-[10px] text-[#8b8b9e]" style={{ backgroundColor: tag.color ? tag.color + '20' : '#1a1a24' }}>
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {contact.addresses.length > 0 && (
                                <section className="mb-4">
                                    <h2 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Addresses</h2>
                                    <div className="space-y-1">
                                        {contact.addresses.map(addr => (
                                            <div key={addr.id} className="rounded border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#8b8b9e]">
                                                <Globe className="mr-1.5 inline h-3 w-3 text-[#555570]" />
                                                {addr.line1}, {addr.city}, {addr.country}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Right panel: Universal Timeline */}
                    <div className="w-80 shrink-0 border-l border-[#1e1e2a] bg-[#0a0a0f]">
                        <ActivityTimeline entityType="contact" entityId={contact.id} />
                    </div>
                </div>
            </div>
        </>
    );
}
