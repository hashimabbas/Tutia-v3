import { Head, useForm } from '@inertiajs/react';
import { Clock, Award, Shield, Phone, Mail, ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import InputError from '@/components/input-error';
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
import { useI18n } from '@/lib/i18n';

const timeSlots = [
    { value: 'morning', en: 'Morning 9-12', ar: 'صباحاً 9-12' },
    { value: 'afternoon', en: 'Afternoon 12-5', ar: 'مساءً 12-5' },
    { value: 'evening', en: 'Evening 5-8', ar: 'مساءً 5-8' },
];

const benefits = [
    {
        icon: Clock,
        en: 'Fast Response',
        ar: 'رد سريع',
        descEn: 'We respond within 24 hours',
        descAr: 'نرد عليك خلال 24 ساعة',
    },
    {
        icon: Award,
        en: 'Expert Team',
        ar: 'فريق خبير',
        descEn: 'Certified professionals with years of experience',
        descAr: 'محترفون معتمدون بخبرة سنوات',
    },
    {
        icon: Shield,
        en: 'No Obligation',
        ar: 'بدون التزام',
        descEn: 'Free consultation with no commitment required',
        descAr: 'استشارة مجانية بدون أي التزام',
    },
];

export default function Consultation() {
    const { locale } = useI18n();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        description: '',
        time_slot: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/contact/consultation');
    }

    return (
        <>
            <Head
                title={
                    locale === 'ar'
                        ? 'احجز استشارة مجانية'
                        : 'Book a Free Consultation'
                }
            >
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'احجز استشارة مجانية مع فريق توتيا التقني'
                            : 'Book a free consultation with the TUTIA technical team'
                    }
                />
            </Head>

            <Section
                background="navy"
                className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h1" className="text-white">
                            {locale === 'ar'
                                ? 'احجز استشارة مجانية'
                                : 'Book a Free Consultation'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'أخبرنا عن مشروعك وسنرد عليك خلال 24 ساعة'
                                : "Tell us about your project and we'll get back to you within 24 hours"}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="grid gap-12 md:grid-cols-5">
                        <div className="md:col-span-3">
                            <form
                                onSubmit={handleSubmit}
                                className="rounded-xl border border-neutral-200 bg-white p-6 md:p-8"
                            >
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            {locale === 'ar'
                                                ? 'الاسم الكامل'
                                                : 'Full Name'}{' '}
                                            *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder={
                                                locale === 'ar'
                                                    ? 'اسمك الكامل'
                                                    : 'Your full name'
                                            }
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            {locale === 'ar'
                                                ? 'البريد الإلكتروني'
                                                : 'Email'}{' '}
                                            *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            placeholder="you@example.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            {locale === 'ar'
                                                ? 'رقم الهاتف'
                                                : 'Phone'}{' '}
                                            *
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData('phone', e.target.value)
                                            }
                                            placeholder="+249"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company">
                                            {locale === 'ar'
                                                ? 'الشركة'
                                                : 'Company'}
                                        </Label>
                                        <Input
                                            id="company"
                                            value={data.company}
                                            onChange={(e) =>
                                                setData(
                                                    'company',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={
                                                locale === 'ar'
                                                    ? 'اسم الشركة (اختياري)'
                                                    : 'Company name (optional)'
                                            }
                                        />
                                        <InputError message={errors.company} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="time_slot">
                                            {locale === 'ar'
                                                ? 'الوقت المفضل'
                                                : 'Preferred Time'}{' '}
                                            *
                                        </Label>
                                        <Select
                                            value={data.time_slot}
                                            onValueChange={(v) =>
                                                setData('time_slot', v)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        locale === 'ar'
                                                            ? 'اختر الوقت المناسب'
                                                            : 'Select a time slot'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((slot) => (
                                                    <SelectItem
                                                        key={slot.value}
                                                        value={slot.value}
                                                    >
                                                        {locale === 'ar'
                                                            ? slot.ar
                                                            : slot.en}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.time_slot}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="description">
                                            {locale === 'ar'
                                                ? 'وصف المشروع'
                                                : 'Project Description'}{' '}
                                            *
                                        </Label>
                                        <textarea
                                            id="description"
                                            rows={4}
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={
                                                locale === 'ar'
                                                    ? 'صف مشروعك بإيجاز'
                                                    : 'Briefly describe your project'
                                            }
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    size="lg"
                                    className="mt-6 w-full bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                                >
                                    {locale === 'ar'
                                        ? 'احجز الاستشارة'
                                        : 'Book Consultation'}
                                    <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                                </Button>
                            </form>
                        </div>

                        <div className="md:col-span-2">
                            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 md:p-8">
                                <Heading
                                    level="h3"
                                    className="text-brand-navy-900"
                                >
                                    {locale === 'ar'
                                        ? 'لماذا تحجز مع توتيا؟'
                                        : 'Why book with TUTIA?'}
                                </Heading>
                                <div className="mt-6 space-y-6">
                                    {benefits.map((benefit, i) => {
                                        const Icon = benefit.icon;

                                        return (
                                            <div key={i} className="flex gap-4">
                                                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-gold-500/10">
                                                    <Icon className="size-6 text-brand-gold-500" />
                                                </div>
                                                <div>
                                                    <Text
                                                        variant="body"
                                                        className="font-semibold text-neutral-900"
                                                    >
                                                        {locale === 'ar'
                                                            ? benefit.ar
                                                            : benefit.en}
                                                    </Text>
                                                    <Text
                                                        variant="body-sm"
                                                        className="text-neutral-600"
                                                    >
                                                        {locale === 'ar'
                                                            ? benefit.descAr
                                                            : benefit.descEn}
                                                    </Text>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-8 border-t border-neutral-200 pt-6">
                                    <Text
                                        variant="body"
                                        className="font-semibold text-neutral-900"
                                    >
                                        {locale === 'ar'
                                            ? 'معلومات الاتصال'
                                            : 'Contact Information'}
                                    </Text>
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Phone className="size-4 text-brand-navy-500" />
                                            <Text
                                                variant="body-sm"
                                                className="text-neutral-600"
                                            >
                                                +249 123 456 789
                                            </Text>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="size-4 text-brand-navy-500" />
                                            <Text
                                                variant="body-sm"
                                                className="text-neutral-600"
                                            >
                                                info@tutia.sd
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </Section>
        </>
    );
}
