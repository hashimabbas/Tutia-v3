import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, User, Mail, Phone, Building2, Linkedin, Briefcase, ChevronDown, Send, Check } from 'lucide-react';
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

interface InfluenceType {
    id: number;
    slug: string;
    name: string;
}

interface Organization {
    id: number;
    name: string;
}

interface ContactData {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    mobile: string;
    job_title: string;
    department: string;
    linkedin_url: string;
    influence_type_id: number | null;
}

interface Props {
    contact?: ContactData;
    selected_organization_ids?: string[];
    influence_types: InfluenceType[];
    organizations: Organization[];
}

const SECTIONS = ['contact', 'professional', 'affiliation', 'details'] as const;
type Section = (typeof SECTIONS)[number];

const SECTION_LABELS: Record<Section, string> = {
    contact: 'Contact',
    professional: 'Professional',
    affiliation: 'Affiliation',
    details: 'Details',
};

export default function ContactCreate({ contact, selected_organization_ids, influence_types, organizations }: Props) {
    const isEditing = !!contact;

    const [form, setForm] = useState({
        first_name: contact?.first_name ?? '',
        last_name: contact?.last_name ?? '',
        email: contact?.email ?? '',
        phone: contact?.phone ?? '',
        mobile: contact?.mobile ?? '',
        job_title: contact?.job_title ?? '',
        department: contact?.department ?? '',
        linkedin_url: contact?.linkedin_url ?? '',
        influence_type_id: contact?.influence_type_id ? String(contact.influence_type_id) : '',
        organization_ids: selected_organization_ids ?? [] as string[],
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

    const handleOrgToggle = (id: string) => {
        setForm((prev) => {
            const next = prev.organization_ids.includes(id)
                ? prev.organization_ids.filter((o) => o !== id)
                : [...prev.organization_ids, id];
            return { ...prev, organization_ids: next };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);

        const data = {
            ...form,
            influence_type_id: form.influence_type_id || undefined,
            organization_ids: form.organization_ids.length > 0 ? form.organization_ids : undefined,
        };

        if (isEditing) {
            router.patch(`/crm/contacts/${contact.id}`, data, {
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
            router.post('/crm/contacts', data, {
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
            <Head title={isEditing ? `CRM · Edit ${contact.first_name} ${contact.last_name}` : 'CRM · New Contact'} />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Header */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-white/90 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href={isEditing ? `/crm/contacts/${contact.id}` : '/crm/contacts'}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2e6ef] bg-white text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div>
                                <h1 className="text-lg font-semibold text-[#1a1a2e] tracking-tight">
                                    {isEditing ? 'Edit Contact' : 'New Contact'}
                                </h1>
                                <p className="text-xs text-[#6b7280]">
                                    {isEditing ? 'Update contact details' : 'Add a new contact to your network'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="hidden text-[11px] text-[#6b7280] md:block">
                                <kbd className="rounded-md border border-[#e2e6ef] bg-[#f8f9fc] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">⌘</kbd>
                                <kbd className="ml-0.5 rounded-md border border-[#e2e6ef] bg-[#f8f9fc] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">↵</kbd>
                                {' '}to save
                            </span>
                            <Link href={isEditing ? `/crm/contacts/${contact.id}` : '/crm/contacts'}>
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
                                        {isEditing ? 'Update Contact' : 'Create Contact'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Section tabs */}
                    <div className="flex items-center gap-0 border-t border-[#e2e6ef] px-6">
                        {SECTIONS.map((section, idx) => {
                            const completed = SECTIONS.slice(0, idx).every((s) => {
                                if (s === 'contact') return form.first_name && form.last_name && form.email;
                                return true;
                            });
                            return (
                                <div
                                    key={section}
                                    className={cn(
                                        'flex items-center gap-2 border-b-2 py-2.5 text-[11px] font-medium transition-all',
                                        idx <= SECTIONS.length
                                            ? 'border-[#2B4C8C] text-[#2B4C8C]'
                                            : 'border-transparent text-[#9ca3af]',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                                            idx <= SECTIONS.length
                                                ? 'bg-[#2B4C8C] text-white'
                                                : 'bg-[#e2e6ef] text-[#6b7280]',
                                        )}
                                    >
                                        {completed && idx > 0 ? (
                                            <Check className="h-3 w-3" />
                                        ) : (
                                            idx + 1
                                        )}
                                    </span>
                                    {SECTION_LABELS[section]}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-4xl px-6 py-8">
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                            {/* Contact Information */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B4C8C]/10">
                                        <User className="h-4 w-4 text-[#2B4C8C]" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Contact Information</h2>
                                        <p className="text-[11px] text-[#6b7280]">Basic personal and contact details</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div data-field="first_name">
                                        <Label htmlFor="first_name" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            First Name <span className="text-rose-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                                            <Input
                                                id="first_name"
                                                value={form.first_name}
                                                onChange={(e) => handleChange('first_name', e.target.value)}
                                                onFocus={() => setFocused('first_name')}
                                                onBlur={() => setFocused(null)}
                                                placeholder="e.g. Ahmed"
                                                className={cn(
                                                    'h-10 pl-10 text-sm transition-all',
                                                    errors.first_name
                                                        ? 'border-rose-300 ring-rose-200/50'
                                                        : focused === 'first_name'
                                                            ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10'
                                                            : '',
                                                )}
                                            />
                                        </div>
                                        {errors.first_name && (
                                            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-600">
                                                {errors.first_name}
                                            </p>
                                        )}
                                    </div>

                                    <div data-field="last_name">
                                        <Label htmlFor="last_name" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Last Name <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="last_name"
                                            value={form.last_name}
                                            onChange={(e) => handleChange('last_name', e.target.value)}
                                            onFocus={() => setFocused('last_name')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="e.g. Al-Saud"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                errors.last_name
                                                    ? 'border-rose-300 ring-rose-200/50'
                                                    : focused === 'last_name'
                                                        ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10'
                                                        : '',
                                            )}
                                        />
                                        {errors.last_name && (
                                            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-600">
                                                {errors.last_name}
                                            </p>
                                        )}
                                    </div>

                                    <div data-field="email">
                                        <Label htmlFor="email" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Email <span className="text-rose-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                onFocus={() => setFocused('email')}
                                                onBlur={() => setFocused(null)}
                                                placeholder="ahmed@example.com"
                                                className={cn(
                                                    'h-10 pl-10 text-sm transition-all',
                                                    errors.email
                                                        ? 'border-rose-300 ring-rose-200/50'
                                                        : focused === 'email'
                                                            ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10'
                                                            : '',
                                                )}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-600">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div data-field="phone">
                                        <Label htmlFor="phone" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Phone
                                        </Label>
                                        <div className="relative">
                                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                                            <Input
                                                id="phone"
                                                value={form.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                onFocus={() => setFocused('phone')}
                                                onBlur={() => setFocused(null)}
                                                placeholder="+966 50 000 0000"
                                                className={cn(
                                                    'h-10 pl-10 text-sm transition-all',
                                                    focused === 'phone' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div data-field="mobile">
                                        <Label htmlFor="mobile" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Mobile
                                        </Label>
                                        <div className="relative">
                                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                                            <Input
                                                id="mobile"
                                                value={form.mobile}
                                                onChange={(e) => handleChange('mobile', e.target.value)}
                                                onFocus={() => setFocused('mobile')}
                                                onBlur={() => setFocused(null)}
                                                placeholder="+966 55 000 0000"
                                                className={cn(
                                                    'h-10 pl-10 text-sm transition-all',
                                                    focused === 'mobile' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Professional */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                        <Briefcase className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Professional</h2>
                                        <p className="text-[11px] text-[#6b7280]">Job role, department, and influence</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div data-field="job_title">
                                        <Label htmlFor="job_title" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Job Title
                                        </Label>
                                        <Input
                                            id="job_title"
                                            value={form.job_title}
                                            onChange={(e) => handleChange('job_title', e.target.value)}
                                            onFocus={() => setFocused('job_title')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="e.g. CEO, Director"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                focused === 'job_title' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                    </div>

                                    <div data-field="department">
                                        <Label htmlFor="department" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Department
                                        </Label>
                                        <Input
                                            id="department"
                                            value={form.department}
                                            onChange={(e) => handleChange('department', e.target.value)}
                                            onFocus={() => setFocused('department')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="e.g. Engineering, Sales"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                focused === 'department' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                    </div>

                                    <div data-field="influence_type_id">
                                        <Label className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Influence Type
                                        </Label>
                                        <Select
                                            value={form.influence_type_id}
                                            onValueChange={(v) => handleChange('influence_type_id', v)}
                                        >
                                            <SelectTrigger className="h-10 text-sm">
                                                <SelectValue placeholder="Select influence type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {influence_types.map((t) => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div data-field="linkedin_url">
                                        <Label htmlFor="linkedin_url" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            LinkedIn URL
                                        </Label>
                                        <div className="relative">
                                            <Linkedin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                                            <Input
                                                id="linkedin_url"
                                                value={form.linkedin_url}
                                                onChange={(e) => handleChange('linkedin_url', e.target.value)}
                                                onFocus={() => setFocused('linkedin_url')}
                                                onBlur={() => setFocused(null)}
                                                placeholder="https://linkedin.com/in/..."
                                                className={cn(
                                                    'h-10 pl-10 text-sm transition-all',
                                                    focused === 'linkedin_url' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Affiliation - Organizations */}
                            {organizations.length > 0 && (
                                <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                                            <Building2 className="h-4 w-4 text-violet-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-[#1a1a2e]">Affiliation</h2>
                                            <p className="text-[11px] text-[#6b7280]">Link to organizations</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {organizations.map((org) => {
                                            const selected = form.organization_ids.includes(String(org.id));
                                            return (
                                                <button
                                                    key={org.id}
                                                    type="button"
                                                    onClick={() => handleOrgToggle(String(org.id))}
                                                    className={cn(
                                                        'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all',
                                                        selected
                                                            ? 'border-[#2B4C8C] bg-[#2B4C8C]/5 ring-1 ring-[#2B4C8C]/20'
                                                            : 'border-[#e2e6ef] hover:border-[#c8cce0] hover:bg-[#f8f9fc]',
                                                    )}
                                                >
                                                    <div className={cn(
                                                        'flex h-5 w-5 items-center justify-center rounded border transition-all',
                                                        selected
                                                            ? 'border-[#2B4C8C] bg-[#2B4C8C] text-white'
                                                            : 'border-[#e2e6ef]',
                                                    )}>
                                                        {selected && <Check className="h-3 w-3" />}
                                                    </div>
                                                    <Building2 className={cn('h-4 w-4 shrink-0', selected ? 'text-[#2B4C8C]' : 'text-[#6b7280]')} />
                                                    <span className={selected ? 'font-medium text-[#1a1a2e]' : 'text-[#6b7280]'}>
                                                        {org.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

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
                                    <Link href={isEditing ? `/crm/contacts/${contact.id}` : '/crm/contacts'}>
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
                                                {isEditing ? 'Update Contact' : 'Create Contact'}
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
