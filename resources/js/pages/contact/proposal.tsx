import { Head, useForm } from '@inertiajs/react';
import { FileText, Search, PenTool, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';

const projectTypes = [
    'E-Commerce', 'ERP', 'Web Development', 'Mobile App', 'Connectivity',
    'Bulk SMS', 'Call Center', 'Ticketing', 'VPN', 'Payment Gateway',
    'ICT Consulting', 'Other',
];

const projectTypesAr = [
    'تجارة إلكترونية', 'تخطيط موارد', 'تطوير مواقع', 'تطبيقات جوال', 'اتصالات',
    'رسائل جماعية', 'مركز اتصال', 'تذاكر', 'شبكات خاصة', 'بوابة دفع',
    'استشارات تقنية', 'أخرى',
];

const budgetRanges = [
    { value: 'under_1k', en: 'Under $1,000', ar: 'أقل من $1,000' },
    { value: '1k_5k', en: '$1,000-$5,000', ar: '$1,000-$5,000' },
    { value: '5k_20k', en: '$5,000-$20,000', ar: '$5,000-$20,000' },
    { value: '20k_plus', en: '$20,000+', ar: '$20,000+' },
    { value: 'not_sure', en: 'Not Sure', ar: 'غير متأكد' },
];

const timelines = [
    { value: 'asap', en: 'ASAP - 1 Month', ar: 'فوراً - شهر' },
    { value: '1_3', en: '1-3 Months', ar: '1-3 أشهر' },
    { value: '3_6', en: '3-6 Months', ar: '3-6 أشهر' },
    { value: '6_plus', en: '6+ Months', ar: '6+ أشهر' },
    { value: 'not_sure', en: 'Not Sure', ar: 'غير متأكد' },
];

const steps = [
    { icon: Search, en: 'We review your requirements', ar: 'نراجع متطلباتك' },
    { icon: PenTool, en: 'We prepare a tailored proposal', ar: 'نعد عرضاً مخصصاً' },
    { icon: Phone, en: 'We schedule a call to discuss', ar: 'نحدد موعداً للمناقشة' },
    { icon: CheckCircle, en: 'You approve and we start', ar: 'توافق ونبدأ التنفيذ' },
];

export default function Proposal() {
    const { locale } = useI18n();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        project_type: '',
        budget_range: '',
        timeline: '',
        requirements: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/contact/proposal');
    }

    return (
        <>
            <Head title={locale === 'ar' ? 'طلب عرض سعر' : 'Request a Proposal'}>
                <meta name="description" content={locale === 'ar' ? 'اطلب عرض سعر مخصص لمشروعك من توتيا' : 'Request a tailored proposal for your project from TUTIA'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <FileText className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'طلب عرض سعر' : 'Request a Proposal'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'أخبرنا عن مشروعك وسنعد لك عرضاً مخصصاً'
                                : 'Tell us about your project and we\'ll prepare a tailored proposal'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="grid gap-12 md:grid-cols-5">
                        <div className="md:col-span-3">
                            <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-6 md:p-8">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{locale === 'ar' ? 'الاسم الكامل' : 'Full Name'} *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder={locale === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="you@example.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">{locale === 'ar' ? 'رقم الهاتف' : 'Phone'} *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+249"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company">{locale === 'ar' ? 'الشركة' : 'Company'}</Label>
                                        <Input
                                            id="company"
                                            value={data.company}
                                            onChange={(e) => setData('company', e.target.value)}
                                            placeholder={locale === 'ar' ? 'اسم الشركة (اختياري)' : 'Company name (optional)'}
                                        />
                                        <InputError message={errors.company} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="project_type">{locale === 'ar' ? 'نوع المشروع' : 'Project Type'} *</Label>
                                        <Select
                                            value={data.project_type}
                                            onValueChange={(v) => setData('project_type', v)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={locale === 'ar' ? 'اختر نوع المشروع' : 'Select project type'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projectTypes.map((type, i) => (
                                                    <SelectItem key={type} value={type.toLowerCase()}>
                                                        {locale === 'ar' ? projectTypesAr[i] : type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.project_type} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="budget_range">{locale === 'ar' ? 'نطاق الميزانية' : 'Budget Range'} *</Label>
                                        <Select
                                            value={data.budget_range}
                                            onValueChange={(v) => setData('budget_range', v)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={locale === 'ar' ? 'اختر نطاق الميزانية' : 'Select budget range'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {budgetRanges.map((r) => (
                                                    <SelectItem key={r.value} value={r.value}>
                                                        {locale === 'ar' ? r.ar : r.en}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.budget_range} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="timeline">{locale === 'ar' ? 'الجدول الزمني' : 'Timeline'} *</Label>
                                        <Select
                                            value={data.timeline}
                                            onValueChange={(v) => setData('timeline', v)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={locale === 'ar' ? 'اختر الجدول الزمني' : 'Select timeline'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timelines.map((t) => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {locale === 'ar' ? t.ar : t.en}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.timeline} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="requirements">{locale === 'ar' ? 'المتطلبات' : 'Requirements'} *</Label>
                                        <textarea
                                            id="requirements"
                                            rows={5}
                                            value={data.requirements}
                                            onChange={(e) => setData('requirements', e.target.value)}
                                            placeholder={locale === 'ar' ? 'صف متطلبات مشروعك بالتفصيل' : 'Describe your project requirements in detail'}
                                            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] md:text-sm"
                                        />
                                        <InputError message={errors.requirements} />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    size="lg"
                                    className="mt-6 w-full bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                                >
                                    {locale === 'ar' ? 'طلب عرض السعر' : 'Request Proposal'}
                                    <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                                </Button>
                            </form>
                        </div>

                        <div className="md:col-span-2">
                            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 md:p-8">
                                <Heading level="h3" className="text-brand-navy-900">
                                    {locale === 'ar' ? 'ماذا يحدث بعد ذلك؟' : 'What happens next?'}
                                </Heading>
                                <div className="mt-6 space-y-6">
                                    {steps.map((step, i) => {
                                        const Icon = step.icon;

                                        return (
                                            <div key={i} className="flex gap-4">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gold-500 text-sm font-bold text-white">
                                                    {i + 1}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Icon className="size-5 text-brand-navy-500" />
                                                    <Text variant="body" className="text-neutral-700">
                                                        {locale === 'ar' ? step.ar : step.en}
                                                    </Text>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </Section>
        </>
    );
}
