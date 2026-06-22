import { Head } from '@inertiajs/react';
import { FileText, CheckCircle2, XCircle, Clock, DollarSign } from 'lucide-react';
import PortalShell from '@/components/portal/portal-shell';
import { PortalEmptyState } from '@/components/portal/portal-empty-state';

interface ChangeOrder {
    id: number;
    title: string;
    amount: number;
    status: string;
    created_at: string;
    project_name?: string;
    project_id?: number;
}

interface ChangeOrdersProps {
    change_orders: ChangeOrder[];
}

const statusConfig: Record<string, { icon: typeof Clock; color: string }> = {
    pending: { icon: Clock, color: '#eab308' },
    approved: { icon: CheckCircle2, color: '#22c55e' },
    rejected: { icon: XCircle, color: '#ef4444' },
};

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
        <button onClick={handleApprove} className="rounded bg-[#22c55e] px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#16a34a]">
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
        <button onClick={handleReject} className="rounded border border-[#f87171]/30 px-2.5 py-1 text-[11px] font-medium text-[#f87171] transition-colors hover:bg-[#f87171]/10">
            Reject
        </button>
    );
}

export default function PortalChangeOrders({ change_orders }: ChangeOrdersProps) {
    const pendingCOs = change_orders.filter(co => co.status === 'pending');
    const totalImpact = change_orders.filter(co => co.status === 'approved').reduce((sum, co) => sum + co.amount, 0);

    return (
        <PortalShell title="Change Orders">
            <Head title="Change Orders" />
            <div className="space-y-4 p-4 pb-20 md:p-6">
                {/* Summary */}
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                        <div className="text-[11px] text-[#8b8b9e]">Total</div>
                        <div className="mt-1 text-lg font-bold text-[#e8e8ed]">{change_orders.length}</div>
                    </div>
                    <div className="rounded-lg border border-[#eab308]/20 bg-[#0f0f14] p-4">
                        <div className="text-[11px] text-[#eab308]">Pending</div>
                        <div className="mt-1 text-lg font-bold text-[#e8e8ed]">{pendingCOs.length}</div>
                    </div>
                    <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                        <div className="flex items-center gap-1 text-[11px] text-[#8b8b9e]">
                            <DollarSign className="h-3 w-3" />
                            Approved Impact
                        </div>
                        <div className="mt-1 text-lg font-bold text-[#22c55e]">${totalImpact.toLocaleString()}</div>
                    </div>
                </div>

                {/* List */}
                {change_orders.length === 0 ? (
                    <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-8">
                        <PortalEmptyState title="No change orders" description="Approved or pending changes will appear here." />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {change_orders.map(co => {
                            const config = statusConfig[co.status] ?? { icon: Clock, color: '#555570' };
                            const Icon = config.icon;
                            return (
                                <div key={co.id} className="flex items-center gap-4 rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${config.color}14` }}>
                                        <Icon className="h-4 w-4" style={{ color: config.color }} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-medium text-[#e8e8ed]">{co.title}</p>
                                        <p className="text-[11px] text-[#8b8b9e]">
                                            {co.project_name && `${co.project_name} · `}
                                            ${co.amount.toLocaleString()} · {new Date(co.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-[#1a1a24] px-2 py-0.5 text-[10px] capitalize text-[#555570]">{co.status}</span>
                                    {co.status === 'pending' && co.project_id && (
                                        <div className="flex gap-1">
                                            <ApproveButton coId={co.id} projectId={co.project_id} />
                                            <RejectButton coId={co.id} projectId={co.project_id} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </PortalShell>
    );
}
