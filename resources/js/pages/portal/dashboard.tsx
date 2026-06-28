import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    DollarSign,
    FolderKanban,
} from 'lucide-react';
import PortalShell from '@/components/portal/portal-shell';
import { PortalKpiCard } from '@/components/portal/portal-kpi-card';
import { PortalProjectCard } from '@/components/portal/portal-project-card';

interface Project {
    id: number;
    name: string;
    status: string;
    health_tier?: string;
    total_value?: number;
    milestones?: Array<{ id: number; name: string; status: string }>;
    risks?: Array<{ id: number; description: string; severity: string }>;
    issues?: Array<{ id: number; description: string; severity: string }>;
    change_orders?: Array<{
        id: number;
        title: string;
        amount: number;
        status: string;
        created_at: string;
    }>;
}

interface DashboardProps {
    projects: Project[];
}

export default function PortalDashboard({ projects }: DashboardProps) {
    const totalValue = projects.reduce(
        (sum, p) => sum + (p.total_value ?? 0),
        0,
    );
    const pendingCOs = projects.reduce(
        (sum, p) =>
            sum +
            (p.change_orders?.filter((co) => co.status === 'pending').length ??
                0),
        0,
    );
    const activeProjects = projects.filter(
        (p) => p.status === 'In Progress' || p.status === 'At Risk',
    );
    const atRiskProjects = projects.filter((p) => p.status === 'At Risk');

    return (
        <PortalShell title="Dashboard">
            <Head title="Portal Dashboard" />

            <div className="space-y-6 p-4 pb-20 md:p-6">
                {/* Action Center */}
                <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                    <h2 className="mb-3 text-sm font-semibold text-[#e8e8ed]">
                        Action Center
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {pendingCOs > 0 && (
                            <Link
                                href={`/portal/projects`}
                                className="flex items-center gap-3 rounded-lg border border-[#eab308]/20 bg-[#eab308]/5 p-3 transition-colors hover:border-[#eab308]/40"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eab308]/10">
                                    <Clock className="h-4 w-4 text-[#eab308]" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-[#e8e8ed]">
                                        {pendingCOs} Pending
                                    </div>
                                    <div className="text-[10px] text-[#8b8b9e]">
                                        Change order{pendingCOs > 1 ? 's' : ''}{' '}
                                        awaiting your approval
                                    </div>
                                </div>
                            </Link>
                        )}
                        {atRiskProjects.length > 0 && (
                            <div className="flex items-center gap-3 rounded-lg border border-[#ef4444]/20 bg-[#ef4444]/5 p-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ef4444]/10">
                                    <AlertTriangle className="h-4 w-4 text-[#ef4444]" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-[#e8e8ed]">
                                        {atRiskProjects.length} At Risk
                                    </div>
                                    <div className="text-[10px] text-[#8b8b9e]">
                                        Project
                                        {atRiskProjects.length > 1 ? 's' : ''}{' '}
                                        need your attention
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3 rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5 p-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e]/10">
                                <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-[#e8e8ed]">
                                    {activeProjects.length} Active
                                </div>
                                <div className="text-[10px] text-[#8b8b9e]">
                                    Project
                                    {activeProjects.length !== 1 ? 's' : ''} in
                                    progress
                                </div>
                            </div>
                        </div>
                        {pendingCOs === 0 && atRiskProjects.length === 0 && (
                            <div className="col-span-full py-2 text-center text-[11px] text-[#555570]">
                                No pending actions — everything is on track
                            </div>
                        )}
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid gap-3 sm:grid-cols-3">
                    <PortalKpiCard
                        icon={FolderKanban}
                        label="Total Projects"
                        value={projects.length}
                        subtext={
                            activeProjects.length > 0
                                ? `${activeProjects.length} currently active`
                                : undefined
                        }
                        color="#3b6cdb"
                    />
                    <PortalKpiCard
                        icon={DollarSign}
                        label="Total Value"
                        value={`$${totalValue.toLocaleString()}`}
                        color="#34d399"
                    />
                    <PortalKpiCard
                        icon={AlertTriangle}
                        label="Open Items"
                        value={projects.reduce(
                            (sum, p) =>
                                sum +
                                (p.risks?.length ?? 0) +
                                (p.issues?.length ?? 0),
                            0,
                        )}
                        subtext={
                            pendingCOs > 0
                                ? `${pendingCOs} pending approvals`
                                : undefined
                        }
                        color={
                            atRiskProjects.length > 0 ? '#eab308' : '#34d399'
                        }
                    />
                </div>

                {/* Projects */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold text-[#e8e8ed]">
                        Your Projects
                    </h2>
                    {projects.length === 0 ? (
                        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-8 text-center">
                            <FolderKanban className="mx-auto mb-2 h-8 w-8 text-[#555570]" />
                            <p className="text-sm text-[#8b8b9e]">
                                No projects yet
                            </p>
                            <p className="mt-1 text-[11px] text-[#555570]">
                                Projects will appear here once your account is
                                granted access.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {projects.map((p) => (
                                <PortalProjectCard key={p.id} {...p} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PortalShell>
    );
}
