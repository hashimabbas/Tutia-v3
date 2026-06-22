import { Head, Link } from '@inertiajs/react';
import { Headset, ArrowLeft, ArrowRight, MessageCircle, Phone, BarChart3, Workflow } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function CallCenter() {
    const { locale } = useI18n();

    const solutions = locale === 'ar'
        ? [
            { icon: Workflow, title: 'الجيل التالي لمراكز الاتصال', desc: 'حلول متطورة لمراكز الاتصال تدعم القنوات الرقمية إلى جانب المكالمات' },
            { icon: MessageCircle, title: 'إدارة تجربة العملاء', desc: 'تجربة موحدة ومتكاملة عبر جميع نقاط الاتصال والقنوات' },
            { icon: Phone, title: 'الاتصال متعدد القنوات', desc: 'تجربة سلسة متعددة القنوات تحافظ على السياق عبر التفاعلات' },
            { icon: BarChart3, title: 'خفض تكلفة الخدمة', desc: 'تحسين العمليات التجارية لتقليل تكلفة الخدمة مع تحسين الجودة' },
          ]
        : [
            { icon: Workflow, title: 'Next-Gen Contact Center', desc: 'Advanced contact center solutions supporting digital channels beyond phone calls' },
            { icon: MessageCircle, title: 'Customer Experience Management', desc: 'Unified omnichannel experience at every touchpoint and channel' },
            { icon: Phone, title: 'Omnichannel Communication', desc: 'Seamless multi-channel experience preserving context across interactions' },
            { icon: BarChart3, title: 'Lower Cost to Serve', desc: 'Business process optimization to reduce service costs while improving quality' },
          ];

    return (
        <>
            <Head title={locale === 'ar' ? 'مركز الاتصال' : 'Call Center'}>
                <meta name="description" content="TUTIA Customer Experience Platform — omnichannel call center solutions for unified customer service" />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0">
                    <img src="/images/services/call-centre.jpg" alt="" className="size-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-900/95 via-brand-navy-900/90 to-brand-navy-900/85" />
                </div>
                <Container className="relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <Headset className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'مركز الاتصال' : 'Call Center'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'منصة تجربة العملاء من توتيا — اتصال موحد ومتكامل عبر جميع القنوات'
                                : 'TUTIA Customer Experience Platform — unified omnichannel customer service'}
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
                        <Text variant="body-lg" className="mt-4 text-neutral-600">
                            {locale === 'ar'
                                ? 'عندما يتطور مركز الاتصال ليدعم القنوات الرقمية، يصبح دمج هذه الخدمات في اتصال واحد سلس أمراً بالغ الأهمية. تقدم منصة تجربة العملاء من توتيا حلولاً لمراكز الاتصال لتوفير تجربة عملاء موحدة ومتسقة عبر كل نقطة اتصال وقناة.'
                                : 'When a call center modernizes beyond phone calls to support digital channels, integrating these services into one seamless connection is critical. The TUTIA Customer Experience Platform offers solutions for call centers to provide a unified and consistent omnichannel customer experience at every touchpoint and channel.'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar' ? 'حلول منصة توتيا' : 'TUTIA Platform Solutions'}
                    </Heading>
                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                        {solutions.map((sol, i) => {
                            const Icon = sol.icon;

                            return (
                                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-navy-200 hover:shadow-md">
                                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Icon className="size-6 text-brand-navy-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900">{sol.title}</h3>
                                    <Text variant="body-sm" className="mt-2 text-neutral-600">{sol.desc}</Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {locale === 'ar' ? 'فوائد إدارة مراكز اتصال توتيا' : 'TUTIA Call Center Benefits'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'تحافظ المنصة على السياق والتاريخ عبر التفاعلات عندما ينتقل العميل بين القنوات، مما يحسن مستويات خدمة العملاء وتجربتهم الشاملة.'
                            : 'The platform preserves context and history across interactions as customers transition between channels, improving customer service levels and overall customer experience.'}
                    </Text>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'طور خدمة العملاء' : 'Elevate Your Customer Service'}
                    </Heading>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/consultation">
                                {locale === 'ar' ? 'تحدث مع خبير' : 'Talk to an Expert'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            <Link href="/contact/consultation">
                                {locale === 'ar' ? 'اطلب عرضاً تجريبياً' : 'Request a Demo'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <Button asChild variant="link" className="text-brand-navy-500">
                        <Link href="/services">
                            <ArrowLeft className="mr-2 size-4 rtl:rotate-180" />
                            {locale === 'ar' ? 'العودة إلى الخدمات' : 'Back to Services'}
                        </Link>
                    </Button>
                </Container>
            </Section>
        </>
    );
}
