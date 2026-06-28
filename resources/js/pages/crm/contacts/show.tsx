import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Mail,
    Phone,
    Globe,
    Linkedin,
    Building2,
    Briefcase,
    MessageSquare,
    Activity,
    UserPlus,
    MapPin,
    Tag,
    Sparkles,
    ChevronDown,
    MoreHorizontal,
    Edit,
    Trash2,
    Send,
    Clock,
    Target,
    Zap,
    User,
    Plus,
    CheckCircle2,
    FileText,
    PhoneCall,
    StickyNote,
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
import InfluenceBadge from '@/components/crm/influence-badge';
import ActivityTimeline from '@/components/crm/activity-timeline';

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
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(val);
}

export default function ContactShow({
    contact,
    health_score,
    recommendations,
}: Props) {
    const [quickAction, setQuickAction] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [callOutcome, setCallOutcome] = useState('');
    const [emailSubject, setEmailSubject] = useState('');

    const handleDismiss = (ruleKey: string) => {
        router.post(
            '/crm/next-best-action/dismiss',
            {
                rule_key: ruleKey,
                entity_type: 'contact',
                entity_id: contact.id,
            },
            { preserveState: true },
        );
    };

    const handleLogNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        setSavingNote(true);
        router.post(
            '/crm/activities',
            {
                activitable_type: 'App\\Models\\CrmContact',
                activitable_id: contact.id,
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

    const handleLogCall = (e: React.FormEvent) => {
        e.preventDefault();
        if (!callOutcome.trim()) return;
        setSavingNote(true);
        router.post(
            '/crm/activities',
            {
                activitable_type: 'App\\Models\\CrmContact',
                activitable_id: contact.id,
                type: 'call',
                subject: `Call: ${callOutcome}`,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setCallOutcome('');
                    setQuickAction(null);
                    setSavingNote(false);
                },
                onError: () => setSavingNote(false),
            },
        );
    };

    const handleLogEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailSubject.trim()) return;
        setSavingNote(true);
        router.post(
            '/crm/activities',
            {
                activitable_type: 'App\\Models\\CrmContact',
                activitable_id: contact.id,
                type: 'email',
                subject: `Email: ${emailSubject}`,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setEmailSubject('');
                    setQuickAction(null);
                    setSavingNote(false);
                },
                onError: () => setSavingNote(false),
            },
        );
    };

    return (
        <>
            <Head title={`CRM · ${contact.name}`} />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Sticky header */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-white/90 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/crm/contacts"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e6ef] bg-white text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-xl shadow-sm">
                                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-[#eef1f8] to-[#e2e6ef] text-sm font-semibold text-[#1a1a2e]">
                                        {contact.first_name.charAt(0)}
                                        {contact.last_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-lg font-semibold tracking-tight text-[#1a1a2e]">
                                            {contact.name}
                                        </h1>
                                        {contact.influence_type && (
                                            <InfluenceBadge
                                                slug={
                                                    contact.influence_type.slug
                                                }
                                                name={
                                                    contact.influence_type.name
                                                }
                                                size="md"
                                            />
                                        )}
                                        {health_score && (
                                            <HealthScoreBadge
                                                score={health_score.score}
                                                tier={health_score.tier}
                                                size="sm"
                                            />
                                        )}
                                    </div>
                                    <p className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                                        {contact.job_title}
                                        {contact.job_title && contact.department
                                            ? ' · '
                                            : ''}
                                        {contact.department}
                                        {contact.owner && (
                                            <>
                                                <span className="text-[#d1d5db]">
                                                    ·
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {contact.owner.name}
                                                </span>
                                            </>
                                        )}
                                    </p>
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
                                                `/crm/contacts/${contact.id}/edit`,
                                            )
                                        }
                                        className="cursor-pointer focus:bg-[#eef1f8]"
                                    >
                                        <Edit className="mr-2 h-3.5 w-3.5" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            (window.location.href = `mailto:${contact.email}`)
                                        }
                                        className="cursor-pointer focus:bg-[#eef1f8]"
                                        disabled={!contact.email}
                                    >
                                        <Send className="mr-2 h-3.5 w-3.5" />
                                        Send email
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
                    <div className="grid grid-cols-5 gap-px border-t border-[#e2e6ef] bg-[#e2e6ef]">
                        {[
                            {
                                label: 'Influence',
                                value: contact.influence_type?.name ?? '—',
                                icon: Target,
                                gradient: 'from-violet-500 to-violet-600',
                            },
                            {
                                label: 'Organizations',
                                value: `${contact.organizations.length} linked`,
                                icon: Building2,
                                gradient: 'from-blue-500 to-blue-600',
                            },
                            {
                                label: 'Active Deals',
                                value: `${contact.deals.length} open`,
                                icon: Briefcase,
                                gradient: 'from-amber-500 to-amber-600',
                            },
                            {
                                label: 'Tags',
                                value: `${contact.tags.length} tags`,
                                icon: Tag,
                                gradient: 'from-emerald-500 to-emerald-600',
                            },
                            {
                                label: 'Health',
                                value: health_score
                                    ? `${health_score.score}/100`
                                    : '—',
                                icon: Activity,
                                gradient:
                                    health_score?.tier === 'healthy'
                                        ? 'from-emerald-500 to-emerald-600'
                                        : health_score?.tier === 'at_risk'
                                          ? 'from-amber-500 to-amber-600'
                                          : 'from-rose-500 to-rose-600',
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

                {/* Content: 2-panel layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left panel — Contact info sidebar */}
                    <div className="w-[340px] shrink-0 overflow-y-auto border-r border-[#e2e6ef] bg-white p-5">
                        {/* Contact Details */}
                        <section className="mb-6">
                            <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                <span className="h-px flex-1 bg-[#e2e6ef]" />
                                Contact
                                <span className="h-px flex-1 bg-[#e2e6ef]" />
                            </h2>
                            <div className="space-y-1">
                                {contact.email && (
                                    <a
                                        href={`mailto:${contact.email}`}
                                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-[#1a1a2e] transition-all hover:bg-[#f8f9fc] hover:shadow-sm"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 shadow-sm ring-1 ring-blue-100">
                                            <Mail className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-medium text-[#6b7280]">
                                                Email
                                            </span>
                                            <p className="truncate text-[13px] group-hover:text-[#2b4c8c]">
                                                {contact.email}
                                            </p>
                                        </div>
                                    </a>
                                )}
                                {contact.phone && (
                                    <a
                                        href={`tel:${contact.phone}`}
                                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-[#1a1a2e] transition-all hover:bg-[#f8f9fc] hover:shadow-sm"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 shadow-sm ring-1 ring-emerald-100">
                                            <Phone className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-medium text-[#6b7280]">
                                                Phone
                                            </span>
                                            <p className="text-[13px]">
                                                {contact.phone}
                                            </p>
                                        </div>
                                    </a>
                                )}
                                {contact.mobile && (
                                    <a
                                        href={`tel:${contact.mobile}`}
                                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-[#1a1a2e] transition-all hover:bg-[#f8f9fc] hover:shadow-sm"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 shadow-sm ring-1 ring-amber-100">
                                            <Phone className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-medium text-[#6b7280]">
                                                Mobile
                                            </span>
                                            <p className="text-[13px]">
                                                {contact.mobile}
                                            </p>
                                        </div>
                                    </a>
                                )}
                                {contact.linkedin_url && (
                                    <a
                                        href={contact.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-[#1a1a2e] transition-all hover:bg-[#f8f9fc] hover:shadow-sm"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 shadow-sm ring-1 ring-sky-100">
                                            <Linkedin className="h-4 w-4 text-sky-600" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-medium text-[#6b7280]">
                                                LinkedIn
                                            </span>
                                            <p className="text-[13px] font-medium text-sky-600 group-hover:text-sky-700">
                                                View profile →
                                            </p>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </section>

                        {contact.job_title && (
                            <section className="mb-6">
                                <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                    Role
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                </h2>
                                <div className="rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] px-4 py-3">
                                    <div className="flex items-center gap-2 text-xs text-[#1a1a2e]">
                                        <Briefcase className="h-3.5 w-3.5 text-[#6b7280]" />
                                        {contact.job_title}
                                    </div>
                                    {contact.department && (
                                        <p className="mt-1 ml-5.5 text-[11px] text-[#6b7280]">
                                            {contact.department} department
                                        </p>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Organizations */}
                        <section className="mb-6">
                            <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                <span className="h-px flex-1 bg-[#e2e6ef]" />
                                Organizations
                                <span className="h-px flex-1 bg-[#e2e6ef]" />
                            </h2>
                            {contact.organizations.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-[#e2e6ef] p-4 text-center">
                                    <Building2 className="mx-auto mb-1.5 h-4 w-4 text-[#9ca3af]" />
                                    <p className="text-[11px] text-[#6b7280]">
                                        Not linked to any organization
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {contact.organizations.map((org) => (
                                        <Link
                                            key={org.id}
                                            href={`/crm/organizations/${org.id}`}
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-[#f8f9fc] hover:shadow-sm"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 shadow-sm ring-1 ring-violet-100">
                                                <Building2 className="h-4 w-4 text-violet-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-medium text-[#1a1a2e]">
                                                        {org.name}
                                                    </span>
                                                    {org.pivot.is_primary && (
                                                        <span className="rounded-md bg-[#2b4c8c]/10 px-1.5 py-0.5 text-[8px] font-semibold tracking-wider text-[#2b4c8c] uppercase">
                                                            Primary
                                                        </span>
                                                    )}
                                                </div>
                                                {org.pivot.job_title && (
                                                    <div className="text-[10px] text-[#6b7280]">
                                                        {org.pivot.job_title}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Tags */}
                        {contact.tags.length > 0 && (
                            <section className="mb-6">
                                <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                    Tags
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                </h2>
                                <div className="flex flex-wrap gap-1.5">
                                    {contact.tags.map((tag) => (
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
                                                        tag.color ?? '#9ca3af',
                                                }}
                                            />
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Addresses */}
                        {contact.addresses.length > 0 && (
                            <section className="mb-6">
                                <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                    Addresses
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                </h2>
                                <div className="space-y-1">
                                    {contact.addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-[#6b7280] transition-all hover:bg-[#f8f9fc]"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 shadow-sm ring-1 ring-gray-100">
                                                <MapPin className="h-4 w-4 text-[#6b7280]" />
                                            </div>
                                            <span className="text-[13px]">
                                                {addr.line1}, {addr.city},{' '}
                                                {addr.country}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right panel — Main content */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                        {/* NBA Recommendations */}
                        {recommendations.length > 0 && (
                            <div className="border-b border-[#e2e6ef] bg-white px-6 py-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                        Recommended Actions
                                    </h2>
                                    {recommendations.length > 2 && (
                                        <span className="text-[10px] text-[#9ca3af]">
                                            {recommendations.length}{' '}
                                            recommendations
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {recommendations.slice(0, 3).map((r) => (
                                        <RecommendationCard
                                            key={r.rule_key}
                                            ruleKey={r.rule_key}
                                            priority={r.priority}
                                            title={r.title}
                                            context={r.context}
                                            suggestedAction={r.suggested_action}
                                            onDismiss={() =>
                                                handleDismiss(r.rule_key)
                                            }
                                        />
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
                                    {[
                                        {
                                            key: 'call',
                                            label: 'Log Call',
                                            icon: PhoneCall,
                                        },
                                        {
                                            key: 'email',
                                            label: 'Log Email',
                                            icon: Send,
                                        },
                                        {
                                            key: 'note',
                                            label: 'Quick Note',
                                            icon: StickyNote,
                                        },
                                    ].map((action) => (
                                        <button
                                            key={action.key}
                                            onClick={() =>
                                                setQuickAction(action.key)
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e6ef] bg-white px-3 py-1.5 text-[11px] text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#374151] hover:shadow-md"
                                        >
                                            <action.icon className="h-3 w-3" />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            ) : quickAction === 'note' ? (
                                <form onSubmit={handleLogNote} className="mt-2">
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
                                            onClick={() => setQuickAction(null)}
                                            className="rounded-lg border border-[#e2e6ef] bg-white px-3 py-1.5 text-[11px] text-[#6b7280] hover:bg-[#f8f9fc]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={
                                                savingNote || !noteText.trim()
                                            }
                                            className="rounded-lg bg-[#2B4C8C] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition-all hover:bg-[#2B4C8C]/90 hover:shadow-md disabled:opacity-50"
                                        >
                                            {savingNote
                                                ? 'Saving...'
                                                : 'Save Note'}
                                        </button>
                                    </div>
                                </form>
                            ) : quickAction === 'call' ? (
                                <form onSubmit={handleLogCall} className="mt-2">
                                    <input
                                        type="text"
                                        value={callOutcome}
                                        onChange={(e) =>
                                            setCallOutcome(e.target.value)
                                        }
                                        placeholder="Call outcome or notes..."
                                        className="mb-2 w-full rounded-lg border border-[#e2e6ef] bg-white px-3 py-2 text-xs text-[#1a1a2e] placeholder-[#9ca3af] transition-all outline-none focus:border-[#2B4C8C] focus:ring-[3px] focus:ring-[#2B4C8C]/10"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setQuickAction(null)}
                                            className="rounded-lg border border-[#e2e6ef] bg-white px-3 py-1.5 text-[11px] text-[#6b7280] hover:bg-[#f8f9fc]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={
                                                savingNote ||
                                                !callOutcome.trim()
                                            }
                                            className="rounded-lg bg-[#2B4C8C] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition-all hover:bg-[#2B4C8C]/90 hover:shadow-md disabled:opacity-50"
                                        >
                                            {savingNote
                                                ? 'Saving...'
                                                : 'Log Call'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form
                                    onSubmit={handleLogEmail}
                                    className="mt-2"
                                >
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) =>
                                            setEmailSubject(e.target.value)
                                        }
                                        placeholder="Email subject..."
                                        className="mb-2 w-full rounded-lg border border-[#e2e6ef] bg-white px-3 py-2 text-xs text-[#1a1a2e] placeholder-[#9ca3af] transition-all outline-none focus:border-[#2B4C8C] focus:ring-[3px] focus:ring-[#2B4C8C]/10"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setQuickAction(null)}
                                            className="rounded-lg border border-[#e2e6ef] bg-white px-3 py-1.5 text-[11px] text-[#6b7280] hover:bg-[#f8f9fc]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={
                                                savingNote ||
                                                !emailSubject.trim()
                                            }
                                            className="rounded-lg bg-[#2B4C8C] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition-all hover:bg-[#2B4C8C]/90 hover:shadow-md disabled:opacity-50"
                                        >
                                            {savingNote
                                                ? 'Saving...'
                                                : 'Log Email'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            <div className="flex flex-1 flex-col overflow-hidden">
                                {/* Deals section */}
                                {contact.deals.length > 0 && (
                                    <div className="border-b border-[#e2e6ef] bg-white px-6 py-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h2 className="text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                                Active Opportunities (
                                                {contact.deals.length})
                                            </h2>
                                        </div>
                                        <div className="space-y-2">
                                            {contact.deals
                                                .slice(0, 5)
                                                .map((deal) => (
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
                                                        <span className="text-sm font-semibold text-[#1a1a2e]">
                                                            {formatCurrency(
                                                                deal.value,
                                                            )}
                                                        </span>
                                                    </Link>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {contact.notes && (
                                    <div className="border-b border-[#e2e6ef] bg-white px-6 py-4">
                                        <h2 className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-[#6b7280] uppercase">
                                            Notes
                                        </h2>
                                        <div className="rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] p-4 shadow-sm">
                                            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium text-[#6b7280]">
                                                <FileText className="h-3 w-3" />
                                                Internal Note
                                            </div>
                                            <p className="text-xs leading-relaxed text-[#6b7280]">
                                                {contact.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Activity Timeline */}
                                <div className="flex flex-1 flex-col overflow-hidden bg-white">
                                    <ActivityTimeline
                                        entityType="contact"
                                        entityId={contact.id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
