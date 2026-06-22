import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, FileText, Mail, Printer, GitBranch } from 'lucide-react';

interface QuotationItem {
    id: number;
    product_name: string;
    description: string | null;
    quantity: number;
    unit_price: number;
    discount_percent: number;
    net_price: number;
    total: number;
    sort_order: number;
}

interface VersionSummary {
    id: number;
    version: number;
    parent_id: number | null;
    status: string;
    subtotal: number;
    grand_total: number;
    created_at: string;
    created_by: { id: number; name: string } | null;
}

interface Quotation {
    id: number;
    version: number;
    parent_id: number | null;
    status: string;
    subtotal: number;
    discount_total: number;
    tax_rate: number;
    tax_total: number;
    grand_total: number;
    payment_terms: string | null;
    valid_until: string | null;
    viewed_at: string | null;
    notes: string | null;
    created_at: string;
    created_by: { id: number; name: string } | null;
    deal: { id: number; title: string; organization: { name: string } | null };
    items: QuotationItem[];
}

interface Props {
    quotation: Quotation;
    previousVersions: VersionSummary[];
}

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
}

const statusColors: Record<string, string> = {
    draft: 'text-[#555570] bg-[#1a1a24]',
    internal_review: 'text-[#fbbf24] bg-[#fbbf24]/10',
    sent: 'text-[#3b6cdb] bg-[#3b6cdb]/10',
    viewed: 'text-[#34d399] bg-[#34d399]/10',
    accepted: 'text-[#34d399] bg-[#34d399]/10',
    rejected: 'text-[#f87171] bg-[#f87171]/10',
    expired: 'text-[#8b8b9e] bg-[#8b8b9e]/10',
};

const statusBadgeColors: Record<string, string> = {
    draft: 'bg-[#1a1a24] text-[#555570] border-[#1e1e2a]',
    internal_review: 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20',
    sent: 'bg-[#3b6cdb]/10 text-[#3b6cdb] border-[#3b6cdb]/20',
    viewed: 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20',
    accepted: 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20',
    rejected: 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20',
    expired: 'bg-[#8b8b9e]/10 text-[#8b8b9e] border-[#8b8b9e]/20',
};

export default function QuotationShow({ quotation, previousVersions }: Props) {
    const handleStatusChange = (status: string) => {
        router.patch(`/crm/quotations/${quotation.id}`, { status }, { preserveScroll: true, preserveState: true });
    };

    const handleClone = () => {
        router.post(`/crm/quotations/${quotation.id}/clone`, {}, { preserveScroll: true });
    };

    const orgName = quotation.deal.organization?.name ?? '';

    const sortedVersions = [...previousVersions].sort((a, b) => b.version - a.version);

    return (
        <>
            <Head title={`Quote v${quotation.version} · ${quotation.deal.title}`} />

            <div className="mx-auto flex h-full max-w-5xl flex-col">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-2.5">
                    <div className="flex items-center gap-3">
                        <Link href={`/crm/deals/${quotation.deal.id}`} className="flex h-7 w-7 items-center justify-center rounded text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <Link href={`/crm/deals/${quotation.deal.id}`} className="text-[#555570] hover:text-[#8b8b9e]">{quotation.deal.title}</Link>
                            <span className="text-[#555570]">/</span>
                            <span className="text-[#e8e8ed]">Quote v{quotation.version}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={handleClone} className="rounded border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1 text-[11px] text-[#8b8b9e] transition-colors hover:border-[#2a2a3a] hover:text-[#e8e8ed]">
                            <GitBranch className="mr-1 inline h-3 w-3" />New Version
                        </button>
                        <button className="rounded border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1 text-[11px] text-[#8b8b9e] transition-colors hover:border-[#2a2a3a] hover:text-[#e8e8ed]">
                            <Printer className="h-3 w-3" />
                        </button>
                        {['sent', 'internal_review'].includes(quotation.status) && (
                            <a href={`mailto:?subject=Quote v${quotation.version} - ${quotation.deal.title}&body=View quote: ${window.location.href}`}
                                className="rounded border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1 text-[11px] text-[#8b8b9e] transition-colors hover:border-[#2a2a3a] hover:text-[#e8e8ed]"
                            >
                                <Mail className="h-3 w-3" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Status actions */}
                <div className="flex items-center gap-2 border-b border-[#1e1e2a] px-6 py-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[quotation.status] ?? statusColors.draft}`}>
                        {quotation.status.replace(/_/g, ' ')}
                    </span>
                    {quotation.status === 'draft' && (
                        <>
                            <button onClick={() => handleStatusChange('internal_review')} className="rounded border border-[#1e1e2a] bg-[#0f0f14] px-2 py-0.5 text-[10px] text-[#8b8b9e] hover:border-[#2a2a3a]">Send for Review</button>
                            <button onClick={() => handleStatusChange('sent')} className="rounded bg-[#2B4C8C] px-2 py-0.5 text-[10px] text-white hover:bg-[#3b5d9c]">Send to Customer</button>
                        </>
                    )}
                    {quotation.status === 'internal_review' && (
                        <button onClick={() => handleStatusChange('sent')} className="rounded bg-[#2B4C8C] px-2 py-0.5 text-[10px] text-white hover:bg-[#3b5d9c]">Send to Customer</button>
                    )}
                    {quotation.status === 'sent' && (
                        <>
                            <button onClick={() => handleStatusChange('accepted')} className="rounded bg-[#34d399] px-2 py-0.5 text-[10px] text-[#0a0a0f] hover:bg-[#4be3ad]">Accept</button>
                            <button onClick={() => handleStatusChange('rejected')} className="rounded border border-[#f87171] px-2 py-0.5 text-[10px] text-[#f87171] hover:bg-[#f87171]/10">Reject</button>
                        </>
                    )}
                    <div className="ml-auto text-[10px] text-[#555570]">
                        Created {new Date(quotation.created_at).toLocaleDateString()}
                        {quotation.created_by && <> by {quotation.created_by.name}</>}
                    </div>
                </div>

                {/* Content: Document + Version Timeline */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Document body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Header */}
                        <div className="mb-6 border-b border-[#1e1e2a] pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-lg font-medium text-[#e8e8ed]">Quote #{quotation.id}</h1>
                                    <p className="text-xs text-[#555570]">Version {quotation.version}</p>
                                    <p className="text-xs text-[#555570]">{orgName}</p>
                                </div>
                                <div className="text-right text-xs text-[#555570]">
                                    {quotation.valid_until && <p>Valid until: {new Date(quotation.valid_until).toLocaleDateString()}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Items table */}
                        <table className="mb-6 w-full text-xs">
                            <thead>
                                <tr className="border-b border-[#1e1e2a] text-[10px] uppercase tracking-wider text-[#555570]">
                                    <th className="pb-2 text-left font-medium">Item</th>
                                    <th className="pb-2 text-right font-medium">Qty</th>
                                    <th className="pb-2 text-right font-medium">Unit Price</th>
                                    <th className="pb-2 text-right font-medium">Disc %</th>
                                    <th className="pb-2 text-right font-medium">Net</th>
                                    <th className="pb-2 text-right font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotation.items.map(item => (
                                    <tr key={item.id} className="border-b border-[#1e1e2a]/50">
                                        <td className="py-2 pr-4">
                                            <div className="text-[#e8e8ed]">{item.product_name}</div>
                                            {item.description && <div className="text-[10px] text-[#555570]">{item.description}</div>}
                                        </td>
                                        <td className="py-2 text-right text-[#8b8b9e]">{item.quantity}</td>
                                        <td className="py-2 text-right text-[#8b8b9e]">{formatCurrency(item.unit_price)}</td>
                                        <td className="py-2 text-right text-[#8b8b9e]">{item.discount_percent > 0 ? `${item.discount_percent}%` : '-'}</td>
                                        <td className="py-2 text-right text-[#8b8b9e]">{formatCurrency(item.net_price)}</td>
                                        <td className="py-2 text-right font-medium text-[#e8e8ed]">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="mb-6 ml-auto w-64 space-y-1 border-t border-[#1e1e2a] pt-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-[#555570]">Subtotal</span>
                                <span className="text-[#8b8b9e]">{formatCurrency(quotation.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-[#555570]">Discount</span>
                                <span className="text-[#8b8b9e]">-{formatCurrency(quotation.discount_total)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-[#555570]">Tax ({quotation.tax_rate}%)</span>
                                <span className="text-[#8b8b9e]">{formatCurrency(quotation.tax_total)}</span>
                            </div>
                            <div className="flex justify-between border-t border-[#1e1e2a] pt-1.5 text-sm font-semibold text-[#e8e8ed]">
                                <span>Total</span>
                                <span>{formatCurrency(quotation.grand_total)}</span>
                            </div>
                        </div>

                        {/* Terms */}
                        {(quotation.payment_terms || quotation.notes) && (
                            <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                                {quotation.payment_terms && (
                                    <div className="mb-3">
                                        <h3 className="mb-1 text-[10px] font-medium uppercase text-[#555570]">Payment Terms</h3>
                                        <p className="text-xs text-[#8b8b9e]">{quotation.payment_terms}</p>
                                    </div>
                                )}
                                {quotation.notes && (
                                    <div>
                                        <h3 className="mb-1 text-[10px] font-medium uppercase text-[#555570]">Notes</h3>
                                        <p className="text-xs text-[#8b8b9e]">{quotation.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Version Timeline — right rail */}
                    <div className="w-64 border-l border-[#1e1e2a] overflow-y-auto p-4">
                        <div className="mb-3 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[#555570]">
                            <GitBranch className="h-3 w-3" />
                            Version History
                        </div>
                        <div className="relative space-y-0">
                            {/* Timeline line */}
                            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#1e1e2a]" />
                            {sortedVersions.map((v, idx) => {
                                const isCurrent = v.id === quotation.id;
                                const isFirst = idx === 0;
                                return (
                                    <Link
                                        key={v.id}
                                        href={`/crm/quotations/${v.id}`}
                                        className={`relative flex items-start gap-3 py-2.5 transition-colors hover:opacity-90 ${isCurrent ? '' : 'opacity-60 hover:opacity-100'}`}
                                    >
                                        {/* Timeline dot */}
                                        <div className={`relative z-10 mt-0.5 h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 flex items-center justify-center ${isCurrent ? 'border-[#3b6cdb] bg-[#3b6cdb]/20' : 'border-[#1e1e2a] bg-[#0f0f14]'}`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${isCurrent ? 'bg-[#3b6cdb]' : 'bg-[#555570]'}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-xs font-medium ${isCurrent ? 'text-[#e8e8ed]' : 'text-[#8b8b9e]'}`}>
                                                    v{v.version}
                                                </span>
                                                {v.parent_id && !isFirst && (
                                                    <span className="text-[9px] text-[#555570]">← v{v.version - 1}</span>
                                                )}
                                            </div>
                                            <span className={`mt-0.5 inline-block rounded px-1 py-[1px] text-[9px] font-medium capitalize ${statusBadgeColors[v.status] ?? 'bg-[#1a1a24] text-[#555570] border border-[#1e1e2a]'}`}>
                                                {v.status.replace(/_/g, ' ')}
                                            </span>
                                            <div className="mt-0.5 text-[9px] text-[#555570]">
                                                {formatCurrency(v.grand_total)}
                                            </div>
                                            <div className="text-[9px] text-[#555570]">
                                                {new Date(v.created_at).toLocaleDateString()}
                                                {v.created_by && <> · {v.created_by.name}</>}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
