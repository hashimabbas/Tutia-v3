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
} from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

function StageBadge({ stage, size = 'sm' }: { stage: string; size?: 'sm' | 'md' | 'lg' }) {
    const colors: Record<string, string> = {
        new: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        contacted: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        qualified: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
        proposal: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        negotiation: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        converted: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        lost: 'text-red-400 bg-red-500/10 border-red-500/20',
    };
    const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm' : size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';

    return (
        <span
            className={`inline-block rounded-md border font-medium capitalize ${sizeClasses} ${colors[stage] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}
        >
            {stage.replace(/_/g, ' ')}
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

    if (mins < 60) {
return `${mins}m ago`;
}

    if (hours < 24) {
return `${hours}h ago`;
}

    if (days < 7) {
return `${days}d ago`;
}

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ActivityIcon({ type }: { type: string }) {
    const icons: Record<string, React.ElementType> = {
        call: Phone,
        email: Mail,
        meeting: Calendar,
        note: MessageSquare,
        task: CheckCircle2,
    };
    const Icon = icons[type] ?? MessageSquare;

    return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a24]">
            <Icon className="h-3.5 w-3.5 text-[#555570]" />
        </div>
    );
}

export default function LeadShow({ lead }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [activityType, setActivityType] = useState('note');
    const [activitySubject, setActivitySubject] = useState('');

    const handleStageChange = (stage: string) => {
        router.patch(
            `/crm/leads/${lead.id}`,
            { stage },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleAddActivity = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activitySubject.trim()) {
return;
}

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
            }
        );
    };

    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted', 'lost'];

    return (
        <>
            <Head title={`CRM · ${lead.name}`} />

            <div className="flex h-full flex-col">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/crm/leads"
                            className="flex h-7 w-7 items-center justify-center rounded text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a24] text-sm font-medium text-[#e8e8ed]">
                            {lead.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-lg font-medium text-[#e8e8ed]">{lead.name}</h1>
                            <p className="text-xs text-[#555570]">
                                {lead.company ?? lead.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-3 text-xs font-medium text-[#e8e8ed] transition-colors hover:border-[#2a2a3a]">
                                    <StageBadge stage={lead.stage} />
                                    <ChevronDown className="h-3 w-3 text-[#555570]" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40 border-[#1e1e2a] bg-[#0f0f14] text-xs text-[#e8e8ed]">
                                {stages.map((s) => (
                                    <DropdownMenuItem
                                        key={s}
                                        onClick={() => handleStageChange(s)}
                                        className="cursor-pointer capitalize focus:bg-[#1a1a24]"
                                    >
                                        {s.replace(/_/g, ' ')}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Content: 2-panel layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left panel — Lead info */}
                    <div className="w-[380px] shrink-0 overflow-y-auto border-r border-[#1e1e2a] p-6">
                        {/* Contact Details */}
                        <section className="mb-6">
                            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#555570]">
                                Contact
                            </h2>
                            <div className="space-y-2.5">
                                {lead.email && (
                                    <a
                                        href={`mailto:${lead.email}`}
                                        className="flex items-center gap-2.5 text-xs text-[#e8e8ed] transition-colors hover:text-[#3b6cdb]"
                                    >
                                        <Mail className="h-3.5 w-3.5 text-[#555570]" />
                                        {lead.email}
                                    </a>
                                )}
                                {lead.phone && (
                                    <a
                                        href={`tel:${lead.phone}`}
                                        className="flex items-center gap-2.5 text-xs text-[#e8e8ed] transition-colors hover:text-[#3b6cdb]"
                                    >
                                        <Phone className="h-3.5 w-3.5 text-[#555570]" />
                                        {lead.phone}
                                    </a>
                                )}
                                {lead.company && (
                                    <div className="flex items-center gap-2.5 text-xs text-[#e8e8ed]">
                                        <Building2 className="h-3.5 w-3.5 text-[#555570]" />
                                        {lead.company}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Details */}
                        <section className="mb-6">
                            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#555570]">
                                Details
                            </h2>
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#555570]">Source</span>
                                    <span className="flex items-center gap-1.5 capitalize text-[#8b8b9e]">
                                        <Globe className="h-3 w-3" />
                                        {lead.source.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#555570]">Priority</span>
                                    <span className={`capitalize ${lead.priority === 'high' ? 'text-rose-400' : lead.priority === 'medium' ? 'text-amber-400' : 'text-slate-400'}`}>
                                        {lead.priority}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#555570]">Created</span>
                                    <span className="text-[#8b8b9e]">{formatDate(lead.created_at)}</span>
                                </div>
                                {lead.assignedTo && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[#555570]">Owner</span>
                                        <span className="text-[#8b8b9e]">{lead.assignedTo.name}</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Service Info */}
                        {(lead.service || lead.project_type) && (
                            <section className="mb-6">
                                <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#555570]">
                                    Interest
                                </h2>
                                <div className="space-y-2.5">
                                    {lead.service && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-[#555570]">Service</span>
                                            <span className="text-[#8b8b9e]">{lead.service}</span>
                                        </div>
                                    )}
                                    {lead.project_type && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-[#555570]">Project Type</span>
                                            <span className="text-[#8b8b9e]">{lead.project_type}</span>
                                        </div>
                                    )}
                                    {lead.budget && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-[#555570]">Budget</span>
                                            <span className="text-[#8b8b9e]">{lead.budget}</span>
                                        </div>
                                    )}
                                    {lead.timeline && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-[#555570]">Timeline</span>
                                            <span className="text-[#8b8b9e]">{lead.timeline}</span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Message/Brief */}
                        {(lead.message || lead.brief || lead.requirements) && (
                            <section>
                                <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#555570]">
                                    Notes
                                </h2>
                                <div className="space-y-3">
                                    {lead.message && (
                                        <p className="rounded-lg bg-[#0f0f14] p-3 text-xs leading-relaxed text-[#8b8b9e]">
                                            {lead.message}
                                        </p>
                                    )}
                                    {lead.brief && (
                                        <p className="rounded-lg bg-[#0f0f14] p-3 text-xs leading-relaxed text-[#8b8b9e]">
                                            {lead.brief}
                                        </p>
                                    )}
                                    {lead.requirements && (
                                        <p className="rounded-lg bg-[#0f0f14] p-3 text-xs leading-relaxed text-[#8b8b9e]">
                                            {lead.requirements}
                                        </p>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Linked Deals */}
                        {lead.deals.length > 0 && (
                            <section className="mt-6">
                                <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#555570]">
                                    Deals
                                </h2>
                                <div className="space-y-2">
                                    {lead.deals.map((deal) => (
                                        <Link
                                            key={deal.id}
                                            href={`/crm/deals/${deal.id}`}
                                            className="flex items-center justify-between rounded-lg border border-[#1e1e2a] bg-[#0f0f14] px-3 py-2.5 text-xs transition-colors hover:border-[#2a2a3a]"
                                        >
                                            <span className="text-[#e8e8ed]">{deal.title}</span>
                                            <span className="text-[#8b8b9e]">
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
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-3">
                            <h2 className="text-[11px] font-medium uppercase tracking-wider text-[#555570]">
                                Activity
                            </h2>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="flex items-center gap-1.5 rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#8b8b9e] transition-colors hover:border-[#2a2a3a] hover:text-[#e8e8ed]"
                            >
                                <Plus className="h-3 w-3" />
                                Log activity
                            </button>
                        </div>

                        {/* Activity form */}
                        {showForm && (
                            <form
                                onSubmit={handleAddActivity}
                                className="border-b border-[#1e1e2a] bg-[#0f0f14] px-6 py-3"
                            >
                                <div className="mb-2 flex gap-2">
                                    {['note', 'call', 'email', 'meeting', 'task'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setActivityType(type)}
                                            className={`rounded-md px-2.5 py-1 text-[11px] capitalize transition-colors ${
                                                activityType === type
                                                    ? 'bg-[#2B4C8C] text-white'
                                                    : 'bg-[#1a1a24] text-[#555570] hover:bg-[#1e1e2a]'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={activitySubject}
                                        onChange={(e) => setActivitySubject(e.target.value)}
                                        placeholder="What happened?"
                                        className="flex-1 rounded-md border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-1.5 text-xs text-[#e8e8ed] placeholder-[#555570] outline-none focus:border-[#3b6cdb]"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-md bg-[#2B4C8C] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3b5d9c]"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Activity list */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {lead.activities.length > 0 ? (
                                <div className="relative space-y-0">
                                    <div className="absolute left-[13px] top-0 h-full w-px bg-[#1e1e2a]" />
                                    {lead.activities.map((activity) => (
                                        <div key={activity.id} className="relative flex gap-4 pb-5">
                                            <div className="relative z-10">
                                                <ActivityIcon type={activity.type} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-medium text-[#e8e8ed]">
                                                        {activity.subject ?? activity.type}
                                                    </span>
                                                    {activity.completed_at && (
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                                    )}
                                                </div>
                                                {activity.description && (
                                                    <p className="mt-0.5 text-xs text-[#8b8b9e]">
                                                        {activity.description}
                                                    </p>
                                                )}
                                                <div className="mt-1 flex items-center gap-2 text-[11px] text-[#555570]">
                                                    <span className="capitalize">{activity.type}</span>
                                                    <span>·</span>
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
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <MessageSquare className="mx-auto mb-2 h-8 w-8 text-[#1e1e2a]" />
                                        <p className="text-xs text-[#555570]">
                                            No activity logged yet
                                        </p>
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="mt-2 text-[11px] text-[#3b6cdb] hover:text-[#5b8cfb]"
                                        >
                                            Log your first activity
                                        </button>
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
