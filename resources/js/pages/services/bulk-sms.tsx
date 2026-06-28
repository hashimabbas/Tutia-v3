import { Head, Link } from '@inertiajs/react';
import {
    MessageSquareText,
    ArrowLeft,
    ArrowRight,
    Shield,
    Zap,
    Users,
    Heart,
    Globe,
} from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function BulkSms() {
    const { locale } = useI18n();

    const services =
        locale === 'ar'
            ? [
                  {
                      icon: Shield,
                      title: 'OTP SMS',
                      desc: 'رسائل التحقق والإجراءات الأمنية للحماية من الاحتيال',
                  },
                  {
                      icon: Zap,
                      title: 'SMS المعاملات',
                      desc: 'رسائل معاملات فورية وآمنة لإشعارات العملاء',
                  },
                  {
                      icon: Users,
                      title: 'SMS الترويجي',
                      desc: 'حملات تسويقية واسعة النطاق عبر الرسائل النصية',
                  },
              ]
            : [
                  {
                      icon: Shield,
                      title: 'OTP SMS',
                      desc: 'Verification codes and security messages for fraud protection',
                  },
                  {
                      icon: Zap,
                      title: 'Transactional SMS',
                      desc: 'Instant and secure transaction messages for customer notifications',
                  },
                  {
                      icon: Users,
                      title: 'Promotional SMS',
                      desc: 'Large-scale marketing campaigns via text messaging',
                  },
              ];

    return (
        <>
            <Head title={locale === 'ar' ? 'الرسائل الجماعية' : 'Bulk SMS'}>
                <meta
                    name="description"
                    content="TUTIA SMS marketing services including OTP, transactional, and promotional bulk SMS messaging solutions"
                />
            </Head>

            <Section
                background="navy"
                className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
            >
                <div className="absolute inset-0">
                    <img
                        src="/images/services/sms-bluk-service.jpg"
                        alt=""
                        className="size-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-900/95 via-brand-navy-900/90 to-brand-navy-900/85" />
                </div>
                <Container className="relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <MessageSquareText className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar'
                                ? 'الرسائل الجماعية SMS'
                                : 'Bulk SMS'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'حلول مراسلة SMS موثوقة — OTP، معاملات، ترويج'
                                : 'Reliable SMS messaging solutions — OTP, transactional, promotional'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="mx-auto max-w-3xl">
                        <Heading level="h2">
                            {locale === 'ar'
                                ? 'خدمات SMS من توتيا'
                                : 'TUTIA SMS Services'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-600"
                        >
                            {locale === 'ar'
                                ? 'في سوق اليوم التنافسي، وسعت توتيا خدماتها لتقدم حلول مراسلة SMS فعّالة وآمنة. نحن اللاعب الأكثر ثقة في سوق حلول المراسلة، نقدم مجموعة واسعة من الخدمات مثل OTP، SMS المعاملات، وSMS الترويجي.'
                                : "In today's competitive market, TUTIA has expanded its SMS service offerings to deliver efficient and secure messaging solutions. We are the most trusted player in the messaging solutions market, offering a wide range of services including OTP, Transactional SMS, and Promotional SMS."}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar' ? 'حلولنا' : 'Our Solutions'}
                    </Heading>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {services.map((svc, i) => {
                            const Icon = svc.icon;

                            return (
                                <div
                                    key={i}
                                    className="rounded-xl border border-neutral-200 bg-white p-6 text-center transition-all hover:border-brand-navy-200 hover:shadow-md"
                                >
                                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Icon className="size-7 text-brand-navy-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900">
                                        {svc.title}
                                    </h3>
                                    <Text
                                        variant="body-sm"
                                        className="mt-2 text-neutral-600"
                                    >
                                        {svc.desc}
                                    </Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {locale === 'ar'
                            ? 'لماذا توتيا SMS؟'
                            : 'Why TUTIA SMS?'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'أرسل رسائلك عبر أي من حلول توتيا للمراسلة. يمكنك إرسال رسائل SMS قصيرة ومهمة عالمياً أو محلياً بسرعة. أرسل رسائل المعاملات مثل كلمات المرور لمرة واحدة وتنبيهات SMS، أو رسائل ترويجية من نظام CRM أو مكتب المبيعات.'
                            : 'Get your messages across with any of our TUTIA SMS solutions. Send short and important SMS messages worldwide or locally with speed. Send transactional messages like one-time passcodes and alerts, or promotional messages from your CRM or sales desk.'}
                    </Text>
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand-gold-200 bg-brand-gold-50 p-5">
                        <Heart className="mt-0.5 size-5 shrink-0 text-brand-gold-500" />
                        <div>
                            <p className="font-semibold text-neutral-900">
                                {locale === 'ar'
                                    ? 'أسعار خاصة للمنظمات غير الربحية والمدارس'
                                    : 'Special Pricing'}
                            </p>
                            <Text
                                variant="body-sm"
                                className="mt-1 text-neutral-600"
                            >
                                {locale === 'ar'
                                    ? 'نقدم أسعاراً خاصة للمنظمات غير الربحية والمدارس والمؤسسات التعليمية.'
                                    : 'We offer unique pricing for non-profit organizations, schools, and educational institutions.'}
                            </Text>
                        </div>
                    </div>
                </Container>
            </Section>

            <Section className="py-8">
                <Container className="mx-auto max-w-3xl text-center">
                    <a
                        href="https://sms.tutaisd.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-brand-gold-500 underline underline-offset-4 hover:text-brand-gold-600"
                    >
                        <Globe className="size-4" />
                        sms.tutaisd.com
                    </a>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar'
                            ? 'أطلق حملاتك الآن'
                            : 'Launch Your Campaigns'}
                    </Heading>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/contact/consultation">
                                {locale === 'ar'
                                    ? 'أرسل حملاتك'
                                    : 'Send Campaigns'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            <Link href="/contact/quote">
                                {locale === 'ar'
                                    ? 'اطلب عرض سعر'
                                    : 'Get a Quote'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <Button
                        asChild
                        variant="link"
                        className="text-brand-navy-500"
                    >
                        <Link href="/services">
                            <ArrowLeft className="mr-2 size-4 rtl:rotate-180" />
                            {locale === 'ar'
                                ? 'العودة إلى الخدمات'
                                : 'Back to Services'}
                        </Link>
                    </Button>
                </Container>
            </Section>
        </>
    );
}
