import { Head, Link } from '@inertiajs/react';
import { ArrowRight, User } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

const LEADERS = [
    {
        name: 'Mohamed Eltayeb',
        nameAr: 'محمد الطيب',
        title: 'Chief Executive Officer',
        titleAr: 'الرئيس التنفيذي',
        bio: "Over 20 years of experience in technology leadership and digital transformation across Sudan and the region. Mohamed drives TUTIA's strategic vision and growth.",
        bioAr: 'أكثر من 20 عاماً من الخبرة في القيادة التقنية والتحول الرقمي في السودان والمنطقة. يقود محمد الرؤية الاستراتيجية والنمو لشركة توتيا.',
    },
    {
        name: 'Ahmed Hassan',
        nameAr: 'أحمد حسن',
        title: 'Chief Technology Officer',
        titleAr: 'رئيس التقنية',
        bio: "Ahmed leads TUTIA's technical strategy, overseeing platform architecture, innovation, and delivery of enterprise-grade solutions for clients.",
        bioAr: 'يقود أحمد الاستراتيجية التقنية لتوتيا، ويشرف على هندسة المنصات والابتكار وتقديم الحلول المؤسسية للعملاء.',
    },
    {
        name: 'Sara Omer',
        nameAr: 'سارة عمر',
        title: 'Chief Operating Officer',
        titleAr: 'رئيسة العمليات',
        bio: 'Sara ensures operational excellence across all departments, driving efficiency, client satisfaction, and sustainable business practices.',
        bioAr: 'تضمن سارة التميز التشغيلي في جميع الأقسام، وتدفع الكفاءة ورضا العملاء والممارسات التجارية المستدامة.',
    },
    {
        name: 'Khalid Osman',
        nameAr: 'خالد عثمان',
        title: 'Head of Operations',
        titleAr: 'مدير العمليات',
        bio: 'Khalid manages day-to-day operations, resource allocation, and project delivery, ensuring TUTIA consistently meets client expectations.',
        bioAr: 'يدير خالد العمليات اليومية وتخصيص الموارد وتسليم المشاريع، مما يضمن أن توتيا تلبي توقعات العملاء باستمرار.',
    },
];

export default function Leadership() {
    const { locale } = useI18n();

    return (
        <>
            <Head
                title={
                    locale === 'ar' ? 'الإدارة - توتيا' : 'Leadership - TUTIA'
                }
            >
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'تعرف على فريق القيادة في توتيا'
                            : 'Meet the leadership team at TUTIA'
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
                            {locale === 'ar' ? 'الإدارة' : 'Our Leadership'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'فريق القيادة الذي يقود رؤية توتيا ويدفع عجلة النمو'
                                : "The leadership team driving TUTIA's vision and growth"}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="grid gap-8 md:grid-cols-2">
                        {LEADERS.map((leader) => (
                            <div
                                key={leader.name}
                                className="rounded-xl border border-neutral-200 bg-white p-8 transition-all hover:shadow-md"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-navy-900">
                                        <User className="size-7 text-white" />
                                    </div>
                                    <div>
                                        <Heading level="h3">
                                            {locale === 'ar'
                                                ? leader.nameAr
                                                : leader.name}
                                        </Heading>
                                        <Text
                                            variant="body-sm"
                                            className="mt-1 font-medium text-brand-navy-500"
                                        >
                                            {locale === 'ar'
                                                ? leader.titleAr
                                                : leader.title}
                                        </Text>
                                        <Text
                                            variant="body"
                                            className="mt-3 text-neutral-600"
                                        >
                                            {locale === 'ar'
                                                ? leader.bioAr
                                                : leader.bio}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2">
                        {locale === 'ar'
                            ? 'تواصل مع فريقنا'
                            : 'Talk to Our Team'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'نحن هنا للإجابة على أسئلتك ومناقشة كيف يمكننا مساعدتك'
                            : "We're here to answer your questions and discuss how we can help"}
                    </Text>
                    <div className="mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/contact/consultation">
                                {locale === 'ar'
                                    ? 'احجز استشارة'
                                    : 'Book a Consultation'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>
        </>
    );
}
