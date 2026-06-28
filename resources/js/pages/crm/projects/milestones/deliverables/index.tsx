import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    Plus,
    CalendarDays,
    User,
    CheckCircle2,
    ThumbsUp,
    Trash2,
    Eye,
} from 'lucide-react';
import ProjectStatusBadge from '@/components/crm/project-status-badge';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

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
    acceptance_criteria: string | null;
    is_visible_to_customer: boolean;
    customer_approved_at: string | null;
    owner: Owner | null;
}

interface Milestone {
    id: number;
    name: string;
    status: string;
}

interface Project {
    id: number;
    name: string;
    status: string;
    organization: { id: number; name: string } | null;
}

interface Props {
    project: Project;
    milestone: Milestone;
    deliverables: { data: Deliverable[]; meta: any };
    filters: Record<string, string | undefined>;
}

function formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: '#6b7280', bg: '#f3f4f6' },
    completed: { label: 'Completed', color: '#10b981', bg: '#ecfdf5' },
    approved: { label: 'Approved', color: '#2B4C8C', bg: '#eef2f9' },
};

const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'approved', label: 'Approved' },
];

export default function DeliverablesIndex({ project, milestone, deliverables, filters }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formDueDate, setFormDueDate] = useState('');
    const [formOwnerId, setFormOwnerId] = useState('');
    const [formAcceptanceCriteria, setFormAcceptanceCriteria] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    const applyFilter = (key: string, val: string) => {
        router.get(
            `/crm/projects/${project.id}/milestones/${milestone.id}/deliverables`,
            { ...filters, [key]: val || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) return;
        setSaving(true);
        router.post(
            `/crm/projects/${project.id}/milestones/${milestone.id}/deliverables`,
            {
                name: formName,
                description: formDescription,
                due_date: formDueDate || undefined,
                owner_id: formOwnerId || undefined,
                acceptance_criteria: formAcceptanceCriteria || undefined,
                is_visible_to_customer: formVisible,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setShowCreate(false);
                    setFormName('');
                    setFormDescription('');
                    setFormDueDate('');
                    setFormOwnerId('');
                    setFormAcceptanceCriteria('');
                    setFormVisible(false);
                    setSaving(false);
                },
                onError: () => setSaving(false),
            },
        );
    };

    const handleComplete = (d: Deliverable) => {
        router.post(
            `/crm/projects/${project.id}/milestones/${milestone.id}/deliverables/${d.id}/complete`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleApprove = (d: Deliverable) => {
        router.post(
            `/crm/projects/${project.id}/milestones/${milestone.id}/deliverables/${d.id}/approve`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleDelete = (d: Deliverable) => {
        if (!confirm(`Delete deliverable "${d.name}"? This cannot be undone.`)) return;
        router.delete(
            `/crm/projects/${project.id}/milestones/${milestone.id}/deliverables/${d.id}`,
            { preserveScroll: true, preserveState: true },
        );
    };

    const isCustomerVisible = milestone.status === 'completed' || milestone.status === 'approved';

    return (
        <>
            <Head title={`CRM · Deliverables · ${project.name}`} />

            <div className="flex h-full flex-col">
                <div className="z-10 flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 px-6 py-2.5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/crm/projects/${project.id}/milestones`}
                            className="flex h-7 w-7 items-center justify-center rounded text-[#6b7280] transition-colors hover:bg-[#f8f9fc] hover:text-[#1a1a2e]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <Link
                                href={`/crm/projects/${project.id}`}
                                className="text-[#6b7280] hover:text-[#1a1a2e]"
                            >
                                {project.name}
                            </Link>
                            <span className="text-[#6b7280]">/</span>
                            <Link
                                href={`/crm/projects/${project.id}/milestones`}
                                className="text-[#6b7280] hover:text-[#1a1a2e]"
                            >
                                Milestones
                            </Link>
                            <span className="text-[#6b7280]">/</span>
                            <span className="text-[#1a1a2e]">{milestone.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ProjectStatusBadge status={project.status} />
                        <Dialog open={showCreate} onOpenChange={setShowCreate}>
                            <DialogTrigger asChild>
                                <button className="flex items-center gap-1.5 rounded-md bg-[#2B4C8C] px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#3b5d9c]">
                                    <Plus className="h-3.5 w-3.5" />
                                    New Deliverable
                                </button>
                            </DialogTrigger>
                            <DialogContent className="border-[#e2e6ef] bg-white text-[#1a1a2e]">
                                <DialogHeader>
                                    <DialogTitle className="text-sm font-medium text-[#1a1a2e]">
                                        New Deliverable
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-3">
                                    <div>
                                        <label className="mb-1 block text-[11px] text-[#6b7280]">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            className="w-full rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] placeholder-[#6b7280] outline-none focus:border-[#2B4C8C]"
                                            placeholder="e.g. Site inspection report"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] text-[#6b7280]">
                                            Description
                                        </label>
                                        <textarea
                                            value={formDescription}
                                            onChange={(e) => setFormDescription(e.target.value)}
                                            className="w-full resize-none rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] placeholder-[#6b7280] outline-none focus:border-[#2B4C8C]"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-[11px] text-[#6b7280]">
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formDueDate}
                                                onChange={(e) => setFormDueDate(e.target.value)}
                                                className="w-full rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] outline-none focus:border-[#2B4C8C]"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[11px] text-[#6b7280]">
                                                Owner
                                            </label>
                                            <input
                                                type="text"
                                                value={formOwnerId}
                                                onChange={(e) => setFormOwnerId(e.target.value)}
                                                className="w-full rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] placeholder-[#6b7280] outline-none focus:border-[#2B4C8C]"
                                                placeholder="User ID"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] text-[#6b7280]">
                                            Acceptance Criteria
                                        </label>
                                        <textarea
                                            value={formAcceptanceCriteria}
                                            onChange={(e) => setFormAcceptanceCriteria(e.target.value)}
                                            className="w-full resize-none rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] placeholder-[#6b7280] outline-none focus:border-[#2B4C8C]"
                                            rows={2}
                                        />
                                    </div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formVisible}
                                            onChange={(e) => setFormVisible(e.target.checked)}
                                            className="rounded border-[#e2e6ef] text-[#2B4C8C] focus:ring-[#2B4C8C]"
                                        />
                                        <span className="text-[11px] text-[#6b7280]">
                                            Visible to customer
                                        </span>
                                    </label>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreate(false)}
                                            className="rounded border border-[#e2e6ef] px-3 py-1.5 text-[11px] text-[#6b7280] hover:border-[#c8ccd6]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="rounded bg-[#2B4C8C] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#3b5d9c] disabled:opacity-50"
                                        >
                                            {saving ? 'Creating...' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Summary bar */}
                <div className="grid grid-cols-3 gap-px border-b border-[#e2e6ef] bg-[#e2e6ef]">
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Total</div>
                        <div className="text-sm font-semibold text-[#1a1a2e]">{deliverables.data.length}</div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Completed</div>
                        <div className="text-sm font-semibold text-[#10b981]">
                            {deliverables.data.filter((d) => d.status === 'completed').length}
                        </div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Approved</div>
                        <div className="text-sm font-semibold text-[#2B4C8C]">
                            {deliverables.data.filter((d) => d.status === 'approved').length}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 border-b border-[#e2e6ef] px-6 py-2.5">
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter('status', e.target.value)}
                        className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#e2e6ef] text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                                <th className="px-6 py-2.5 text-left">Deliverable</th>
                                <th className="px-4 py-2.5 text-left">Status</th>
                                <th className="px-4 py-2.5 text-left">Due Date</th>
                                <th className="px-4 py-2.5 text-left">Owner</th>
                                <th className="px-4 py-2.5 text-center">Customer</th>
                                <th className="px-4 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-[#1a1a2e]">
                            {deliverables.data.map((d) => {
                                const st = statusStyles[d.status] ?? statusStyles.pending;
                                return (
                                    <tr
                                        key={d.id}
                                        className="border-b border-[#e2e6ef] hover:bg-[#f8f9fc]"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-3.5 w-3.5 text-[#6b7280]" />
                                                <div>
                                                    <div className="font-medium text-[#1a1a2e]">
                                                        {d.name}
                                                    </div>
                                                    {d.description && (
                                                        <div className="mt-0.5 text-[10px] text-[#6b7280] line-clamp-1">
                                                            {d.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                                                style={{ color: st.color, backgroundColor: st.bg }}
                                            >
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[#6b7280]">
                                            <div className="flex items-center gap-1">
                                                <CalendarDays className="h-3 w-3" />
                                                <span>{formatDate(d.due_date)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[#6b7280]">
                                            {d.owner ? (
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    <span>{d.owner.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[#c8ccd6]">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {d.is_visible_to_customer ? (
                                                    <>
                                                        <Eye className="h-3 w-3 text-[#6b7280]" />
                                                        <span className="text-[10px] text-[#6b7280]">
                                                            {d.customer_approved_at ? 'Approved' : 'Visible'}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] text-[#c8ccd6]">Hidden</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                {d.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleComplete(d)}
                                                        className="flex items-center gap-1 rounded bg-[#10b981] px-2 py-1 text-[10px] font-medium text-white hover:bg-[#059669]"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Complete
                                                    </button>
                                                )}
                                                {d.status === 'completed' && (
                                                    <button
                                                        onClick={() => handleApprove(d)}
                                                        className="flex items-center gap-1 rounded bg-[#2B4C8C] px-2 py-1 text-[10px] font-medium text-white hover:bg-[#3b5d9c]"
                                                    >
                                                        <ThumbsUp className="h-3 w-3" />
                                                        Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(d)}
                                                    className="flex items-center gap-1 rounded border border-[#e2e6ef] px-2 py-1 text-[10px] text-[#ef4444] hover:border-[#fca5a5]"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {deliverables.data.length === 0 && (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <Package className="mx-auto mb-3 h-8 w-8 text-[#e2e6ef]" />
                                <p className="text-sm text-[#6b7280]">
                                    No deliverables yet
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
