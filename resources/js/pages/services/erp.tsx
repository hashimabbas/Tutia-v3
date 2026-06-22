import { Head, Link } from '@inertiajs/react';
import { Building2, ArrowLeft, ArrowRight, BookOpen, TrendingUp, Package, Banknote, BarChart3, Users, Megaphone, Headphones, Printer  } from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

function ModuleSection({ title, items }: { title: string; items: { icon: LucideIcon; title: string; desc: string }[] }) {
    return (
        <div>
            <h3 className="mb-6 text-xl font-semibold text-neutral-900">{title}</h3>
            <div className="grid gap-4 md:grid-cols-2">
                {items.map((mod, i) => {
                    const Icon = mod.icon;

                    return (
                        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-brand-navy-200 hover:shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex shrink-0 size-10 items-center justify-center rounded-full bg-brand-gold-50">
                                    <Icon className="size-5 text-brand-gold-500" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-neutral-900">{mod.title}</h4>
                                    <Text variant="body-sm" className="mt-1 text-neutral-600">{mod.desc}</Text>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function Erp() {
    const { locale } = useI18n();

    const modules = locale === 'ar'
        ? {
            financial: [
                { icon: BookOpen, title: 'المحاسبة', desc: 'أتمتة معالجة القيود المحاسبية والحسابات المدينة والدائنة' },
                { icon: TrendingUp, title: 'الرقابة المالية', desc: 'إدارة التدفق النقدي وتتبع الأصول الثابتة ومراقبة الميزانيات' },
                { icon: Package, title: 'إدارة الأصول الثابتة', desc: 'إدارة الأصول الثابتة بوظيفة افتراضية تلغي الحاجة لإدخال البيانات يدوياً' },
                { icon: Banknote, title: 'البنوك والتسوية', desc: 'معالجة التسويات والكشوفات المصرفية والمدفوعات بطرق متعددة' },
                { icon: BarChart3, title: 'التقارير المالية', desc: 'إنشاء تقارير مخصصة من بيانات فورية لتحسين التخطيط والمراجعة' },
            ],
            commercial: [
                { icon: Users, title: 'إدارة فرص البيع', desc: 'تتبع فرص البيع وأنشطة العملاء المحتملين من أول اتصال إلى إغلاق الصفقة' },
                { icon: Megaphone, title: 'إدارة الحملات التسويقية', desc: 'إنشاء وإدارة وتحليل الأنشطة التسويقية لتحويل العملاء المحتملين' },
                { icon: Headphones, title: 'إدارة العملاء', desc: 'تخزين بيانات العملاء في مكان واحد مع المزامنة مع Microsoft Outlook' },
                { icon: Printer, title: 'إدارة الخدمة', desc: 'إدارة عقود الضمان واتفاقيات الخدمة والاستجابة السريعة لطلبات الخدمة' },
                { icon: BarChart3, title: 'التقارير والتحليلات', desc: 'تصميم تقارير مفصلة عن جميع جوانب عملية البيع باستخدام القوالب' },
            ],
          }
        : {
            financial: [
                { icon: BookOpen, title: 'Accounting', desc: 'Automate journal entries, accounts receivable, and accounts payable' },
                { icon: TrendingUp, title: 'Controlling', desc: 'Manage cash flow, track fixed assets, control budgets, and monitor project costs' },
                { icon: Package, title: 'Fixed Asset Management', desc: 'Simplify fixed asset management with virtual function, eliminating manual data entry' },
                { icon: Banknote, title: 'Banking & Reconciliation', desc: 'Process reconciliations, bank statements, and payments via checks, cash, and transfers' },
                { icon: BarChart3, title: 'Financial Reporting', desc: 'Create standard or customized reports from real-time data for planning and audits' },
            ],
            commercial: [
                { icon: Users, title: 'Sales & Opportunity Mgmt', desc: 'Track all sales opportunities and lead activities from first contact to deal closing' },
                { icon: Megaphone, title: 'Marketing Campaign Mgmt', desc: 'Create, manage, and analyze marketing activities to turn prospects into customers' },
                { icon: Headphones, title: 'Customer Management', desc: 'Store all critical customer data in one place with Microsoft Outlook sync' },
                { icon: Printer, title: 'Service Management', desc: 'Manage warranty contracts and service agreements efficiently with quick response' },
                { icon: BarChart3, title: 'Reporting & Analysis', desc: 'Design detailed reports on all sales process aspects using templates' },
            ],
          };

    return (
        <>
            <Head title={locale === 'ar' ? 'نظام ERP' : 'ERP Systems'}>
                <meta name="description" content="Enterprise resource planning systems covering financials, purchasing, inventory, sales, CRM, project management, operations, and HR" />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0">
                    <img src="/images/services/erp.jpg" alt="" className="size-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-900/95 via-brand-navy-900/90 to-brand-navy-900/85" />
                </div>
                <Container className="relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <Building2 className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'نظام ERP' : 'ERP Systems'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'تحكم أكبر في أعمالك مع برنامج ينمو معك — وحدّث العمليات الرئيسية'
                                : 'Increase control over your business with software designed to grow with you'}
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
                                ? 'زد سيطرتك على أعمالك مع برنامج ERP مصمم لينمو معك. قم بتبسيط العمليات الرئيسية، واحصل على رؤى أعمق لأعمالك، واتخذ قرارات بناءً على معلومات فورية لتحقيق نمو مربح. قم بتشغيل وصيانة برنامج ERP الخاص بك بتكلفة معقولة. اخفض تكلفة إدارة أعمالك بدءاً من المالية والمشتريات والمخزون والمبيعات وعلاقات العملاء وصولاً إلى إدارة المشاريع والعمليات والموارد البشرية.'
                                : 'Increase control over your business with software designed to grow with you. Streamline key processes, gain greater insight into your business, and make decisions based on real-time information to drive profitable growth. Run and maintain your ERP software affordably. Lower the cost of managing your business from financials, purchasing, inventory, sales, and customer relationships to project management, operations, and HR.'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar' ? 'الوحدات المالية' : 'Financial Modules'}
                    </Heading>
                    <div className="mt-10">
                        <ModuleSection title={locale === 'ar' ? 'المحاسبة والمالية' : 'Accounting & Finance'} items={modules.financial} />
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar' ? 'وحدات المبيعات والتسويق' : 'Sales & Marketing Modules'}
                    </Heading>
                    <div className="mt-10">
                        <ModuleSection title={locale === 'ar' ? 'المبيعات وخدمة العملاء' : 'Sales & Customer Service'} items={modules.commercial} />
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'استعد لتحويل أعمالك' : 'Ready to Transform Your Business?'}
                    </Heading>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/quote">
                                {locale === 'ar' ? 'اطلب عرض سعر' : 'Get a Quote'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            <Link href="/contact/consultation">
                                {locale === 'ar' ? 'احجز عرضاً تجريبياً' : 'Schedule a Demo'}
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
