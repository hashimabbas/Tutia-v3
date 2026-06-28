import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Flag,
    Plus,
    CalendarDays,
    User,
    CheckCircle2,
    RotateCcw,
    Trash2,
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
    status: string;
}

interface Milestone {
    id: number;
    name: string;
    description: string | null;
    status: string;
    start_date: string | null;
    end_date: string | null;
    actual_end_date: string | null;
    sort_order: number;
    owner: Owner | null;
    deliverables: Deliverable[];
}

interface Project {
    id: number;
    name: string;
    status: string;
    organization: { id: number; name: string } | null;
}

interface Props {
    project: Project;
    milestones: { data: Milestone[]; meta: any };
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
    in_progress: { label: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
    completed: { label: 'Completed', color: '#10b981', bg: '#ecfdf5' },
};

const statusOption = [
    { value: '', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

export default function MilestonesIndex({ project, milestones, filters }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formStartDate, setFormStartDate] = useState('');
    const [formEndDate, setFormEndDate] = useState('');
    const [formOwnerId, setFormOwnerId] = useState('');
    const [saving, setSaving] = useState(false);

    const applyFilter = (key: string, val: string) => {
        router.get(
            `/crm/projects/${project.id}/milestones`,
            { ...filters, [key]: val || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) return;
        setSaving(true);
        router.post(
            `/crm/projects/${project.id}/milestones`,
            {
                name: formName,
                description: formDescription,
                start_date: formStartDate || undefined,
                end_date: formEndDate || undefined,
                owner_id: formOwnerId || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setShowCreate(false);
                    setFormName('');
                    setFormDescription('');
                    setFormStartDate('');
                    setFormEndDate('');
                    setFormOwnerId('');
                    setSaving(false);
                },
                onError: () => setSaving(false),
            },
        );
    };

    const handleComplete = (ms: Milestone) => {
        router.post(
            `/crm/projects/${project.id}/milestones/${ms.id}/complete`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleReopen = (ms: Milestone) => {
        router.post(
            `/crm/projects/${project.id}/milestones/${ms.id}/reopen`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleDelete = (ms: Milestone) => {
        if (!confirm(`Delete milestone "${ms.name}"? This cannot be undone.`)) return;
        router.delete(
            `/crm/projects/${project.id}/milestones/${ms.id}`,
            { preserveScroll: true, preserveState: true },
        );
    };

    const pendingCount = milestones.data.filter((m) => m.status === 'pending').length;
    const inProgressCount = milestones.data.filter((m) => m.status === 'in_progress').length;
    const completedCount = milestones.data.filter((m) => m.status === 'completed').length;

    return (
        <>
            <Head title={`CRM · Milestones · ${project.name}`} />

            <div className="flex h-full flex-col">
                <div className="z-10 flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 px-6 py-2.5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/crm/projects/${project.id}`}
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
                            <span className="text-[#1a1a2e]">Milestones</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ProjectStatusBadge status={project.status} />
                        <Dialog open={showCreate} onOpenChange={setShowCreate}>
                            <DialogTrigger asChild>
                                <button className="flex items-center gap-1.5 rounded-md bg-[#2B4C8C] px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#3b5d9c]">
                                    <Plus className="h-3.5 w-3.5" />
                                    New Milestone
                                </button>
                            </DialogTrigger>
                            <DialogContent className="border-[#e2e6ef] bg-white text-[#1a1a2e]">
                                <DialogHeader>
                                    <DialogTitle className="text-sm font-medium text-[#1a1a2e]">
                                        New Milestone
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
                                            placeholder="e.g. Foundation phase"
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
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formStartDate}
                                                onChange={(e) => setFormStartDate(e.target.value)}
                                                className="w-full rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] outline-none focus:border-[#2B4C8C]"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[11px] text-[#6b7280]">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formEndDate}
                                                onChange={(e) => setFormEndDate(e.target.value)}
                                                className="w-full rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] outline-none focus:border-[#2B4C8C]"
                                            />
                                        </div>
                                    </div>
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
                        <div className="text-[10px] text-[#6b7280]">Pending</div>
                        <div className="text-sm font-semibold text-[#6b7280]">{pendingCount}</div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">In Progress</div>
                        <div className="text-sm font-semibold text-[#f59e0b]">{inProgressCount}</div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Completed</div>
                        <div className="text-sm font-semibold text-[#10b981]">{completedCount}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 border-b border-[#e2e6ef] px-6 py-2.5">
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter('status', e.target.value)}
                        className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                    >
                        {statusOption.map((opt) => (
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
                                <th className="px-6 py-2.5 text-left">Milestone</th>
                                <th className="px-4 py-2.5 text-left">Status</th>
                                <th className="px-4 py-2.5 text-left">Dates</th>
                                <th className="px-4 py-2.5 text-left">Owner</th>
                                <th className="px-4 py-2.5 text-center">Deliverables</th>
                                <th className="px-4 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-[#1a1a2e]">
                            {milestones.data.map((ms) => {
                                const st = statusStyles[ms.status] ?? statusStyles.pending;
                                const deliverableCounts = {
                                    total: ms.deliverables.length,
                                    completed: ms.deliverables.filter((d) => d.status === 'completed').length,
                                };
                                return (
                                    <tr
                                        key={ms.id}
                                        className="border-b border-[#e2e6ef] hover:bg-[#f8f9fc]"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <Flag className="h-3.5 w-3.5 text-[#6b7280]" />
                                                <div>
                                                    <div className="font-medium text-[#1a1a2e]">
                                                        {ms.name}
                                                    </div>
                                                    {ms.description && (
                                                        <div className="mt-0.5 text-[10px] text-[#6b7280] line-clamp-1">
                                                            {ms.description}
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
                                                <span>
                                                    {formatDate(ms.start_date)}
                                                    {' — '}
                                                    {formatDate(ms.end_date)}
                                                </span>
                                            </div>
                                            {ms.actual_end_date && (
                                                <div className="mt-0.5 text-[10px] text-[#10b981]">
                                                    Completed {formatDate(ms.actual_end_date)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-[#6b7280]">
                                            {ms.owner ? (
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    <span>{ms.owner.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[#c8ccd6]">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link
                                                href={`/crm/projects/${project.id}/milestones/${ms.id}/deliverables`}
                                                className="text-[#2B4C8C] hover:underline"
                                            >
                                                {deliverableCounts.completed}/{deliverableCounts.total}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                {ms.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleComplete(ms)}
                                                        className="flex items-center gap-1 rounded bg-[#10b981] px-2 py-1 text-[10px] font-medium text-white hover:bg-[#059669]"
                                                        title="Mark complete"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Complete
                                                    </button>
                                                )}
                                                {ms.status === 'completed' && (
                                                    <button
                                                        onClick={() => handleReopen(ms)}
                                                        className="flex items-center gap-1 rounded border border-[#e2e6ef] px-2 py-1 text-[10px] text-[#6b7280] hover:border-[#c8ccd6]"
                                                        title="Reopen"
                                                    >
                                                        <RotateCcw className="h-3 w-3" />
                                                        Reopen
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(ms)}
                                                    className="flex items-center gap-1 rounded border border-[#e2e6ef] px-2 py-1 text-[10px] text-[#ef4444] hover:border-[#fca5a5]"
                                                    title="Delete"
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

                    {milestones.data.length === 0 && (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <Flag className="mx-auto mb-3 h-8 w-8 text-[#e2e6ef]" />
                                <p className="text-sm text-[#6b7280]">
                                    No milestones yet
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
