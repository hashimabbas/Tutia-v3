import { Head, Link } from '@inertiajs/react';
import { Briefcase, ArrowLeft, ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { CASE_STUDY_PREVIEWS } from '@/lib/home-content';
import { useI18n } from '@/lib/i18n';

export default function CaseStudies() {
    const { t, locale } = useI18n();

    return (
        <>
            <Head title={locale === 'ar' ? 'دراسات الحالة' : 'Case Studies'}>
                <meta name="description" content={locale === 'ar' ? 'دراسات حالة مشاريع توتيا' : 'TUTIA project case studies'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Briefcase className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'دراسات الحالة' : 'Case Studies'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'نظرة متعمقة على مشاريعنا والنتائج التي حققناها'
                                : 'In-depth looks at our projects and the results we delivered'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="grid gap-8 md:grid-cols-2">
                        {CASE_STUDY_PREVIEWS.map((study) => (
                            <Link
                                key={study.id}
                                href={study.href}
                                className="group rounded-xl border border-neutral-200 bg-white p-8 transition-all hover:border-brand-navy-200 hover:shadow-md"
                            >
                                <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-brand-navy-500">
                                    {locale === 'ar' ? study.titleAr : study.title}
                                </h3>
                                <Text variant="body" className="mt-3 text-neutral-600">
                                    {locale === 'ar' ? study.summaryAr : study.summary}
                                </Text>
                                <div className="mt-6 flex items-center gap-3 rounded-lg bg-brand-navy-50 p-4">
                                    <span className="text-2xl font-bold text-brand-gold-500">
                                        {locale === 'ar' ? study.resultMetricAr : study.resultMetric}
                                    </span>
                                    <Text variant="body-sm" className="text-brand-navy-700">
                                        {locale === 'ar' ? study.resultLabelAr : study.resultLabel}
                                    </Text>
                                </div>
                                <span className="mt-4 inline-flex items-center text-sm font-medium text-brand-navy-500">
                                    {locale === 'ar' ? 'عرض دراسة الحالة' : 'View Case Study'}
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
                        {locale === 'ar' ? 'هل لديك مشروع مشابه؟' : 'Have a Similar Project?'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'تواصل معنا لمناقشة كيف يمكننا مساعدتك في تحقيق أهدافك'
                            : 'Get in touch to discuss how we can help you achieve your goals'}
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

            <Section>
                <Container>
                    <Button asChild variant="link" className="text-brand-navy-500">
                        <Link href="/insights">
                            <ArrowLeft className="mr-2 size-4 rtl:rotate-180" />
                            {locale === 'ar' ? 'العودة إلى المدونة والموارد' : 'Back to Insights & Resources'}
                        </Link>
                    </Button>
                </Container>
            </Section>
        </>
    );
}
