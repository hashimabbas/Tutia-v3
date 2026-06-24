import { Head, Link, router } from '@inertiajs/react';
import {
    Package,
    Search,
    Plus,
    MoreHorizontal,
    Layers,
    Wifi,
    Shield,
    MessageSquare,
    CreditCard,
    Code,
    Briefcase,
    Filter,
    Eye,
    Edit3,
    Trash2,
    X,
    ChevronDown,
    LayoutGrid,
    List,
} from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

interface CategoryStat {
    category: string;
    total: number;
    total_value: number;
}

interface Props {
    products: Record<string, Product[]>;
    categories: CategoryStat[];
}

const categoryConfig: Record<string, { icon: React.ElementType; label: string }> = {
    erp: { icon: Layers, label: 'ERP' },
    connectivity: { icon: Wifi, label: 'Connectivity' },
    vpn: { icon: Shield, label: 'VPN' },
    bulk_sms: { icon: MessageSquare, label: 'Bulk SMS' },
    payment_gateway: { icon: CreditCard, label: 'Payment Gateway' },
    custom_development: { icon: Code, label: 'Custom Development' },
    consulting: { icon: Briefcase, label: 'Consulting' },
};

const typeColors: Record<string, string> = {
    product: 'bg-blue-500/10 text-blue-600 border-blue-200',
    service: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    subscription: 'bg-amber-500/10 text-amber-600 border-amber-200',
    package: 'bg-violet-500/10 text-violet-600 border-violet-200',
};

const typeIcons: Record<string, string> = {
    product: '🔹',
    service: '⚡',
    subscription: '🔄',
    package: '📦',
};

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
}

export default function ProductIndex({ products, categories }: Props) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [view, setView] = useState<'grid' | 'list'>('grid');

    const filtered = Object.entries(products).reduce<Record<string, Product[]>>((acc, [cat, items]) => {
        const filtered = items.filter(p => {
            const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description?.toLowerCase().includes(search.toLowerCase()));
            const matchesType = typeFilter === 'all' || p.type === typeFilter;
            return matchesSearch && matchesType;
        });
        if (filtered.length > 0) acc[cat] = filtered;
        return acc;
    }, {});

    const totalProducts = Object.values(products).reduce((sum, items) => sum + items.length, 0);
    const filteredTotal = Object.values(filtered).reduce((sum, items) => sum + items.length, 0);

    const handleDelete = (product: Product) => {
        router.delete(`/crm/products/${product.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title="CRM · Product Catalog" />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 backdrop-blur-xl px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2B4C8C] to-[#3b6cdb] shadow-sm">
                            <Package className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-[#1a1a2e] tracking-tight">Product Catalog</h1>
                            <p className="text-xs text-[#6b7280]">{totalProducts} products across {Object.keys(products).length} categories</p>
                        </div>
                    </div>
                    <Link href="/crm/products/create">
                        <Button size="sm" className="h-9 gap-2 bg-[#2B4C8C] text-white shadow-sm transition-all hover:bg-[#2B4C8C]/90 hover:shadow-md">
                            <Plus className="h-3.5 w-3.5" />
                            New Product
                        </Button>
                    </Link>
                </div>

                {/* Stats row */}
                <div className="flex gap-3 overflow-x-auto border-b border-[#e2e6ef] bg-white px-6 py-3">
                    {categories.map(cat => {
                        const config = categoryConfig[cat.category] ?? { icon: Package, label: cat.category };
                        const Icon = config.icon;
                        return (
                            <div key={cat.category} className="flex shrink-0 items-center gap-2.5 rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] px-3.5 py-2 shadow-sm">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2B4C8C]/5">
                                    <Icon className="h-3.5 w-3.5 text-[#2B4C8C]" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-[#374151]">{config.label}</p>
                                    <p className="text-[10px] text-[#6b7280]">{cat.total} products</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 border-b border-[#e2e6ef] bg-white px-6 py-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="h-9 w-full rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] pl-9 pr-3 text-xs text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition-all focus:border-[#2B4C8C] focus:ring-[3px] focus:ring-[#2B4C8C]/10"
                        />
                    </div>
                    <div className="w-36">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="h-9 text-xs border-[#e2e6ef]">
                                <Filter className="h-3 w-3 mr-1.5 text-[#9ca3af]" />
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="service">Service</SelectItem>
                                <SelectItem value="subscription">Subscription</SelectItem>
                                <SelectItem value="package">Package</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] p-0.5">
                        <button
                            onClick={() => setView('grid')}
                            className={cn('flex h-7 w-7 items-center justify-center rounded-lg transition-all', view === 'grid' ? 'bg-white text-[#2B4C8C] shadow-sm' : 'text-[#9ca3af] hover:text-[#6b7280]')}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={cn('flex h-7 w-7 items-center justify-center rounded-lg transition-all', view === 'list' ? 'bg-white text-[#2B4C8C] shadow-sm' : 'text-[#9ca3af] hover:text-[#6b7280]')}
                        >
                            <List className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {Object.keys(filtered).length === 0 ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0f2f7]">
                                    <Package className="h-6 w-6 text-[#9ca3af]" />
                                </div>
                                <p className="text-sm font-medium text-[#6b7280]">No products found</p>
                                <p className="mt-1 text-xs text-[#9ca3af]">Try adjusting your search or filter</p>
                            </div>
                        </div>
                    ) : view === 'grid' ? (
                        <div className="space-y-8">
                            {Object.entries(filtered).map(([category, items]) => {
                                const config = categoryConfig[category] ?? { icon: Package, label: category };
                                const Icon = config.icon;
                                return (
                                    <section key={category}>
                                        <div className="mb-3 flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2B4C8C]/5">
                                                <Icon className="h-3.5 w-3.5 text-[#2B4C8C]" />
                                            </div>
                                            <h2 className="text-sm font-semibold text-[#1a1a2e]">{config.label}</h2>
                                            <span className="rounded-md bg-[#f0f2f7] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">{items.length}</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {items.map(p => (
                                                <div
                                                    key={p.id}
                                                    className="group rounded-xl border border-[#e2e6ef] bg-white p-4 shadow-sm transition-all hover:border-[#c8cce0] hover:shadow-md"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0f2f7]">
                                                                <Icon className="h-3.5 w-3.5 text-[#6b7280]" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <Link href={`/crm/products/${p.id}`} className="text-sm font-medium text-[#1a1a2e] hover:text-[#2B4C8C] truncate block">
                                                                    {p.name}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="flex h-6 w-6 items-center justify-center rounded-lg text-[#9ca3af] opacity-0 transition-all hover:bg-[#f0f2f7] hover:text-[#6b7280] group-hover:opacity-100">
                                                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-36 text-xs">
                                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                                    <Link href={`/crm/products/${p.id}`}>
                                                                        <Eye className="mr-2 h-3 w-3" />
                                                                        View
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                                    <Link href={`/crm/products/${p.id}/edit`}>
                                                                        <Edit3 className="mr-2 h-3 w-3" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleDelete(p)} className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50">
                                                                    <Trash2 className="mr-2 h-3 w-3" />
                                                                    Deactivate
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {p.description && (
                                                        <p className="mb-2.5 text-[11px] text-[#6b7280] line-clamp-2 leading-relaxed">{p.description}</p>
                                                    )}

                                                    <div className="flex items-center justify-between pt-2 border-t border-[#f0f2f7]">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={cn('rounded-md border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider', typeColors[p.type] ?? 'bg-gray-500/10 text-gray-600 border-gray-200')}>
                                                                {p.type}
                                                            </span>
                                                            <span className="text-[10px] text-[#9ca3af]">v{p.version}</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-[#1a1a2e]">{formatCurrency(p.unit_price)}<span className="text-[9px] font-normal text-[#9ca3af]">/{p.unit_type}</span></span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    ) : (
                        /* List View */
                        <div className="space-y-6">
                            {Object.entries(filtered).map(([category, items]) => {
                                const config = categoryConfig[category] ?? { icon: Package, label: category };
                                const Icon = config.icon;
                                return (
                                    <section key={category}>
                                        <div className="mb-3 flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2B4C8C]/5">
                                                <Icon className="h-3.5 w-3.5 text-[#2B4C8C]" />
                                            </div>
                                            <h2 className="text-sm font-semibold text-[#1a1a2e]">{config.label}</h2>
                                            <span className="rounded-md bg-[#f0f2f7] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">{items.length}</span>
                                        </div>
                                        <div className="rounded-xl border border-[#e2e6ef] bg-white shadow-sm overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-[#f0f2f7] bg-[#f8f9fc]">
                                                        <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#6b7280] uppercase tracking-wider">Product</th>
                                                        <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#6b7280] uppercase tracking-wider">Type</th>
                                                        <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[#6b7280] uppercase tracking-wider">Version</th>
                                                        <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[#6b7280] uppercase tracking-wider">Price</th>
                                                        <th className="px-4 py-2.5 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map(p => (
                                                        <tr key={p.id} className="border-b border-[#f0f2f7] last:border-0 group hover:bg-[#f8f9fc]">
                                                            <td className="px-4 py-3">
                                                                <Link href={`/crm/products/${p.id}`} className="flex items-center gap-2.5">
                                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f0f2f7]">
                                                                        <Icon className="h-3.5 w-3.5 text-[#6b7280]" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-[#1a1a2e]">{p.name}</p>
                                                                        {p.description && <p className="text-[11px] text-[#6b7280] truncate max-w-xs">{p.description}</p>}
                                                                    </div>
                                                                </Link>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase', typeColors[p.type] ?? '')}>{p.type}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-xs text-[#6b7280]">v{p.version}</td>
                                                            <td className="px-4 py-3 text-right text-sm font-bold text-[#1a1a2e]">{formatCurrency(p.unit_price)}<span className="text-[10px] font-normal text-[#9ca3af]">/{p.unit_type}</span></td>
                                                            <td className="px-4 py-3">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9ca3af] opacity-0 transition-all hover:bg-[#f0f2f7] hover:text-[#6b7280] group-hover:opacity-100">
                                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-36 text-xs">
                                                                        <DropdownMenuItem asChild className="cursor-pointer">
                                                                            <Link href={`/crm/products/${p.id}`}>
                                                                                <Eye className="mr-2 h-3 w-3" />
                                                                                View
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem asChild className="cursor-pointer">
                                                                            <Link href={`/crm/products/${p.id}/edit`}>
                                                                                <Edit3 className="mr-2 h-3 w-3" />
                                                                                Edit
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem onClick={() => handleDelete(p)} className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50">
                                                                            <Trash2 className="mr-2 h-3 w-3" />
                                                                            Deactivate
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
