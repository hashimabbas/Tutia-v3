import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, DollarSign, Building2, User, Calendar, FileText, Send, Search, ChevronDown, X } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
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

interface ContactOption {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    job_title: string | null;
    organization_name: string | null;
    organization_id: number | null;
}

interface OrganizationOption {
    id: number;
    name: string;
    industry: string | null;
}

interface DealData {
    id: number;
    title: string;
    value: number;
    currency: string;
    stage: string;
    probability: number;
    company: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    expected_close_date: string;
    notes: string;
    organization_id?: number | null;
    contact_id?: number | null;
}

interface Props {
    deal?: DealData;
    contacts?: ContactOption[];
    organizations?: OrganizationOption[];
}

const STAGES = [
    { key: 'qualification', label: 'Qualification' },
    { key: 'meeting', label: 'Meeting Scheduled' },
    { key: 'proposal', label: 'Proposal Sent' },
    { key: 'negotiation', label: 'Negotiation' },
    { key: 'closed_won', label: 'Closed Won' },
    { key: 'closed_lost', label: 'Closed Lost' },
];

function SearchableSelect<T extends { id: number }>({
    items,
    selectedId,
    onSelect,
    placeholder,
    searchPlaceholder,
    displayValue,
    renderItem,
    icon: Icon,
    label,
    error,
    onClear,
}: {
    items: T[];
    selectedId: number | null | undefined;
    onSelect: (item: T | null) => void;
    placeholder: string;
    searchPlaceholder: string;
    displayValue: string;
    renderItem: (item: T) => React.ReactNode;
    icon: React.ElementType;
    label: string;
    error?: string;
    onClear?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = useMemo(
        () => query ? items.filter(i => JSON.stringify(i).toLowerCase().includes(query.toLowerCase())) : items,
        [items, query],
    );

    const selected = items.find(i => i.id === selectedId);

    return (
        <div data-field={label} className="relative" ref={containerRef}>
            <Label className="mb-1.5 text-xs font-medium text-[#374151]">{label}</Label>
            <button
                type="button"
                onClick={() => { setOpen(!open); setQuery(''); }}
                className={cn(
                    'flex h-10 w-full items-center gap-2 rounded-xl border bg-[#f8f9fc] px-3 text-sm text-left transition-all',
                    open ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : 'border-[#e2e6ef]',
                    error ? 'border-rose-300 ring-rose-200/50' : '',
                )}
            >
                <Icon className="h-4 w-4 shrink-0 text-[#9ca3af]" />
                <span className={cn('flex-1 truncate', selected ? 'text-[#1a1a2e]' : 'text-[#9ca3af]')}>
                    {selected ? displayValue : placeholder}
                </span>
                {selected && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onClear?.(); }}
                        className="flex h-5 w-5 items-center justify-center rounded-md text-[#9ca3af] hover:bg-[#f0f2f7] hover:text-[#6b7280]"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
                <ChevronDown className={cn('h-4 w-4 text-[#9ca3af] transition-transform', open && 'rotate-180')} />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-[#e2e6ef] bg-white shadow-lg">
                    <div className="relative p-2">
                        <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-9 w-full rounded-lg border border-[#e2e6ef] bg-[#f8f9fc] pl-8 pr-3 text-xs text-[#1a1a2e] placeholder-[#9ca3af] outline-none"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto px-1 pb-1">
                        {filtered.length === 0 ? (
                            <p className="px-3 py-4 text-center text-xs text-[#9ca3af]">No results found</p>
                        ) : (
                            filtered.map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => { onSelect(item); setOpen(false); }}
                                    className={cn(
                                        'flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                                        item.id === selectedId ? 'bg-[#2B4C8C]/5 text-[#2B4C8C]' : 'text-[#1a1a2e] hover:bg-[#f8f9fc]',
                                    )}
                                >
                                    {renderItem(item)}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
            {error && <p className="mt-1.5 text-[11px] text-rose-600">{error}</p>}
        </div>
    );
}

export default function DealCreate({ deal, contacts = [], organizations = [] }: Props) {
    const isEditing = !!deal;

    const [form, setForm] = useState({
        title: deal?.title ?? '',
        value: deal?.value ? String(deal.value) : '',
        currency: deal?.currency ?? 'USD',
        stage: deal?.stage ?? 'qualification',
        probability: deal?.probability ? String(deal.probability) : '50',
        company: deal?.company ?? '',
        contact_name: deal?.contact_name ?? '',
        contact_email: deal?.contact_email ?? '',
        contact_phone: deal?.contact_phone ?? '',
        expected_close_date: deal?.expected_close_date ?? '',
        notes: deal?.notes ?? '',
        organization_id: deal?.organization_id ?? null,
        contact_id: deal?.contact_id ?? null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);
    const [showManualContact, setShowManualContact] = useState(false);
    const [showManualOrg, setShowManualOrg] = useState(false);

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

    const handleContactSelect = (contact: ContactOption | null) => {
        if (!contact) {
            handleChange('contact_id', null);
            handleChange('contact_name', '');
            handleChange('contact_email', '');
            handleChange('contact_phone', '');
            return;
        }
        handleChange('contact_id', contact.id);
        handleChange('contact_name', contact.name);
        handleChange('contact_email', contact.email ?? '');
        handleChange('contact_phone', contact.phone ?? '');
        if (contact.organization_id && !form.organization_id) {
            handleChange('organization_id', contact.organization_id);
            handleChange('company', contact.organization_name ?? '');
        }
    };

    const handleOrgSelect = (org: OrganizationOption | null) => {
        if (!org) {
            handleChange('organization_id', null);
            handleChange('company', '');
            return;
        }
        handleChange('organization_id', org.id);
        handleChange('company', org.name);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);

        const data: Record<string, any> = {
            title: form.title,
            value: form.value ? parseFloat(form.value) : undefined,
            currency: form.currency,
            stage: form.stage,
            probability: form.probability ? parseInt(form.probability, 10) : undefined,
            expected_close_date: form.expected_close_date || undefined,
            notes: form.notes || undefined,
            organization_id: form.organization_id || undefined,
            contact_id: form.contact_id || undefined,
            company: form.company || undefined,
            contact_name: form.contact_name || undefined,
            contact_email: form.contact_email || undefined,
            contact_phone: form.contact_phone || undefined,
        };

        Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

        if (isEditing) {
            router.patch(`/crm/deals/${deal.id}`, data, {
                onSuccess: () => setSaving(false),
                onError: (errs) => {
                    setErrors(errs);
                    setSaving(false);
                },
            });
        } else {
            router.post('/crm/deals', data, {
                onSuccess: () => setSaving(false),
                onError: (errs) => {
                    setErrors(errs);
                    setSaving(false);
                },
            });
        }
    };

    const selectedContact = contacts.find(c => c.id === form.contact_id);
    const selectedOrg = organizations.find(o => o.id === form.organization_id);

    const contactDisplayValue = selectedContact
        ? `${selectedContact.name}${selectedContact.email ? ` (${selectedContact.email})` : ''}`
        : '';

    const orgDisplayValue = selectedOrg
        ? `${selectedOrg.name}${selectedOrg.industry ? ` · ${selectedOrg.industry}` : ''}`
        : '';

    const filteredContacts = useMemo(
        () => form.organization_id
            ? contacts.filter(c => c.organization_id === form.organization_id || !c.organization_id)
            : contacts,
        [contacts, form.organization_id],
    );

    const switchToManualContact = () => {
        handleChange('contact_id', null);
        setShowManualContact(true);
    };

    const switchToManualOrg = () => {
        handleChange('organization_id', null);
        setShowManualOrg(true);
    };

    return (
        <>
            <Head title={isEditing ? `CRM · Edit ${deal.title}` : 'CRM · New Deal'} />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-white/90 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href={isEditing ? `/crm/deals/${deal.id}` : '/crm/deals'}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2e6ef] bg-white text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div>
                                <h1 className="text-lg font-semibold text-[#1a1a2e] tracking-tight">
                                    {isEditing ? 'Edit Deal' : 'New Deal'}
                                </h1>
                                <p className="text-xs text-[#6b7280]">
                                    {isEditing ? 'Update deal details' : 'Create a new deal in your pipeline'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="hidden text-[11px] text-[#6b7280] md:block">
                                <kbd className="rounded-md border border-[#e2e6ef] bg-[#f8f9fc] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">⌘</kbd>
                                <kbd className="ml-0.5 rounded-md border border-[#e2e6ef] bg-[#f8f9fc] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">↵</kbd>
                                {' '}to save
                            </span>
                            <Link href={isEditing ? `/crm/deals/${deal.id}` : '/crm/deals'}>
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
                                        {isEditing ? 'Update Deal' : 'Create Deal'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-3xl px-6 py-8">
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                            {/* Deal Details */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                        <DollarSign className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Deal Details</h2>
                                        <p className="text-[11px] text-[#6b7280]">Basic deal information and value</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div data-field="title" className="md:col-span-2">
                                        <Label htmlFor="title" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Deal Title <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="title"
                                            value={form.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            onFocus={() => setFocused('title')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="e.g. ERP Implementation - Acme Corp"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                errors.title ? 'border-rose-300 ring-rose-200/50' : focused === 'title' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                        {errors.title && <p className="mt-1.5 text-[11px] text-rose-600">{errors.title}</p>}
                                    </div>

                                    <div data-field="value">
                                        <Label htmlFor="value" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Deal Value <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="value"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.value}
                                            onChange={(e) => handleChange('value', e.target.value)}
                                            onFocus={() => setFocused('value')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="50000"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                errors.value ? 'border-rose-300 ring-rose-200/50' : focused === 'value' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                        {errors.value && <p className="mt-1.5 text-[11px] text-rose-600">{errors.value}</p>}
                                    </div>

                                    <div data-field="currency">
                                        <Label htmlFor="currency" className="mb-1.5 text-xs font-medium text-[#374151]">Currency</Label>
                                        <Input
                                            id="currency"
                                            value={form.currency}
                                            onChange={(e) => handleChange('currency', e.target.value)}
                                            onFocus={() => setFocused('currency')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="USD"
                                            maxLength={3}
                                            className={cn(
                                                'h-10 text-sm uppercase transition-all',
                                                focused === 'currency' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                    </div>

                                    <div data-field="stage">
                                        <Label className="mb-1.5 text-xs font-medium text-[#374151]">Stage</Label>
                                        <Select value={form.stage} onValueChange={(v) => handleChange('stage', v)}>
                                            <SelectTrigger className="h-10 text-sm">
                                                <SelectValue placeholder="Select stage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STAGES.map(s => (
                                                    <SelectItem key={s.key} value={s.key} className="capitalize">{s.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div data-field="probability">
                                        <Label htmlFor="probability" className="mb-1.5 text-xs font-medium text-[#374151]">Probability (%)</Label>
                                        <Input
                                            id="probability"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={form.probability}
                                            onChange={(e) => handleChange('probability', e.target.value)}
                                            onFocus={() => setFocused('probability')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="50"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                focused === 'probability' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                    </div>

                                    <div data-field="expected_close_date">
                                        <Label htmlFor="expected_close_date" className="mb-1.5 text-xs font-medium text-[#374151]">Expected Close Date</Label>
                                        <Input
                                            id="expected_close_date"
                                            type="date"
                                            value={form.expected_close_date}
                                            onChange={(e) => handleChange('expected_close_date', e.target.value)}
                                            onFocus={() => setFocused('expected_close_date')}
                                            onBlur={() => setFocused(null)}
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                focused === 'expected_close_date' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Company & Contact */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                                        <Building2 className="h-4 w-4 text-violet-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Company & Contact</h2>
                                        <p className="text-[11px] text-[#6b7280]">Select from existing records or enter manually</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {/* Organization */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <Label className="text-xs font-medium text-[#374151]">Organization</Label>
                                                {!showManualOrg && (
                                                    <button
                                                        type="button"
                                                        onClick={switchToManualOrg}
                                                        className="text-[10px] text-[#2B4C8C] hover:text-[#2B4C8C]/80 hover:underline"
                                                    >
                                                        Not in list? Enter manually
                                                    </button>
                                                )}
                                                {showManualOrg && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { setShowManualOrg(false); handleChange('organization_id', null); handleChange('company', ''); }}
                                                        className="text-[10px] text-[#2B4C8C] hover:text-[#2B4C8C]/80 hover:underline"
                                                    >
                                                        Browse organizations
                                                    </button>
                                                )}
                                            </div>

                                            {showManualOrg ? (
                                                <Input
                                                    value={form.company}
                                                    onChange={(e) => handleChange('company', e.target.value)}
                                                    onFocus={() => setFocused('company')}
                                                    onBlur={() => setFocused(null)}
                                                    placeholder="Acme Corp"
                                                    className={cn(
                                                        'h-10 text-sm transition-all',
                                                        focused === 'company' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                                    )}
                                                />
                                            ) : (
                                                <SearchableSelect
                                                    items={organizations}
                                                    selectedId={form.organization_id}
                                                    onSelect={(org) => handleOrgSelect(org)}
                                                    onClear={() => handleOrgSelect(null)}
                                                    placeholder="Search or select an organization..."
                                                    searchPlaceholder="Search organizations..."
                                                    displayValue={orgDisplayValue}
                                                    renderItem={(org) => (
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0f2f7]">
                                                                <Building2 className="h-3.5 w-3.5 text-[#6b7280]" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-[#1a1a2e] truncate">{org.name}</p>
                                                                {org.industry && (
                                                                    <p className="text-[11px] text-[#6b7280] truncate">{org.industry}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    icon={Building2}
                                                    label=""
                                                    error={errors.organization_id}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <Label className="text-xs font-medium text-[#374151]">Contact</Label>
                                                {!showManualContact && (
                                                    <button
                                                        type="button"
                                                        onClick={switchToManualContact}
                                                        className="text-[10px] text-[#2B4C8C] hover:text-[#2B4C8C]/80 hover:underline"
                                                    >
                                                        Not in list? Enter manually
                                                    </button>
                                                )}
                                                {showManualContact && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { setShowManualContact(false); handleChange('contact_id', null); handleChange('contact_name', ''); handleChange('contact_email', ''); handleChange('contact_phone', ''); }}
                                                        className="text-[10px] text-[#2B4C8C] hover:text-[#2B4C8C]/80 hover:underline"
                                                    >
                                                        Browse contacts
                                                    </button>
                                                )}
                                            </div>

                                            {showManualContact ? (
                                                <>
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                        <Input
                                                            value={form.contact_name}
                                                            onChange={(e) => handleChange('contact_name', e.target.value)}
                                                            onFocus={() => setFocused('contact_name')}
                                                            onBlur={() => setFocused(null)}
                                                            placeholder="Contact name"
                                                            className={cn('h-10 text-sm transition-all', focused === 'contact_name' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '')}
                                                        />
                                                        <Input
                                                            type="email"
                                                            value={form.contact_email}
                                                            onChange={(e) => handleChange('contact_email', e.target.value)}
                                                            onFocus={() => setFocused('contact_email')}
                                                            onBlur={() => setFocused(null)}
                                                            placeholder="Email"
                                                            className={cn('h-10 text-sm transition-all', focused === 'contact_email' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '')}
                                                        />
                                                        <Input
                                                            value={form.contact_phone}
                                                            onChange={(e) => handleChange('contact_phone', e.target.value)}
                                                            onFocus={() => setFocused('contact_phone')}
                                                            onBlur={() => setFocused(null)}
                                                            placeholder="Phone"
                                                            className={cn('h-10 text-sm transition-all', focused === 'contact_phone' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '')}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <SearchableSelect
                                                    items={filteredContacts}
                                                    selectedId={form.contact_id}
                                                    onSelect={(contact) => handleContactSelect(contact)}
                                                    onClear={() => handleContactSelect(null)}
                                                    placeholder="Search or select a contact..."
                                                    searchPlaceholder="Search contacts..."
                                                    displayValue={contactDisplayValue}
                                                    renderItem={(c) => (
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0f2f7]">
                                                                <User className="h-3.5 w-3.5 text-[#6b7280]" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-[#1a1a2e] truncate">{c.name}</p>
                                                                <p className="text-[11px] text-[#6b7280] truncate">
                                                                    {[c.email, c.job_title, c.organization_name].filter(Boolean).join(' · ')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    icon={User}
                                                    label=""
                                                    error={errors.contact_id}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Notes */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-500/10">
                                        <FileText className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Notes</h2>
                                        <p className="text-[11px] text-[#6b7280]">Internal notes about this deal</p>
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
                                        focused === 'notes' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : 'border-[#e2e6ef]',
                                    )}
                                />
                            </section>

                            {/* Footer */}
                            <div className="flex items-center justify-between rounded-2xl border border-[#e2e6ef] bg-white px-6 py-4 shadow-sm">
                                <p className="text-xs text-[#6b7280]"><span className="text-rose-500">*</span> Required fields</p>
                                <div className="flex items-center gap-2">
                                    <Link href={isEditing ? `/crm/deals/${deal.id}` : '/crm/deals'}>
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
                                                {isEditing ? 'Update Deal' : 'Create Deal'}
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
