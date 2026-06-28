import { Head, Link } from '@inertiajs/react';
import {
    Wifi,
    ArrowRight,
    ArrowLeft,
    Antenna,
    Settings,
    ClipboardCheck,
} from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function Connectivity() {
    const { locale } = useI18n();

    const solutions =
        locale === 'ar'
            ? [
                  {
                      icon: Antenna,
                      title: 'تغطية الجوال',
                      desc: 'حلول تغطية جوال داخلية/خارجية مع جميع مشغلي الشبكات في السودان',
                  },
                  {
                      icon: Wifi,
                      title: 'شبكات Wi-Fi',
                      desc: 'تغطية واي فاي داخلية وخارجية موثوقة للمنازل والشركات',
                  },
                  {
                      icon: Settings,
                      title: 'استشارات وصيانة',
                      desc: 'خدمات استشارية وصيانة مستمرة لضمان أفضل أداء',
                  },
              ]
            : [
                  {
                      icon: Antenna,
                      title: 'Mobile Coverage',
                      desc: 'Indoor/outdoor mobile coverage solutions with all network operators in Sudan',
                  },
                  {
                      icon: Wifi,
                      title: 'Wi-Fi Networks',
                      desc: 'Reliable indoor/outdoor Wi-Fi coverage for homes and businesses',
                  },
                  {
                      icon: Settings,
                      title: 'Maintenance & Consulting',
                      desc: 'Ongoing maintenance and consultancy services for optimal performance',
                  },
              ];

    const process =
        locale === 'ar'
            ? [
                  {
                      icon: ClipboardCheck,
                      title: 'تقييم الموقع',
                      desc: 'زيارة ميدانية وتقييم التغطية الحالية لتحديد أفضل الحلول',
                  },
                  {
                      icon: Settings,
                      title: 'تصميم النظام',
                      desc: 'تصميم نظام التغطية الأمثل بناءً على نتائج التقييم',
                  },
                  {
                      icon: Wifi,
                      title: 'التركيب والتشغيل',
                      desc: 'تركيب أجهزة التغطية وتشغيل النظام بالكامل',
                  },
              ]
            : [
                  {
                      icon: ClipboardCheck,
                      title: 'Site Assessment',
                      desc: 'On-site coverage assessment to determine optimal solutions',
                  },
                  {
                      icon: Settings,
                      title: 'System Design',
                      desc: 'Design the optimal coverage system based on assessment results',
                  },
                  {
                      icon: Wifi,
                      title: 'Installation & Commissioning',
                      desc: 'Install coverage equipment and commission the entire system',
                  },
              ];

    return (
        <>
            <Head
                title={
                    locale === 'ar' ? 'حلول الاتصال' : 'Connectivity Solutions'
                }
            >
                <meta
                    name="description"
                    content="Mobile coverage and Wi-Fi solutions using latest technologies approved by all network operators in Sudan"
                />
            </Head>

            <Section
                background="navy"
                className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
            >
                <div className="absolute inset-0">
                    <img
                        src="/images/services/network-g.jpg"
                        alt=""
                        className="size-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-900/95 via-brand-navy-900/90 to-brand-navy-900/85" />
                </div>
                <Container className="relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <Wifi className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar'
                                ? 'حلول الاتصال'
                                : 'Connectivity Solutions'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'أحدث حلول التغطية الجوالة المعتمدة من مشغلي الشبكات في السودان'
                                : 'Latest mobile coverage solutions approved by all network operators in Sudan'}
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
                                ? 'نستخدم أحدث حلول التغطية الجوالة وأكثرها تقدماً، والمعتمدة من مشغلي الشبكات في السودان. نقدم تغطية جوالة داخلية/خارجية وتغطية Wi-Fi للمنازل والشركات والمؤسسات. نبدأ بتقييم الموقع، ثم تصميم النظام، ثم التركيب، ونقدم أيضاً خدمات الصيانة والاستشارات المستمرة.'
                                : 'We use the latest and most advanced mobile coverage solutions approved by all network operators in Sudan. We provide indoor/outdoor mobile and Wi-Fi coverage for homes, businesses, and organizations. This is followed by an on-site coverage assessment, design, system installation, and ongoing maintenance and consultancy.'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar' ? 'حلولنا' : 'Our Solutions'}
                    </Heading>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {solutions.map((sol, i) => {
                            const Icon = sol.icon;

                            return (
                                <div
                                    key={i}
                                    className="rounded-xl border border-neutral-200 bg-white p-6 text-center transition-all hover:border-brand-navy-200 hover:shadow-md"
                                >
                                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Icon className="size-7 text-brand-navy-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900">
                                        {sol.title}
                                    </h3>
                                    <Text
                                        variant="body-sm"
                                        className="mt-2 text-neutral-600"
                                    >
                                        {sol.desc}
                                    </Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar'
                            ? 'عملية التنفيذ'
                            : 'Implementation Process'}
                    </Heading>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {process.map((step, i) => {
                            const Icon = step.icon;

                            return (
                                <div
                                    key={i}
                                    className="relative rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-navy-200 hover:shadow-md"
                                >
                                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-gold-50">
                                        <Icon className="size-6 text-brand-gold-500" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 flex size-8 items-center justify-center rounded-full bg-brand-navy-600 text-sm font-bold text-white">
                                        {i + 1}
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900">
                                        {step.title}
                                    </h3>
                                    <Text
                                        variant="body-sm"
                                        className="mt-2 text-neutral-600"
                                    >
                                        {step.desc}
                                    </Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar'
                            ? 'تحتاج تغطية أفضل؟'
                            : 'Need Better Coverage?'}
                    </Heading>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/contact/consultation">
                                {locale === 'ar'
                                    ? 'اطلب معاينة'
                                    : 'Request a Survey'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            <Link href="/contact/quote">
                                {locale === 'ar'
                                    ? 'اطلب عرض سعر'
                                    : 'Get a Quote'}
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
