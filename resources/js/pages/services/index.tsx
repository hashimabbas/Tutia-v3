import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { SERVICE_CATEGORIES } from '@/lib/navigation-data';

export default function ServicesIndex() {
    const { t, locale } = useI18n();

    return (
        <>
            <Head title={t('services.title')}>
                <meta name="description" content={t('services.subtitle')} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h1" className="text-white">
                            {t('services.title')}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {t('services.subtitle')}
                        </Text>
                    </div>
                </Container>
            </Section>

            {SERVICE_CATEGORIES.map((cat) => (
                <Section key={cat.title} background={cat === SERVICE_CATEGORIES[0] || cat === SERVICE_CATEGORIES[2] ? 'white' : 'muted'}>
                    <Container>
                        <Heading level="h2">
                            {locale === 'ar' ? cat.titleAr : t(cat.title)}
                        </Heading>
                        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {cat.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-navy-200 hover:shadow-md"
                                    >
                                        {Icon && <Icon className="mb-4 size-8 text-brand-navy-500" />}
                                        <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-navy-500">
                                            {locale === 'ar' ? item.titleAr : t(item.title)}
                                        </h3>
                                        <Text variant="body-sm" className="mt-2 text-neutral-600">
                                            {locale === 'ar' ? item.descriptionAr : item.description}
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
            ))}

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'لماذا توتيا' : 'Why TUTIA'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'نقدم حلولاً متكاملة تجمع بين الخبرة المحلية والمعايير العالمية'
                            : 'We deliver integrated solutions combining local expertise with global standards'}
                    </Text>
                    <div className="mt-8">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/consultation">
                                {t('cta.bookConsultation')}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>
        </>
    );
}
