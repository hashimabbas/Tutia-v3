import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, FastForward, Users, Puzzle, Shield } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';

const services = [
    'E-Commerce', 'ERP', 'Web Development', 'Mobile App', 'Connectivity',
    'Bulk SMS', 'Call Center', 'Ticketing', 'VPN', 'Payment Gateway',
    'ICT Consulting', 'Other',
];

const servicesAr = [
    'تجارة إلكترونية', 'تخطيط موارد', 'تطوير مواقع', 'تطبيقات جوال', 'اتصالات',
    'رسائل جماعية', 'مركز اتصال', 'تذاكر', 'شبكات خاصة', 'بوابة دفع',
    'استشارات تقنية', 'أخرى',
];

const trustSignals = [
    {
        icon: FastForward,
        en: { title: 'Fast Response', desc: 'Within 24 hours' },
        ar: { title: 'رد سريع', desc: 'خلال 24 ساعة' },
    },
    {
        icon: Users,
        en: { title: 'Expert Team', desc: 'Seasoned professionals' },
        ar: { title: 'فريق خبير', desc: 'محترفون ذوو خبرة' },
    },
    {
        icon: Puzzle,
        en: { title: 'Tailored Solutions', desc: 'Custom fit for your needs' },
        ar: { title: 'حلول مخصصة', desc: 'مصممة خصيصاً لاحتياجاتك' },
    },
    {
        icon: Shield,
        en: { title: 'No Obligation', desc: 'Free consultation' },
        ar: { title: 'بدون التزام', desc: 'استشارة مجانية' },
    },
];

export default function Quote() {
    const { locale } = useI18n();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        service: '',
        requirements: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/contact/quote');
    }

    return (
        <>
            <Head title={locale === 'ar' ? 'احصل على عرض سعر سريع' : 'Get a Quick Quote'}>
                <meta name="description" content={locale === 'ar' ? 'احصل على عرض سعر سريع لخدمات توتيا' : 'Get a quick quote for TUTIA services'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'احصل على عرض سعر سريع' : 'Get a Quick Quote'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'أخبرنا عن احتياجاتك وسنرد عليك بعرض مناسب'
                                : 'Tell us your needs and we\'ll get back with a suitable quote'}
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
                                        <Label htmlFor="service">{locale === 'ar' ? 'الخدمة' : 'Service'} *</Label>
                                        <Select
                                            value={data.service}
                                            onValueChange={(v) => setData('service', v)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={locale === 'ar' ? 'اختر خدمة' : 'Select a service'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {services.map((s, i) => (
                                                    <SelectItem key={s} value={s.toLowerCase()}>
                                                        {locale === 'ar' ? servicesAr[i] : s}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.service} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="requirements">{locale === 'ar' ? 'المتطلبات' : 'Requirements'} *</Label>
                                        <textarea
                                            id="requirements"
                                            rows={4}
                                            value={data.requirements}
                                            onChange={(e) => setData('requirements', e.target.value)}
                                            placeholder={locale === 'ar' ? 'صف متطلباتك' : 'Describe your requirements'}
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
                                    {locale === 'ar' ? 'احصل على عرض السعر' : 'Get a Quote'}
                                    <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                                </Button>
                            </form>
                        </div>

                        <div className="md:col-span-2">
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 md:p-8">
                                <Heading level="h3" className="text-brand-navy-900">
                                    {locale === 'ar' ? 'لماذا توتيا؟' : 'Why TUTIA?'}
                                </Heading>
                                <div className="mt-6 space-y-5">
                                    {trustSignals.map((signal, i) => {
                                        const Icon = signal.icon;

                                        return (
                                            <div key={i} className="flex gap-4">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gold-500/10">
                                                    <Icon className="size-5 text-brand-gold-500" />
                                                </div>
                                                <div>
                                                    <Text variant="body" className="font-semibold text-neutral-900">
                                                        {locale === 'ar' ? signal.ar.title : signal.en.title}
                                                    </Text>
                                                    <Text variant="body-sm" className="text-neutral-500">
                                                        {locale === 'ar' ? signal.ar.desc : signal.en.desc}
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
