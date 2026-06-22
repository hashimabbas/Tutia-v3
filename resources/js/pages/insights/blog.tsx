import { Head, Link } from '@inertiajs/react';
import { BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function Blog() {
    const { locale } = useI18n();

    return (
        <>
            <Head title={locale === 'ar' ? 'المدونة' : 'Blog'}>
                <meta name="description" content={locale === 'ar' ? 'مدونة توتيا - أفكار ورؤى حول التكنولوجيا' : 'TUTIA Blog - Insights and perspectives on technology'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <BookOpen className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'المدونة' : 'Blog'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'أفكار ورؤى حول التكنولوجيا والتحول الرقمي في السودان'
                                : 'Insights and perspectives on technology and digital transformation in Sudan'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl text-center">
                    <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-full bg-brand-navy-50">
                        <BookOpen className="size-10 text-brand-navy-400" />
                    </div>
                    <Heading level="h2">
                        {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'نعمل على إطلاق مدونتنا قريباً! سنشارك من خلالها أفكاراً ورؤى حول التكنولوجيا والتحول الرقمي في السودان، مع مقالات من خبرائنا وشراكاتنا.'
                            : 'We are launching our blog soon! We will share insights and perspectives on technology and digital transformation in Sudan, with articles from our experts and partners.'}
                    </Text>
                    <div className="mt-8">
                        <Text variant="body" className="text-neutral-500">
                            {locale === 'ar'
                                ? 'في هذه الأثناء، يمكنك الاطلاع على دراسات الحالة الخاصة بمشاريعنا'
                                : 'In the meantime, explore our case studies to see our work in action'}
                        </Text>
                        <div className="mt-6">
                            <Button asChild className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                                <Link href="/insights/case-studies">
                                    {locale === 'ar' ? 'عرض دراسات الحالة' : 'View Case Studies'}
                                    <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                                </Link>
                            </Button>
                        </div>
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
                            ? 'اشترك في نشرتنا البريدية لتصلك أحدث المقالات فور نشرها'
                            : 'Subscribe to our newsletter to get notified when we publish new articles'}
                    </Text>
                    <div className="mt-8">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact">
                                {locale === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
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
