import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { INDUSTRIES, INDUSTRY_ICON_MAP } from '@/lib/home-content';
import { useI18n } from '@/lib/i18n';

export default function IndustriesIndex() {
    const { t, locale } = useI18n();

    return (
        <>
            <Head title={locale === 'ar' ? 'القطاعات التي نخدمها' : 'Industries We Serve'}>
                <meta name="description" content={locale === 'ar' ? 'خبرة قطاعية متعمقة في التجزئة والسفر والاتصالات والبنوك والقطاع الحكومي' : 'Deep sector expertise across retail, travel, telecom, banking, and government'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'القطاعات التي نخدمها' : 'Industries We Serve'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'خبرة قطاعية متعمقة وحلول مخصصة تلبي احتياجات كل قطاع في السودان'
                                : 'Deep sector expertise and tailored solutions for every industry in Sudan'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {INDUSTRIES.map((industry) => {
                            const Icon = INDUSTRY_ICON_MAP[industry.icon];

                            return (
                                <Link
                                    key={industry.id}
                                    href={`/industries/${industry.id === 'retail' ? 'retail-ecommerce' : industry.id === 'travel' ? 'travel-tourism' : industry.id === 'telecom' ? 'telecommunications' : industry.id === 'finance' ? 'banking-finance' : industry.id === 'government' ? 'government' : industry.id}`}
                                    className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-navy-200 hover:shadow-md"
                                >
                                    {Icon && <Icon className="mb-4 size-8 text-brand-navy-500" />}
                                    <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-navy-500">
                                        {locale === 'ar' ? industry.nameAr : industry.name}
                                    </h3>
                                    <Text variant="body-sm" className="mt-2 text-neutral-600">
                                        {locale === 'ar' ? industry.descriptionAr : industry.description}
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

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'هل قطاعك غير مدرج؟' : 'Don\'t See Your Industry?'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'نتحدث مع شركات من جميع القطاعات. تواصل معنا لمناقشة احتياجاتك الخاصة'
                            : 'We work with businesses across all sectors. Reach out to discuss your specific needs'}
                    </Text>
                    <div className="mt-8">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/consultation">
                                {t('cta.talkToExpert')}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>
        </>
    );
}
