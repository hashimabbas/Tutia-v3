import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import ProjectStatusBadge from '@/components/crm/project-status-badge';

interface User {
    id: number;
    name: string;
}

interface CrmImport {
    id: number;
    entity_type: string;
    filename: string;
    total_rows: number;
    processed_rows: number;
    failed_rows: number;
    status: string;
    errors: string[] | null;
    completed_at: string | null;
    created_at: string;
    user: User | null;
}

interface Props {
    import: CrmImport;
}

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

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb' },
    processing: { label: 'Processing', color: '#2B4C8C', bg: '#eef2f9' },
    completed: { label: 'Completed', color: '#10b981', bg: '#ecfdf5' },
    failed: { label: 'Failed', color: '#ef4444', bg: '#fef2f2' },
};

export default function ImportsShow({ import: imp }: Props) {
    const st = statusStyles[imp.status] ?? statusStyles.pending;

    return (
        <>
            <Head title={`CRM · Import · ${imp.filename}`} />

            <div className="flex h-full flex-col">
                <div className="z-10 flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 px-6 py-2.5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/crm/imports"
                            className="flex h-7 w-7 items-center justify-center rounded text-[#6b7280] transition-colors hover:bg-[#f8f9fc] hover:text-[#1a1a2e]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <Link href="/crm/imports" className="text-[#6b7280] hover:text-[#1a1a2e]">
                                Imports
                            </Link>
                            <span className="text-[#6b7280]">/</span>
                            <span className="text-[#1a1a2e]">{imp.filename}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-px border-b border-[#e2e6ef] bg-[#e2e6ef] md:grid-cols-4">
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Status</div>
                        <span
                            className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ color: st.color, backgroundColor: st.bg }}
                        >
                            {imp.status === 'completed' && <CheckCircle2 className="h-2.5 w-2.5" />}
                            {imp.status === 'failed' && <XCircle className="h-2.5 w-2.5" />}
                            {imp.status === 'processing' && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                            {st.label}
                        </span>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Entity Type</div>
                        <div className="mt-1 text-sm font-semibold capitalize text-[#1a1a2e]">
                            {imp.entity_type}
                        </div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Rows</div>
                        <div className="mt-1 text-sm font-semibold text-[#1a1a2e]">
                            {imp.processed_rows}/{imp.total_rows}
                        </div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Failed</div>
                        <div className="mt-1 text-sm font-semibold text-[#ef4444]">
                            {imp.failed_rows}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="mb-6 grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                                Filename
                            </label>
                            <p className="mt-1 text-sm text-[#1a1a2e]">{imp.filename}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                                Imported By
                            </label>
                            <p className="mt-1 text-sm text-[#1a1a2e]">{imp.user?.name ?? '-'}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                                Created
                            </label>
                            <p className="mt-1 text-sm text-[#1a1a2e]">{formatDate(imp.created_at)}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                                Completed
                            </label>
                            <p className="mt-1 text-sm text-[#1a1a2e]">{formatDate(imp.completed_at)}</p>
                        </div>
                    </div>

                    {imp.errors && imp.errors.length > 0 && (
                        <div>
                            <label className="block text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                                Errors
                            </label>
                            <ul className="mt-1 space-y-1">
                                {imp.errors.map((err, i) => (
                                    <li key={i} className="text-xs text-[#ef4444]">
                                        {err}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
