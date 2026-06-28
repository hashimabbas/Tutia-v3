import { Head, useForm } from '@inertiajs/react';
import { Phone, Mail, Clock, MessageSquare, ArrowRight } from 'lucide-react';
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

const services = [
    'E-Commerce',
    'ERP',
    'Web Development',
    'Mobile App',
    'Connectivity',
    'Bulk SMS',
    'Call Center',
    'Ticketing',
    'VPN',
    'Payment Gateway',
    'ICT Consulting',
];

const servicesAr = [
    'تجارة إلكترونية',
    'تخطيط موارد',
    'تطوير مواقع',
    'تطبيقات جوال',
    'اتصالات',
    'رسائل جماعية',
    'مركز اتصال',
    'تذاكر',
    'شبكات خاصة',
    'بوابة دفع',
    'استشارات تقنية',
];

export default function Sales() {
    const { locale } = useI18n();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/contact/submit');
    }

    return (
        <>
            <Head
                title={
                    locale === 'ar'
                        ? 'تحدث إلى فريق المبيعات'
                        : 'Talk to Our Sales Team'
                }
            >
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'تواصل مع فريق مبيعات توتيا للاستفسار عن خدماتنا'
                            : 'Contact the TUTIA sales team to inquire about our services'
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
                        <MessageSquare className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar'
                                ? 'تحدث إلى فريق المبيعات'
                                : 'Talk to Our Sales Team'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'نحن هنا للإجابة على جميع استفساراتك'
                                : 'We are here to answer all your questions'}
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
                                <Heading level="h3" className="mb-6">
                                    {locale === 'ar'
                                        ? 'أرسل لنا رسالة'
                                        : 'Send us a message'}
                                </Heading>
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
                                        <Label htmlFor="service">
                                            {locale === 'ar'
                                                ? 'الخدمة المطلوبة'
                                                : 'Service Interest'}{' '}
                                            *
                                        </Label>
                                        <Select
                                            value={data.service}
                                            onValueChange={(v) =>
                                                setData('service', v)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        locale === 'ar'
                                                            ? 'اختر خدمة'
                                                            : 'Select a service'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {services.map((s, i) => (
                                                    <SelectItem
                                                        key={s}
                                                        value={s.toLowerCase()}
                                                    >
                                                        {locale === 'ar'
                                                            ? servicesAr[i]
                                                            : s}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.service} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="message">
                                            {locale === 'ar'
                                                ? 'الرسالة'
                                                : 'Message'}{' '}
                                            *
                                        </Label>
                                        <textarea
                                            id="message"
                                            rows={4}
                                            value={data.message}
                                            onChange={(e) =>
                                                setData(
                                                    'message',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={
                                                locale === 'ar'
                                                    ? 'اكتب رسالتك هنا'
                                                    : 'Type your message here'
                                            }
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
                                        />
                                        <InputError message={errors.message} />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    size="lg"
                                    className="mt-6 w-full bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                                >
                                    {locale === 'ar'
                                        ? 'إرسال الرسالة'
                                        : 'Send Message'}
                                    <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                                </Button>
                            </form>
                        </div>

                        <div className="space-y-6 md:col-span-2">
                            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Phone className="size-6 text-brand-navy-500" />
                                    </div>
                                    <div>
                                        <Text
                                            variant="body"
                                            className="font-semibold text-neutral-900"
                                        >
                                            {locale === 'ar'
                                                ? 'تفضل بالاتصال'
                                                : 'Prefer to call?'}
                                        </Text>
                                        <Text
                                            variant="body-sm"
                                            className="mt-1 text-neutral-600"
                                        >
                                            +249 123 456 789
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Clock className="size-6 text-brand-navy-500" />
                                    </div>
                                    <div>
                                        <Text
                                            variant="body"
                                            className="font-semibold text-neutral-900"
                                        >
                                            {locale === 'ar'
                                                ? 'ساعات العمل'
                                                : 'Office Hours'}
                                        </Text>
                                        <Text
                                            variant="body-sm"
                                            className="mt-1 text-neutral-600"
                                        >
                                            {locale === 'ar'
                                                ? 'الأحد - الخميس: 9:00 ص - 5:00 م'
                                                : 'Sunday - Thursday: 9:00 AM - 5:00 PM'}
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Mail className="size-6 text-brand-navy-500" />
                                    </div>
                                    <div>
                                        <Text
                                            variant="body"
                                            className="font-semibold text-neutral-900"
                                        >
                                            {locale === 'ar'
                                                ? 'راسلنا مباشرة'
                                                : 'Email us directly'}
                                        </Text>
                                        <Text
                                            variant="body-sm"
                                            className="mt-1 text-neutral-600"
                                        >
                                            sales@tutia.sd
                                        </Text>
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
