import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Building2, Mail, Phone, Target, Send, User, ChevronDown, Check } from 'lucide-react';
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

interface LeadData {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    source: string;
    stage: string;
    priority: string;
    service: string;
    project_type: string;
    budget: string;
    timeline: string;
    message: string;
    brief: string;
    requirements: string;
}

interface Props {
    lead?: LeadData;
    sources: string[];
    stages: string[];
}

const SECTIONS = ['contact', 'classification', 'details', 'notes'] as const;
type Section = (typeof SECTIONS)[number];

const SECTION_LABELS: Record<Section, string> = {
    contact: 'Contact',
    classification: 'Classification',
    details: 'Project Details',
    notes: 'Notes',
};

const STAGE_COLORS: Record<string, string> = {
    new: 'bg-blue-600',
    contacted: 'bg-amber-600',
    qualified: 'bg-violet-600',
    proposal: 'bg-orange-600',
    negotiation: 'bg-rose-600',
    converted: 'bg-emerald-600',
    lost: 'bg-red-600',
};

const PRIORITY_COLORS: Record<string, string> = {
    high: 'bg-rose-500',
    medium: 'bg-amber-500',
    low: 'bg-slate-400',
};

export default function LeadCreate({ lead, sources, stages }: Props) {
    const isEditing = !!lead;
    const [form, setForm] = useState({
        name: lead?.name ?? '',
        email: lead?.email ?? '',
        phone: lead?.phone ?? '',
        company: lead?.company ?? '',
        source: lead?.source ?? 'contact',
        stage: lead?.stage ?? 'new',
        priority: lead?.priority ?? 'medium',
        service: lead?.service ?? '',
        project_type: lead?.project_type ?? '',
        budget: lead?.budget ?? '',
        timeline: lead?.timeline ?? '',
        message: lead?.message ?? '',
        brief: lead?.brief ?? '',
        requirements: lead?.requirements ?? '',
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);

        const onFinish = () => setSaving(false);
        const onError = (errs: Record<string, string>) => {
            setErrors(errs);
            setSaving(false);
            const first = Object.keys(errs)[0];
            if (first) {
                document.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                document.querySelector(`[data-field="${first}"] input`)?.focus();
            }
        };

        if (isEditing) {
            router.patch(`/crm/leads/${lead.id}`, form, {
                onSuccess: () => setSaving(false),
                onError,
            });
        } else {
            router.post('/crm/leads', form, { onSuccess: onFinish, onError });
        }
    };

    return (
        <>
            <Head title={isEditing ? `CRM · Edit ${lead.name}` : 'CRM · New Lead'} />

            <div className="flex h-full flex-col bg-[#f8f9fc]">
                {/* Header */}
                <div className="sticky top-0 z-20 border-b border-[#e2e6ef] bg-white/90 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href={isEditing ? `/crm/leads/${lead.id}` : '/crm/leads'}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2e6ef] bg-white text-[#6b7280] shadow-sm transition-all hover:border-[#c8cce0] hover:text-[#1a1a2e] hover:shadow-md"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div>
                                <h1 className="text-lg font-semibold text-[#1a1a2e] tracking-tight">{isEditing ? 'Edit Lead' : 'New Lead'}</h1>
                                <p className="text-xs text-[#6b7280]">{isEditing ? 'Update lead details' : 'Add a new lead to the CRM pipeline'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="hidden text-[11px] text-[#6b7280] md:block">
                                <kbd className="rounded-md border border-[#e2e6ef] bg-[#f8f9fc] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">⌘</kbd>
                                <kbd className="ml-0.5 rounded-md border border-[#e2e6ef] bg-[#f8f9fc] px-1.5 py-0.5 text-[10px] font-medium text-[#6b7280]">↵</kbd>
                                {' '}to save
                            </span>
                            <Link href={isEditing ? `/crm/leads/${lead.id}` : '/crm/leads'}>
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
                                        {isEditing ? 'Update Lead' : 'Create Lead'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Section tabs */}
                    <div className="flex items-center gap-0 border-t border-[#e2e6ef] px-6">
                        {SECTIONS.map((section, idx) => {
                            const completed = SECTIONS.slice(0, idx).every((s) => {
                                if (s === 'contact') return form.name && form.email;
                                if (s === 'classification') return form.source;
                                return true;
                            });
                            const isActive = idx <= SECTIONS.length;
                            return (
                                <div
                                    key={section}
                                    className={cn(
                                        'flex items-center gap-2 border-b-2 py-2.5 text-[11px] font-medium transition-all',
                                        isActive
                                            ? 'border-[#2B4C8C] text-[#2B4C8C]'
                                            : 'border-transparent text-[#9ca3af]',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                                            isActive
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
                                        <p className="text-[11px] text-[#6b7280]">Basic details about the lead</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="md:col-span-2" data-field="name">
                                        <Label htmlFor="name" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Full Name <span className="text-rose-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                                            <Input
                                                id="name"
                                                value={form.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                onFocus={() => setFocused('name')}
                                                onBlur={() => setFocused(null)}
                                                placeholder="e.g. Ahmed Al-Saud"
                                                className={cn(
                                                    'h-10 pl-10 text-sm transition-all',
                                                    errors.name
                                                        ? 'border-rose-300 ring-rose-200/50'
                                                        : focused === 'name'
                                                            ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10'
                                                            : '',
                                                )}
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-600">
                                                {errors.name}
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

                                    <div className="md:col-span-2" data-field="company">
                                        <Label htmlFor="company" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Company
                                        </Label>
                                        <div className="relative">
                                            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                                            <Input
                                                id="company"
                                                value={form.company}
                                                onChange={(e) => handleChange('company', e.target.value)}
                                                onFocus={() => setFocused('company')}
                                                onBlur={() => setFocused(null)}
                                                placeholder="Company name"
                                                className={cn(
                                                    'h-10 pl-10 text-sm transition-all',
                                                    focused === 'company' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Classification */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                        <ChevronDown className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Classification</h2>
                                        <p className="text-[11px] text-[#6b7280]">Source, stage, and priority</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                    <div data-field="source">
                                        <Label className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Source <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select
                                            value={form.source}
                                            onValueChange={(v) => handleChange('source', v)}
                                        >
                                            <SelectTrigger className={cn('h-10 text-sm', errors.source && 'border-rose-300')}>
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sources.map((s) => (
                                                    <SelectItem key={s} value={s}>
                                                        {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.source && (
                                            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-600">
                                                {errors.source}
                                            </p>
                                        )}
                                    </div>

                                    <div data-field="stage">
                                        <Label className="mb-1.5 text-xs font-medium text-[#374151]">Stage</Label>
                                        <div className="relative">
                                            <Select value={form.stage} onValueChange={(v) => handleChange('stage', v)}>
                                                <SelectTrigger className="h-10 text-sm">
                                                    <SelectValue placeholder="Select stage" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stages.map((s) => (
                                                        <SelectItem key={s} value={s}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn('h-2 w-2 rounded-full', STAGE_COLORS[s])} />
                                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div data-field="priority">
                                        <Label className="mb-1.5 text-xs font-medium text-[#374151]">Priority</Label>
                                        <Select value={form.priority} onValueChange={(v) => handleChange('priority', v)}>
                                            <SelectTrigger className="h-10 text-sm">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    { value: 'low', label: 'Low' },
                                                    { value: 'medium', label: 'Medium' },
                                                    { value: 'high', label: 'High' },
                                                ].map((p) => (
                                                    <SelectItem key={p.value} value={p.value}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn('h-2 w-2 rounded-full', PRIORITY_COLORS[p.value])} />
                                                            {p.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </section>

                            {/* Project Details */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <Target className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Project Details</h2>
                                        <p className="text-[11px] text-[#6b7280]">Service, budget, and timeline information</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div data-field="service">
                                        <Label htmlFor="service" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Service
                                        </Label>
                                        <Input
                                            id="service"
                                            value={form.service}
                                            onChange={(e) => handleChange('service', e.target.value)}
                                            onFocus={() => setFocused('service')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="e.g. Web Development"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                focused === 'service' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                    </div>
                                    <div data-field="project_type">
                                        <Label htmlFor="project_type" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Project Type
                                        </Label>
                                        <Input
                                            id="project_type"
                                            value={form.project_type}
                                            onChange={(e) => handleChange('project_type', e.target.value)}
                                            onFocus={() => setFocused('project_type')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="e.g. New Website"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                focused === 'project_type' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                    </div>
                                    <div data-field="budget">
                                        <Label htmlFor="budget" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Budget
                                        </Label>
                                        <div className="relative">
                                            <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                                            <Input
                                                id="budget"
                                                value={form.budget}
                                                onChange={(e) => handleChange('budget', e.target.value)}
                                                onFocus={() => setFocused('budget')}
                                                onBlur={() => setFocused(null)}
                                                placeholder="e.g. $10,000 – $20,000"
                                                className={cn(
                                                    'h-10 pl-10 text-sm transition-all',
                                                    focused === 'budget' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div data-field="timeline">
                                        <Label htmlFor="timeline" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Timeline
                                        </Label>
                                        <Input
                                            id="timeline"
                                            value={form.timeline}
                                            onChange={(e) => handleChange('timeline', e.target.value)}
                                            onFocus={() => setFocused('timeline')}
                                            onBlur={() => setFocused(null)}
                                            placeholder="e.g. 2-3 months"
                                            className={cn(
                                                'h-10 text-sm transition-all',
                                                focused === 'timeline' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : '',
                                            )}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Notes */}
                            <section className="rounded-2xl border border-[#e2e6ef] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                        <Send className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Notes</h2>
                                        <p className="text-[11px] text-[#6b7280]">Additional information about the lead</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5">
                                    <div data-field="message">
                                        <Label htmlFor="message" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Message
                                        </Label>
                                        <textarea
                                            id="message"
                                            value={form.message}
                                            onChange={(e) => handleChange('message', e.target.value)}
                                            onFocus={() => setFocused('message')}
                                            onBlur={() => setFocused(null)}
                                            rows={3}
                                            placeholder="Lead's initial message or inquiry"
                                            className={cn(
                                                'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition-all resize-none',
                                                focused === 'message' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : 'border-[#e2e6ef]',
                                            )}
                                        />
                                    </div>
                                    <div data-field="brief">
                                        <Label htmlFor="brief" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Brief
                                        </Label>
                                        <textarea
                                            id="brief"
                                            value={form.brief}
                                            onChange={(e) => handleChange('brief', e.target.value)}
                                            onFocus={() => setFocused('brief')}
                                            onBlur={() => setFocused(null)}
                                            rows={3}
                                            placeholder="Brief description of the project"
                                            className={cn(
                                                'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition-all resize-none',
                                                focused === 'brief' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : 'border-[#e2e6ef]',
                                            )}
                                        />
                                    </div>
                                    <div data-field="requirements">
                                        <Label htmlFor="requirements" className="mb-1.5 text-xs font-medium text-[#374151]">
                                            Requirements
                                        </Label>
                                        <textarea
                                            id="requirements"
                                            value={form.requirements}
                                            onChange={(e) => handleChange('requirements', e.target.value)}
                                            onFocus={() => setFocused('requirements')}
                                            onBlur={() => setFocused(null)}
                                            rows={3}
                                            placeholder="Specific requirements or scope items"
                                            className={cn(
                                                'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition-all resize-none',
                                                focused === 'requirements' ? 'border-[#2B4C8C] ring-[3px] ring-[#2B4C8C]/10' : 'border-[#e2e6ef]',
                                            )}
                                        />
                                    </div>
                                </div>
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
                                    <Link href={isEditing ? `/crm/leads/${lead.id}` : '/crm/leads'}>
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
                                                {isEditing ? 'Update Lead' : 'Create Lead'}
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