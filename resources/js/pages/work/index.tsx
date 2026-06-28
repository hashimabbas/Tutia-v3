import { Head, Link } from '@inertiajs/react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { CASE_STUDIES } from '@/lib/case-studies-content';
import { useI18n } from '@/lib/i18n';

const CASE_STUDY_TITLES: Record<string, { title: string; titleAr: string }> = {
    'matger-tutia': {
        title: 'Matger-TUTIA Platform',
        titleAr: 'منصة متجر توتيا',
    },
    'erp-implementation': {
        title: 'ERP Implementation',
        titleAr: 'تطبيق نظام تخطيط الموارد',
    },
    'connectivity-project': {
        title: 'Connectivity Project',
        titleAr: 'مشروع الاتصال',
    },
};

export default function WorkIndex() {
    const { t, locale } = useI18n();

    return (
        <>
            <Head title={t('work.title')}>
                <meta name="description" content={t('work.subtitle')} />
            </Head>

            <Section
                background="navy"
                className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <TrendingUp className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {t('work.title')}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {t('work.subtitle')}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {CASE_STUDIES.map((cs) => {
                            const titles = CASE_STUDY_TITLES[cs.slug] ?? {
                                title: cs.client,
                                titleAr: cs.clientAr,
                            };

                            return (
                                <Link
                                    key={cs.id}
                                    href={`/work/${cs.slug}`}
                                    className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-navy-200 hover:shadow-md"
                                >
                                    <span className="inline-flex items-center rounded-full bg-brand-navy-100 px-3 py-1 text-xs font-medium text-brand-navy-700">
                                        {locale === 'ar'
                                            ? cs.industryAr
                                            : cs.industry}
                                    </span>
                                    <h3 className="mt-4 text-lg font-semibold text-neutral-900 group-hover:text-brand-navy-500">
                                        {locale === 'ar'
                                            ? titles.titleAr
                                            : titles.title}
                                    </h3>
                                    <Text
                                        variant="body-sm"
                                        className="mt-2 text-neutral-600"
                                    >
                                        {locale === 'ar'
                                            ? cs.summaryAr
                                            : cs.summary}
                                    </Text>
                                    <div className="mt-4">
                                        <span className="block text-2xl font-bold text-brand-navy-700">
                                            {locale === 'ar'
                                                ? cs.resultMetricAr
                                                : cs.resultMetric}
                                        </span>
                                        <Text
                                            variant="caption"
                                            className="text-neutral-500"
                                        >
                                            {locale === 'ar'
                                                ? cs.resultLabelAr
                                                : cs.resultLabel}
                                        </Text>
                                    </div>
                                    <span className="mt-4 inline-flex items-center text-sm font-medium text-brand-navy-500">
                                        {t('work.viewCaseStudy')}
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
                        {t('work.getResults')}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'تواصل معنا لتحقيق نتائج مماثلة لمشروعك'
                            : 'Contact us to achieve similar results for your project'}
                    </Text>
                    <div className="mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/contact/consultation">
                                {t('work.getResults')}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>
        </>
    );
}
