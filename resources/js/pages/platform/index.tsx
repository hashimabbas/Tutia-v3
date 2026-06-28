import { Head, Link } from '@inertiajs/react';
import {
    Store,
    ShoppingBag,
    Check,
    Smartphone,
    ArrowRight,
} from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function PlatformIndex() {
    const { t, locale } = useI18n();

    const sellerBenefits =
        locale === 'ar'
            ? [
                  'أنشئ متجرك الإلكتروني مجاناً',
                  'وصل إلى آلاف المشترين',
                  'إدارة المخزون والطلبات بسهولة',
              ]
            : [
                  'Create your online store for free',
                  'Reach thousands of buyers',
                  'Easily manage inventory and orders',
              ];

    const buyerBenefits =
        locale === 'ar'
            ? [
                  'تسوق من مئات البائعين',
                  'طرق دفع متعددة وآمنة',
                  'توصيل سريع وموثوق',
              ]
            : [
                  'Shop from hundreds of sellers',
                  'Multiple secure payment methods',
                  'Fast and reliable delivery',
              ];

    return (
        <>
            <Head title={t('platform.title')}>
                <meta name="description" content={t('platform.subtitle')} />
            </Head>

            <Section
                background="navy"
                className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h1" className="text-white">
                            {locale === 'ar'
                                ? 'متجر توتيا'
                                : t('platform.title')}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {t('platform.subtitle')}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {locale === 'ar'
                            ? 'ما هو متجر توتيا؟'
                            : 'What is Matger-TUTIA?'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'متجر توتيا هو أول سوق إلكتروني متعدد البائعين في السودان. منصة متكاملة تمكن التجار من عرض وبيع منتجاتهم عبر الإنترنت، وتتيح للمشترين التسوق من مجموعة واسعة من المنتجات بكل سهولة وأمان. سواء كنت بائعاً تبحث عن منصة لعرض منتجاتك أو مشترياً تبحث عن تجربة تسوق متميزة، متجر توتيا هو وجهتك المثالية.'
                            : "Matger-TUTIA is Sudan's first multi-vendor e-commerce marketplace. An integrated platform that enables merchants to showcase and sell their products online, and allows buyers to shop from a wide range of products easily and securely. Whether you are a seller looking for a platform to showcase your products or a buyer seeking a premium shopping experience, Matger-TUTIA is your ideal destination."}
                    </Text>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <div className="grid gap-10 md:grid-cols-2">
                        <div className="rounded-xl border border-neutral-200 bg-white p-8">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-navy-50">
                                <Store className="size-7 text-brand-navy-500" />
                            </div>
                            <Heading level="h3">
                                {t('platform.forSellers')}
                            </Heading>
                            <ul className="mt-6 space-y-3">
                                {sellerBenefits.map((benefit, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                                            <Check className="size-3 text-green-600" />
                                        </span>
                                        <Text
                                            variant="body"
                                            className="text-neutral-700"
                                        >
                                            {benefit}
                                        </Text>
                                    </li>
                                ))}
                            </ul>
                            <Button asChild className="mt-6 w-full">
                                <Link href="/platform/sellers">
                                    {t('platform.sellerRegistration')}
                                    <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                                </Link>
                            </Button>
                        </div>

                        <div className="rounded-xl border border-neutral-200 bg-white p-8">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-navy-50">
                                <ShoppingBag className="size-7 text-brand-navy-500" />
                            </div>
                            <Heading level="h3">
                                {t('platform.forBuyers')}
                            </Heading>
                            <ul className="mt-6 space-y-3">
                                {buyerBenefits.map((benefit, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                                            <Check className="size-3 text-green-600" />
                                        </span>
                                        <Text
                                            variant="body"
                                            className="text-neutral-700"
                                        >
                                            {benefit}
                                        </Text>
                                    </li>
                                ))}
                            </ul>
                            <Button asChild className="mt-6 w-full">
                                <Link href="/platform/buyers">
                                    {t('platform.startShopping')}
                                    <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2">
                        {locale === 'ar' ? 'التطبيقات الجوالة' : 'Mobile Apps'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'حمّل تطبيق متجر توتيا على جهازك الأندرويد أو iOS وتسوق أينما كنت'
                            : 'Download the Matger-TUTIA app on your Android or iOS device and shop anywhere'}
                    </Text>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-navy-800 text-white hover:bg-brand-navy-900"
                        >
                            <Link href="/platform/apps">
                                <Smartphone className="mr-2 size-5" />
                                {t('platform.downloadApp')}
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar'
                            ? 'انضم إلى سوق متجر توتيا'
                            : 'Join the Matger-TUTIA Marketplace'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar'
                            ? 'ابدأ رحلة التجارة الإلكترونية مع أول سوق متعدد البائعين في السودان'
                            : "Start your e-commerce journey with Sudan's first multi-vendor marketplace"}
                    </Text>
                    <div className="mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/platform/register">
                                {t('platform.sellerRegistration')}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>
        </>
    );
}
