import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { VALUES } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';

const VALUE_IMAGES: Record<string, string> = {
    trust: '/images/values/trust.png',
    commitment: '/images/values/commitment.png',
    integrity: '/images/values/integration.png',
    results: '/images/values/stadistics.png',
};

export default function AboutIndex() {
    const { t, locale } = useI18n();

    const quickLinks = [
        {
            href: '/about/leadership',
            label: t('about.leadership'),
            labelAr: 'الإدارة',
        },
        { href: '/about/team', label: t('about.team'), labelAr: 'فريقنا' },
        { href: '/about/values', label: t('about.values'), labelAr: 'قيمنا' },
        {
            href: '/about/culture',
            label: t('about.culture'),
            labelAr: 'ثقافتنا',
        },
    ];

    return (
        <>
            <Head title={t('about.title')}>
                <meta name="description" content={t('about.subtitle')} />
            </Head>

            <Section
                background="navy"
                className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h1" className="text-white">
                            {t('about.title')}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {t('about.subtitle')}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {locale === 'ar' ? 'قصتنا' : t('about.ourStory')}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'تأسست شركة توتيا لتكون شريكاً استراتيجياً في تقديم خدمات تكنولوجيا المعلومات والتحول الرقمي في السودان. بدأنا برؤية واضحة: تمكين الشركات والمؤسسات السودانية من الاستفادة من أحدث التقنيات لتحقيق النمو والتميز. على مر السنين، نمت توتيا لتصبح اسماً موثوقاً في مجالات متعددة تشمل التجارة الإلكترونية، أنظمة تخطيط الموارد، تطوير المواقع والتطبيقات، حلول الاتصال، والشبكات الخاصة.'
                            : 'TUTIA was founded to be a strategic partner in delivering IT services and digital transformation in Sudan. We started with a clear vision: empowering Sudanese businesses and organizations to leverage the latest technologies for growth and excellence. Over the years, TUTIA has grown into a trusted name across multiple domains including e-commerce, ERP systems, web and app development, connectivity solutions, and VPN services.'}
                    </Text>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <div className="grid gap-10 md:grid-cols-2">
                        <div className="rounded-xl border border-neutral-200 bg-white p-8">
                            <Heading level="h3">{t('about.mission')}</Heading>
                            <Text
                                variant="body"
                                className="mt-4 text-neutral-600"
                            >
                                {locale === 'ar'
                                    ? 'سنواصل تحدي أنفسنا ووضع معايير أداء جديدة من خلال الاستثمار في مستقبل عملائنا والسعي وراء المعرفة والابتكار من أجل تجاوز التوقعات في خدمة مجتمعنا.'
                                    : 'We will continue to challenge ourselves and set new performance standards by investing in the future of our Customers and seeking knowledge and innovation in order to exceed expectations in serving our community.'}
                            </Text>
                        </div>
                        <div className="rounded-xl border border-neutral-200 bg-white p-8">
                            <Heading level="h3">{t('about.vision')}</Heading>
                            <Text
                                variant="body"
                                className="mt-4 text-neutral-600"
                            >
                                {locale === 'ar'
                                    ? 'أن نبقى الشريك المفضل في التحول الرقمي والتقني في السودان، ونقود نمو سوق التكنولوجيا في السودان ونتوسع في المنطقة.'
                                    : 'To remain the Preferred Technology & Digital Transformation Partner in Sudan, leading the Technology Market Growth in Sudan and expanding in the region.'}
                            </Text>
                        </div>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h2">
                            {locale === 'ar' ? 'قيمنا' : 'Core Values'}
                        </Heading>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {VALUES.map((value) => {
                            const valueImage = VALUE_IMAGES[value.id];

                            return (
                                <div
                                    key={value.id}
                                    className="flex flex-col items-center text-center"
                                >
                                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-brand-gold-500/10 p-3">
                                        <img
                                            src={valueImage}
                                            alt={
                                                locale === 'ar'
                                                    ? value.titleAr
                                                    : value.title
                                            }
                                            className="size-full object-contain"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900">
                                        {locale === 'ar'
                                            ? value.titleAr
                                            : value.title}
                                    </h3>
                                    <Text
                                        variant="body-sm"
                                        className="mt-2 text-neutral-500"
                                    >
                                        {locale === 'ar'
                                            ? value.descriptionAr
                                            : value.description}
                                    </Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h2">
                            {locale === 'ar' ? 'استكشف المزيد' : 'Explore More'}
                        </Heading>
                    </div>
                    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-navy-200 hover:shadow-md"
                            >
                                <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-navy-500">
                                    {locale === 'ar'
                                        ? link.labelAr
                                        : link.label}
                                </h3>
                                <span className="mt-3 inline-flex items-center text-sm font-medium text-brand-navy-500">
                                    {locale === 'ar'
                                        ? 'اعرف أكثر'
                                        : 'Learn More'}
                                    <ArrowRight className="ml-1 size-4 rtl:rotate-180" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'تواصل معنا' : 'Get In Touch'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'نحن هنا لمساعدتك في تحقيق أهدافك التقنية'
                            : 'We are here to help you achieve your technology goals'}
                    </Text>
                    <div className="mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/contact">
                                {locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>
        </>
    );
}
