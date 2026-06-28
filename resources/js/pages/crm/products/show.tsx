import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    Pencil,
    Trash2,
    Layers,
    Wifi,
    Shield,
    MessageSquare,
    CreditCard,
    Code,
    Briefcase,
    Tag,
    DollarSign,
    Hash,
    Box,
    Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    children?: Product[];
}

interface Props {
    product: Product;
}

const categoryConfig: Record<
    string,
    { icon: React.ElementType; label: string; color: string }
> = {
    erp: { icon: Layers, label: 'ERP', color: 'text-blue-600 bg-blue-50' },
    connectivity: {
        icon: Wifi,
        label: 'Connectivity',
        color: 'text-cyan-600 bg-cyan-50',
    },
    vpn: { icon: Shield, label: 'VPN', color: 'text-purple-600 bg-purple-50' },
    bulk_sms: {
        icon: MessageSquare,
        label: 'Bulk SMS',
        color: 'text-green-600 bg-green-50',
    },
    payment_gateway: {
        icon: CreditCard,
        label: 'Payment Gateway',
        color: 'text-indigo-600 bg-indigo-50',
    },
    custom_development: {
        icon: Code,
        label: 'Custom Development',
        color: 'text-orange-600 bg-orange-50',
    },
    consulting: {
        icon: Briefcase,
        label: 'Consulting',
        color: 'text-amber-600 bg-amber-50',
    },
};

const typeColors: Record<string, string> = {
    product: 'bg-blue-500/10 text-blue-600 border-blue-200',
    service: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    subscription: 'bg-amber-500/10 text-amber-600 border-amber-200',
    package: 'bg-violet-500/10 text-violet-600 border-violet-200',
};

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(val);
}

export default function ProductShow({ product }: Props) {
    const config = categoryConfig[product.category] ?? {
        icon: Package,
        label: product.category,
        color: 'text-gray-600 bg-gray-50',
    };
    const Icon = config.icon;

    const handleDelete = () => {
        router.delete(`/crm/products/${product.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title={`CRM · ${product.name}`} />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 px-6 py-3 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/crm/products"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e2e6ef] bg-white text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <Link
                                href="/crm/products"
                                className="text-[#6b7280] hover:text-[#374151]"
                            >
                                Products
                            </Link>
                            <span className="text-[#d1d5db]">/</span>
                            <span className="font-medium text-[#1a1a2e]">
                                {product.name}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/crm/products/${product.id}/edit`}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 border-[#e2e6ef] text-xs text-[#6b7280] hover:bg-[#f0f2f7] hover:text-[#1a1a2e]"
                            >
                                <Pencil className="h-3 w-3" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            className="h-8 gap-1.5 border-[#e2e6ef] text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                            <Trash2 className="h-3 w-3" />
                            Deactivate
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-4xl px-6 py-8">
                        {/* Hero section */}
                        <div className="mb-6 rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div
                                    className={cn(
                                        'flex h-14 w-14 items-center justify-center rounded-2xl',
                                        config.color,
                                    )}
                                >
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-3">
                                        <h1 className="text-xl font-bold tracking-tight text-[#1a1a2e]">
                                            {product.name}
                                        </h1>
                                        <span
                                            className={cn(
                                                'rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase',
                                                typeColors[product.type] ?? '',
                                            )}
                                        >
                                            {product.type}
                                        </span>
                                    </div>
                                    {product.description && (
                                        <p className="text-sm leading-relaxed text-[#6b7280]">
                                            {product.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Left column */}
                            <div className="space-y-4">
                                {/* Pricing */}
                                <section className="rounded-2xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                    <h2 className="mb-4 text-xs font-semibold tracking-wider text-[#6b7280] uppercase">
                                        Pricing
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-[#f0f2f7] pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                                                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                                                </div>
                                                <span className="text-sm text-[#374151]">
                                                    Unit Price
                                                </span>
                                            </div>
                                            <span className="text-lg font-bold text-[#1a1a2e]">
                                                {formatCurrency(
                                                    product.unit_price,
                                                )}
                                                <span className="text-sm font-normal text-[#9ca3af]">
                                                    /{product.unit_type}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50">
                                                    <Tag className="h-3.5 w-3.5 text-gray-600" />
                                                </div>
                                                <span className="text-sm text-[#374151]">
                                                    Unit Type
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-[#1a1a2e] capitalize">
                                                {product.unit_type}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {/* Category */}
                                <section className="rounded-2xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                    <h2 className="mb-4 text-xs font-semibold tracking-wider text-[#6b7280] uppercase">
                                        Classification
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-[#f0f2f7] pb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                                                    <Icon className="h-3.5 w-3.5 text-blue-600" />
                                                </div>
                                                <span className="text-sm text-[#374151]">
                                                    Category
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-[#1a1a2e]">
                                                {config.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
                                                    <Hash className="h-3.5 w-3.5 text-purple-600" />
                                                </div>
                                                <span className="text-sm text-[#374151]">
                                                    Version
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-[#1a1a2e]">
                                                v{product.version}
                                            </span>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right column */}
                            <div className="space-y-4">
                                {/* Metadata */}
                                <section className="rounded-2xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                    <h2 className="mb-4 text-xs font-semibold tracking-wider text-[#6b7280] uppercase">
                                        Details
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-[#f0f2f7] pb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
                                                    <Box className="h-3.5 w-3.5 text-amber-600" />
                                                </div>
                                                <span className="text-sm text-[#374151]">
                                                    Status
                                                </span>
                                            </div>
                                            <span
                                                className={cn(
                                                    'rounded-md px-2 py-0.5 text-xs font-medium',
                                                    product.is_active
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-gray-50 text-gray-500',
                                                )}
                                            >
                                                {product.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50">
                                                    <Calendar className="h-3.5 w-3.5 text-sky-600" />
                                                </div>
                                                <span className="text-sm text-[#374151]">
                                                    Created
                                                </span>
                                            </div>
                                            <span className="text-sm text-[#6b7280]">
                                                {new Date(
                                                    product.created_at,
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {/* Variants / Children */}
                                {product.children &&
                                    product.children.length > 0 && (
                                        <section className="rounded-2xl border border-[#e2e6ef] bg-white p-5 shadow-sm">
                                            <h2 className="mb-4 text-xs font-semibold tracking-wider text-[#6b7280] uppercase">
                                                Variants (
                                                {product.children.length})
                                            </h2>
                                            <div className="space-y-2">
                                                {product.children.map(
                                                    (child) => (
                                                        <Link
                                                            key={child.id}
                                                            href={`/crm/products/${child.id}`}
                                                            className="flex items-center justify-between rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] px-3.5 py-2.5 transition-all hover:border-[#c8cce0] hover:shadow-sm"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f0f2f7]">
                                                                    <Icon className="h-3 w-3 text-[#6b7280]" />
                                                                </div>
                                                                <span className="text-sm font-medium text-[#1a1a2e]">
                                                                    {child.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-bold text-[#1a1a2e]">
                                                                {formatCurrency(
                                                                    child.unit_price,
                                                                )}
                                                                <span className="text-[10px] font-normal text-[#9ca3af]">
                                                                    /
                                                                    {
                                                                        child.unit_type
                                                                    }
                                                                </span>
                                                            </span>
                                                        </Link>
                                                    ),
                                                )}
                                            </div>
                                        </section>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
