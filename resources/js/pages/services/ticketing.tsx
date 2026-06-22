import { Head, Link } from '@inertiajs/react';
import { Ticket, ArrowLeft, ArrowRight, ShoppingCart, BarChart3, Settings, Users } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function Ticketing() {
    const { locale } = useI18n();

    const areas = locale === 'ar'
        ? [
            { icon: ShoppingCart, title: 'المبيعات', desc: 'إدارة المبيعات وحجوزات السفر وعمليات البيع' },
            { icon: Users, title: 'التسويق', desc: 'إدارة الحملات التسويقية واستهداف العملاء المحتملين' },
            { icon: Settings, title: 'العمليات', desc: 'أتمتة العمليات التشغيلية اليومية لوكالات السفر' },
            { icon: BarChart3, title: 'المالية', desc: 'إدارة الفواتير والمدفوعات والتقارير المالية' },
          ]
        : [
            { icon: ShoppingCart, title: 'Sales', desc: 'Sales management, travel bookings, and point-of-sale operations' },
            { icon: Users, title: 'Marketing', desc: 'Marketing campaign management and customer targeting' },
            { icon: Settings, title: 'Operations', desc: 'Automation of daily travel agency operations' },
            { icon: BarChart3, title: 'Finance', desc: 'Invoice management, payments, and financial reporting' },
          ];

    return (
        <>
            <Head title={locale === 'ar' ? 'نظام الحجز والتذاكر' : 'Ticketing System'}>
                <meta name="description" content="TUTIA ticketing system automates sales, marketing, operations, and finance for travel agencies" />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0">
                    <img src="/images/services/tickting.png" alt="" className="size-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-900/95 via-brand-navy-900/90 to-brand-navy-900/85" />
                </div>
                <Container className="relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <Ticket className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'نظام الحجز والتذاكر' : 'Ticketing System'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'أتمتة أعمال وكالات السفر — مبيعات، تسويق، عمليات، ومالية في نظام واحد'
                                : 'Travel agency automation — sales, marketing, operations, and finance in one system'}
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
                                ? 'نظام الحجز والتذاكر من توتيا هو برنامج يؤتمت مبيعاتك وتسويقك وعملياتك وماليتك. صمم نظامنا بالاستناد إلى أنجح شركات السفر ويغطي العملية التجارية الكاملة لوكالات السفر. مع برنامجنا وفريق التنفيذ والدعم المخصص، سيتمكن عملاؤنا من تنمية أعمالهم في السفر وتحسين الكفاءة وزيادة المبيعات.'
                                : 'TUTIA ticketing system is software that automates your sales, marketing, operations, and finances. Our software has been modeled upon the most successful travel businesses and covers the entire business process for travel agencies. With our software and dedicated implementation and support team, customers can grow their travel businesses, improve efficiency, and generate more sales.'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar' ? 'مجالات التغطية' : 'Coverage Areas'}
                    </Heading>
                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                        {areas.map((area, i) => {
                            const Icon = area.icon;

                            return (
                                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-navy-200 hover:shadow-md">
                                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Icon className="size-6 text-brand-navy-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900">{area.title}</h3>
                                    <Text variant="body-sm" className="mt-2 text-neutral-600">{area.desc}</Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2">
                        {locale === 'ar' ? 'لماذا تختار نظام توتيا؟' : 'Why Choose TUTIA Ticketing?'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'مع فريق التنفيذ والدعم المخصص لدينا، ستتمكن من تطوير أعمالك في السفر وتحسين الكفاءة وزيادة المبيعات.'
                            : 'With our dedicated implementation and support team, you\'ll be able to grow your travel business, improve efficiency, and generate more sales.'}
                    </Text>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'احجز عرضاً تجريبياً' : 'Book a Demo'}
                    </Heading>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/consultation">
                                {locale === 'ar' ? 'احجز موعداً' : 'Schedule a Demo'}
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
