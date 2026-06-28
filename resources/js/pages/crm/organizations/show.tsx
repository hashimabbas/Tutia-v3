import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Globe,
    Phone,
    Mail,
    Users,
    DollarSign,
    Activity,
    Tag,
    Plus,
    UserPlus,
    Briefcase,
    ChevronDown,
    MoreHorizontal,
    Edit,
    Trash2,
    Send,
    Target,
    User,
    StickyNote,
    PhoneCall,
    MapPin,
} from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
    pivot: {
        contact_role_id: number | null;
        is_primary: boolean;
        job_title: string | null;
    };
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
    nodes: {
        id: number;
        name: string;
        influence_type: string | null;
        influence_type_name: string | null;
        avatar_url: string | null;
        is_primary: boolean;
        org_role: number | null;
    }[];
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
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(val);
}

export default function OrganizationShow({
    organization: org,
    health_score,
    recommendations,
    relationship_graph,
}: Props) {
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [quickAction, setQuickAction] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');
    const [savingNote, setSavingNote] = useState(false);

    const activeDeals = org.deals.filter(
        (d) => !['closed_won', 'closed_lost'].includes(d.stage),
    );
    const wonDeals = org.deals.filter((d) => d.stage === 'closed_won');
    const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);

    const stakeholderCoverage = (() => {
        const total = org.contacts.length;
        if (total === 0) return 0;
        const withInfluence = org.contacts.filter(
            (c) => c.influence_type,
        ).length;
        return Math.round((withInfluence / total) * 100);
    })();

    const relationshipStrength = org.contacts.reduce((sum, c) => {
        return (
            sum +
            (relationship_graph.edges.find((e) => e.from === c.id)?.weight ?? 0)
        );
    }, 0);

    const handleDismiss = (ruleKey: string) => {
        router.post(
            '/crm/next-best-action/dismiss',
            {
                rule_key: ruleKey,
                entity_type: 'organization',
                entity_id: org.id,
            },
            { preserveState: true },
        );
    };

    const handleLogQuickNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        setSavingNote(true);
        router.post(
            '/crm/activities',
            {
                activitable_type: 'App\\Models\\CrmOrganization',
                activitable_id: org.id,
                type: 'note',
                subject: noteText,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setNoteText('');
                    setQuickAction(null);
                    setSavingNote(false);
                },
                onError: () => setSavingNote(false),
            },
        );
    };

    return (
        <>
            <Head title={`CRM · ${org.name}`} />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Sticky header */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-white/90 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/crm/organizations"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e6ef] bg-white text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 shadow-sm">
                                    <Building2 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-lg font-semibold tracking-tight text-[#1a1a2e]">
                                            {org.name}
                                        </h1>
                                        {health_score && (
                                            <HealthScoreBadge
                                                score={health_score.score}
                                                tier={health_score.tier}
                                                size="sm"
                                                trend={health_score.trend}
                                                factors={health_score.factors}
                                            />
                                        )}
                                    </div>
                                    <p className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                                        {org.domain && (
                                            <span className="flex items-center gap-1">
                                                <Globe className="h-3 w-3" />
                                                {org.domain}
                                            </span>
                                        )}
                                        {org.industry && (
                                            <>
                                                <span className="text-[#d1d5db]">
                                                    ·
                                                </span>
                                                <span>{org.industry}</span>
                                            </>
                                        )}
                                        {org.size && (
                                            <>
                                                <span className="text-[#d1d5db]">
                                                    ·
                                                </span>
                                                <span>{org.size}</span>
                                            </>
                                        )}
                                        {org.owner && (
                                            <>
                                                <span className="text-[#d1d5db]">
                                                    ·
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {org.owner.name}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                    {org.classifications.length > 0 && (
                                        <div className="mt-1 flex gap-1">
                                            {org.classifications.map((c) => (
                                                <span
                                                    key={c.id}
                                                    className="rounded-md bg-[#eef1f8] px-1.5 py-0.5 text-[9px] font-medium text-[#6b7280]"
                                                >
                                                    {c.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-2 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e] shadow-sm"
                                    >
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                        Actions
                                        <ChevronDown className="h-3 w-3 text-[#6b7280]" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-40 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e] shadow-lg"
                                >
                                    <DropdownMenuLabel className="text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                                        Manage
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-[#e2e6ef]" />
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.visit(
                                                `/crm/organizations/${org.id}/edit`,
                                            )
                                        }
                                        className="cursor-pointer focus:bg-[#eef1f8]"
                                    >
                                        <Edit className="mr-2 h-3.5 w-3.5" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[#e2e6ef]" />
                                    <DropdownMenuItem className="cursor-pointer text-rose-600 focus:bg-[#fef2f2]">
                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Quick stats row */}
                    <div className="grid grid-cols-4 gap-px border-t border-[#e2e6ef] bg-[#e2e6ef]">
                        {[
                            {
                                label: 'Active Deals',
                                value: activeDeals.length,
                                icon: Briefcase,
                                gradient: 'from-amber-500 to-amber-600',
                            },
                            {
                                label: 'Pipeline Value',
                                value: formatCurrency(pipelineValue),
                                icon: DollarSign,
                                gradient: 'from-emerald-500 to-emerald-600',
                            },
                            {
                                label: 'Stakeholder Coverage',
                                value: `${stakeholderCoverage}%`,
                                icon: Users,
                                gradient: 'from-violet-500 to-violet-600',
                            },
                            {
                                label: 'Relationship Strength',
                                value: relationshipStrength,
                                icon: Target,
                                gradient: 'from-blue-500 to-blue-600',
                            },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-white px-4 py-3 transition-colors hover:bg-[#f8f9fc]"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            'flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm',
                                            stat.gradient,
                                        )}
                                    >
                                        <stat.icon className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[18px] font-semibold tracking-tight text-[#1a1a2e]">
                                            {stat.value}
                                        </p>
                                        <p className="text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2-panel layout: Left = Relationship Graph, Right = Content + Timeline */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left panel: Relationship Intelligence */}
                    {leftPanelOpen && (
                        <div className="w-80 shrink-0 border-r border-[#e2e6ef] bg-white">
                            <RelationshipGraph
                                nodes={relationship_graph.nodes}
                                edges={relationship_graph.edges}
                                influenceSummary={
                                    relationship_graph.influence_summary
                                }
                                orgRelationships={
                                    relationship_graph.organization_relationships
                                }
                            />
                        </div>
                    )}

                    {/* Collapse toggle */}
                    <button
                        onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                        className="flex w-5 shrink-0 items-center justify-center border-r border-[#e2e6ef] bg-white text-[#9ca3af] transition-colors hover:bg-[#f8f9fc] hover:text-[#6b7280]"
                    >
                        <div
                            className={cn(
                                'h-8 w-0.5 rounded-full bg-[#e2e6ef] transition-all',
                                leftPanelOpen && 'rotate-0',
                            )}
                        />
                    </button>

                    {/* Center panel: Main content */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto">
                            {/* NBA Recommendations */}
                            {recommendations.length > 0 && (
                                <div className="border-b border-[#e2e6ef] bg-white px-6 py-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h2 className="text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                            Recommendations
                                        </h2>
                                    </div>
                                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                                        {recommendations.map((r) => (
                                            <div
                                                key={r.rule_key}
                                                className="w-64 shrink-0"
                                            >
                                                <RecommendationCard
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
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="border-b border-[#e2e6ef] bg-white px-6 py-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                        Quick Actions
                                    </h2>
                                    {quickAction && (
                                        <button
                                            onClick={() => setQuickAction(null)}
                                            className="text-[10px] text-[#9ca3af] hover:text-[#6b7280]"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                                {!quickAction ? (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        <button
                                            onClick={() =>
                                                setQuickAction('note')
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e6ef] bg-white px-3 py-1.5 text-[11px] text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#374151] hover:shadow-md"
                                        >
                                            <StickyNote className="h-3 w-3" />
                                            Quick Note
                                        </button>
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={handleLogQuickNote}
                                        className="mt-2"
                                    >
                                        <input
                                            type="text"
                                            value={noteText}
                                            onChange={(e) =>
                                                setNoteText(e.target.value)
                                            }
                                            placeholder="Write a quick note..."
                                            className="mb-2 w-full rounded-lg border border-[#e2e6ef] bg-white px-3 py-2 text-xs text-[#1a1a2e] placeholder-[#9ca3af] transition-all outline-none focus:border-[#2B4C8C] focus:ring-[3px] focus:ring-[#2B4C8C]/10"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setQuickAction(null)
                                                }
                                                className="rounded-lg border border-[#e2e6ef] bg-white px-3 py-1.5 text-[11px] text-[#6b7280] hover:bg-[#f8f9fc]"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={
                                                    savingNote ||
                                                    !noteText.trim()
                                                }
                                                className="rounded-lg bg-[#2B4C8C] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition-all hover:bg-[#2B4C8C]/90 hover:shadow-md disabled:opacity-50"
                                            >
                                                {savingNote
                                                    ? 'Saving...'
                                                    : 'Save Note'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Contacts section */}
                            <div className="border-b border-[#e2e6ef] bg-white px-6 py-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                        Contacts ({org.contacts.length})
                                    </h2>
                                </div>
                                {org.contacts.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-[#e2e6ef] p-6 text-center">
                                        <UserPlus className="mx-auto mb-2 h-5 w-5 text-[#9ca3af]" />
                                        <p className="text-xs text-[#6b7280]">
                                            No contacts linked yet
                                        </p>
                                        <p className="mt-1 text-[10px] text-[#9ca3af]">
                                            Add contacts to this organization to
                                            track relationships
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {org.contacts.map((contact) => (
                                            <Link
                                                key={contact.id}
                                                href={`/crm/contacts/${contact.id}`}
                                                className="flex items-center gap-3 rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] px-4 py-3 shadow-sm transition-all hover:border-[#c8cce0] hover:bg-white hover:shadow-md"
                                            >
                                                <Avatar className="h-8 w-8 rounded-lg">
                                                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 text-xs font-medium text-[#1a1a2e]">
                                                        {contact.first_name.charAt(
                                                            0,
                                                        )}
                                                        {contact.last_name.charAt(
                                                            0,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-medium text-[#1a1a2e]">
                                                            {contact.name}
                                                        </span>
                                                        {contact.pivot
                                                            .is_primary && (
                                                            <span className="rounded-md bg-[#2b4c8c]/10 px-1.5 py-0.5 text-[8px] font-semibold tracking-wider text-[#2b4c8c] uppercase">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-[#6b7280]">
                                                        {contact.job_title ??
                                                            contact.pivot
                                                                .job_title ??
                                                            ''}
                                                        {contact.email && (
                                                            <>
                                                                {' '}
                                                                ·{' '}
                                                                {contact.email}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef1f8]">
                                                    <Mail className="h-3.5 w-3.5 text-[#6b7280]" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Deals Pipeline */}
                            <div className="border-b border-[#e2e6ef] bg-white px-6 py-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                        Deals ({org.deals.length})
                                    </h2>
                                </div>
                                {org.deals.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-[#e2e6ef] p-6 text-center">
                                        <Briefcase className="mx-auto mb-2 h-5 w-5 text-[#9ca3af]" />
                                        <p className="text-xs text-[#6b7280]">
                                            No deals yet
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {org.deals.map((deal) => (
                                            <Link
                                                key={deal.id}
                                                href={`/crm/deals/${deal.id}`}
                                                className="group flex items-center justify-between rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] px-4 py-3 shadow-sm transition-all hover:border-[#c8cce0] hover:bg-white hover:shadow-md"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
                                                        <Briefcase className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[13px] font-medium text-[#1a1a2e]">
                                                            {deal.title}
                                                        </span>
                                                        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#6b7280] capitalize">
                                                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                            {deal.stage.replace(
                                                                /_/g,
                                                                ' ',
                                                            )}
                                                            {deal.owner && (
                                                                <>
                                                                    <span>
                                                                        ·
                                                                    </span>
                                                                    {
                                                                        deal
                                                                            .owner
                                                                            .name
                                                                    }
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold text-[#1a1a2e]">
                                                        {formatCurrency(
                                                            deal.value,
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {org.notes && (
                                <div className="border-b border-[#e2e6ef] bg-white px-6 py-4">
                                    <h2 className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                        Notes
                                    </h2>
                                    <div className="rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] p-4 shadow-sm">
                                        <p className="text-xs leading-relaxed text-[#6b7280]">
                                            {org.notes}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {org.tags.length > 0 && (
                                <div className="border-b border-[#e2e6ef] bg-white px-6 py-4">
                                    <h2 className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                        Tags
                                    </h2>
                                    <div className="flex flex-wrap gap-1.5">
                                        {org.tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-medium text-[#6b7280] shadow-sm ring-1 ring-[#e2e6ef]"
                                                style={{
                                                    backgroundColor: tag.color
                                                        ? tag.color + '12'
                                                        : '#f8f9fc',
                                                }}
                                            >
                                                <Tag
                                                    className="h-2.5 w-2.5"
                                                    style={{
                                                        color:
                                                            tag.color ??
                                                            '#9ca3af',
                                                    }}
                                                />
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Addresses */}
                            {org.addresses.length > 0 && (
                                <div className="border-b border-[#e2e6ef] bg-white px-6 py-4">
                                    <h2 className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                        Addresses
                                    </h2>
                                    <div className="space-y-1.5">
                                        {org.addresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-[#6b7280] hover:bg-[#f8f9fc]"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 shadow-sm ring-1 ring-gray-100">
                                                    <MapPin className="h-4 w-4 text-[#6b7280]" />
                                                </div>
                                                <span className="text-[13px]">
                                                    {addr.line1}, {addr.city},{' '}
                                                    {addr.country}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Activity Timeline */}
                            <div className="flex flex-1 flex-col overflow-hidden bg-white">
                                <ActivityTimeline
                                    entityType="organization"
                                    entityId={org.id}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
