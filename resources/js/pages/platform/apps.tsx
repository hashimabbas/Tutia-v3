import { Head, Link } from '@inertiajs/react';
import { Smartphone, Search, CreditCard, Package, Bell, Heart, Star, ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

const features = [
    {
        icon: Search,
        en: 'Product Search',
        ar: 'بحث المنتجات',
        descEn: 'Search by name, category, or brand',
        descAr: 'ابحث بالاسم أو الفئة أو العلامة التجارية',
    },
    {
        icon: CreditCard,
        en: 'Secure Checkout',
        ar: 'إتمام شراء آمن',
        descEn: 'Multiple payment methods',
        descAr: 'طرق دفع متعددة',
    },
    {
        icon: Package,
        en: 'Order Tracking',
        ar: 'تتبع الطلبات',
        descEn: 'Real-time delivery tracking',
        descAr: 'تتبع التوصيل في الوقت الفعلي',
    },
    {
        icon: Bell,
        en: 'Push Notifications',
        ar: 'إشعارات فورية',
        descEn: 'Stay updated on deals and orders',
        descAr: 'ابق على اطلاع بالعروض والطلبات',
    },
    {
        icon: Heart,
        en: 'Wishlist',
        ar: 'قائمة الرغبات',
        descEn: 'Save products for later',
        descAr: 'احفظ المنتجات لوقت لاحق',
    },
    {
        icon: Star,
        en: 'Reviews & Ratings',
        ar: 'التقييمات والمراجعات',
        descEn: 'Read reviews before buying',
        descAr: 'اقرأ التقييمات قبل الشراء',
    },
];

export default function Apps() {
    const { locale } = useI18n();

    return (
        <>
            <Head title={locale === 'ar' ? 'تطبيقات متجر توتيا الجوالة' : 'Matger-TUTIA Mobile Apps'}>
                <meta name="description" content={locale === 'ar' ? 'حمّل تطبيق متجر توتيا على هاتفك المحمول' : 'Download the Matger-TUTIA app on your mobile device'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Smartphone className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'تطبيقات متجر توتيا الجوالة' : 'Matger-TUTIA Mobile Apps'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'تسوق بسهولة من أي مكان في السودان عبر تطبيقنا'
                                : 'Shop easily from anywhere in Sudan with our app'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <Heading level="h2" className="mb-12 text-center">
                        {locale === 'ar' ? 'مميزات التطبيق' : 'App Features'}
                    </Heading>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f, i) => {
                            const Icon = f.icon;

                            return (
                                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6">
                                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Icon className="size-6 text-brand-navy-500" />
                                    </div>
                                    <Heading level="h3">
                                        {locale === 'ar' ? f.ar : f.en}
                                    </Heading>
                                    <Text variant="body" className="mt-2 text-neutral-600">
                                        {locale === 'ar' ? f.descAr : f.descEn}
                                    </Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container className="mx-auto max-w-3xl text-center">
                    <Smartphone className="mx-auto mb-6 size-12 text-brand-navy-500" />
                    <Heading level="h2">
                        {locale === 'ar' ? 'حمّل التطبيق الآن' : 'Download the App Now'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'متوفر على أندرويد و iOS'
                            : 'Available on Android and iOS'}
                    </Text>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-brand-navy-800 text-white hover:bg-brand-navy-900">
                            <a href="#" target="_blank" rel="noopener noreferrer">
                                {locale === 'ar' ? 'جوجل بلاي' : 'Google Play'}
                            </a>
                        </Button>
                        <Button asChild size="lg" className="bg-brand-navy-800 text-white hover:bg-brand-navy-900">
                            <a href="#" target="_blank" rel="noopener noreferrer">
                                {locale === 'ar' ? 'آب ستور' : 'App Store'}
                            </a>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl text-center">
                    <Button asChild variant="outline" size="lg">
                        <Link href="/platform">
                            <ArrowRight className="mr-2 size-4 rtl:rotate-180" />
                            {locale === 'ar' ? 'العودة إلى المنصة' : 'Back to Platform'}
                        </Link>
                    </Button>
                </Container>
            </Section>
        </>
    );
}
