import { Head, Link } from '@inertiajs/react';
import {
    Globe,
    ArrowRight,
    ArrowLeft,
    Search,
    Code,
    Sparkles,
    RefreshCw,
} from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function WebDevelopment() {
    const { locale } = useI18n();

    const phases =
        locale === 'ar'
            ? [
                  {
                      icon: Sparkles,
                      title: 'تصميم',
                      desc: 'تصميم إبداعي حائز على جوائز يلفت انتباه جمهورك',
                  },
                  {
                      icon: Search,
                      title: 'تحسين محركات البحث',
                      desc: 'تحسينSEO لضمان ظهور موقعك في صدارة نتائج البحث',
                  },
                  {
                      icon: Code,
                      title: 'تطوير',
                      desc: 'بناء المواقع بأحدث تقنيات الويب وفق أعلى معايير الجودة',
                  },
                  {
                      icon: RefreshCw,
                      title: 'صيانة ودعم',
                      desc: 'صيانة مستمرة ودعم فني لضمان استمرارية أداء موقعك',
                  },
              ]
            : [
                  {
                      icon: Sparkles,
                      title: 'Design',
                      desc: 'Award-winning creative design that creates a lasting impression for your brand',
                  },
                  {
                      icon: Search,
                      title: 'SEO',
                      desc: 'Search engine optimization to rank your site at the top of search results',
                  },
                  {
                      icon: Code,
                      title: 'Development',
                      desc: 'Building with the latest web technologies and highest quality standards',
                  },
                  {
                      icon: RefreshCw,
                      title: 'Maintenance & Support',
                      desc: 'Ongoing maintenance and support for continuous performance',
                  },
              ];

    return (
        <>
            <Head title={locale === 'ar' ? 'تطوير المواقع' : 'Web Development'}>
                <meta
                    name="description"
                    content="Professional web design and development services — static and dynamic websites using latest technologies"
                />
            </Head>

            <Section
                background="navy"
                className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
            >
                <div className="absolute inset-0">
                    <img
                        src="/images/services/web-design.jpg"
                        alt=""
                        className="size-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-900/95 via-brand-navy-900/90 to-brand-navy-900/85" />
                </div>
                <Container className="relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <Globe className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar'
                                ? 'تطوير المواقع'
                                : 'Web Development'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'نصمم ونطور مواقع ثابتة وديناميكية لجميع المجالات بأعلى معايير الجودة'
                                : 'We design static and dynamic websites for all fields with the highest quality standards'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="mx-auto max-w-3xl">
                        <Heading level="h2">
                            {locale === 'ar' ? 'نظرة عامة' : 'Overview'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-600"
                        >
                            {locale === 'ar'
                                ? 'نصمم مواقع ثابتة وديناميكية لجميع المجالات وفق أعلى معايير الجودة وأحدث تقنيات تطوير الويب واحتياجات العملاء. نغطي جميع احتياجات الشركات من الشركات الناشئة إلى الشركات الكبيرة للمواقع البسيطة أو الأكثر تعقيداً.'
                                : 'We design static and dynamic websites for all fields according to high-quality principles, the latest web development technologies, and customer needs. We cover all company needs from startups to large enterprises — from simple websites to the most complex.'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar' ? 'رحلتنا معك' : 'Our Process'}
                    </Heading>
                    <div className="mt-10 grid gap-6 md:grid-cols-4">
                        {phases.map((phase, i) => {
                            const Icon = phase.icon;

                            return (
                                <div
                                    key={i}
                                    className="rounded-xl border border-neutral-200 bg-white p-6 text-center transition-all hover:border-brand-navy-200 hover:shadow-md"
                                >
                                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-gold-50">
                                        <Icon className="size-7 text-brand-gold-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900">
                                        {phase.title}
                                    </h3>
                                    <Text
                                        variant="body-sm"
                                        className="mt-2 text-neutral-600"
                                    >
                                        {phase.desc}
                                    </Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2">
                        {locale === 'ar'
                            ? 'وكالة إبداعية حائزة على جوائز'
                            : 'An Award-Winning Creative Agency'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'نحن وكالة إبداعية حائزة على جوائز، مكرسة لإنشاء أكثر المواقع جاذبية وديناميكية وتصميماً حديثاً لترك انطباع دائم لدى جمهورك. ندير دورة الحياة الكاملة للموقع من التصميم إلى كتابة المحتوى إلى تحسين محركات البحث إلى التطوير إلى الصيانة والدعم المستمر.'
                            : "We're an award-winning creative agency dedicated to creating the most eye-catching, dynamic, and modern designed websites to create a lasting impression with your audience. We manage the entire life cycle of a website — from design to copywriting to SEO to development to ongoing maintenance and support."}
                    </Text>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/contact/proposal">
                                {locale === 'ar'
                                    ? 'ابدأ مشروعك'
                                    : 'Start Your Project'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-brand-navy-200 text-brand-navy-700 hover:bg-brand-navy-50"
                        >
                            <Link href="/contact/consultation">
                                {locale === 'ar'
                                    ? 'تحدث مع خبير'
                                    : 'Talk to an Expert'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <Button
                        asChild
                        variant="link"
                        className="text-brand-navy-500"
                    >
                        <Link href="/services">
                            <ArrowLeft className="mr-2 size-4 rtl:rotate-180" />
                            {locale === 'ar'
                                ? 'العودة إلى الخدمات'
                                : 'Back to Services'}
                        </Link>
                    </Button>
                </Container>
            </Section>
        </>
    );
}
