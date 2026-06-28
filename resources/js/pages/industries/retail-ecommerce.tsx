import { Head, Link } from '@inertiajs/react';
import {
    Store,
    ShoppingCart,
    CreditCard,
    Globe,
    ArrowLeft,
    ArrowRight,
} from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function RetailEcommerce() {
    const { t, locale } = useI18n();

    const services = [
        {
            icon: ShoppingCart,
            title: 'E-Commerce Solutions',
            titleAr: 'حلول التجارة الإلكترونية',
            description:
                'Multi-vendor marketplace platform and custom online stores tailored to the Sudanese market.',
            descriptionAr:
                'منصة سوق متعدد البائعين ومتاجر إلكترونية مخصصة للسوق السوداني.',
            href: '/services/ecommerce',
        },
        {
            icon: CreditCard,
            title: 'Payment Gateway Integration',
            titleAr: 'دمج بوابات الدفع',
            description:
                'Secure multi-currency payment processing with local and international payment methods.',
            descriptionAr:
                'معالجة مدفوعات آمنة متعددة العملات بطرق دفع محلية ودولية.',
            href: '/services/payment-gateway',
        },
        {
            icon: Globe,
            title: 'Web Development',
            titleAr: 'تطوير المواقع',
            description:
                'Professional websites and web applications for retail businesses of all sizes.',
            descriptionAr:
                'مواقع إلكترونية وتطبيقات ويب احترافية لشركات التجزئة بمختلف الأحجام.',
            href: '/services/web-development',
        },
    ];

    return (
        <>
            <Head
                title={
                    locale === 'ar'
                        ? 'التجزئة والتجارة الإلكترونية'
                        : 'Retail & E-Commerce'
                }
            >
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'حلول التجزئة والتجارة الإلكترونية من توتيا'
                            : 'TUTIA retail and e-commerce solutions for Sudanese businesses'
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
                        <Store className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar'
                                ? 'التجزئة والتجارة الإلكترونية'
                                : 'Retail & E-Commerce'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'تمكين تجار التجزئة السودانيين بالحلول الرقمية'
                                : 'Empowering Sudanese retailers with digital solutions'}
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
                            ? 'يشهد قطاع التجزئة في السودان تحولاً رقمياً متسارعاً، مع تزايد الاعتماد على التجارة الإلكترونية ومنصات التسوق الرقمية. يواجه التجار تحديات في الوصول إلى عملاء جدد وإدارة المخزون واستقبال المدفوعات بطرق تناسب السوق المحلي.'
                            : "Sudan's retail sector is undergoing rapid digital transformation, with increasing reliance on e-commerce and digital shopping platforms. Merchants face challenges reaching new customers, managing inventory, and accepting payments in ways that suit the local market."}
                    </Text>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'تقدم توتيا حلولاً متكاملة تساعد تجار التجزئة على تأسيس حضور رقمي قوي، من خلال منصة متجر توتيا المتعددة البائعين وبوابات الدفع الآمنة وخدمات تطوير المواقع الإلكترونية.'
                            : 'TUTIA offers integrated solutions that help retailers establish a strong digital presence through the Matger-TUTIA multi-vendor marketplace, secure payment gateways, and web development services.'}
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
                            ? 'اطلع على كيفية بناء منصة متجر توتيا - أول سوق إلكتروني متعدد البائعين في السودان. يربط التطبيق التجار بالمشترين عبر منصة متنقلة سهلة الاستخدام.'
                            : "Explore how we built the Matger-TUTIA platform — Sudan's first multi-vendor e-commerce marketplace. The app connects merchants with buyers through an easy-to-use mobile platform."}
                    </Text>
                    <div className="mt-6">
                        <Button
                            asChild
                            variant="link"
                            className="text-brand-navy-500"
                        >
                            <Link href="/work/matger-tutia">
                                {locale === 'ar'
                                    ? 'عرض دراسة حالة متجر توتيا'
                                    : 'View Matger-TUTIA Case Study'}
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
                            ? 'استعد للتحول الرقمي'
                            : 'Ready to Go Digital?'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'تحدث مع خبيرنا وابدأ رحلة التجارة الإلكترونية'
                            : 'Talk to our expert and start your e-commerce journey'}
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
