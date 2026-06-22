import { Head, Link } from '@inertiajs/react';
import { Landmark, BrainCircuit, Wifi, Globe, Building2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function Government() {
    const { t, locale } = useI18n();

    const services = [
        {
            icon: BrainCircuit,
            title: 'ICT Consulting',
            titleAr: 'الاستشارات التقنية',
            description: 'Technology strategy, digital transformation planning, and advisory for government entities.',
            descriptionAr: 'استراتيجية تقنية وتخطيط التحول الرقمي واستشارات للجهات الحكومية.',
            href: '/services/consulting',
        },
        {
            icon: Wifi,
            title: 'Connectivity Solutions',
            titleAr: 'حلول الاتصال',
            description: 'Reliable network infrastructure and connectivity for government facilities.',
            descriptionAr: 'بنية تحتية شبكية موثوقة واتصال للمرافق الحكومية.',
            href: '/services/connectivity',
        },
        {
            icon: Globe,
            title: 'Web Development',
            titleAr: 'تطوير المواقع',
            description: 'Government portals, citizen service platforms, and information systems.',
            descriptionAr: 'بوابات حكومية ومنصات خدمة المواطنين وأنظمة معلومات.',
            href: '/services/web-development',
        },
        {
            icon: Building2,
            title: 'ERP Systems',
            titleAr: 'أنظمة تخطيط الموارد',
            description: 'Enterprise resource planning for government financial and administrative operations.',
            descriptionAr: 'تخطيط الموارد المؤسسية للعمليات المالية والإدارية الحكومية.',
            href: '/services/erp',
        },
    ];

    return (
        <>
            <Head title={locale === 'ar' ? 'القطاع الحكومي' : 'Government'}>
                <meta name="description" content={locale === 'ar' ? 'حلول القطاع الحكومي من توتيا' : 'TUTIA government sector solutions'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Landmark className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'القطاع الحكومي' : 'Government'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'دعم التحول الرقمي في القطاع الحكومي السوداني'
                                : 'Supporting digital transformation in Sudan\'s public sector'}
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
                            ? 'يمثل التحول الرقمي في القطاع الحكومي أولوية وطنية في السودان. تسعى الجهات الحكومية إلى تحسين كفاءة الخدمات المقدمة للمواطنين من خلال تبني التقنيات الحديثة وأنظمة المعلومات المتطورة.'
                            : 'Digital transformation in the government sector is a national priority in Sudan. Government entities are seeking to improve the efficiency of citizen services through the adoption of modern technologies and advanced information systems.'}
                    </Text>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'تقدم توتيا خبرة واسعة في دعم المؤسسات الحكومية في رحلة التحول الرقمي، من خلال الاستشارات التقنية وحلول الاتصال وتطوير البوابات الإلكترونية وأنظمة تخطيط الموارد.'
                            : 'TUTIA brings extensive experience in supporting government institutions on their digital transformation journey through ICT consulting, connectivity solutions, web portal development, and ERP systems.'}
                    </Text>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2">
                        {locale === 'ar' ? 'كيف تخدم توتيا هذا القطاع' : 'How TUTIA Serves This Sector'}
                    </Heading>
                    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                        {locale === 'ar' ? 'دراسات حالة' : 'Case Studies'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'لدينا سجل حافل من المشاريع الناجحة مع المؤسسات الحكومية والمنظمات في السودان، بما في ذلك حلول الاتصال وأنظمة تخطيط الموارد والخدمات الاستشارية.'
                            : 'We have a proven track record of successful projects with government institutions and organizations in Sudan, including connectivity solutions, ERP systems, and advisory services.'}
                    </Text>
                    <div className="mt-6">
                        <Button asChild variant="link" className="text-brand-navy-500">
                            <Link href="/work">
                                {locale === 'ar' ? 'عرض جميع دراسات الحالة' : 'View All Case Studies'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'دعم تحولكم الرقمي' : 'Support Your Digital Transformation'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'تحدث مع خبيرنا لمناقشة احتياجات مؤسستك'
                            : 'Talk to our expert to discuss your organization\'s needs'}
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
