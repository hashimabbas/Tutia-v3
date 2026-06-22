import { Head } from '@inertiajs/react';
import { ShoppingBag, Shield, Truck, RotateCcw, Search, ShoppingCart, MapPin, ArrowRight, Smartphone } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

const benefits = [
    {
        icon: ShoppingBag,
        en: 'Wide Selection',
        ar: 'تشكيلة واسعة',
        descEn: 'Browse thousands of products across multiple categories',
        descAr: 'تصفح آلاف المنتجات عبر فئات متعددة',
    },
    {
        icon: Shield,
        en: 'Secure Shopping',
        ar: 'تسوق آمن',
        descEn: 'Safe payment with multiple payment options',
        descAr: 'دفع آمن مع خيارات دفع متعددة',
    },
    {
        icon: Truck,
        en: 'Fast Delivery',
        ar: 'توصيل سريع',
        descEn: 'Reliable delivery across Khartoum and Sudan',
        descAr: 'توصيل موثوق في جميع أنحاء الخرطوم والسودان',
    },
    {
        icon: RotateCcw,
        en: 'Easy Returns',
        ar: 'إرجاع سهل',
        descEn: 'Hassle-free return policy',
        descAr: 'سياسة إرجاع بدون متاعب',
    },
];

const steps = [
    {
        icon: Search,
        en: 'Browse products by category or search',
        ar: 'تصفح المنتجات حسب الفئة أو ابحث',
    },
    {
        icon: ShoppingCart,
        en: 'Add to cart and checkout securely',
        ar: 'أضف إلى السلة وأتم الدفع بأمان',
    },
    {
        icon: MapPin,
        en: 'Receive your order at your doorstep',
        ar: 'استلم طلبك عند باب منزلك',
    },
];

export default function Buyers() {
    const { locale } = useI18n();

    return (
        <>
            <Head title={locale === 'ar' ? 'تسوق في متجر توتيا' : 'Shop on Matger-TUTIA'}>
                <meta name="description" content={locale === 'ar' ? 'اكتشف منتجات من تجار سودانيين موثوقين' : 'Discover products from trusted Sudanese merchants'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <ShoppingBag className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'تسوق في متجر توتيا' : 'Shop on Matger-TUTIA'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'اكتشف منتجات من تجار سودانيين موثوقين'
                                : 'Discover products from trusted Sudanese merchants'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <Heading level="h2" className="mb-12 text-center">
                        {locale === 'ar' ? 'لماذا تتسوق في متجر توتيا؟' : 'Why shop on Matger-TUTIA?'}
                    </Heading>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {benefits.map((b, i) => {
                            const Icon = b.icon;

                            return (
                                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6 text-center">
                                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Icon className="size-7 text-brand-navy-500" />
                                    </div>
                                    <Heading level="h3">
                                        {locale === 'ar' ? b.ar : b.en}
                                    </Heading>
                                    <Text variant="body" className="mt-2 text-neutral-600">
                                        {locale === 'ar' ? b.descAr : b.descEn}
                                    </Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2" className="mb-12 text-center">
                        {locale === 'ar' ? 'كيف يعمل المتجر؟' : 'How It Works'}
                    </Heading>
                    <div className="grid gap-8 md:grid-cols-3">
                        {steps.map((s, i) => {
                            const Icon = s.icon;

                            return (
                                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
                                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-brand-gold-500/10">
                                        <Icon className="size-8 text-brand-gold-500" />
                                    </div>
                                    <div className="mx-auto mb-4 flex size-8 items-center justify-center rounded-full bg-brand-navy-900 text-sm font-bold text-white">
                                        {i + 1}
                                    </div>
                                    <Text variant="body" className="font-semibold text-neutral-900">
                                        {locale === 'ar' ? s.ar : s.en}
                                    </Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl text-center">
                    <Smartphone className="mx-auto mb-6 size-12 text-brand-navy-500" />
                    <Heading level="h2">
                        {locale === 'ar' ? 'حمّل تطبيق متجر توتيا' : 'Download the Matger-TUTIA App'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'تسوق من أي مكان وفي أي وقت من خلال تطبيقنا للجوّال'
                            : 'Shop anywhere, anytime with our mobile app'}
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

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'ابدأ التسوق الآن' : 'Start Shopping Today'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'تصفح آلاف المنتجات واحصل على أفضل العروض'
                            : 'Browse thousands of products and get the best deals'}
                    </Text>
                    <div className="mt-8">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <a href="https://matger-tutia.com/" target="_blank" rel="noopener noreferrer">
                                {locale === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </a>
                        </Button>
                    </div>
                </Container>
            </Section>
        </>
    );
}
