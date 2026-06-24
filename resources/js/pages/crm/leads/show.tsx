import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Phone,
    Mail,
    Globe,
    Calendar,
    Building2,
    MessageSquare,
    Plus,
    CheckCircle2,
    ChevronDown,
    Clock,
    User,
    Target,
    Zap,
    Edit,
    Trash2,
    MoreHorizontal,
    Send,
    FileText,
    Sparkles,
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

interface Activity {
    id: number;
    type: string;
    subject?: string;
    description?: string;
    due_at?: string;
    completed_at?: string;
    created_at: string;
    created_by?: { id: number; name: string } | null;
}

interface Deal {
    id: number;
    title: string;
    value: number;
    stage: string;
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
    service?: string;
    project_type?: string;
    budget?: string;
    timeline?: string;
    message?: string;
    brief?: string;
    requirements?: string;
    assigned_to?: number | null;
    last_contacted_at?: string | null;
    converted_at?: string | null;
    created_at: string;
    assignedTo?: { id: number; name: string } | null;
    deals: Deal[];
    activities: Activity[];
}

interface Props {
    lead: Lead;
}

const STAGE_CONFIG: Record<string, { label: string; color: string; dot: string; bar: string }> = {
    new:          { label: 'New',          color: 'text-blue-700 bg-blue-50 border-blue-200',         dot: 'bg-blue-600',   bar: 'bg-blue-600' },
    contacted:    { label: 'Contacted',     color: 'text-amber-700 bg-amber-50 border-amber-200',       dot: 'bg-amber-600', bar: 'bg-amber-600' },
    qualified:    { label: 'Qualified',     color: 'text-violet-700 bg-violet-50 border-violet-200',     dot: 'bg-violet-600', bar: 'bg-violet-600' },
    proposal:     { label: 'Proposal',      color: 'text-orange-700 bg-orange-50 border-orange-200',    dot: 'bg-orange-600', bar: 'bg-orange-600' },
    negotiation:  { label: 'Negotiation',   color: 'text-rose-700 bg-rose-50 border-rose-200',         dot: 'bg-rose-600',  bar: 'bg-rose-600' },
    converted:    { label: 'Converted',     color: 'text-emerald-700 bg-emerald-50 border-emerald-200',   dot: 'bg-emerald-600', bar: 'bg-emerald-600' },
    lost:         { label: 'Lost',          color: 'text-red-700 bg-red-50 border-red-200',            dot: 'bg-red-600',   bar: 'bg-red-600' },
};

const PRIORITY_CONFIG: Record<string, { label: string; dot: string }> = {
    high:   { label: 'High',   dot: 'bg-rose-600' },
    medium: { label: 'Medium', dot: 'bg-amber-600' },
    low:    { label: 'Low',    dot: 'bg-slate-500' },
};

function StageBadge({ stage, size = 'sm' }: { stage: string; size?: 'sm' | 'md' | 'lg' }) {
    const cfg = STAGE_CONFIG[stage];
    if (!cfg) return null;
    const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm' : size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border font-medium capitalize', sizeClasses, cfg.color)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
        </span>
    );
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function timeAgo(date: string): string {
    const now = new Date();
    const d = new Date(date);
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ACTIVITY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    call:    { icon: Phone,         color: 'text-emerald-700', bg: 'bg-emerald-50' },
    email:   { icon: Mail,          color: 'text-blue-700',    bg: 'bg-blue-50' },
    meeting: { icon: Calendar,      color: 'text-violet-700',  bg: 'bg-violet-50' },
    note:    { icon: MessageSquare, color: 'text-amber-700',   bg: 'bg-amber-50' },
    task:    { icon: CheckCircle2,  color: 'text-cyan-700',    bg: 'bg-cyan-50' },
};

function ActivityIcon({ type }: { type: string }) {
    const cfg = ACTIVITY_CONFIG[type] ?? ACTIVITY_CONFIG.note;
    const Icon = cfg.icon;
    return (
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl border border-[#e2e6ef]', cfg.bg)}>
            <Icon className={cn('h-4 w-4', cfg.color)} />
        </div>
    );
}

export default function LeadShow({ lead }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [activityType, setActivityType] = useState('note');
    const [activitySubject, setActivitySubject] = useState('');

    const handleStageChange = (stage: string) => {
        router.patch(`/crm/leads/${lead.id}`, { stage }, { preserveScroll: true, preserveState: true });
    };

    const handleAddActivity = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activitySubject.trim()) return;
        router.post(
            '/crm/activities',
            {
                activitable_type: 'App\\Models\\CrmLead',
                activitable_id: lead.id,
                type: activityType,
                subject: activitySubject,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setActivitySubject('');
                    setShowForm(false);
                },
            },
        );
    };

    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted', 'lost'];

    return (
        <>
            <Head title={`CRM · ${lead.name}`} />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Sticky header */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-[#f8f9fc]/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/crm/leads"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e6ef] bg-white text-[#6b7280] transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-xl">
                                    <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-50 text-sm font-semibold text-[#1a1a2e] rounded-xl">
                                        {lead.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-lg font-semibold text-[#1a1a2e] tracking-tight">{lead.name}</h1>
                                    <p className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                                        <Building2 className="h-3 w-3" />
                                        {lead.company ?? lead.email}
                                        <span className="text-[#e2e6ef]">·</span>
                                        <span>Created {formatDate(lead.created_at)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 gap-2 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]">
                                        <StageBadge stage={lead.stage} />
                                        <ChevronDown className="h-3 w-3 text-[#6b7280]" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-44 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]">
                                    <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                                        Change stage
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-[#e2e6ef]" />
                                    {stages.map((s) => {
                                        const cfg = STAGE_CONFIG[s];
                                        const active = lead.stage === s;
                                        return (
                                            <DropdownMenuItem
                                                key={s}
                                                onClick={() => handleStageChange(s)}
                                                className={cn(
                                                    'flex cursor-pointer items-center gap-2 capitalize focus:bg-[#eef1f8]',
                                                    active && 'bg-[#e2e6ef]',
                                                )}
                                            >
                                                <span className={cn('h-1.5 w-1.5 rounded-full', cfg?.dot)} />
                                                <span className="flex-1">{cfg?.label ?? s}</span>
                                                {active && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-8 w-8 border-[#e2e6ef] bg-white">
                                        <MoreHorizontal className="h-4 w-4 text-[#6b7280]" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-36 border-[#e2e6ef] bg-white text-xs text-[#1a1a2e]">
                                    <DropdownMenuItem className="cursor-pointer focus:bg-[#eef1f8]">
                                        <Edit className="mr-2 h-3 w-3" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer focus:bg-[#eef1f8]">
                                        <Send className="mr-2 h-3 w-3" />
                                        Send email
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[#e2e6ef]" />
                                    <DropdownMenuItem className="cursor-pointer text-rose-600 focus:bg-[#eef1f8]">
                                        <Trash2 className="mr-2 h-3 w-3" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Quick stats row under header */}
                    <div className="grid grid-cols-5 gap-px border-t border-[#e2e6ef] bg-[#e2e6ef]">
                        {[
                            { label: 'Priority', value: lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1), icon: Zap, color: PRIORITY_CONFIG[lead.priority]?.dot ?? 'bg-slate-500' },
                            { label: 'Source', value: lead.source.replace(/_/g, ' '), icon: Globe, color: 'bg-[#2b4c8c]' },
                            { label: 'Owner', value: lead.assignedTo?.name ?? 'Unassigned', icon: User, color: 'bg-violet-600' },
                            { label: 'Last Contact', value: lead.last_contacted_at ? timeAgo(lead.last_contacted_at) : '—', icon: Clock, color: 'bg-amber-500' },
                            { label: 'Budget', value: lead.budget ?? '—', icon: Target, color: 'bg-emerald-600' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-[#f8f9fc] px-4 py-2.5">
                                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                                    <span className={cn('h-1.5 w-1.5 rounded-full', stat.color)} />
                                    {stat.label}
                                </div>
                                <p className="mt-0.5 text-xs font-medium text-[#1a1a2e]">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content: 2-panel layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left panel — Lead info */}
                    <div className="w-[380px] shrink-0 overflow-y-auto border-r border-[#e2e6ef] bg-[#f8f9fc] p-6">
                        {/* Contact Details */}
                        <section className="mb-8">
                            <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                                <span className="h-px flex-1 bg-[#e2e6ef]" />
                                Contact
                                <span className="h-px flex-1 bg-[#e2e6ef]" />
                            </h2>
                            <div className="space-y-3">
                                {lead.email && (
                                    <a
                                        href={`mailto:${lead.email}`}
                                        className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-xs text-[#1a1a2e] transition-all hover:border-[#e2e6ef] hover:bg-white"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                                            <Mail className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-medium text-[#6b7280]">Email</span>
                                            <p className="text-[13px] group-hover:text-[#2b4c8c]">{lead.email}</p>
                                        </div>
                                    </a>
                                )}
                                {lead.phone && (
                                    <a
                                        href={`tel:${lead.phone}`}
                                        className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-xs text-[#1a1a2e] transition-all hover:border-[#e2e6ef] hover:bg-white"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                                            <Phone className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-medium text-[#6b7280]">Phone</span>
                                            <p className="text-[13px]">{lead.phone}</p>
                                        </div>
                                    </a>
                                )}
                                {lead.company && (
                                    <div className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-xs text-[#1a1a2e]">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                                            <Building2 className="h-4 w-4 text-violet-600" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-medium text-[#6b7280]">Company</span>
                                            <p className="text-[13px]">{lead.company}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Interest / Service Info */}
                        {(lead.service || lead.project_type || lead.budget || lead.timeline) && (
                            <section className="mb-8">
                                <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                    Interest
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                </h2>
                                <div className="space-y-2">
                                    {lead.service && (
                                        <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                                            <span className="text-[11px] text-[#6b7280]">Service</span>
                                            <span className="text-xs font-medium text-[#1a1a2e]">{lead.service}</span>
                                        </div>
                                    )}
                                    {lead.project_type && (
                                        <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                                            <span className="text-[11px] text-[#6b7280]">Project Type</span>
                                            <span className="text-xs font-medium capitalize text-[#1a1a2e]">{lead.project_type}</span>
                                        </div>
                                    )}
                                    {lead.budget && (
                                        <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                                            <span className="text-[11px] text-[#6b7280]">Budget</span>
                                            <span className="text-xs font-medium text-emerald-600">{lead.budget}</span>
                                        </div>
                                    )}
                                    {lead.timeline && (
                                        <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                                            <span className="text-[11px] text-[#6b7280]">Timeline</span>
                                            <span className="text-xs font-medium text-[#1a1a2e]">{lead.timeline}</span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Notes */}
                        {(lead.message || lead.brief || lead.requirements) && (
                            <section className="mb-8">
                                <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                    Notes
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                </h2>
                                <div className="space-y-3">
                                    {lead.message && (
                                        <div className="rounded-xl border border-[#e2e6ef] bg-white p-4">
                                            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium text-[#6b7280]">
                                                <FileText className="h-3 w-3" />
                                                Message
                                            </div>
                                            <p className="text-xs leading-relaxed text-[#6b7280]">{lead.message}</p>
                                        </div>
                                    )}
                                    {lead.brief && (
                                        <div className="rounded-xl border border-[#e2e6ef] bg-white p-4">
                                            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium text-[#6b7280]">
                                                <FileText className="h-3 w-3" />
                                                Brief
                                            </div>
                                            <p className="text-xs leading-relaxed text-[#6b7280]">{lead.brief}</p>
                                        </div>
                                    )}
                                    {lead.requirements && (
                                        <div className="rounded-xl border border-[#e2e6ef] bg-white p-4">
                                            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium text-[#6b7280]">
                                                <FileText className="h-3 w-3" />
                                                Requirements
                                            </div>
                                            <p className="text-xs leading-relaxed text-[#6b7280]">{lead.requirements}</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Linked Deals */}
                        {lead.deals.length > 0 && (
                            <section>
                                <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                    Deals
                                    <span className="h-px flex-1 bg-[#e2e6ef]" />
                                </h2>
                                <div className="space-y-2">
                                    {lead.deals.map((deal) => (
                                        <Link
                                            key={deal.id}
                                            href={`/crm/deals/${deal.id}`}
                                            className="group flex items-center justify-between rounded-xl border border-[#e2e6ef] bg-white px-4 py-3 transition-all hover:border-[#c8cce0] hover:bg-[#f0f2f7]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e2e6ef]">
                                                    <span className="text-xs font-bold text-[#6b7280]">$</span>
                                                </div>
                                                <div>
                                                    <span className="text-[13px] font-medium text-[#1a1a2e]">{deal.title}</span>
                                                    <p className="text-[10px] text-[#6b7280] capitalize">{deal.stage.replace(/_/g, ' ')}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-semibold text-[#1a1a2e]">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                    minimumFractionDigits: 0,
                                                }).format(deal.value)}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right panel — Activity timeline */}
                    <div className="flex flex-1 flex-col overflow-hidden bg-[#f8f9fc]">
                        <div className="flex items-center justify-between border-b border-[#e2e6ef] px-6 py-3">
                            <div className="flex items-center gap-2.5">
                                <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                                    Activity Timeline
                                </h2>
                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#e2e6ef] px-1.5 text-[10px] text-[#6b7280]">
                                    {lead.activities.length}
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowForm(!showForm)}
                                className="h-8 gap-1.5 border-[#e2e6ef] bg-white text-xs text-[#6b7280] hover:text-[#1a1a2e]"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Log activity
                            </Button>
                        </div>

                        {/* Activity form */}
                        {showForm && (
                            <form
                                onSubmit={handleAddActivity}
                                className="border-b border-[#e2e6ef] bg-white/80 px-6 py-4 backdrop-blur-sm"
                            >
                                <div className="mb-3 flex gap-1.5">
                                    {['note', 'call', 'email', 'meeting', 'task'].map((type) => {
                                        const cfg = ACTIVITY_CONFIG[type];
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setActivityType(type)}
                                                className={cn(
                                                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] capitalize transition-all',
                                                    activityType === type
                                                        ? 'bg-[#2B4C8C] text-white shadow-sm'
                                                        : 'border border-[#e2e6ef] bg-[#e2e6ef] text-[#6b7280] hover:border-[#c8cce0] hover:text-[#374151]',
                                                )}
                                            >
                                                {cfg && <cfg.icon className="h-3 w-3" />}
                                                {type}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={activitySubject}
                                            onChange={(e) => setActivitySubject(e.target.value)}
                                            placeholder="What happened?"
                                            className="w-full rounded-lg border border-[#e2e6ef] bg-[#f8f9fc] px-3 py-2 text-xs text-[#1a1a2e] placeholder-[#6b7280] outline-none transition-all focus:border-[#2b4c8c] focus:ring-1 focus:ring-[#2b4c8c]/20"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="h-8 bg-[#2B4C8C] text-white hover:bg-[#2B4C8C]/90"
                                    >
                                        <Send className="mr-1 h-3 w-3" />
                                        Save
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Activity list */}
                        <div className="flex-1 overflow-y-auto">
                            {lead.activities.length > 0 ? (
                                <div className="relative px-6 py-6">
                                    {/* Timeline line */}
                                    <div className="absolute left-[23px] top-0 h-full w-px bg-gradient-to-b from-[#e2e6ef] via-[#e2e6ef] to-transparent" />

                                    <div className="space-y-0">
                                        {lead.activities.map((activity, idx) => (
                                            <div key={activity.id} className="relative flex gap-4 pb-6">
                                                {/* Timeline dot */}
                                                <div className="relative z-10 mt-1">
                                                    <ActivityIcon type={activity.type} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="rounded-xl border border-[#e2e6ef] bg-white p-4 transition-all hover:border-[#c8cce0]">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[13px] font-medium text-[#1a1a2e]">
                                                                    {activity.subject ?? activity.type}
                                                                </span>
                                                                {activity.completed_at && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                                                                        <CheckCircle2 className="h-3 w-3" />
                                                                        Done
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {activity.description && (
                                                            <p className="mt-1 text-xs text-[#6b7280]">{activity.description}</p>
                                                        )}
                                                        <div className="mt-2 flex items-center gap-2 text-[10px] text-[#6b7280]">
                                                            <span className={cn(
                                                                'rounded px-1.5 py-0.5 capitalize',
                                                                ACTIVITY_CONFIG[activity.type]?.bg ?? 'bg-[#e2e6ef]',
                                                                ACTIVITY_CONFIG[activity.type]?.color ?? 'text-[#6b7280]',
                                                            )}>
                                                                {activity.type}
                                                            </span>
                                                            <span>·</span>
                                                            <Clock className="h-3 w-3" />
                                                            <span>{timeAgo(activity.created_at)}</span>
                                                            {activity.created_by && (
                                                                <>
                                                                    <span>·</span>
                                                                    <span>{activity.created_by.name}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 ring-1 ring-[#e2e6ef]">
                                            <MessageSquare className="h-7 w-7 text-[#6b7280]" />
                                        </div>
                                        <h3 className="mb-1 text-sm font-medium text-[#1a1a2e]">No activity yet</h3>
                                        <p className="mb-4 text-xs text-[#6b7280] max-w-[220px]">
                                            Start logging calls, emails, meetings, and notes to track your interactions with this lead.
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={() => setShowForm(true)}
                                            className="gap-1.5 bg-[#2B4C8C] text-white hover:bg-[#2B4C8C]/90"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Log your first activity
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
