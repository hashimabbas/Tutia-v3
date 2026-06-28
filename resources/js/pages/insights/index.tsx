import { Head, Link } from '@inertiajs/react';
import { BookOpen, Briefcase, Library, ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function InsightsIndex() {
    const { locale } = useI18n();

    const sections = [
        {
            icon: BookOpen,
            title: 'Blog',
            titleAr: 'المدونة',
            description:
                'Insights, articles, and thought leadership on technology and digital transformation in Sudan.',
            descriptionAr:
                'أفكار ومقالات وقيادة فكرية حول التكنولوجيا والتحول الرقمي في السودان.',
            href: '/insights/blog',
        },
        {
            icon: Briefcase,
            title: 'Case Studies',
            titleAr: 'دراسات الحالة',
            description:
                'In-depth looks at our projects, challenges, and the results we delivered for our clients.',
            descriptionAr:
                'نظرة متعمقة على مشاريعنا وتحدياتها والنتائج التي حققناها لعملائنا.',
            href: '/insights/case-studies',
        },
        {
            icon: Library,
            title: 'Resources',
            titleAr: 'الموارد',
            description:
                'Whitepapers, guides, and tools to help you navigate your technology journey.',
            descriptionAr:
                'أوراق بحثية وأدلة وأدوات لمساعدتك في رحلتك التقنية.',
            href: '/insights/resources',
        },
    ];

    return (
        <>
            <Head
                title={
                    locale === 'ar'
                        ? 'المدونة والموارد'
                        : 'Insights & Resources'
                }
            >
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'أفكار ورؤى وموارد من توتيا حول التكنولوجيا والتحول الرقمي'
                            : 'Insights, articles, and resources from TUTIA on technology and digital transformation'
                    }
                />
            </Head>

            <Section
                background="navy"
                className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h1" className="text-white">
                            {locale === 'ar'
                                ? 'المدونة والموارد'
                                : 'Insights & Resources'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'أفكار ورؤى وموارد لمساعدتك في رحلتك الرقمية'
                                : 'Insights, perspectives, and resources to guide your digital journey'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="grid gap-8 md:grid-cols-3">
                        {sections.map((section) => {
                            const Icon = section.icon;

                            return (
                                <Link
                                    key={section.href}
                                    href={section.href}
                                    className="group rounded-xl border border-neutral-200 bg-white p-8 transition-all hover:border-brand-navy-200 hover:shadow-md"
                                >
                                    <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-brand-navy-50">
                                        {Icon && (
                                            <Icon className="size-6 text-brand-navy-500" />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-brand-navy-500">
                                        {locale === 'ar'
                                            ? section.titleAr
                                            : section.title}
                                    </h3>
                                    <Text
                                        variant="body"
                                        className="mt-3 text-neutral-600"
                                    >
                                        {locale === 'ar'
                                            ? section.descriptionAr
                                            : section.description}
                                    </Text>
                                    <span className="mt-4 inline-flex items-center text-sm font-medium text-brand-navy-500">
                                        {locale === 'ar' ? 'استكشف' : 'Explore'}
                                        <ArrowRight className="ml-1 size-4 rtl:rotate-180" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2">
                        {locale === 'ar' ? 'ابق على اطلاع' : 'Stay Updated'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'اشترك في نشرتنا البريدية لتصلك أحدث المقالات والموارد'
                            : 'Subscribe to our newsletter to receive the latest articles and resources'}
                    </Text>
                    <div className="mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/contact">
                                {locale === 'ar'
                                    ? 'اشترك الآن'
                                    : 'Subscribe Now'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>
        </>
    );
}
