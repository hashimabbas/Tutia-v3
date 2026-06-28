import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle,
    Briefcase,
    BookOpen,
    Store,
    ArrowRight,
} from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

const resources = [
    {
        icon: Briefcase,
        href: '/work',
        en: 'View Our Work',
        ar: 'أعمالنا',
        descEn: 'See our latest projects and case studies',
        descAr: 'اطلع على أحدث مشاريعنا ودراسات الحالة',
    },
    {
        icon: BookOpen,
        href: '/insights',
        en: 'Read Our Insights',
        ar: 'المدونة',
        descEn: 'Explore articles and industry insights',
        descAr: 'استعرض المقالات والرؤى التقنية',
    },
    {
        icon: Store,
        href: '/platform',
        en: 'Explore Matger-TUTIA',
        ar: 'متجر توتيا',
        descEn: "Discover Sudan's first multi-vendor marketplace",
        descAr: 'اكتشف أول سوق إلكتروني متعدد البائعين في السودان',
    },
];

export default function ThankYou() {
    const { locale } = useI18n();

    return (
        <>
            <Head title={locale === 'ar' ? 'شكراً لتواصلك معنا' : 'Thank You'}>
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'شكراً لتواصلك مع توتيا. سنرد عليك خلال 24 ساعة'
                            : 'Thank you for contacting TUTIA. We will get back to you within 24 hours'
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
                        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="size-10 text-green-600" />
                        </div>
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'شكراً لك!' : 'Thank You!'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'لقد تلقينا رسالتك وسنرد عليك خلال 24 ساعة'
                                : "We've received your message and will get back to you within 24 hours."}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h2">
                            {locale === 'ar'
                                ? 'بينما تنتظر...'
                                : 'While you wait...'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-2 text-neutral-600"
                        >
                            {locale === 'ar'
                                ? 'استكشف المزيد من محتوانا'
                                : 'Explore more of our content'}
                        </Text>
                    </div>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {resources.map((r) => {
                            const Icon = r.icon;

                            return (
                                <Link
                                    key={r.href}
                                    href={r.href}
                                    className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-navy-200 hover:shadow-md"
                                >
                                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Icon className="size-6 text-brand-navy-500" />
                                    </div>
                                    <Heading
                                        level="h4"
                                        className="group-hover:text-brand-navy-500"
                                    >
                                        {locale === 'ar' ? r.ar : r.en}
                                    </Heading>
                                    <Text
                                        variant="body-sm"
                                        className="mt-2 text-neutral-600"
                                    >
                                        {locale === 'ar' ? r.descAr : r.descEn}
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

            <Section>
                <Container className="mx-auto max-w-3xl text-center">
                    <Button
                        asChild
                        size="lg"
                        className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                    >
                        <Link href="/">
                            {locale === 'ar'
                                ? 'العودة إلى الرئيسية'
                                : 'Back to Home'}
                            <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                        </Link>
                    </Button>
                </Container>
            </Section>
        </>
    );
}
