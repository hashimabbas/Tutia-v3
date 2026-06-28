import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Package, DollarSign, Tag, Info, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ProductData {
    id: number;
    name: string;
    description: string | null;
    category: string;
    type: string;
    unit_price: number;
    unit_type: string;
    version: number;
    is_active: boolean;
}

interface Props {
    product?: ProductData;
}

const CATEGORIES = [
    { value: 'erp', label: 'ERP' },
    { value: 'connectivity', label: 'Connectivity' },
    { value: 'vpn', label: 'VPN' },
    { value: 'bulk_sms', label: 'Bulk SMS' },
    { value: 'payment_gateway', label: 'Payment Gateway' },
    { value: 'custom_development', label: 'Custom Development' },
    { value: 'consulting', label: 'Consulting' },
];

const TYPES = [
    { value: 'product', label: 'Product' },
    { value: 'service', label: 'Service' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'package', label: 'Package' },
];

const UNIT_TYPES = [
    { value: 'unit', label: 'Per Unit' },
    { value: 'hour', label: 'Per Hour' },
    { value: 'license', label: 'Per License' },
    { value: 'fixed', label: 'Fixed' },
];

export default function ProductCreate({ product }: Props) {
    const isEditing = !!product;

    const [form, setForm] = useState({
        name: product?.name ?? '',
        description: product?.description ?? '',
        category: product?.category ?? 'erp',
        type: product?.type ?? 'service',
        unit_price: product?.unit_price ? String(product.unit_price) : '',
        unit_type: product?.unit_type ?? 'unit',
        version: product?.version ? String(product.version) : '1',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                formRef.current?.requestSubmit();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);

        const data: Record<string, any> = {
            name: form.name,
            description: form.description || undefined,
            category: form.category,
            type: form.type,
            unit_price: form.unit_price
                ? parseFloat(form.unit_price)
                : undefined,
            unit_type: form.unit_type,
            version: form.version ? parseInt(form.version, 10) : 1,
        };

        Object.keys(data).forEach(
            (k) => data[k] === undefined && delete data[k],
        );

        if (isEditing) {
            router.patch(`/crm/products/${product.id}`, data, {
                onSuccess: () => setSaving(false),
                onError: (errs) => {
                    setErrors(errs);
                    setSaving(false);
                },
            });
        } else {
            router.post('/crm/products', data, {
                onSuccess: () => setSaving(false),
                onError: (errs) => {
                    setErrors(errs);
                    setSaving(false);
                },
            });
        }
    };

    return (
        <>
            <Head
                title={
                    isEditing
                        ? `CRM · Edit ${product.name}`
                        : 'CRM · New Product'
                }
            />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-white/90 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href={
                                    isEditing
                                        ? `/crm/products/${product.id}`
                                        : '/crm/products'
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2e6ef] bg-white text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight text-[#1a1a2e]">
                                    {isEditing ? 'Edit Product' : 'New Product'}
                                </h1>
                                <p className="text-xs text-[#6b7280]">
                                    {isEditing
                                        ? 'Update product details'
                                        : 'Add a new product to the catalog'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="hidden text-[11px] text-[#6b7280] md:block">
                                <kbd className="rounded-md border border-[#e2e6ef] bg-[#f8f9fc] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">
                                    ⌘
                                </kbd>
                                <kbd className="ml-0.5 rounded-md border border-[#e2e6ef] bg-[#f8f9fc] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">
                                    ↵
                                </kbd>{' '}
                                to save
                            </span>
                            <Link
                                href={
                                    isEditing
                                        ? `/crm/products/${product.id}`
                                        : '/crm/products'
                                }
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 border-[#e2e6ef] text-[#6b7280] hover:bg-[#f0f2f7] hover:text-[#1a1a2e]"
                                >
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                size="sm"
                                onClick={() => formRef.current?.requestSubmit()}
                                disabled={saving}
                                className={cn(
                                    'h-9 gap-2 bg-[#2B4C8C] text-white shadow-sm transition-all hover:bg-[#2B4C8C]/90 hover:shadow-md',
                                    saving && 'opacity-80',
                                )}
                            >
                                {saving ? (
                                    <>
                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-3.5 w-3.5" />
                                        {isEditing
                                            ? 'Update Product'
                                            : 'Create Product'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-3xl px-6 py-8">
                        <form
                            ref={formRef}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            {/* Basic Information */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                        <Package className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">
                                            Basic Information
                                        </h2>
                                        <p className="text-[11px] text-[#6b7280]">
                                            Product name and description
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5">
                                    <div data-field="name">
                                        <Label
                                            htmlFor="name"
                                            className="mb-1.5 text-xs font-medium text-[#374151]"
                                        >
                                            Product Name{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={form.name}
                                            onChange={(e) =>
                                                handleChange(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            onFocus={() => setFocused('name')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="e.g. ERP Pro"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                errors.name
                                                    ? 'border-rose-300 ring-rose-200/50'
                                                    : focused === 'name'
                                                      ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10'
                                                      : '',
                                            )}
                                        />
                                        {errors.name && (
                                            <p className="mt-1.5 text-[11px] text-rose-600">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div data-field="description">
                                        <Label
                                            htmlFor="description"
                                            className="mb-1.5 text-xs font-medium text-[#374151]"
                                        >
                                            Description
                                        </Label>
                                        <textarea
                                            id="description"
                                            value={form.description}
                                            onChange={(e) =>
                                                handleChange(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            onFocus={() =>
                                                setFocused('description')
                                            }
                                            onBlur={() => setFocused(null)}
                                            rows={3}
                                            placeholder="Brief description of the product or service"
                                            className={cn(
                                                'w-full resize-none rounded-xl border px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#9ca3af] transition-all outline-none',
                                                focused === 'description'
                                                    ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10'
                                                    : 'border-[#e2e6ef]',
                                            )}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Classification */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                                        <Tag className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">
                                            Classification
                                        </h2>
                                        <p className="text-[11px] text-[#6b7280]">
                                            Category, type, and versioning
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                    <div data-field="category">
                                        <Label className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Category{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={form.category}
                                            onValueChange={(v) =>
                                                handleChange('category', v)
                                            }
                                        >
                                            <SelectTrigger
                                                className={cn(
                                                    'h-10 text-sm',
                                                    errors.category &&
                                                        'border-rose-300',
                                                )}
                                            >
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map((c) => (
                                                    <SelectItem
                                                        key={c.value}
                                                        value={c.value}
                                                    >
                                                        {c.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && (
                                            <p className="mt-1.5 text-[11px] text-rose-600">
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>

                                    <div data-field="type">
                                        <Label className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Type{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={form.type}
                                            onValueChange={(v) =>
                                                handleChange('type', v)
                                            }
                                        >
                                            <SelectTrigger
                                                className={cn(
                                                    'h-10 text-sm capitalize',
                                                    errors.type &&
                                                        'border-rose-300',
                                                )}
                                            >
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TYPES.map((t) => (
                                                    <SelectItem
                                                        key={t.value}
                                                        value={t.value}
                                                    >
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.type && (
                                            <p className="mt-1.5 text-[11px] text-rose-600">
                                                {errors.type}
                                            </p>
                                        )}
                                    </div>

                                    <div data-field="version">
                                        <Label
                                            htmlFor="version"
                                            className="mb-1.5 text-xs font-medium text-[#374151]"
                                        >
                                            Version
                                        </Label>
                                        <Input
                                            id="version"
                                            type="number"
                                            min="1"
                                            value={form.version}
                                            onChange={(e) =>
                                                handleChange(
                                                    'version',
                                                    e.target.value,
                                                )
                                            }
                                            onFocus={() =>
                                                setFocused('version')
                                            }
                                            onBlur={() => setFocused(null)}
                                            placeholder="1"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                focused === 'version'
                                                    ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10'
                                                    : '',
                                            )}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Pricing */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <DollarSign className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">
                                            Pricing
                                        </h2>
                                        <p className="text-[11px] text-[#6b7280]">
                                            Price and billing unit
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div data-field="unit_price">
                                        <Label
                                            htmlFor="unit_price"
                                            className="mb-1.5 text-xs font-medium text-[#374151]"
                                        >
                                            Unit Price{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="unit_price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.unit_price}
                                            onChange={(e) =>
                                                handleChange(
                                                    'unit_price',
                                                    e.target.value,
                                                )
                                            }
                                            onFocus={() =>
                                                setFocused('unit_price')
                                            }
                                            onBlur={() => setFocused(null)}
                                            placeholder="0.00"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                errors.unit_price
                                                    ? 'border-rose-300 ring-rose-200/50'
                                                    : focused === 'unit_price'
                                                      ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10'
                                                      : '',
                                            )}
                                        />
                                        {errors.unit_price && (
                                            <p className="mt-1.5 text-[11px] text-rose-600">
                                                {errors.unit_price}
                                            </p>
                                        )}
                                    </div>

                                    <div data-field="unit_type">
                                        <Label className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Unit Type{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={form.unit_type}
                                            onValueChange={(v) =>
                                                handleChange('unit_type', v)
                                            }
                                        >
                                            <SelectTrigger
                                                className={cn(
                                                    'h-10 text-sm capitalize',
                                                    errors.unit_type &&
                                                        'border-rose-300',
                                                )}
                                            >
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {UNIT_TYPES.map((u) => (
                                                    <SelectItem
                                                        key={u.value}
                                                        value={u.value}
                                                    >
                                                        {u.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.unit_type && (
                                            <p className="mt-1.5 text-[11px] text-rose-600">
                                                {errors.unit_type}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Footer */}
                            <div className="flex items-center justify-between rounded-2xl border border-[#e2e6ef] bg-white px-6 py-4 shadow-sm">
                                <p className="text-xs text-[#6b7280]">
                                    <span className="text-rose-500">*</span>{' '}
                                    Required fields
                                </p>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={
                                            isEditing
                                                ? `/crm/products/${product.id}`
                                                : '/crm/products'
                                        }
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 border-[#e2e6ef] text-[#6b7280] hover:bg-[#f0f2f7] hover:text-[#1a1a2e]"
                                        >
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            formRef.current?.requestSubmit()
                                        }
                                        disabled={saving}
                                        className={cn(
                                            'h-9 gap-2 bg-[#2B4C8C] text-white shadow-sm transition-all hover:bg-[#2B4C8C]/90 hover:shadow-md',
                                            saving && 'opacity-80',
                                        )}
                                    >
                                        {saving ? (
                                            <>
                                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-3.5 w-3.5" />
                                                {isEditing
                                                    ? 'Update Product'
                                                    : 'Create Product'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
