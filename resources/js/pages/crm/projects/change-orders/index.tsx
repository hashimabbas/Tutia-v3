import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, FileText, Plus, DollarSign, CalendarDays } from 'lucide-react';
import ProjectStatusBadge from '@/components/crm/project-status-badge';
import SeverityBadge from '@/components/crm/severity-badge';
import { useState } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

interface ChangeOrder {
    id: number;
    title: string;
    description: string | null;
    status: string;
    cost_impact: number;
    timeline_impact_days: number;
    requested_by: string | null;
    approved_at: string | null;
    rejection_reason: string | null;
    created_at: string;
}

interface Project {
    id: number;
    name: string;
    status: string;
    contract_value: number;
    change_order_total: number;
    billed_amount: number;
    collected_amount: number;
    organization: { id: number; name: string } | null;
}

interface Props {
    project: Project;
    changeOrders: { data: ChangeOrder[]; meta: any };
    filters: Record<string, string | undefined>;
}

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
}

function formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ChangeOrderIndex({ project, changeOrders, filters }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formCost, setFormCost] = useState('');
    const [formTimelineDays, setFormTimelineDays] = useState('');
    const [formRequestedBy, setFormRequestedBy] = useState('');
    const [saving, setSaving] = useState(false);

    const applyFilter = (key: string, val: string) => {
        router.get(`/crm/projects/${project.id}/change-orders`, { ...filters, [key]: val || undefined }, { preserveState: true, replace: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim() || !formCost) return;
        setSaving(true);
        router.post(`/crm/projects/${project.id}/change-orders`, {
            title: formTitle,
            description: formDescription,
            cost_impact: parseFloat(formCost),
            timeline_impact_days: parseInt(formTimelineDays || '0'),
            requested_by: formRequestedBy,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowCreate(false);
                setFormTitle('');
                setFormDescription('');
                setFormCost('');
                setFormTimelineDays('');
                setFormRequestedBy('');
                setSaving(false);
            },
            onError: () => setSaving(false),
        });
    };

    const handleApprove = (co: ChangeOrder) => {
        router.post(`/crm/projects/${project.id}/change-orders/${co.id}/approve`, {}, { preserveScroll: true, preserveState: true });
    };

    const handleReject = (co: ChangeOrder) => {
        const reason = prompt('Rejection reason:');
        if (reason !== null) {
            router.post(`/crm/projects/${project.id}/change-orders/${co.id}/reject`, { rejection_reason: reason }, { preserveScroll: true, preserveState: true });
        }
    };

    const totalValue = project.contract_value + project.change_order_total;
    const pendingCOs = changeOrders.data.filter(co => co.status === 'identified');
    const approvedCOs = changeOrders.data.filter(co => co.status === 'approved');

    return (
        <>
            <Head title={`CRM · Change Orders · ${project.name}`} />

            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 backdrop-blur-xl px-6 py-2.5 z-10">
                    <div className="flex items-center gap-3">
                        <Link href={`/crm/projects/${project.id}`} className="flex h-7 w-7 items-center justify-center rounded text-[#6b7280] transition-colors hover:bg-[#f8f9fc] hover:text-[#1a1a2e]">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <Link href={`/crm/projects/${project.id}`} className="text-[#6b7280] hover:text-[#1a1a2e]">{project.name}</Link>
                            <span className="text-[#6b7280]">/</span>
                            <span className="text-[#1a1a2e]">Change Orders</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ProjectStatusBadge status={project.status} />
                        <Dialog open={showCreate} onOpenChange={setShowCreate}>
                            <DialogTrigger asChild>
                                <button className="flex items-center gap-1.5 rounded-md bg-[#2B4C8C] px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#3b5d9c]">
                                    <Plus className="h-3.5 w-3.5" />
                                    New Change Order
                                </button>
                            </DialogTrigger>
                            <DialogContent className="border-[#e2e6ef] bg-white text-[#1a1a2e]">
                                <DialogHeader>
                                    <DialogTitle className="text-sm font-medium text-[#1a1a2e]">New Change Order</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-3">
                                    <div>
                                        <label className="mb-1 block text-[11px] text-[#6b7280]">Title</label>
                                        <input
                                            type="text" value={formTitle}
                                            onChange={e => setFormTitle(e.target.value)}
                                            className="w-full rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] placeholder-[#6b7280] outline-none focus:border-[#2B4C8C]"
                                            placeholder="e.g. Additional server capacity"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] text-[#6b7280]">Description</label>
                                        <textarea
                                            value={formDescription}
                                            onChange={e => setFormDescription(e.target.value)}
                                            className="w-full rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] placeholder-[#6b7280] outline-none focus:border-[#2B4C8C] resize-none"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-[11px] text-[#6b7280]">Cost Impact ($)</label>
                                            <input
                                                type="number" value={formCost}
                                                onChange={e => setFormCost(e.target.value)}
                                                className="w-full rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] outline-none focus:border-[#2B4C8C]"
                                                min="0" step="0.01" required
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[11px] text-[#6b7280]">Timeline Impact (days)</label>
                                            <input
                                                type="number" value={formTimelineDays}
                                                onChange={e => setFormTimelineDays(e.target.value)}
                                                className="w-full rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] outline-none focus:border-[#2B4C8C]"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] text-[#6b7280]">Requested By</label>
                                        <input
                                            type="text" value={formRequestedBy}
                                            onChange={e => setFormRequestedBy(e.target.value)}
                                            className="w-full rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] placeholder-[#6b7280] outline-none focus:border-[#2B4C8C]"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button type="button" onClick={() => setShowCreate(false)}
                                            className="rounded border border-[#e2e6ef] px-3 py-1.5 text-[11px] text-[#6b7280] hover:border-[#c8ccd6]"
                                        >Cancel</button>
                                        <button type="submit" disabled={saving}
                                            className="rounded bg-[#2B4C8C] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#3b5d9c] disabled:opacity-50"
                                        >{saving ? 'Creating...' : 'Create'}</button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-5 gap-px border-b border-[#e2e6ef] bg-[#e2e6ef]">
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Original Contract</div>
                        <div className="text-sm font-semibold text-[#1a1a2e]">{formatCurrency(project.contract_value)}</div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Approved COs</div>
                        <div className="text-sm font-semibold text-[#10b981]">{formatCurrency(project.change_order_total)}</div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Total Project Value</div>
                        <div className="text-sm font-semibold text-[#1a1a2e]">{formatCurrency(totalValue)}</div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Pending</div>
                        <div className="text-sm font-semibold text-[#f59e0b]">{pendingCOs.length}</div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Approved</div>
                        <div className="text-sm font-semibold text-[#10b981]">{approvedCOs.length}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 border-b border-[#e2e6ef] px-6 py-2.5">
                    <select
                        value={filters.status ?? ''}
                        onChange={e => applyFilter('status', e.target.value)}
                        className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                    >
                        <option value="">All statuses</option>
                        <option value="identified">Identified</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#e2e6ef] text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                                <th className="px-6 py-2.5 text-left">Title</th>
                                <th className="px-4 py-2.5 text-left">Status</th>
                                <th className="px-4 py-2.5 text-right">Cost Impact</th>
                                <th className="px-4 py-2.5 text-right">Timeline</th>
                                <th className="px-4 py-2.5 text-left">Requested By</th>
                                <th className="px-4 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-[#1a1a2e]">
                            {changeOrders.data.map(co => (
                                <tr key={co.id} className="border-b border-[#e2e6ef] hover:bg-[#f8f9fc]">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5 text-[#6b7280]" />
                                            <span className="font-medium text-[#1a1a2e]">{co.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <SeverityBadge severity={co.status === 'approved' ? 'low' : co.status === 'rejected' ? 'minor' : 'medium'} />
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium" style={{ color: co.cost_impact > 0 ? '#f59e0b' : '#10b981' }}>
                                        {co.cost_impact > 0 ? '+' : ''}{formatCurrency(co.cost_impact)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-[#6b7280]">
                                        {co.timeline_impact_days > 0 ? `+${co.timeline_impact_days}d` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-[#6b7280]">{co.requested_by ?? '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        {co.status === 'identified' && (
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => handleApprove(co)}
                                                    className="rounded bg-[#2B4C8C] px-2 py-1 text-[10px] font-medium text-white hover:bg-[#3b5d9c]"
                                                >Approve</button>
                                                <button
                                                    onClick={() => handleReject(co)}
                                                    className="rounded border border-[#e2e6ef] px-2 py-1 text-[10px] text-[#6b7280] hover:border-[#c8ccd6]"
                                                >Reject</button>
                                            </div>
                                        )}
                                        {co.status === 'approved' && (
                                            <span className="text-[10px] text-[#10b981]">{formatDate(co.approved_at)}</span>
                                        )}
                                        {co.status === 'rejected' && (
                                            <span className="text-[10px] text-[#ef4444]" title={co.rejection_reason ?? ''}>Rejected</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {changeOrders.data.length === 0 && (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <FileText className="mx-auto mb-3 h-8 w-8 text-[#e2e6ef]" />
                                <p className="text-sm text-[#6b7280]">No change orders yet</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
