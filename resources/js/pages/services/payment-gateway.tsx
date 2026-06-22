import { Head, Link } from '@inertiajs/react';
import { CreditCard, ArrowLeft, ArrowRight, Globe, RefreshCw, BarChart3, Wallet } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function PaymentGateway() {
    const { locale } = useI18n();

    const features = locale === 'ar'
        ? [
            { icon: CreditCard, title: 'بطاقات الائتمان', desc: 'قبول جميع بطاقات الائتمان الرئيسية بسلاسة وأمان' },
            { icon: Wallet, title: 'المحافظ الرقمية', desc: 'دعم المحافظ الرقمية ومنصات التجارة الإلكترونية' },
            { icon: Globe, title: 'عملات متعددة', desc: 'معالجة المدفوعات بعملات أجنبية مختلفة' },
            { icon: RefreshCw, title: 'فواتير متكررة', desc: 'إعداد الفواتير المتكررة وإدارة الاشتراكات' },
            { icon: BarChart3, title: 'لوحة تحكم', desc: 'تتبع جميع معاملاتك عبر لوحة إدارة الحساب' },
          ]
        : [
            { icon: CreditCard, title: 'Credit Cards', desc: 'Accept all major credit card networks seamlessly' },
            { icon: Wallet, title: 'Digital Wallets', desc: 'Support for digital wallets and e-commerce platforms' },
            { icon: Globe, title: 'Multi-Currency', desc: 'Process payments in different foreign currencies' },
            { icon: RefreshCw, title: 'Recurring Billing', desc: 'Set up recurring billing and subscription management' },
            { icon: BarChart3, title: 'Dashboard', desc: 'Track all transactions via account management dashboard' },
          ];

    return (
        <>
            <Head title={locale === 'ar' ? 'بوابة الدفع' : 'Payment Gateway'}>
                <meta name="description" content="Payment gateway solution working with all major credit card networks, digital wallets, and multi-currency support" />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0">
                    <img src="/images/services/payment.jpg" alt="" className="size-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-900/95 via-brand-navy-900/90 to-brand-navy-900/85" />
                </div>
                <Container className="relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <CreditCard className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'بوابة الدفع' : 'Payment Gateway'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'بوابة دفع تعمل مع جميع بطاقات الائتمان والمحافظ الرقمية ومنصات التجارة الإلكترونية'
                                : 'Payment gateway working with all major credit cards, digital wallets, and e-commerce platforms'}
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
                                ? 'بوابة دفع توتيا تعمل مع جميع شبكات بطاقات الائتمان الرئيسية والمحافظ الرقمية ومنصات التجارة الإلكترونية. تشمل الميزات أيضاً القدرة على معالجة العملات الأجنبية المختلفة، وترتيب الفواتير المتكررة، وتتبع معاملاتك عبر لوحة إدارة الحساب.'
                                : 'TUTIA Payment Gateway works with all major credit card networks, digital wallets, and e-commerce platforms. Other features include the ability to process different foreign currencies, arrange recurring billing, and track your transactions via an account management dashboard.'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar' ? 'الميزات' : 'Features'}
                    </Heading>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {features.map((feat, i) => {
                            const Icon = feat.icon;

                            return (
                                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6 text-center transition-all hover:border-brand-navy-200 hover:shadow-md">
                                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Icon className="size-7 text-brand-navy-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900">{feat.title}</h3>
                                    <Text variant="body-sm" className="mt-2 text-neutral-600">{feat.desc}</Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'ابدأ بقبول المدفوعات' : 'Start Accepting Payments'}
                    </Heading>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/quote">
                                {locale === 'ar' ? 'اقبل المدفوعات' : 'Accept Payments'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            <Link href="/contact/consultation">
                                {locale === 'ar' ? 'تحدث مع خبير' : 'Talk to an Expert'}
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
