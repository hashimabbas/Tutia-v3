import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    FileText,
    Headset,
    DollarSign,
    Phone,
    Mail,
    MapPin,
    ArrowRight,
} from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { COMPANY_INFO } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';

const cards = [
    {
        icon: Calendar,
        href: '/contact/consultation',
        en: {
            title: 'Book a Free Consultation',
            desc: 'Schedule a no-obligation consultation with our experts',
        },
        ar: {
            title: 'احجز استشارة مجانية',
            desc: 'احجز استشارة بدون التزام مع خبرائنا',
        },
    },
    {
        icon: FileText,
        href: '/contact/proposal',
        en: {
            title: 'Request a Proposal',
            desc: 'Get a tailored proposal for your project',
        },
        ar: { title: 'طلب عرض سعر', desc: 'احصل على عرض سعر مخصص لمشروعك' },
    },
    {
        icon: Headset,
        href: '/contact/sales',
        en: {
            title: 'Contact Sales',
            desc: 'Speak with our sales team directly',
        },
        ar: {
            title: 'تحدث إلى المبيعات',
            desc: 'تحدث مع فريق المبيعات مباشرة',
        },
    },
    {
        icon: DollarSign,
        href: '/contact/quote',
        en: {
            title: 'Get a Quick Quote',
            desc: 'Receive a quick estimate for your needs',
        },
        ar: {
            title: 'احصل على عرض سعر سريع',
            desc: 'احصل على تقدير سريع لاحتياجاتك',
        },
    },
];

export default function ContactIndex() {
    const { locale } = useI18n();

    const contactItems = [
        {
            icon: Phone,
            labelEn: 'Phone',
            labelAr: 'الهاتف',
            value: COMPANY_INFO.phone[0],
        },
        {
            icon: Mail,
            labelEn: 'Email',
            labelAr: 'البريد الإلكتروني',
            value: COMPANY_INFO.email,
        },
        {
            icon: MapPin,
            labelEn: 'Address',
            labelAr: 'العنوان',
            value:
                locale === 'ar' ? COMPANY_INFO.addressAr : COMPANY_INFO.address,
        },
    ];

    return (
        <>
            <Head title={locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}>
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'تواصل مع فريق توتيا'
                            : 'Get in touch with the TUTIA team'
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
                            {locale === 'ar' ? 'لنتحدث' : "Let's Talk"}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'نحن هنا لمساعدتك. اختر الطريقة الأنسب للتواصل معنا'
                                : 'We are here to help. Choose the best way to reach us'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="grid gap-6 md:grid-cols-2">
                        {cards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <Link
                                    key={card.href}
                                    href={card.href}
                                    className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-navy-200 hover:shadow-md md:p-8"
                                >
                                    <div className="flex size-12 items-center justify-center rounded-full bg-brand-gold-500/10">
                                        <Icon className="size-6 text-brand-gold-500" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-neutral-900 group-hover:text-brand-navy-500">
                                        {locale === 'ar'
                                            ? card.ar.title
                                            : card.en.title}
                                    </h3>
                                    <Text
                                        variant="body-sm"
                                        className="mt-2 text-neutral-600"
                                    >
                                        {locale === 'ar'
                                            ? card.ar.desc
                                            : card.en.desc}
                                    </Text>
                                    <span className="mt-4 inline-flex items-center text-sm font-medium text-brand-navy-500">
                                        {locale === 'ar'
                                            ? 'ابدأ الآن'
                                            : 'Get Started'}
                                        <ArrowRight className="ml-1 size-4 rtl:rotate-180" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar'
                            ? 'معلومات الاتصال'
                            : 'Contact Information'}
                    </Heading>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {contactItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.labelEn}
                                    className="flex flex-col items-center rounded-xl border border-neutral-200 bg-white p-6 text-center"
                                >
                                    <div className="flex size-12 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Icon className="size-6 text-brand-navy-500" />
                                    </div>
                                    <Text
                                        variant="body"
                                        className="mt-4 font-semibold text-neutral-900"
                                    >
                                        {locale === 'ar'
                                            ? item.labelAr
                                            : item.labelEn}
                                    </Text>
                                    <Text
                                        variant="body-sm"
                                        className="mt-1 text-neutral-600"
                                    >
                                        {item.value}
                                    </Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar'
                            ? 'لست متأكداً من أين تبدأ؟'
                            : 'Not sure where to start?'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'دع فريقنا يساعدك في إيجاد الحل الأمثل لاحتياجاتك'
                            : 'Let our team help you find the right solution for your needs'}
                    </Text>
                    <div className="mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/contact/sales">
                                {locale === 'ar'
                                    ? 'تحدث إلى فريقنا'
                                    : 'Talk to our team'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>
        </>
    );
}
