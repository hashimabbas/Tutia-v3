import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Building2, Globe, Phone, FileText, ChevronDown, Send, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Classification {
    id: number;
    slug: string;
    name: string;
}

interface OrganizationData {
    id: number;
    name: string;
    domain: string;
    industry: string;
    size: string;
    phone: string;
    website: string;
    notes: string;
}

interface Props {
    organization?: OrganizationData;
    selected_classification_ids?: string[];
    classifications: Classification[];
    industries: string[];
}

export default function OrganizationCreate({ organization, selected_classification_ids, classifications, industries }: Props) {
    const isEditing = !!organization;

    const [form, setForm] = useState({
        name: organization?.name ?? '',
        domain: organization?.domain ?? '',
        industry: organization?.industry ?? '',
        size: organization?.size ?? '',
        phone: organization?.phone ?? '',
        website: organization?.website ?? '',
        notes: organization?.notes ?? '',
        classification_ids: selected_classification_ids ?? [] as string[],
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

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleClassificationToggle = (id: string) => {
        setForm((prev) => {
            const next = prev.classification_ids.includes(id)
                ? prev.classification_ids.filter((o) => o !== id)
                : [...prev.classification_ids, id];
            return { ...prev, classification_ids: next };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);

        const data = {
            ...form,
            classifications: form.classification_ids.length > 0 ? form.classification_ids : undefined,
        };

        if (isEditing) {
            router.patch(`/crm/organizations/${organization.id}`, data, {
                onSuccess: () => setSaving(false),
                onError: (errs) => {
                    setErrors(errs);
                    setSaving(false);
                    const first = Object.keys(errs)[0];
                    if (first) {
                        document.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        document.querySelector(`[data-field="${first}"] input`)?.focus();
                    }
                },
            });
        } else {
            router.post('/crm/organizations', data, {
                onSuccess: () => setSaving(false),
                onError: (errs) => {
                    setErrors(errs);
                    setSaving(false);
                    const first = Object.keys(errs)[0];
                    if (first) {
                        document.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        document.querySelector(`[data-field="${first}"] input`)?.focus();
                    }
                },
            });
        }
    };

    return (
        <>
            <Head title={isEditing ? `CRM · Edit ${organization.name}` : 'CRM · New Organization'} />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Header */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-white/90 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href={isEditing ? `/crm/organizations/${organization.id}` : '/crm/organizations'}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2e6ef] bg-white text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div>
                                <h1 className="text-lg font-semibold text-[#1a1a2e] tracking-tight">
                                    {isEditing ? 'Edit Organization' : 'New Organization'}
                                </h1>
                                <p className="text-xs text-[#6b7280]">
                                    {isEditing ? 'Update organization details' : 'Add a new organization to your network'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="hidden text-[11px] text-[#6b7280] md:block">
                                <kbd className="rounded-md border border-[#e2e6ef] bg-[#f8f9fc] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">⌘</kbd>
                                <kbd className="ml-0.5 rounded-md border border-[#e2e6ef] bg-[#f8f9fc] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">↵</kbd>
                                {' '}to save
                            </span>
                            <Link href={isEditing ? `/crm/organizations/${organization.id}` : '/crm/organizations'}>
                                <Button variant="outline" size="sm" className="h-9 border-[#e2e6ef] text-[#6b7280] hover:bg-[#f0f2f7] hover:text-[#1a1a2e]">
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
                                        {isEditing ? 'Update' : 'Create Organization'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-3xl px-6 py-8">
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                                        <Building2 className="h-4 w-4 text-violet-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Basic Information</h2>
                                        <p className="text-[11px] text-[#6b7280]">Company name, domain, and industry details</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div data-field="name" className="md:col-span-2">
                                        <Label htmlFor="name" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Organization Name <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={form.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            onFocus={() => setFocused('name')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="e.g. Acme Corp"
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
                                            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div data-field="domain">
                                        <Label htmlFor="domain" className="mb-1.5 text-xs font-medium text-[#374151]">Domain</Label>
                                        <div className="relative">
                                            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                                            <Input
                                                id="domain"
                                                value={form.domain}
                                                onChange={(e) => handleChange('domain', e.target.value)}
                                                onFocus={() => setFocused('domain')}
                                                onBlur={() => setFocused(null)}
                                                placeholder="acme.com"
                                                className={cn(
                                                    'h-10 pl-10 text-sm transition-all',
                                                    focused === 'domain' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div data-field="industry">
                                        <Label htmlFor="industry" className="mb-1.5 text-xs font-medium text-[#374151]">Industry</Label>
                                        <Input
                                            id="industry"
                                            value={form.industry}
                                            onChange={(e) => handleChange('industry', e.target.value)}
                                            onFocus={() => setFocused('industry')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="e.g. Technology, Healthcare"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                focused === 'industry' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                    </div>

                                    <div data-field="size">
                                        <Label htmlFor="size" className="mb-1.5 text-xs font-medium text-[#374151]">Company Size</Label>
                                        <Input
                                            id="size"
                                            value={form.size}
                                            onChange={(e) => handleChange('size', e.target.value)}
                                            onFocus={() => setFocused('size')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="e.g. 50-200, Enterprise"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                focused === 'size' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                    </div>

                                    <div data-field="phone">
                                        <Label htmlFor="phone" className="mb-1.5 text-xs font-medium text-[#374151]">Phone</Label>
                                        <div className="relative">
                                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                                            <Input
                                                id="phone"
                                                value={form.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                onFocus={() => setFocused('phone')}
                                                onBlur={() => setFocused(null)}
                                                placeholder="+966 11 000 0000"
                                                className={cn(
                                                    'h-10 pl-10 text-sm transition-all',
                                                    focused === 'phone' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div data-field="website">
                                        <Label htmlFor="website" className="mb-1.5 text-xs font-medium text-[#374151]">Website</Label>
                                        <Input
                                            id="website"
                                            value={form.website}
                                            onChange={(e) => handleChange('website', e.target.value)}
                                            onFocus={() => setFocused('website')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="https://acme.com"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                focused === 'website' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Classifications */}
                            {classifications.length > 0 && (
                                <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                            <Check className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-[#1a1a2e]">Classifications</h2>
                                            <p className="text-[11px] text-[#6b7280]">Categorize this organization</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {classifications.map((c) => {
                                            const selected = form.classification_ids.includes(String(c.id));
                                            return (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => handleClassificationToggle(String(c.id))}
                                                    className={cn(
                                                        'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs transition-all',
                                                        selected
                                                            ? 'border-[#2B4C8C] bg-[#2B4C8C]/5 text-[#2B4C8C] font-medium ring-1 ring-[#2B4C8C]/20'
                                                            : 'border-[#e2e6ef] text-[#6b7280] hover:border-[#c8cce0] hover:bg-[#f8f9fc]',
                                                    )}
                                                >
                                                    {c.name}
                                                    {selected && <Check className="h-3 w-3" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* Notes */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-500/10">
                                        <FileText className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Notes</h2>
                                        <p className="text-[11px] text-[#6b7280]">Internal notes about this organization</p>
                                    </div>
                                </div>

                                <textarea
                                    value={form.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    onFocus={() => setFocused('notes')}
                                    onBlur={() => setFocused(null)}
                                    placeholder="Add any relevant information..."
                                    rows={4}
                                    className={cn(
                                        'w-full rounded-xl border px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#9ca3af] outline-none resize-none transition-all',
                                        focused === 'notes'
                                            ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10'
                                            : 'border-[#e2e6ef]',
                                    )}
                                />
                            </section>

                            {/* Footer */}
                            <div className="flex items-center justify-between rounded-2xl border border-[#e2e6ef] bg-white px-6 py-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <p className="text-xs text-[#6b7280]">
                                        <span className="text-rose-500">*</span> Required fields
                                    </p>
                                    <span className="hidden text-[11px] text-[#9ca3af] md:block">
                                        <kbd className="rounded-md border border-[#e2e6ef] bg-[#f8f9fc] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">⌘</kbd>
                                        <kbd className="ml-0.5 rounded-md border border-[#e2e6ef] bg-[#f8f9fc] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">↵</kbd>
                                        {' '}to save
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={isEditing ? `/crm/organizations/${organization.id}` : '/crm/organizations'}>
                                        <Button variant="outline" size="sm" className="h-9 border-[#e2e6ef] text-[#6b7280] hover:bg-[#f0f2f7] hover:text-[#1a1a2e]">
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
                                                {isEditing ? 'Update' : 'Create Organization'}
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
