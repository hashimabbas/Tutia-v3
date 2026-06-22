import { Link } from '@inertiajs/react';
import { Check, ChevronRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { FEATURED_SERVICES } from '@/lib/home-content';
import { useI18n } from '@/lib/i18n';


export function FeaturedServicesSection() {
    const { t, locale } = useI18n();

    return (
        <Section background="muted">
            <Container>
                <div className="mx-auto max-w-3xl text-center">
                    <Heading level="h2">{t('home.featured.title')}</Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {t('home.featured.subtitle')}
                    </Text>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-3">
                    {FEATURED_SERVICES.map((item) => {
                        const features = locale === 'ar' ? item.featuresAr : item.features;

                        return (
                            <div
                                key={item.id}
                                className="rounded-xl bg-white p-8 shadow-sm border border-neutral-100 transition-all hover:shadow-md"
                            >
                                <h3 className="text-xl font-semibold text-neutral-900">
                                    {locale === 'ar' ? item.titleAr : item.title}
                                </h3>
                                <Text variant="body" className="mt-3 text-neutral-600">
                                    {locale === 'ar' ? item.descriptionAr : item.description}
                                </Text>
                                <ul className="mt-6 space-y-3">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="mt-0.5 size-4 shrink-0 text-brand-gold-500" />
                                            <Text variant="body-sm" className="text-neutral-600">
                                                {feature}
                                            </Text>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8">
                                    <Link
                                        href={item.href}
                                        className="inline-flex items-center text-sm font-medium text-brand-navy-500 transition-colors hover:text-brand-navy-700"
                                    >
                                        {t('services.cta.learnMore')}
                                        <ChevronRight className="ml-1 size-4 rtl:rotate-180" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Container>
        </Section>
    );
}
