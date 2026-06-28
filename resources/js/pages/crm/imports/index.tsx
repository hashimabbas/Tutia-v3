import { Head, Link, router } from '@inertiajs/react';
import { Upload, ArrowLeft, CheckCircle2, XCircle, Loader2, FileText } from 'lucide-react';
import { useState } from 'react';

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
    imports: { data: CrmImport[]; meta: any };
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

export default function ImportsIndex({ imports }: Props) {
    const [showImport, setShowImport] = useState(false);
    const [entityType, setEntityType] = useState('organizations');
    const [rowsText, setRowsText] = useState('');
    const [saving, setSaving] = useState(false);

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rowsText.trim()) return;
        setSaving(true);

        const lines = rowsText.trim().split('\n');
        const rows = lines.map((line) => {
            const parts = line.split(',').map((s) => s.trim());
            if (entityType === 'contacts') {
                return {
                    first_name: parts[0] ?? '',
                    last_name: parts[1] ?? '',
                    email: parts[2] ?? null,
                    phone: parts[3] ?? null,
                    organization_name: parts[4] ?? null,
                };
            }
            return {
                name: parts[0] ?? '',
                email: parts[1] ?? null,
                phone: parts[2] ?? null,
                domain: parts[3] ?? null,
                industry: parts[4] ?? null,
            };
        });

        router.post(
            '/crm/imports',
            { entity_type: entityType, rows },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setShowImport(false);
                    setRowsText('');
                    setSaving(false);
                },
                onError: () => setSaving(false),
            },
        );
    };

    return (
        <>
            <Head title="CRM · Imports" />

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
                            <span className="text-[#1a1a2e]">Imports</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowImport(true)}
                        className="flex items-center gap-1.5 rounded-md bg-[#2B4C8C] px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#3b5d9c]"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        New Import
                    </button>
                </div>

                {/* Inline import form */}
                {showImport && (
                    <div className="border-b border-[#e2e6ef] bg-[#f8f9fc] px-6 py-4">
                        <form onSubmit={handleImport} className="space-y-3">
                            <div>
                                <label className="mb-1 block text-[11px] text-[#6b7280]">Entity Type</label>
                                <select
                                    value={entityType}
                                    onChange={(e) => setEntityType(e.target.value)}
                                    className="rounded-md border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#6b7280] outline-none focus:border-[#2B4C8C]"
                                >
                                    <option value="organizations">Organizations</option>
                                    <option value="contacts">Contacts</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] text-[#6b7280]">
                                    Data (one row per line, comma-separated)
                                </label>
                                <textarea
                                    value={rowsText}
                                    onChange={(e) => setRowsText(e.target.value)}
                                    className="w-full resize-none rounded border border-[#e2e6ef] bg-white px-2.5 py-1.5 text-xs text-[#1a1a2e] placeholder-[#6b7280] outline-none focus:border-[#2B4C8C]"
                                    rows={5}
                                    placeholder={entityType === 'contacts' ? 'John,Doe,john@example.com,+1234567890,Acme Inc' : 'Acme Inc,info@acme.com,+1234567890,acme.com,Technology'}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded bg-[#2B4C8C] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#3b5d9c] disabled:opacity-50"
                                >
                                    {saving ? 'Importing...' : 'Import'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowImport(false); setRowsText(''); }}
                                    className="rounded border border-[#e2e6ef] px-3 py-1.5 text-[11px] text-[#6b7280] hover:border-[#c8ccd6]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-3 gap-px border-b border-[#e2e6ef] bg-[#e2e6ef]">
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Total</div>
                        <div className="text-sm font-semibold text-[#1a1a2e]">{imports.data.length}</div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Completed</div>
                        <div className="text-sm font-semibold text-[#10b981]">
                            {imports.data.filter((i) => i.status === 'completed').length}
                        </div>
                    </div>
                    <div className="bg-white px-4 py-3">
                        <div className="text-[10px] text-[#6b7280]">Failed</div>
                        <div className="text-sm font-semibold text-[#ef4444]">
                            {imports.data.filter((i) => i.status === 'failed').length}
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto">
                    {imports.data.length === 0 ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <Upload className="mx-auto mb-3 h-8 w-8 text-[#e2e6ef]" />
                                <p className="text-sm text-[#6b7280]">No imports yet</p>
                                <button
                                    onClick={() => setShowImport(true)}
                                    className="mt-2 text-[11px] font-medium text-[#2B4C8C] hover:text-[#2B4C8C]/80"
                                >
                                    Import your first data
                                </button>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#e2e6ef] text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                                    <th className="px-6 py-2.5 text-left">Import</th>
                                    <th className="px-4 py-2.5 text-left">Entity</th>
                                    <th className="px-4 py-2.5 text-left">Status</th>
                                    <th className="px-4 py-2.5 text-right">Rows</th>
                                    <th className="px-4 py-2.5 text-left">By</th>
                                    <th className="px-4 py-2.5 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-[#1a1a2e]">
                                {imports.data.map((imp) => {
                                    const st = statusStyles[imp.status] ?? statusStyles.pending;
                                    return (
                                        <tr
                                            key={imp.id}
                                            className="border-b border-[#e2e6ef] hover:bg-[#f8f9fc]"
                                        >
                                            <td className="px-6 py-3">
                                                <Link
                                                    href={`/crm/imports/${imp.id}`}
                                                    className="flex items-center gap-2 text-[#2B4C8C] hover:underline"
                                                >
                                                    <FileText className="h-3.5 w-3.5 text-[#6b7280]" />
                                                    <span className="font-medium">{imp.filename}</span>
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 capitalize text-[#6b7280]">
                                                {imp.entity_type}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                                    style={{ color: st.color, backgroundColor: st.bg }}
                                                >
                                                    {imp.status === 'completed' && <CheckCircle2 className="h-2.5 w-2.5" />}
                                                    {imp.status === 'failed' && <XCircle className="h-2.5 w-2.5" />}
                                                    {imp.status === 'processing' && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-[#6b7280]">
                                                {imp.processed_rows}/{imp.total_rows}
                                                {imp.failed_rows > 0 && (
                                                    <span className="ml-1 text-[#ef4444]">({imp.failed_rows} failed)</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-[#6b7280]">
                                                {imp.user?.name ?? '-'}
                                            </td>
                                            <td className="px-4 py-3 text-[#6b7280]">
                                                {formatDate(imp.created_at)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}
