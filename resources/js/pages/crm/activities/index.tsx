import { Head, Link, router } from '@inertiajs/react';
import { Activity, ArrowLeft, CheckCircle2, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
}

interface CrmActivity {
    id: number;
    type: string;
    subject: string;
    description: string | null;
    due_at: string | null;
    completed_at: string | null;
    created_at: string;
    created_by: User | null;
    activitable_type: string;
    activitable_id: number;
}

interface Props {
    activities: { data: CrmActivity[]; meta: any };
    filters: Record<string, string | undefined>;
}

const typeLabels: Record<string, string> = {
    call: 'Call',
    meeting: 'Meeting',
    email: 'Email',
    task: 'Task',
    note: 'Note',
    milestone_created: 'Milestone Created',
    milestone_completed: 'Milestone Completed',
    deliverable_created: 'Deliverable Created',
    deliverable_completed: 'Deliverable Completed',
};

const typeStyles: Record<string, { color: string; bg: string }> = {
    call: { color: '#2B4C8C', bg: '#eef2f9' },
    meeting: { color: '#7c3aed', bg: '#f5f3ff' },
    email: { color: '#0891b2', bg: '#ecfeff' },
    task: { color: '#d97706', bg: '#fffbeb' },
    note: { color: '#6b7280', bg: '#f3f4f6' },
};

function formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatEntity(type: string): string {
    const map: Record<string, string> = {
        crm_lead: 'Lead',
        crm_deal: 'Deal',
        crm_contact: 'Contact',
        crm_organization: 'Organization',
        crm_project: 'Project',
    };
    return map[type] ?? type.replace('crm_', '');
}

export default function ActivitiesIndex({ activities, filters }: Props) {
    const applyFilter = (key: string, val: string) => {
        router.get(
            '/crm/activities',
            { ...filters, [key]: val || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleComplete = (a: CrmActivity) => {
        router.post(
            `/crm/activities/${a.id}/complete`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleDelete = (a: CrmActivity) => {
        if (!confirm(`Delete activity "${a.subject}"?`)) return;
        router.delete(
            `/crm/activities/${a.id}`,
            { preserveScroll: true, preserveState: true },
        );
    };

    const openCount = activities.data.filter((a) => !a.completed_at).length;
    const completedCount = activities.data.filter((a) => a.completed_at).length;

    return (
        <>
            <Head title="CRM · Activities" />

            <div className="flex h-full flex-col">
                <div className="z-10 flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 px-6 py-2.5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/crm"
                            className="flex h-7 w-7 items-center justify-center rounded text-[#6b7280] transition-colors hover:bg-[#f8f9fc] hover:text-[#1a1a2e]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#1a1a2e]">Activities</span>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-px border-b border-[#e2e6ef] bg-[#e2e6ef]">
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Open</div>
                        <div className="text-sm font-semibold text-[#f59e0b]">{openCount}</div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Completed</div>
                        <div className="text-sm font-semibold text-[#10b981]">{completedCount}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 border-b border-[#e2e6ef] px-6 py-2.5">
                    <select
                        value={filters.type ?? ''}
                        onChange={(e) => applyFilter('type', e.target.value)}
                        className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                    >
                        <option value="">All types</option>
                        {Object.entries(typeLabels).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter('status', e.target.value)}
                        className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                    >
                        <option value="">All statuses</option>
                        <option value="open">Open</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto">
                    {activities.data.length === 0 ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <Activity className="mx-auto mb-3 h-8 w-8 text-[#e2e6ef]" />
                                <p className="text-sm text-[#6b7280]">No activities found</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-px">
                            {activities.data.map((a) => {
                                const st = typeStyles[a.type] ?? { color: '#6b7280', bg: '#f3f4f6' };
                                return (
                                    <div
                                        key={a.id}
                                        className="border-b border-[#e2e6ef] px-6 py-3 transition-colors hover:bg-[#f8f9fc]"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                                                        style={{ color: st.color, backgroundColor: st.bg }}
                                                    >
                                                        {typeLabels[a.type] ?? a.type}
                                                    </span>
                                                    <span className="text-xs font-medium text-[#1a1a2e]">
                                                        {a.subject}
                                                    </span>
                                                    {a.completed_at && (
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" />
                                                    )}
                                                </div>
                                                {a.description && (
                                                    <p className="mt-0.5 text-[11px] text-[#6b7280] line-clamp-2">
                                                        {a.description}
                                                    </p>
                                                )}
                                                <div className="mt-1 flex items-center gap-3 text-[10px] text-[#9ca3af]">
                                                    <span>{formatDate(a.created_at)}</span>
                                                    {a.created_by && (
                                                        <span>by {a.created_by.name}</span>
                                                    )}
                                                    <span>{formatEntity(a.activitable_type)} #{a.activitable_id}</span>
                                                    {a.due_at && (
                                                        <span className="flex items-center gap-0.5">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            Due {formatDate(a.due_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                {!a.completed_at && (
                                                    <button
                                                        onClick={() => handleComplete(a)}
                                                        className="flex items-center gap-1 rounded border border-[#e2e6ef] px-2 py-1 text-[10px] text-[#10b981] hover:border-[#10b981]"
                                                        title="Mark complete"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Complete
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(a)}
                                                    className="flex items-center gap-1 rounded border border-[#e2e6ef] px-2 py-1 text-[10px] text-[#ef4444] hover:border-[#fca5a5]"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
