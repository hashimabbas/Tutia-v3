import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { CASE_STUDY_PREVIEWS } from '@/lib/home-content';
import { useI18n } from '@/lib/i18n';

export function CaseStudiesSection() {
    const { t, locale } = useI18n();

    return (
        <Section background="muted">
            <Container className="text-center">
                <Heading level="h2" className="mb-4">
                    {t('home.caseStudies.title')}
                </Heading>
                <Text
                    variant="body-lg"
                    muted
                    className="mx-auto mb-16 max-w-2xl"
                >
                    {t('home.caseStudies.subtitle')}
                </Text>
            </Container>

            <Container>
                <div className="grid gap-8 md:grid-cols-2">
                    {CASE_STUDY_PREVIEWS.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="group rounded-xl border border-neutral-100 bg-white p-8 shadow-sm transition-all hover:shadow-md"
                        >
                            <Heading level="h3" className="mb-3">
                                {locale === 'ar' ? item.titleAr : item.title}
                            </Heading>
                            <Text variant="body" muted className="mb-6">
                                {locale === 'ar'
                                    ? item.summaryAr
                                    : item.summary}
                            </Text>
                            <div className="mb-6">
                                <span className="text-3xl font-bold text-brand-gold-500 md:text-4xl">
                                    {locale === 'ar'
                                        ? item.resultMetricAr
                                        : item.resultMetric}
                                </span>
                                <Text variant="body-sm" muted className="mt-1">
                                    {locale === 'ar'
                                        ? item.resultLabelAr
                                        : item.resultLabel}
                                </Text>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-brand-navy-500">
                                {t('home.caseStudies.viewLabel') ||
                                    'View Case Study'}
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link href="/work">
                        <Button variant="link" size="lg">
                            {t('home.caseStudies.viewAll')}
                            <ArrowRight className="size-4 rtl:rotate-180" />
                        </Button>
                    </Link>
                </div>
            </Container>
        </Section>
    );
}
