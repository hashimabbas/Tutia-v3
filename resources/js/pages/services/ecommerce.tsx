import { Head, Link } from '@inertiajs/react';
import { ShoppingCart, ArrowLeft, ArrowRight, Smartphone, Globe, Palette } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function Ecommerce() {
    const { locale } = useI18n();

    const highlights = locale === 'ar'
        ? [
            { icon: ShoppingCart, title: 'سوق متعدد البائعين', desc: 'منصة B2C تجمع البائعين والمشترين في سوق إلكتروني متكامل' },
            { icon: Smartphone, title: 'تطبيق جوال', desc: 'متوفر على أندرويد و iOS لتجربة تسوق سهلة من أي مكان' },
            { icon: Globe, title: 'متجر إلكتروني', desc: 'منصة رقمية متكاملة على www.Matger-tutia.sd' },
            { icon: Palette, title: 'علامات تجارية', desc: 'نساعد في بناء العلامات التجارية بمنتجات عالية الجودة' },
          ]
        : [
            { icon: ShoppingCart, title: 'Multi-Vendor Marketplace', desc: 'B2C platform connecting sellers and buyers in a comprehensive digital marketplace' },
            { icon: Smartphone, title: 'Mobile Application', desc: 'Available on Android and iOS for seamless shopping anywhere' },
            { icon: Globe, title: 'Online Store', desc: 'Full-featured digital platform at www.Matger-tutia.sd' },
            { icon: Palette, title: 'Brand Building', desc: 'We help build brands with high-quality products and fast delivery' },
          ];

    const categories = locale === 'ar'
        ? ['مستلزمات المنزل', 'الحاجيات العائلية', 'الأجهزة الإلكترونية', 'مستلزمات الأطفال', 'منتجات المرأة', 'مستحضرات التجميل', 'الألعاب', 'الأثاث', 'العطور']
        : ['Home Necessities', 'Family Essentials', 'Electronic Devices', 'Baby Needs', 'Women Products', 'Cosmetics', 'Toys', 'Furniture', 'Perfumes'];

    return (
        <>
            <Head title={locale === 'ar' ? 'التجارة الإلكترونية' : 'E-Commerce'}>
                <meta name="description" content="Matger-TUTIA multi-vendor B2C e-commerce marketplace with mobile apps and web platform" />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0">
                    <img src="/images/services/online-shop-g7a91d4a91_640.png" alt="" className="size-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-900/95 via-brand-navy-900/90 to-brand-navy-900/85" />
                </div>
                <Container className="relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <ShoppingCart className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'التجارة الإلكترونية' : 'E-Commerce'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'منصة متجر توتيا للتجارة الإلكترونية B2C - نسوق المجتمع ونساعد في التسوق من المنزل'
                                : 'Matger-TUTIA B2C e-commerce marketplace — helping the community shop from home'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
                        <div>
                            <Heading level="h2">
                                {locale === 'ar' ? 'متجر توتيا' : 'Matger-TUTIA'}
                            </Heading>
                            <Text variant="body-lg" className="mt-4 text-neutral-600">
                                {locale === 'ar'
                                    ? 'متجر توتيا هو مشروعنا الرائد في التجارة الإلكترونية، وهو سوق إلكتروني B2C يهدف لتمكين المجتمع من التسوق بسهولة من المنزل. يقدم المتجر منتجات عبر الإنترنت مع عدة طرق دفع مرنة.'
                                    : 'Matger-TUTIA is our flagship e-commerce project — a B2C digital marketplace enabling the community to shop conveniently from home. The platform sells products online with multiple payment methods.'}
                            </Text>
                            <div className="mt-6 space-y-1">
                                <a href="https://matger-tutia.com/" target="_blank" rel="noopener noreferrer" className="text-brand-gold-500 underline underline-offset-4 hover:text-brand-gold-600">
                                    www.Matger-tutia.sd
                                </a>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8">
                            <div className="grid grid-cols-2 gap-4">
                                {highlights.map((item, i) => {
                                    const Icon = item.icon;

                                    return (
                                        <div key={i} className="rounded-xl bg-white p-4 text-center shadow-sm">
                                            <Icon className="mx-auto mb-2 size-6 text-brand-gold-500" />
                                            <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                                            <p className="mt-1 text-xs text-neutral-500">{item.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar' ? 'تصنيفات المنتجات' : 'Product Categories'}
                    </Heading>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        {categories.map((cat, i) => (
                            <span key={i} className="rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:border-brand-gold-300 hover:text-brand-gold-700">
                                {cat}
                            </span>
                        ))}
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'انضم إلى متجر توتيا' : 'Join Matger-TUTIA'}
                    </Heading>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/consultation">
                                {locale === 'ar' ? 'اطلب عرضاً' : 'Request a Demo'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            <Link href="/platform">
                                {locale === 'ar' ? 'تعرف على المنصة' : 'Explore the Platform'}
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
