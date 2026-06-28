import { Head, Link } from '@inertiajs/react';
import {
    Radio,
    Wifi,
    Shield,
    BrainCircuit,
    ArrowLeft,
    ArrowRight,
} from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function Telecommunications() {
    const { t, locale } = useI18n();

    const services = [
        {
            icon: Wifi,
            title: 'Connectivity Solutions',
            titleAr: 'حلول الاتصال',
            description:
                'Mobile and Wi-Fi coverage deployment, network assessment, and maintenance services.',
            descriptionAr:
                'نشر التغطية الجوالة واللاسلكية وتقييم الشبكات وخدمات الصيانة.',
            href: '/services/connectivity',
        },
        {
            icon: Shield,
            title: 'VPN Services',
            titleAr: 'خدمات الشبكات الخاصة',
            description:
                'Secure business VPN solutions for remote connectivity and data protection.',
            descriptionAr:
                'حلول شبكات خاصة آمنة للشركات للاتصال عن بعد وحماية البيانات.',
            href: '/services/vpn',
        },
        {
            icon: BrainCircuit,
            title: 'ICT Consulting',
            titleAr: 'الاستشارات التقنية',
            description:
                'Technology strategy, infrastructure planning, and digital advisory for telecom operators.',
            descriptionAr:
                'استراتيجية تقنية وتخطيط البنية التحتية واستشارات رقمية لمشغلي الاتصالات.',
            href: '/services/consulting',
        },
    ];

    return (
        <>
            <Head title={locale === 'ar' ? 'الاتصالات' : 'Telecommunications'}>
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'حلول الاتصالات من توتيا'
                            : 'TUTIA telecommunications solutions'
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
                        <Radio className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar'
                                ? 'الاتصالات'
                                : 'Telecommunications'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'بنية تحتية موثوقة وحلول شبكية متطورة'
                                : 'Reliable infrastructure and advanced network solutions'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {locale === 'ar'
                            ? 'أهمية هذا القطاع'
                            : 'Why This Industry Matters'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'يشكل قطاع الاتصالات العمود الفقري للتحول الرقمي في السودان. مع تزايد الطلب على خدمات البيانات والاتصال الموثوق، يحتاج مشغلو الاتصالات إلى شركاء تقنيين يمكنهم تقديم حلول مبتكرة وفعالة.'
                            : 'The telecommunications sector is the backbone of digital transformation in Sudan. With growing demand for data services and reliable connectivity, telecom operators need technology partners who can deliver innovative and efficient solutions.'}
                    </Text>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'تقدم توتيا خبرة عميقة في حلول الاتصال والشبكات الخاصة والاستشارات التقنية لدعم مشغلي الاتصالات في تحسين خدماتهم وتوسيع تغطيتهم.'
                            : 'TUTIA brings deep expertise in connectivity solutions, VPN services, and ICT consulting to support telecom operators in improving their services and expanding coverage.'}
                    </Text>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2">
                        {locale === 'ar'
                            ? 'كيف تخدم توتيا هذا القطاع'
                            : 'How TUTIA Serves This Sector'}
                    </Heading>
                    <div className="mt-8 grid gap-6 md:grid-cols-3">
                        {services.map((service) => {
                            const Icon = service.icon;

                            return (
                                <Link
                                    key={service.href}
                                    href={service.href}
                                    className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-navy-200 hover:shadow-md"
                                >
                                    {Icon && (
                                        <Icon className="mb-4 size-8 text-brand-navy-500" />
                                    )}
                                    <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-navy-500">
                                        {locale === 'ar'
                                            ? service.titleAr
                                            : service.title}
                                    </h3>
                                    <Text
                                        variant="body-sm"
                                        className="mt-2 text-neutral-600"
                                    >
                                        {locale === 'ar'
                                            ? service.descriptionAr
                                            : service.description}
                                    </Text>
                                    <span className="mt-4 inline-flex items-center text-sm font-medium text-brand-navy-500">
                                        {t('services.cta.learnMore')}
                                        <ArrowRight className="ml-1 size-4 rtl:rotate-180" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {locale === 'ar' ? 'دراسة حالة' : 'Case Study'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'اطلع على مشروع الاتصال الذي نفذناه لتوسيع التغطية الجوالة واللاسلكية في المناطق المحرومة في الخرطوم، مما حسن الاتصال للشركات والسكان.'
                            : 'Explore our connectivity project that extended reliable mobile and Wi-Fi coverage across underserved areas in Khartoum, improving connectivity for businesses and residents.'}
                    </Text>
                    <div className="mt-6">
                        <Button
                            asChild
                            variant="link"
                            className="text-brand-navy-500"
                        >
                            <Link href="/work/connectivity-project">
                                {locale === 'ar'
                                    ? 'عرض دراسة حالة الاتصال'
                                    : 'View Connectivity Case Study'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar'
                            ? 'طور بنيتك التحتية'
                            : 'Enhance Your Infrastructure'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'تحدث مع خبيرنا لتحسين شبكتك وخدمات الاتصال'
                            : 'Talk to our expert to improve your network and connectivity services'}
                    </Text>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/contact/consultation">
                                {t('cta.talkToExpert')}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            <Link href="/contact/quote">
                                {t('services.cta.getQuote')}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <Button
                        asChild
                        variant="link"
                        className="text-brand-navy-500"
                    >
                        <Link href="/industries">
                            <ArrowLeft className="mr-2 size-4 rtl:rotate-180" />
                            {locale === 'ar'
                                ? 'العودة إلى القطاعات'
                                : 'Back to Industries'}
                        </Link>
                    </Button>
                </Container>
            </Section>
        </>
    );
}
