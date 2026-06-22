import { Head, Link } from '@inertiajs/react';
import { Building, CreditCard, Building2, BrainCircuit, ArrowLeft, ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function BankingFinance() {
    const { t, locale } = useI18n();

    const services = [
        {
            icon: CreditCard,
            title: 'Payment Gateway',
            titleAr: 'بوابة الدفع',
            description: 'Secure payment processing solutions with multi-currency support and recurring billing.',
            descriptionAr: 'حلول معالجة مدفوعات آمنة مع دعم متعدد العملات والفواتير المتكررة.',
            href: '/services/payment-gateway',
        },
        {
            icon: Building2,
            title: 'ERP Systems',
            titleAr: 'أنظمة تخطيط الموارد',
            description: 'Comprehensive ERP solutions for financial management, accounting, and operations.',
            descriptionAr: 'حلول تخطيط موارد مؤسسية شاملة للإدارة المالية والمحاسبة والعمليات.',
            href: '/services/erp',
        },
        {
            icon: BrainCircuit,
            title: 'ICT Consulting',
            titleAr: 'الاستشارات التقنية',
            description: 'Technology strategy and advisory for digital transformation in financial services.',
            descriptionAr: 'استراتيجية تقنية واستشارات للتحول الرقمي في الخدمات المالية.',
            href: '/services/consulting',
        },
    ];

    return (
        <>
            <Head title={locale === 'ar' ? 'البنوك والمالية' : 'Banking & Finance'}>
                <meta name="description" content={locale === 'ar' ? 'حلول البنوك والمالية من توتيا' : 'TUTIA banking and finance solutions'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Building className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'البنوك والمالية' : 'Banking & Finance'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'حلول تقنية مالية مبتكرة للمؤسسات المصرفية والمالية'
                                : 'Innovative fintech solutions for banking and financial institutions'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {locale === 'ar' ? 'أهمية هذا القطاع' : 'Why This Industry Matters'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'يشهد القطاع المالي والمصرفي في السودان تحولاً كبيراً نحو الرقمنة، مع تزايد الطلب على الخدمات المالية الرقمية وبوابات الدفع الإلكترونية وأنظمة إدارة الموارد المتكاملة.'
                            : 'Sudan\'s banking and financial sector is undergoing significant digital transformation, with growing demand for digital financial services, electronic payment gateways, and integrated resource management systems.'}
                    </Text>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'تقدم توتيا حلولاً تقنية متطورة تشمل بوابات الدفع الآمنة وأنظمة تخطيط الموارد المؤسسية والاستشارات التقنية لمساعدة المؤسسات المالية على تحقيق أهداف التحول الرقمي.'
                            : 'TUTIA offers advanced technology solutions including secure payment gateways, enterprise ERP systems, and ICT consulting to help financial institutions achieve their digital transformation goals.'}
                    </Text>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2">
                        {locale === 'ar' ? 'كيف تخدم توتيا هذا القطاع' : 'How TUTIA Serves This Sector'}
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
                                    {Icon && <Icon className="mb-4 size-8 text-brand-navy-500" />}
                                    <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-navy-500">
                                        {locale === 'ar' ? service.titleAr : service.title}
                                    </h3>
                                    <Text variant="body-sm" className="mt-2 text-neutral-600">
                                        {locale === 'ar' ? service.descriptionAr : service.description}
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
                            ? 'اطلع على كيفية تنفيذنا لنظام تخطيط الموارد المؤسسية لمؤسسة سودانية، حيث قمنا بتبسيط العمليات المالية والتشغيلية وتحسين كفاءة العمل.'
                            : 'Explore how we implemented an ERP system for a Sudanese enterprise, streamlining financial and operational processes and improving work efficiency.'}
                    </Text>
                    <div className="mt-6">
                        <Button asChild variant="link" className="text-brand-navy-500">
                            <Link href="/work/erp-implementation">
                                {locale === 'ar' ? 'عرض دراسة حالة ERP' : 'View ERP Case Study'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'حول خدماتك المالية' : 'Transform Your Financial Services'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'تحدث مع خبيرنا لبدء رحلة التحول الرقمي'
                            : 'Talk to our expert to start your digital transformation journey'}
                    </Text>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/consultation">
                                {t('cta.talkToExpert')}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
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
                    <Button asChild variant="link" className="text-brand-navy-500">
                        <Link href="/industries">
                            <ArrowLeft className="mr-2 size-4 rtl:rotate-180" />
                            {locale === 'ar' ? 'العودة إلى القطاعات' : 'Back to Industries'}
                        </Link>
                    </Button>
                </Container>
            </Section>
        </>
    );
}
