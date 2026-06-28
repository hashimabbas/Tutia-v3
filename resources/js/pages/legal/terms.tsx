import { Head } from '@inertiajs/react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { useI18n } from '@/lib/i18n';

const sections = [
    {
        key: 'services',
        en: {
            title: 'Services Description',
            body: 'TUTIA provides technology solutions including e-commerce platforms, ERP systems, web and mobile development, connectivity solutions, VPN services, bulk SMS, call center solutions, ticketing systems, payment gateway integration, and ICT consulting. All services are delivered subject to the terms outlined in this agreement.',
        },
        ar: {
            title: 'وصف الخدمات',
            body: 'تقدم توتيا حلولاً تقنية تشمل منصات التجارة الإلكترونية، أنظمة تخطيط الموارد، تطوير المواقع والتطبيقات، حلول الاتصال، خدمات الشبكات الخاصة، الرسائل الجماعية، حلول مراكز الاتصال، أنظمة الحجوزات، بوابات الدفع، والاستشارات التقنية. يتم تقديم جميع الخدمات وفقاً للشروط الموضحة في هذه الاتفاقية.',
        },
    },
    {
        key: 'obligations',
        en: {
            title: 'User Obligations',
            body: 'Users agree to provide accurate and complete information when using our services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must not use our services for any unlawful purpose or in violation of any applicable laws.',
        },
        ar: {
            title: 'التزامات المستخدم',
            body: 'يوافق المستخدم على تقديم معلومات دقيقة وكاملة عند استخدام خدماتنا. أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك وعن جميع الأنشطة التي تحدث تحت حسابك. يجب ألا تستخدم خدماتنا لأي غرض غير قانوني أو بالمخالفة لأي قوانين سارية.',
        },
    },
    {
        key: 'intellectual',
        en: {
            title: 'Intellectual Property',
            body: 'All content, trademarks, and intellectual property on our website and delivered through our services are owned by or licensed to TUTIA. You may not reproduce, distribute, or create derivative works without our prior written consent.',
        },
        ar: {
            title: 'الملكية الفكرية',
            body: 'جميع المحتويات والعلامات التجارية والملكية الفكرية على موقعنا والتي يتم تقديمها من خلال خدماتنا مملوكة أو مرخصة لتوتيا. لا يجوز لك إعادة إنتاج أو توزيع أو إنشاء أعمال مشتقة دون موافقتنا الكتابية المسبقة.',
        },
    },
    {
        key: 'liability',
        en: {
            title: 'Limitation of Liability',
            body: 'TUTIA shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our services. Our total liability for any claim arising from these terms shall not exceed the amount paid by you for the specific service giving rise to the claim.',
        },
        ar: {
            title: 'حدود المسؤولية',
            body: 'لا تتحمل توتيا المسؤولية عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية تنشأ عن أو تتعلق باستخدام خدماتنا. لا تتجاوز مسؤوليتنا الإجمالية عن أي مطالبة ناشئة عن هذه الشروط المبلغ المدفوع من قبلك مقابل الخدمة المحددة المسببة للمطالبة.',
        },
    },
    {
        key: 'governing',
        en: {
            title: 'Governing Law',
            body: 'These terms shall be governed by and construed in accordance with the laws of the Republic of Sudan. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Khartoum, Sudan.',
        },
        ar: {
            title: 'القانون الحاكم',
            body: 'تخضع هذه الشروط وتفسر وفقاً لقوانين جمهورية السودان. تخضع أي نزاعات تنشأ بموجب هذه الشروط للاختصاص القضائي الحصري لمحاكم الخرطوم، السودان.',
        },
    },
    {
        key: 'contact',
        en: {
            title: 'Contact Information',
            body: 'For questions about these terms, please contact us at info@tutiasd.com or visit our office in Khartoum, Sudan.',
        },
        ar: {
            title: 'معلومات الاتصال',
            body: 'للاستفسار عن هذه الشروط، يرجى الاتصال بنا على info@tutiasd.com أو زيارة مكتبنا في الخرطوم، السودان.',
        },
    },
];

export default function Terms() {
    const { locale } = useI18n();

    return (
        <>
            <Head title={locale === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}>
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'شروط خدمة توتيا'
                            : 'TUTIA Terms of Service'
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
                        <Heading level="h1" className="text-white">
                            {locale === 'ar'
                                ? 'شروط الخدمة'
                                : 'Terms of Service'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'شروط استخدام خدمات توتيا'
                                : 'Terms governing the use of TUTIA services'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <div className="space-y-10">
                        {sections.map((section) => (
                            <div key={section.key}>
                                <Heading
                                    level="h3"
                                    className="text-brand-navy-900"
                                >
                                    {locale === 'ar'
                                        ? section.ar.title
                                        : section.en.title}
                                </Heading>
                                <Text
                                    variant="body"
                                    className="mt-3 leading-relaxed text-neutral-600"
                                >
                                    {locale === 'ar'
                                        ? section.ar.body
                                        : section.en.body}
                                </Text>
                            </div>
                        ))}
                    </div>
                </Container>
            </Section>
        </>
    );
}
