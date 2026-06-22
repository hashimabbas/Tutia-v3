import { Head } from '@inertiajs/react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { useI18n } from '@/lib/i18n';

const sections = [
    {
        key: 'what',
        en: { title: 'What Are Cookies', body: 'Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, enhance user experience, and provide information to website owners about how their site is being used.' },
        ar: { title: 'ما هي ملفات تعريف الارتباط', body: 'ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم وضعها على جهازك عند زيارة موقع إلكتروني. تُستخدم على نطاق واسع لجعل المواقع تعمل بكفاءة أكبر، وتعزيز تجربة المستخدم، وتوفير معلومات لأصحاب المواقع حول كيفية استخدام موقعهم.' },
    },
    {
        key: 'how',
        en: { title: 'How We Use Cookies', body: 'We use cookies to improve your browsing experience, analyze site traffic, personalize content, and deliver targeted advertisements. Some cookies are essential for the basic functionality of our website, while others help us understand how you interact with our site so we can improve it.' },
        ar: { title: 'كيف نستخدم ملفات تعريف الارتباط', body: 'نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح الخاصة بك، وتحليل حركة المرور على الموقع، وتخصيص المحتوى، وتقديم إعلانات مستهدفة. بعض ملفات تعريف الارتباط ضرورية للوظائف الأساسية لموقعنا، بينما يساعدنا البعض الآخر في فهم كيفية تفاعلك مع موقعنا لتحسينه.' },
    },
    {
        key: 'types',
        en: { title: 'Types of Cookies We Use', body: 'We use the following types of cookies: Essential cookies required for website functionality, Analytics cookies to understand usage patterns, Functional cookies to remember your preferences, and Advertising cookies to deliver relevant marketing content. Third-party services we use may also set their own cookies.' },
        ar: { title: 'أنواع ملفات تعريف الارتباط التي نستخدمها', body: 'نستخدم الأنواع التالية من ملفات تعريف الارتباط: ملفات أساسية ضرورية لوظائف الموقع، وملفات تحليلات لفهم أنماط الاستخدام، وملفات وظيفية لتذكر تفضيلاتك، وملفات إعلانية لتقديم محتوى تسويقي ذي صلة. قد تقوم خدمات الطرف الثالث التي نستخدمها أيضاً بتعيين ملفات تعريف الارتباط الخاصة بها.' },
    },
    {
        key: 'managing',
        en: { title: 'Managing Cookies', body: 'You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies, but please note that disabling certain cookies may affect the functionality of our website. You can also opt out of third-party cookies through the respective service providers.' },
        ar: { title: 'إدارة ملفات تعريف الارتباط', body: 'يمكنك التحكم في ملفات تعريف الارتباط وإدارتها من خلال إعدادات المتصفح الخاص بك. تتيح معظم المتصفحات حذف أو منع ملفات تعريف الارتباط، لكن يُرجى ملاحظة أن تعطيل بعض ملفات تعريف الارتباط قد يؤثر على وظائف موقعنا. يمكنك أيضاً إلغاء الاشتراك في ملفات تعريف الارتباط الخاصة بالطرف الثالث من خلال مزودي الخدمة المعنيين.' },
    },
    {
        key: 'contact',
        en: { title: 'Contact Us', body: 'If you have any questions about our use of cookies, please contact us at info@tutiasd.com.' },
        ar: { title: 'اتصل بنا', body: 'إذا كانت لديك أي أسئلة حول استخدامنا لملفات تعريف الارتباط، يرجى الاتصال بنا على info@tutiasd.com.' },
    },
];

export default function Cookies() {
    const { locale } = useI18n();

    return (
        <>
            <Head title={locale === 'ar' ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}>
                <meta name="description" content={locale === 'ar' ? 'سياسة ملفات تعريف الارتباط لتوتيا' : 'TUTIA Cookie Policy'} />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'كيف نستخدم ملفات تعريف الارتباط على موقعنا'
                                : 'How we use cookies on our website'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <div className="space-y-10">
                        {sections.map((section) => (
                            <div key={section.key}>
                                <Heading level="h3" className="text-brand-navy-900">
                                    {locale === 'ar' ? section.ar.title : section.en.title}
                                </Heading>
                                <Text variant="body" className="mt-3 text-neutral-600 leading-relaxed">
                                    {locale === 'ar' ? section.ar.body : section.en.body}
                                </Text>
                            </div>
                        ))}
                    </div>
                </Container>
            </Section>
        </>
    );
}
