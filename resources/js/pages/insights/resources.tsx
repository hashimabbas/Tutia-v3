import { Head, Link } from '@inertiajs/react';
import { Library, ArrowRight, ArrowLeft } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function Resources() {
    const { locale } = useI18n();

    return (
        <>
            <Head title={locale === 'ar' ? 'الموارد' : 'Resources'}>
                <meta name="description" content={locale === 'ar' ? 'موارد توتيا - أوراق بحثية وأدلة وأدوات' : 'TUTIA Resources - Whitepapers, guides, and tools'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Library className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'الموارد' : 'Resources'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'أوراق بحثية وأدلة وأدوات لمساعدتك في رحلتك التقنية'
                                : 'Whitepapers, guides, and tools to support your technology journey'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl text-center">
                    <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-full bg-brand-navy-50">
                        <Library className="size-10 text-brand-navy-400" />
                    </div>
                    <Heading level="h2">
                        {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'نعمل على إعداد مكتبة من الموارد القيمة تشمل أوراقاً بحثية وأدلة وأدوات عملية لمساعدتك في التحول الرقمي واتخاذ القرارات التقنية الصائبة.'
                            : 'We are building a library of valuable resources including whitepapers, guides, and practical tools to help you with digital transformation and making the right technology decisions.'}
                    </Text>
                    <div className="mt-8">
                        <Text variant="body" className="text-neutral-500">
                            {locale === 'ar'
                                ? 'اشترك في نشرتنا البريدية لتصلك أحدث الموارد فور نشرها'
                                : 'Subscribe to our newsletter to get notified when new resources are available'}
                        </Text>
                        <div className="mt-6">
                            <Button asChild className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                                <Link href="/contact">
                                    {locale === 'ar' ? 'اشترك في النشرة البريدية' : 'Subscribe to Newsletter'}
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
                        {locale === 'ar' ? 'في هذه الأثناء' : 'In the Meantime'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'تصفح دراسات الحالة الخاصة بمشاريعنا للاطلاع على أعمالنا'
                            : 'Browse our case studies to learn more about our work'}
                    </Text>
                    <div className="mt-8">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/insights/case-studies">
                                {locale === 'ar' ? 'عرض دراسات الحالة' : 'View Case Studies'}
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
