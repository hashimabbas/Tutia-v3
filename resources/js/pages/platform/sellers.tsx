import { Head, useForm } from '@inertiajs/react';
import { Store, Users, Package, CreditCard, BarChart3, Megaphone, ArrowRight } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';

const categories = [
    'Electronics', 'Fashion', 'Home & Kitchen', 'Beauty & Health',
    'Food & Beverages', 'Books & Stationery', 'Sports & Outdoors', 'Other',
];

const categoriesAr = [
    'إلكترونيات', 'أزياء', 'منزل ومطبخ', 'جمال وصحة',
    'طعام ومشروبات', 'كتب وقرطاسية', 'رياضة وخارج المنزل', 'أخرى',
];

const benefits = [
    { icon: Users, en: 'Reach thousands of customers across Sudan', ar: 'وصل إلى آلاف العملاء في جميع أنحاء السودان', descEn: 'Access a growing customer base actively looking for products like yours', descAr: 'احصل على وصول إلى قاعدة عملاء متنامية تبحث بنشاط عن منتجاتك' },
    { icon: Package, en: 'Easy product listing and inventory management', ar: 'إدراج المنتجات وإدارة المخزون بسهولة', descEn: 'Simple tools to list your products and manage stock levels', descAr: 'أدوات بسيطة لإدراج منتجاتك وإدارة مستويات المخزون' },
    { icon: CreditCard, en: 'Secure payment processing', ar: 'معالجة آمنة للمدفوعات', descEn: 'Multiple payment options with secure transaction processing', descAr: 'خيارات دفع متعددة مع معالجة آمنة للمعاملات' },
    { icon: BarChart3, en: 'Seller dashboard with analytics', ar: 'لوحة تحكم البائع مع تحليلات', descEn: 'Real-time insights into your sales, visitors, and performance', descAr: 'رؤى فورية حول مبيعاتك وزوارك وأدائك' },
    { icon: Megaphone, en: 'Marketing and promotional support', ar: 'دعم تسويقي وترويجي', descEn: 'Featured listings, promotions, and marketing campaigns to boost sales', descAr: 'إعلانات مميزة وعروض ترويجية وحملات تسويقية لتعزيز المبيعات' },
];

export default function Sellers() {
    const { locale } = useI18n();

    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        owner_name: '',
        phone: '',
        email: '',
        product_category: '',
        location: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/platform/register');
    }

    return (
        <>
            <Head title={locale === 'ar' ? 'انضم كبائع في متجر توتيا' : 'Become a Seller on Matger-TUTIA'}>
                <meta name="description" content={locale === 'ar' ? 'سجل كبائع في متجر توتيا وابدأ بيع منتجاتك لألاف العملاء' : 'Register as a seller on Matger-TUTIA and start selling your products to thousands of customers'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Store className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'انضم كبائع في متجر توتيا' : 'Become a Seller on Matger-TUTIA'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'انضم إلى أول سوق إلكتروني متعدد البائعين في السودان ووسّع نطاق أعمالك'
                                : 'Join Sudan\'s first multi-vendor marketplace and expand your business reach'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="grid gap-12 md:grid-cols-5">
                        <div className="md:col-span-3">
                            <Heading level="h2" className="mb-8">
                                {locale === 'ar' ? 'لماذا تبيع على متجر توتيا؟' : 'Why sell on Matger-TUTIA?'}
                            </Heading>
                            <div className="space-y-6">
                                {benefits.map((b, i) => {
                                    const Icon = b.icon;

                                    return (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-gold-500/10">
                                                <Icon className="size-6 text-brand-gold-500" />
                                            </div>
                                            <div>
                                                <Text variant="body" className="font-semibold text-neutral-900">
                                                    {locale === 'ar' ? b.ar : b.en}
                                                </Text>
                                                <Text variant="body-sm" className="mt-1 text-neutral-600">
                                                    {locale === 'ar' ? b.descAr : b.descEn}
                                                </Text>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 md:p-8">
                                <Heading level="h3" className="mb-6">
                                    {locale === 'ar' ? 'سجل كبائع' : 'Register as a Seller'}
                                </Heading>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="business_name">{locale === 'ar' ? 'اسم المتجر' : 'Business Name'} *</Label>
                                        <Input
                                            id="business_name"
                                            value={data.business_name}
                                            onChange={(e) => setData('business_name', e.target.value)}
                                            placeholder={locale === 'ar' ? 'اسم متجرك' : 'Your store name'}
                                        />
                                        <InputError message={errors.business_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="owner_name">{locale === 'ar' ? 'اسم المالك' : 'Owner Name'} *</Label>
                                        <Input
                                            id="owner_name"
                                            value={data.owner_name}
                                            onChange={(e) => setData('owner_name', e.target.value)}
                                            placeholder={locale === 'ar' ? 'اسم المالك' : 'Owner full name'}
                                        />
                                        <InputError message={errors.owner_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">{locale === 'ar' ? 'رقم الهاتف' : 'Phone'} *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+249"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="you@example.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="product_category">{locale === 'ar' ? 'فئة المنتجات' : 'Product Category'} *</Label>
                                        <Select
                                            value={data.product_category}
                                            onValueChange={(v) => setData('product_category', v)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={locale === 'ar' ? 'اختر الفئة' : 'Select category'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat, i) => (
                                                    <SelectItem key={cat} value={cat.toLowerCase()}>
                                                        {locale === 'ar' ? categoriesAr[i] : cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.product_category} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">{locale === 'ar' ? 'الموقع' : 'Location'} *</Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            placeholder={locale === 'ar' ? 'المدينة، الولاية' : 'City, State'}
                                        />
                                        <InputError message={errors.location} />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        size="lg"
                                        className="w-full bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                                    >
                                        {locale === 'ar' ? 'سجل كبائع' : 'Register as Seller'}
                                        <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </Container>
            </Section>
        </>
    );
}
