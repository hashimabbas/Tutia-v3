import { Head } from '@inertiajs/react';
import { Package, Search } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';

interface Product {
    id: number;
    name: string;
    description: string | null;
    category: string;
    type: string;
    unit_price: number;
    unit_type: string;
    version: number;
    is_active: boolean;
    created_at: string;
}

interface Props {
    products: Record<string, Product[]>;
}

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
}

const categoryLabels: Record<string, string> = {
    erp: 'ERP',
    connectivity: 'Connectivity',
    vpn: 'VPN',
    bulk_sms: 'Bulk SMS',
    payment_gateway: 'Payment Gateway',
    custom_development: 'Custom Development',
    consulting: 'Consulting',
};

const typeColors: Record<string, string> = {
    product: '#3b6cdb',
    service: '#34d399',
    subscription: '#fbbf24',
    package: '#a78bfa',
};

export default function ProductIndex({ products }: Props) {
    const [search, setSearch] = useState('');

    const filtered = Object.entries(products).reduce<Record<string, Product[]>>((acc, [cat, items]) => {
        const filtered = items.filter(p =>
            !search || p.name.toLowerCase().includes(search.toLowerCase())
        );
        if (filtered.length > 0) acc[cat] = filtered;
        return acc;
    }, {});

    const handleAddToDeal = (product: Product) => {
        // In a full implementation, opens a modal to select deal + configure qty
        router.post('/crm/deals/1/quotations', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="CRM · Products" />
            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#1e1e2a] px-6 py-3">
                    <h1 className="text-base font-medium text-[#e8e8ed]">Product Catalog</h1>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555570]" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-full rounded-md border border-[#1e1e2a] bg-[#0f0f14] py-1.5 pl-8 pr-3 text-xs text-[#e8e8ed] placeholder-[#555570] outline-none focus:border-[#3b6cdb]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {Object.entries(filtered).map(([category, items]) => (
                        <div key={category} className="mb-6">
                            <h2 className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-[#555570]">
                                {categoryLabels[category] ?? category}
                            </h2>
                            <div className="grid grid-cols-3 gap-2.5">
                                {items.map(p => (
                                    <div
                                        key={p.id}
                                        className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3 transition-colors hover:border-[#2a2a3a]"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Package className="h-3.5 w-3.5 shrink-0 text-[#555570]" />
                                                    <span className="text-xs font-medium text-[#e8e8ed]">{p.name}</span>
                                                </div>
                                                {p.description && <div className="mt-0.5 text-[10px] text-[#555570]">{p.description}</div>}
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className="rounded px-1 py-0.5 text-[9px] font-medium uppercase" style={{ backgroundColor: (typeColors[p.type] ?? '#555570') + '20', color: typeColors[p.type] ?? '#555570' }}>
                                                    {p.type}
                                                </span>
                                                <span className="text-[10px] text-[#555570]">v{p.version}</span>
                                            </div>
                                            <span className="text-xs font-medium text-[#e8e8ed]">{formatCurrency(p.unit_price)}/{p.unit_type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {Object.keys(filtered).length === 0 && (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <Package className="mx-auto mb-3 h-8 w-8 text-[#1e1e2a]" />
                                <p className="text-sm text-[#555570]">No products found</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
