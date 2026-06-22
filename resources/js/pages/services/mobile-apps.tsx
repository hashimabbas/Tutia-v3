import { Head, Link } from '@inertiajs/react';
import { Smartphone, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function MobileApps() {
    const { t, locale } = useI18n();

    const serviceName = locale === 'ar' ? 'التطبيقات الجوالة' : 'Mobile Applications';

    const features = locale === 'ar'
        ? [
            'تطوير تطبيقات عبر المنصات (iOS و Android)',
            'تصميم تجربة مستخدم وواجهات جذابة',
            'تكامل مع الأنظمة والخدمات الخلفية',
            'اختبار شامل وضمان الجودة',
            'دعم فني وصيانة مستمرة',
          ]
        : [
            'Cross-platform development (iOS & Android)',
            'Engaging UI/UX design',
            'Backend integration and API connectivity',
            'Comprehensive testing and quality assurance',
            'Ongoing maintenance and support',
          ];

    return (
        <>
            <Head title={serviceName}>
                <meta name="description" content="iOS and Android mobile app development services" />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Smartphone className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {serviceName}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'حوّل فكرتك إلى تطبيق جوال مميز'
                                : 'Turn your idea into a remarkable mobile app'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {locale === 'ar' ? 'نظرة عامة' : 'Overview'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'نقدم خدمات تطوير تطبيقات الجوال الاحترافية لنظامي iOS و Android، من الفكرة إلى النشر في المتاجر. يعمل فريقنا من المطورين والمصممين على تحويل رؤيتك إلى تطبيق سلس وسريع وجذاب يلبي احتياجات مستخدميك ويساعدك على تحقيق أهداف عملك.'
                            : 'We offer professional mobile app development services for iOS and Android, from concept to App Store deployment. Our team of developers and designers work to turn your vision into a smooth, fast, and engaging app that meets your users\' needs and helps achieve your business goals.'}
                    </Text>
                </Container>
            </Section>

            <Section background="muted">
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {locale === 'ar' ? 'المميزات' : 'Features'}
                    </Heading>
                    <ul className="mt-8 space-y-4">
                        {features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-navy-100">
                                    <Check className="size-3.5 text-brand-navy-600" />
                                </span>
                                <Text variant="body" className="text-neutral-700">
                                    {feature}
                                </Text>
                            </li>
                        ))}
                    </ul>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'ابنِ تطبيقك الآن' : 'Build Your App Today'}
                    </Heading>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/proposal">
                                {t('services.cta.buildMyApp')}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            <Link href="/contact/consultation">
                                {t('services.cta.talkToExpert')}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <Button asChild variant="link" className="text-brand-navy-500">
                        <Link href="/services">
                            <ArrowLeft className="mr-2 size-4 rtl:rotate-180" />
                            {locale === 'ar' ? 'العودة إلى الخدمات' : 'Back to Services'}
                        </Link>
                    </Button>
                </Container>
            </Section>
        </>
    );
}
