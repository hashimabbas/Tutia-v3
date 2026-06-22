import { Head, Link } from '@inertiajs/react';
import { BrainCircuit, ArrowLeft, ArrowRight, Building2, Globe, Network, Shield } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function Consulting() {
    const { locale } = useI18n();

    const domains = locale === 'ar'
        ? [
            { icon: Globe, title: 'الخدمات الإلكترونية الفعالة', desc: 'تصميم وتنفيذ خدمات إلكترونية مبتكرة تلبي احتياجات المستخدمين' },
            { icon: Building2, title: 'أنظمة النقل المتطورة', desc: 'استشارات في أنظمة النقل الذكية والبنية التحتية للمواصلات' },
            { icon: Network, title: 'شبكات الاتصالات', desc: 'تصميم وإدارة شبكات الاتصالات وتكنولوجيا المعلومات في المباني' },
            { icon: Shield, title: 'البنية التحتية التقنية', desc: 'تقييم وتطوير البنية التحتية لتكنولوجيا المعلومات' },
          ]
        : [
            { icon: Globe, title: 'Efficient Online Services', desc: 'Design and implement innovative digital services that meet user requirements' },
            { icon: Building2, title: 'Transportation Systems', desc: 'Consultancy on intelligent transport systems and transportation infrastructure' },
            { icon: Network, title: 'Communications Networks', desc: 'Design and management of IT and communications networks in buildings' },
            { icon: Shield, title: 'Technical Infrastructure', desc: 'Assessment and development of technology infrastructure' },
          ];

    return (
        <>
            <Head title={locale === 'ar' ? 'الاستشارات التقنية' : 'ICT Consulting'}>
                <meta name="description" content="ICT consultancy covering the full lifecycle of technology systems — from strategy to implementation to ongoing management" />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0">
                    <img src="/images/services/business-gbf.jpg" alt="" className="size-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-900/95 via-brand-navy-900/90 to-brand-navy-900/85" />
                </div>
                <Container className="relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <BrainCircuit className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'الاستشارات التقنية' : 'ICT Consulting'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'استشارات تقنية متكاملة تضمن تحقيق أقصى استفادة من استثماراتك التقنية'
                                : 'Comprehensive ICT consultancy ensuring technology delivers its promised benefits'}
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
                                ? 'استشاراتنا في مجال تكنولوجيا المعلومات والاتصالات (ICT) تضمن أن التكنولوجيا لا تلبي متطلبات مستخدميها فحسب، بل يتم تنفيذها وإدارتها لتحقيق الفوائد الموعودة. تكنولوجيا المعلومات والاتصالات جزء لا يتجزأ من الحياة الحديثة وتغطي جميع جوانب البنية التحتية للمجتمع.'
                                : 'Our ICT consultancy ensures technology not only meets user requirements but is implemented and managed to realize promised benefits. ICT is integral to modern life and covers all aspects of society\'s infrastructure.'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar' ? 'مجالات الاستشارات' : 'Consultancy Domains'}
                    </Heading>
                    <Text variant="body-lg" className="mx-auto mt-4 max-w-2xl text-center text-neutral-600">
                        {locale === 'ar'
                            ? 'نقدم خبرة استشارية تغطي دورة الحياة الكاملة لتصميم وتنفيذ هذه الأنظمة'
                            : 'We provide expert consultancy covering the full lifecycle of design and implementation of these systems'}
                    </Text>
                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                        {domains.map((domain, i) => {
                            const Icon = domain.icon;

                            return (
                                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-navy-200 hover:shadow-md">
                                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Icon className="size-6 text-brand-navy-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900">{domain.title}</h3>
                                    <Text variant="body-sm" className="mt-2 text-neutral-600">{domain.desc}</Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {locale === 'ar' ? 'نهجنا الاستشاري' : 'Our Consultancy Approach'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'تقدم توتيا استشارات خبيرة تغطي دورة الحياة الكاملة لتصميم وتنفيذ هذه الأنظمة. نضمن أن تكون استراتيجية ICT شاملة، والتصميم قوياً، والتنفيذ ناجحاً، والإدارة المستمرة تحقق الفوائد المرجوة.'
                            : 'TUTIA provides expert consultancy covering the full lifecycle of design and implementation of these systems. We ensure the ICT strategy is comprehensive, the design is robust, the implementation is successful, and the ongoing management delivers the benefit.'}
                    </Text>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'استشر خبيراً اليوم' : 'Talk to an Expert Today'}
                    </Heading>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/consultation">
                                {locale === 'ar' ? 'تحدث مع خبير' : 'Talk to an Expert'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            <Link href="/contact/quote">
                                {locale === 'ar' ? 'اطلب عرض سعر' : 'Get a Quote'}
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
