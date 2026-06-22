import { Head, Link } from '@inertiajs/react';
import { Plane, Ticket, Globe, Smartphone, ArrowLeft, ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function TravelTourism() {
    const { t, locale } = useI18n();

    const services = [
        {
            icon: Ticket,
            title: 'Ticketing System',
            titleAr: 'نظام الحجوزات',
            description: 'Automated booking and ticketing platforms for travel agencies and tourism operators.',
            descriptionAr: 'منصات حجز وإصدار تذاكر آلية لوكالات السفر ومشغلي السياحة.',
            href: '/services/ticketing',
        },
        {
            icon: Globe,
            title: 'Web Development',
            titleAr: 'تطوير المواقع',
            description: 'Professional travel websites with booking integration and multilingual support.',
            descriptionAr: 'مواقع سفر احترافية مع دمج الحجوزات ودعم متعدد اللغات.',
            href: '/services/web-development',
        },
        {
            icon: Smartphone,
            title: 'Mobile Apps',
            titleAr: 'التطبيقات الجوالة',
            description: 'Native mobile applications for travel booking, itinerary management, and customer engagement.',
            descriptionAr: 'تطبيقات جوالة لحجز السفر وإدارة خطط الرحلات وتفاعل العملاء.',
            href: '/services/mobile-apps',
        },
    ];

    return (
        <>
            <Head title={locale === 'ar' ? 'السفر والسياحة' : 'Travel & Tourism'}>
                <meta name="description" content={locale === 'ar' ? 'حلول السفر والسياحة من توتيا' : 'TUTIA travel and tourism solutions for Sudanese agencies'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Plane className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'السفر والسياحة' : 'Travel & Tourism'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'حلول رقمية متطورة لوكالات السفر والسياحة في السودان'
                                : 'Advanced digital solutions for travel agencies and tourism in Sudan'}
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
                            ? 'يمثل قطاع السفر والسياحة في السودان فرصة نمو كبيرة، مع إمكانات سياحية هائلة غير مستغلة. تواجه وكالات السفر تحديات في أتمتة الحجوزات وإدارة التذاكر وتقديم تجارب رقمية سلسة للعملاء.'
                            : 'Sudan\'s travel and tourism sector represents a significant growth opportunity with vast untapped tourism potential. Travel agencies face challenges in automating bookings, managing tickets, and delivering seamless digital experiences to customers.'}
                    </Text>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'تقدم توتيا حلولاً تقنية متكاملة تشمل أنظمة الحجوزات الآلية وتطوير المواقع والتطبيقات الجوالة لمساعدة وكالات السفر على تقديم خدمات أفضل لعملائها.'
                            : 'TUTIA offers integrated technology solutions including automated booking systems, web development, and mobile apps to help travel agencies deliver better services to their customers.'}
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
                            ? 'تعرف على كيفية تنفيذنا لأنظمة الحجوزات الآلية التي ساعدت وكالات السفر على أتمتة عملياتها وتحسين كفاءة إدارة التذاكر وخدمة العملاء.'
                            : 'Learn how our ticketing system implementation helped travel agencies automate their operations, improve ticket management efficiency, and enhance customer service.'}
                    </Text>
                    <div className="mt-6">
                        <Button asChild variant="link" className="text-brand-navy-500">
                            <Link href="/work">
                                {locale === 'ar' ? 'عرض دراسات الحالة' : 'View Case Studies'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'حول أعمالك للسفر الرقمي' : 'Transform Your Travel Business'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'تحدث مع خبيرنا وابدأ رحلة التحول الرقمي'
                            : 'Talk to our expert and start your digital transformation journey'}
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
