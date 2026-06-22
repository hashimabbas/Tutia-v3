import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, AlertTriangle, FileText, DollarSign } from 'lucide-react';
import PortalShell from '@/components/portal/portal-shell';
import { PortalHealthBadge } from '@/components/portal/portal-health-badge';
import { PortalStatusBadge } from '@/components/portal/portal-status-badge';
import { PortalTimeline } from '@/components/portal/portal-timeline';
import { PortalEmptyState } from '@/components/portal/portal-empty-state';

interface Milestone {
    id: number;
    name: string;
    status: string;
}

interface Risk {
    id: number;
    description: string;
    severity: string;
    status: string;
}

interface Issue {
    id: number;
    description: string;
    severity: string;
    status: string;
}

interface ChangeOrder {
    id: number;
    title: string;
    amount: number;
    status: string;
    created_at: string;
}

interface ProjectData {
    id: number;
    name: string;
    status: string;
    health_tier: string;
    total_value: number;
    milestones: Milestone[];
    risks: Risk[];
    issues: Issue[];
    change_orders: ChangeOrder[];
}

interface ProjectShowProps {
    project: ProjectData;
}

function ApproveButton({ coId, projectId }: { coId: number; projectId: number }) {
    const handleApprove = () => {
        if (confirm('Approve this change order?')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/portal/projects/${projectId}/change-orders/${coId}/approve`;
            form.style.display = 'none';
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (token) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = '_token';
                input.value = token;
                form.appendChild(input);
            }
            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <button
            onClick={handleApprove}
            className="rounded bg-[#22c55e] px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-[#16a34a]"
        >
            Approve
        </button>
    );
}

function RejectButton({ coId, projectId }: { coId: number; projectId: number }) {
    const handleReject = () => {
        const reason = prompt('Reason for rejection:');
        if (reason && reason.trim()) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/portal/projects/${projectId}/change-orders/${coId}/reject`;
            form.style.display = 'none';
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (token) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = '_token';
                input.value = token;
                form.appendChild(input);
            }
            const reasonInput = document.createElement('input');
            reasonInput.type = 'hidden';
            reasonInput.name = 'reason';
            reasonInput.value = reason.trim();
            form.appendChild(reasonInput);
            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <button
            onClick={handleReject}
            className="rounded border border-[#f87171]/30 px-2 py-1 text-[10px] font-medium text-[#f87171] transition-colors hover:bg-[#f87171]/10"
        >
            Reject
        </button>
    );
}

const severityColor: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
    blocker: '#ef4444',
    major: '#f97316',
    minor: '#eab308',
};

export default function PortalProjectShow({ project }: ProjectShowProps) {
    const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
    const totalMilestones = project.milestones.length;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return (
        <PortalShell title={project.name}>
            <Head title={project.name} />

            <div className="flex h-full flex-col">
                {/* Back link */}
                <div className="border-b border-[#1e1e2a] px-4 py-2">
                    <Link href="/portal/dashboard" className="inline-flex items-center gap-1 text-[11px] text-[#8b8b9e] transition-colors hover:text-[#e8e8ed]">
                        <ArrowLeft className="h-3 w-3" />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 lg:flex-row">
                    {/* LEFT PANEL — Summary */}
                    <div className="space-y-3 lg:w-72 lg:shrink-0">
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                            <h3 className="mb-3 text-xs font-semibold text-[#e8e8ed]">Project Summary</h3>
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[#8b8b9e]">Status</span>
                                    <PortalStatusBadge status={project.status} />
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[#8b8b9e]">Health</span>
                                    <PortalHealthBadge tier={project.health_tier} />
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[#8b8b9e]">Value</span>
                                    <span className="font-medium text-[#e8e8ed]">${project.total_value.toLocaleString()}</span>
                                </div>
                            </div>

                            {totalMilestones > 0 && (
                                <div className="mt-4">
                                    <div className="mb-1 flex items-center justify-between text-[11px]">
                                        <span className="text-[#8b8b9e]">Progress</span>
                                        <span className="text-[#e8e8ed]">{completedMilestones}/{totalMilestones}</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a24]">
                                        <div
                                            className="h-full rounded-full bg-[#3b6cdb] transition-all"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="mt-1 text-[10px] text-[#555570]">{progress}% complete</p>
                                </div>
                            )}
                        </div>

                        {/* Visible Risks */}
                        {project.risks.length > 0 && (
                            <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                                <h3 className="mb-3 text-xs font-semibold text-[#e8e8ed]">Risks ({project.risks.length})</h3>
                                <div className="space-y-2">
                                    {project.risks.map(r => (
                                        <div key={r.id} className="flex items-start gap-2">
                                            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" style={{ color: severityColor[r.severity] ?? '#eab308' }} />
                                            <div className="min-w-0">
                                                <p className="truncate text-[11px] text-[#e8e8ed]">{r.description}</p>
                                                <span className="text-[10px] capitalize text-[#555570]">{r.severity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Visible Issues */}
                        {project.issues.length > 0 && (
                            <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                                <h3 className="mb-3 text-xs font-semibold text-[#e8e8ed]">Issues ({project.issues.length})</h3>
                                <div className="space-y-2">
                                    {project.issues.map(i => (
                                        <div key={i.id} className="flex items-start gap-2">
                                            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" style={{ color: severityColor[i.severity] ?? '#f87171' }} />
                                            <div className="min-w-0">
                                                <p className="truncate text-[11px] text-[#e8e8ed]">{i.description}</p>
                                                <span className="text-[10px] capitalize text-[#555570]">{i.severity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CENTER PANEL — Milestones, Deliverables, Change Orders */}
                    <div className="flex-1 space-y-4">
                        {/* Milestones */}
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                            <h3 className="mb-3 text-xs font-semibold text-[#e8e8ed]">Milestones</h3>
                            {project.milestones.length === 0 ? (
                                <PortalEmptyState title="No milestones" description="Milestones will appear here once defined." />
                            ) : (
                                <div className="space-y-2">
                                    {project.milestones.map(m => (
                                        <div key={m.id} className="flex items-center gap-3 rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2">
                                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                                m.status === 'completed' ? 'bg-[#22c55e]/10' : 'bg-[#1a1a24]'
                                            }`}>
                                                {m.status === 'completed' ? (
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                                                ) : (
                                                    <div className="h-2 w-2 rounded-full bg-[#555570]" />
                                                )}
                                            </div>
                                            <span className={`flex-1 text-[12px] ${
                                                m.status === 'completed' ? 'text-[#8b8b9e] line-through' : 'text-[#e8e8ed]'
                                            }`}>
                                                {m.name}
                                            </span>
                                            <span className="text-[10px] capitalize text-[#555570]">{m.status === 'completed' ? 'Done' : m.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Change Orders */}
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                            <h3 className="mb-3 text-xs font-semibold text-[#e8e8ed]">Change Orders</h3>
                            {project.change_orders.length === 0 ? (
                                <PortalEmptyState title="No change orders" description="All change requests will appear here." />
                            ) : (
                                <div className="space-y-2">
                                    {project.change_orders.map(co => (
                                        <div key={co.id} className="flex items-center gap-3 rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2">
                                            <FileText className="h-4 w-4 shrink-0 text-[#3b6cdb]" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[12px] text-[#e8e8ed]">{co.title}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-[#555570]">
                                                    <span>${co.amount.toLocaleString()}</span>
                                                    <span>·</span>
                                                    <span className="capitalize">{co.status}</span>
                                                </div>
                                            </div>
                                            {co.status === 'pending' && (
                                                <div className="flex shrink-0 gap-1">
                                                    <ApproveButton coId={co.id} projectId={project.id} />
                                                    <RejectButton coId={co.id} projectId={project.id} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL — Timeline & Actions */}
                    <div className="space-y-3 lg:w-80 lg:shrink-0">
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                            <h3 className="mb-3 text-xs font-semibold text-[#e8e8ed]">Recent Activity</h3>
                            <PortalTimeline projectId={project.id} />
                        </div>
                    </div>
                </div>
            </div>
        </PortalShell>
    );
}
