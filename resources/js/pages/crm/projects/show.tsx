import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    ArrowLeft, AlertTriangle, CheckCircle2, Calendar,
    Clock, DollarSign, Users, FileText, Plus,
    ChevronDown, TrendingUp, TrendingDown,
    Milestone,
} from 'lucide-react';
import ProjectStatusBadge from '@/components/crm/project-status-badge';
import SeverityBadge from '@/components/crm/severity-badge';
import HealthBreakdownPanel from '@/components/crm/health-breakdown-panel';
import ActivityTimeline from '@/components/crm/activity-timeline';
import RiskIssueCard from '@/components/crm/risk-issue-card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Factor {
    key: string;
    label: string;
    max_score: number;
    score: number;
    details?: string;
}

interface HealthData {
    score: number;
    tier: string;
    factors: Factor[];
    trend: string;
}

interface Owner {
    id: number;
    name: string;
}

interface Deliverable {
    id: number;
    name: string;
    description: string | null;
    status: string;
    due_date: string | null;
    owner: Owner | null;
}

interface MilestoneItem {
    id: number;
    name: string;
    description: string | null;
    status: string;
    start_date: string | null;
    end_date: string | null;
    actual_end_date: string | null;
    deliverables: Deliverable[];
    owner: Owner | null;
}

interface RiskItem {
    id: number;
    description: string;
    severity: string;
    status: string;
    probability: string;
    owner: Owner | null;
}

interface IssueItem {
    id: number;
    description: string;
    severity: string;
    status: string;
    owner: Owner | null;
}

interface ChangeOrderItem {
    id: number;
    title: string;
    status: string;
    cost_impact: number;
    timeline_impact_days: number;
}

interface Organization {
    id: number;
    name: string;
}

interface Project {
    id: number;
    name: string;
    status: string;
    description: string | null;
    contract_value: number;
    change_order_total: number;
    billed_amount: number;
    collected_amount: number;
    start_date: string | null;
    target_end_date: string | null;
    actual_end_date: string | null;
    customer_sentiment: string | null;
    organization: Organization | null;
    milestones: MilestoneItem[];
    risks: RiskItem[];
    issues: IssueItem[];
    changeOrders: ChangeOrderItem[];
}

interface Props {
    project: Project;
    health: HealthData | null;
}

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
}

function formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusActions = ['planned', 'initiating', 'active', 'at_risk', 'completed', 'archived'];
const milestoneStatusConfig: Record<string, { color: string; bg: string }> = {
    pending: { color: '#555570', bg: 'rgba(85,85,112,0.15)' },
    in_progress: { color: '#3b6cdb', bg: 'rgba(59,108,219,0.15)' },
    completed: { color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
};

export default function ProjectShow({ project, health }: Props) {
    const handleStatusChange = (status: string) => {
        router.patch(`/crm/projects/${project.id}`, { status }, { preserveScroll: true, preserveState: true });
    };

    const totalValue = project.contract_value + project.change_order_total;
    const billedPct = totalValue > 0 ? Math.round((project.billed_amount / totalValue) * 100) : 0;
    const collectedPct = project.billed_amount > 0 ? Math.round((project.collected_amount / project.billed_amount) * 100) : 0;

    const activeRisks = project.risks.filter(r => r.status !== 'closed');
    const activeIssues = project.issues.filter(i => i.status !== 'closed' && i.status !== 'resolved');
    const completedMilestones = project.milestones.filter(m => m.status === 'completed');
    const pendingCOs = project.changeOrders.filter(co => co.status === 'identified');

    return (
        <>
            <Head title={`CRM · ${project.name}`} />

            <div className="flex h-full flex-col">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-2.5">
                    <div className="flex items-center gap-3">
                        <Link href="/crm/projects" className="flex h-7 w-7 items-center justify-center rounded text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <Link href="/crm/projects" className="text-[#555570] hover:text-[#8b8b9e]">Projects</Link>
                            <span className="text-[#555570]">/</span>
                            <span className="text-[#e8e8ed]">{project.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ProjectStatusBadge status={project.status} />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex h-7 items-center gap-1 rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 text-[11px] font-medium text-[#e8e8ed] transition-colors hover:border-[#2a2a3a] capitalize">
                                    Change Status
                                    <ChevronDown className="h-3 w-3 text-[#555570]" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40 border-[#1e1e2a] bg-[#0f0f14] text-xs text-[#e8e8ed]">
                                {statusActions.map(s => (
                                    <DropdownMenuItem key={s} onClick={() => handleStatusChange(s)} className="cursor-pointer focus:bg-[#1a1a24] capitalize">
                                        {s.replace(/_/g, ' ')}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* 3-panel layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT panel: Health + Risks + Issues */}
                    <div className="w-72 shrink-0 overflow-y-auto border-r border-[#1e1e2a] p-4 space-y-4">
                        {/* Health Score */}
                        {health && (
                            <HealthBreakdownPanel
                                score={health.score}
                                tier={health.tier}
                                factors={health.factors}
                                trend={health.trend}
                            />
                        )}

                        {/* KPI Summary */}
                        <div className="grid grid-cols-2 gap-px rounded-lg border border-[#1e1e2a] bg-[#1e1e2a] overflow-hidden">
                            <div className="bg-[#0f0f14] px-2.5 py-2 text-center">
                                <div className="text-sm font-semibold text-[#e8e8ed]">{project.milestones.length}</div>
                                <div className="text-[9px] text-[#555570]">Milestones</div>
                            </div>
                            <div className="bg-[#0f0f14] px-2.5 py-2 text-center">
                                <div className="text-sm font-semibold text-[#e8e8ed]">{completedMilestones.length}</div>
                                <div className="text-[9px] text-[#555570]">Done</div>
                            </div>
                            <div className="bg-[#0f0f14] px-2.5 py-2 text-center">
                                <div className="text-sm font-semibold text-[#f87171]">{activeRisks.length}</div>
                                <div className="text-[9px] text-[#555570]">Open Risks</div>
                            </div>
                            <div className="bg-[#0f0f14] px-2.5 py-2 text-center">
                                <div className="text-sm font-semibold text-[#fbbf24]">{activeIssues.length}</div>
                                <div className="text-[9px] text-[#555570]">Open Issues</div>
                            </div>
                        </div>

                        {/* Active Risks */}
                        <section>
                            <div className="mb-2 flex items-center justify-between">
                                <h2 className="text-[10px] font-medium uppercase tracking-wider text-[#555570]">Risks ({activeRisks.length})</h2>
                                <Link href={`/crm/projects/${project.id}/risks`} className="text-[9px] text-[#3b6cdb] hover:text-[#5b8cfb]">View all</Link>
                            </div>
                            <div className="space-y-1.5">
                                {activeRisks.length === 0 ? (
                                    <p className="text-[10px] text-[#555570]">No active risks</p>
                                ) : (
                                    activeRisks.slice(0, 5).map(r => (
                                        <RiskIssueCard key={r.id} id={r.id} description={r.description} severity={r.severity} status={r.status} owner={r.owner} projectId={project.id} type="risk" />
                                    ))
                                )}
                                {activeRisks.length > 5 && (
                                    <Link href={`/crm/projects/${project.id}/risks`} className="block text-center text-[9px] text-[#555570] hover:text-[#8b8b9e]">
                                        +{activeRisks.length - 5} more
                                    </Link>
                                )}
                            </div>
                        </section>

                        {/* Active Issues */}
                        <section>
                            <div className="mb-2 flex items-center justify-between">
                                <h2 className="text-[10px] font-medium uppercase tracking-wider text-[#555570]">Issues ({activeIssues.length})</h2>
                                <Link href={`/crm/projects/${project.id}/issues`} className="text-[9px] text-[#3b6cdb] hover:text-[#5b8cfb]">View all</Link>
                            </div>
                            <div className="space-y-1.5">
                                {activeIssues.length === 0 ? (
                                    <p className="text-[10px] text-[#555570]">No open issues</p>
                                ) : (
                                    activeIssues.slice(0, 5).map(i => (
                                        <RiskIssueCard key={i.id} id={i.id} description={i.description} severity={i.severity} status={i.status} owner={i.owner} projectId={project.id} type="issue" />
                                    ))
                                )}
                                {activeIssues.length > 5 && (
                                    <Link href={`/crm/projects/${project.id}/issues`} className="block text-center text-[9px] text-[#555570] hover:text-[#8b8b9e]">
                                        +{activeIssues.length - 5} more
                                    </Link>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* CENTER panel: Main content */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* Project Header */}
                            <div>
                                <div className="flex items-center gap-2 text-lg font-medium text-[#e8e8ed]">
                                    {project.name}
                                </div>
                                <div className="mt-1 flex items-center gap-3 text-xs text-[#555570]">
                                    <span>{project.organization?.name}</span>
                                    <span>·</span>
                                    <span>{formatCurrency(totalValue)}</span>
                                    {project.start_date && <><span>·</span><span>Start: {formatDate(project.start_date)}</span></>}
                                    {project.target_end_date && <><span>·</span><span>Target: {formatDate(project.target_end_date)}</span></>}
                                </div>
                            </div>

                            {/* Financial Overview */}
                            <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
                                <h2 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#555570]">Financial Overview</h2>
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <div className="text-xs text-[#555570]">Contract</div>
                                        <div className="text-sm font-semibold text-[#e8e8ed]">{formatCurrency(project.contract_value)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-[#555570]">Change Orders</div>
                                        <div className="text-sm font-semibold text-[#fbbf24]">+{formatCurrency(project.change_order_total)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-[#555570]">Total Value</div>
                                        <div className="text-sm font-semibold text-[#34d399]">{formatCurrency(totalValue)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-[#555570]">Pending COs</div>
                                        <div className="text-sm font-semibold text-[#f97316]">{pendingCOs.length}</div>
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-[11px]">
                                            <span className="text-[#555570]">Billed</span>
                                            <span className="text-[#e8e8ed]">{billedPct}%</span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a24]">
                                            <div className="h-full rounded-full bg-[#3b6cdb]" style={{ width: `${billedPct}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-[11px]">
                                            <span className="text-[#555570]">Collected</span>
                                            <span className="text-[#e8e8ed]">{collectedPct}%</span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a24]">
                                            <div className="h-full rounded-full bg-[#34d399]" style={{ width: `${collectedPct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Milestones + Deliverables */}
                            <section>
                                <div className="mb-2 flex items-center justify-between">
                                    <h2 className="text-[10px] font-medium uppercase tracking-wider text-[#555570]">Milestones ({project.milestones.length})</h2>
                                </div>
                                {project.milestones.length === 0 ? (
                                    <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] px-4 py-6 text-center">
                                        <Milestone className="mx-auto mb-2 h-6 w-6 text-[#1e1e2a]" />
                                        <p className="text-xs text-[#555570]">No milestones defined</p>
                                        <p className="text-[10px] text-[#555570]">Milestones are created when a project is converted from a deal.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {project.milestones.map(m => {
                                            const mConfig = milestoneStatusConfig[m.status] ?? milestoneStatusConfig.pending;
                                            const totalDeliverables = m.deliverables.length;
                                            const doneDeliverables = m.deliverables.filter(d => d.status === 'completed' || d.status === 'approved').length;
                                            const delivPct = totalDeliverables > 0 ? Math.round((doneDeliverables / totalDeliverables) * 100) : 0;

                                            return (
                                                <div key={m.id} className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14]">
                                                    <div className="flex items-center justify-between px-3 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: mConfig.color }} />
                                                            <span className="text-xs font-medium text-[#e8e8ed]">{m.name}</span>
                                                            <span
                                                                className="rounded-full px-1.5 py-0.5 text-[9px] font-medium capitalize"
                                                                style={{ backgroundColor: mConfig.bg, color: mConfig.color }}
                                                            >
                                                                {m.status.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] text-[#555570]">
                                                            {m.end_date && <span>{formatDate(m.end_date)}</span>}
                                                            {totalDeliverables > 0 && <span>{doneDeliverables}/{totalDeliverables} deliverables</span>}
                                                        </div>
                                                    </div>
                                                    {totalDeliverables > 0 && (
                                                        <div className="border-t border-[#1e1e2a] px-3 py-1.5">
                                                            <div className="h-1 w-full overflow-hidden rounded-full bg-[#1a1a24]">
                                                                <div className="h-full rounded-full bg-[#3b6cdb]" style={{ width: `${delivPct}%` }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {m.deliverables.length > 0 && (
                                                        <div className="border-t border-[#1e1e2a] px-3 py-1.5 space-y-1">
                                                            {m.deliverables.slice(0, 3).map(d => (
                                                                <div key={d.id} className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <FileText className="h-3 w-3 text-[#555570]" />
                                                                        <span className="text-[11px] text-[#8b8b9e]">{d.name}</span>
                                                                    </div>
                                                                    <span className="text-[9px] capitalize text-[#555570]">{d.status.replace(/_/g, ' ')}</span>
                                                                </div>
                                                            ))}
                                                            {m.deliverables.length > 3 && (
                                                                <div className="text-center text-[9px] text-[#555570]">+{m.deliverables.length - 3} more</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>

                            {/* Change Orders Summary */}
                            {project.changeOrders.length > 0 && (
                                <section>
                                    <div className="mb-2 flex items-center justify-between">
                                        <h2 className="text-[10px] font-medium uppercase tracking-wider text-[#555570]">Change Orders ({project.changeOrders.length})</h2>
                                        <Link href={`/crm/projects/${project.id}/change-orders`} className="text-[9px] text-[#3b6cdb] hover:text-[#5b8cfb]">View all</Link>
                                    </div>
                                    <div className="space-y-1">
                                        {project.changeOrders.slice(0, 3).map(co => (
                                            <div key={co.id} className="flex items-center justify-between rounded border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-3 w-3 text-[#555570]" />
                                                    <span className="text-xs text-[#e8e8ed]">{co.title}</span>
                                                    <SeverityBadge severity={co.status === 'approved' ? 'low' : co.status === 'rejected' ? 'minor' : 'medium'} />
                                                </div>
                                                <span className="text-xs font-medium" style={{ color: co.cost_impact > 0 ? '#fbbf24' : '#34d399' }}>
                                                    {co.cost_impact > 0 ? '+' : ''}{formatCurrency(co.cost_impact)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* RIGHT panel: Timeline */}
                    <div className="w-80 shrink-0 border-l border-[#1e1e2a] bg-[#0a0a0f]">
                        <ActivityTimeline entityType="project" entityId={project.id} />
                    </div>
                </div>
            </div>
        </>
    );
}
