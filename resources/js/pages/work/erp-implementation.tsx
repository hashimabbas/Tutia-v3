import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { CASE_STUDIES } from '@/lib/case-studies-content';
import { useI18n } from '@/lib/i18n';

export default function ErpImplementation() {
    const { t, locale } = useI18n();
    const cs = CASE_STUDIES.find((c) => c.slug === 'erp-implementation');

    if (!cs) {
        return null;
    }

    return (
        <>
            <Head title={cs.client}>
                <meta name="description" content={locale === 'ar' ? cs.summaryAr : cs.summary} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-4xl">
                        <span className="inline-flex items-center rounded-full bg-brand-gold-500/20 px-3 py-1 text-xs font-medium text-brand-gold-300">
                            {locale === 'ar' ? cs.industryAr : cs.industry}
                        </span>
                        <Heading level="h1" className="mt-4 text-white">
                            {locale === 'ar' ? 'تطبيق نظام تخطيط الموارد' : 'ERP Implementation'}
                        </Heading>
                        <Text variant="body-lg" className="mt-2 text-neutral-300">
                            {locale === 'ar' ? cs.clientAr : cs.client}
                        </Text>
                    </div>
                </Container>
            </Section>

            {cs.sections.map((section, index) => (
                <Section key={section.title} background={index % 2 === 0 ? 'white' : 'muted'}>
                    <Container className="mx-auto max-w-3xl">
                        <Heading level="h2">
                            {locale === 'ar' ? section.titleAr : section.title}
                        </Heading>
                        {section.content.split('\n').map((paragraph, i) => (
                            paragraph.trim() && (
                                <Text key={i} variant="body-lg" className="mt-4 text-neutral-600">
                                    {locale === 'ar' ? section.contentAr.split('\n')[i]?.trim() || paragraph : paragraph}
                                </Text>
                            )
                        ))}
                    </Container>
                </Section>
            ))}

            <Section background="muted">
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {t('work.technologies')}
                    </Heading>
                    <div className="mt-6 flex flex-wrap gap-3">
                        {cs.technologies.map((tech) => (
                            <span
                                key={tech.name}
                                className="inline-flex items-center rounded-full bg-brand-navy-100 px-4 py-1.5 text-sm font-medium text-brand-navy-700"
                            >
                                {locale === 'ar' ? tech.nameAr : tech.name}
                            </span>
                        ))}
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl">
                    <div className="relative">
                        <Quote className="mb-4 size-10 text-brand-gold-500/40" />
                        <Text variant="body-lg" className="text-neutral-200 italic">
                            &ldquo;{locale === 'ar' ? cs.clientQuoteAr : cs.clientQuote}&rdquo;
                        </Text>
                        <div className="mt-6 flex items-center gap-4">
                            {cs.clientLogo && (
                                <img
                                    src={cs.clientLogo}
                                    alt=""
                                    className="size-12 rounded-full object-cover"
                                />
                            )}
                            <div>
                                <Text variant="body" className="font-semibold text-white">
                                    {locale === 'ar' ? cs.clientAr : cs.client}
                                </Text>
                            </div>
                        </div>
                    </div>
                </Container>
            </Section>

            <Section background="navy" className="border-t border-white/10">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {t('work.getResults')}
                    </Heading>
                    <div className="mt-8">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/consultation">
                                {t('work.getResults')}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <Button asChild variant="link" className="text-brand-navy-500">
                        <Link href="/work">
                            <ArrowLeft className="mr-2 size-4 rtl:rotate-180" />
                            {locale === 'ar' ? 'العودة إلى الأعمال' : 'Back to Work'}
                        </Link>
                    </Button>
                </Container>
            </Section>
        </>
    );
}
