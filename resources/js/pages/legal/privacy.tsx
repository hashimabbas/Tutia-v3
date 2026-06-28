import { Head } from '@inertiajs/react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { useI18n } from '@/lib/i18n';

const sections = [
    {
        key: 'collect',
        en: {
            title: 'Information We Collect',
            body: 'We collect information you provide directly, such as your name, email address, phone number, and company details when you fill out forms on our website. We also automatically collect certain technical information, including IP address, browser type, device information, and usage data through cookies and similar technologies.',
        },
        ar: {
            title: 'المعلومات التي نجمعها',
            body: 'نجمع المعلومات التي تقدمها مباشرة، مثل اسمك وبريدك الإلكتروني ورقم هاتفك وبيانات شركتك عند ملء النماذج على موقعنا. كما نجمع تلقائياً بعض المعلومات التقنية، بما في ذلك عنوان IP ونوع المتصفح ومعلومات الجهاز وبيانات الاستخدام عبر ملفات تعريف الارتباط والتقنيات المشابهة.',
        },
    },
    {
        key: 'use',
        en: {
            title: 'How We Use Your Information',
            body: 'We use the information we collect to provide, maintain, and improve our services, communicate with you about your inquiries, send technical notices and support messages, and comply with legal obligations. We do not sell your personal information to third parties.',
        },
        ar: {
            title: 'كيف نستخدم معلوماتك',
            body: 'نستخدم المعلومات التي نجمعها لتقديم خدماتنا وصيانتها وتحسينها، والتواصل معك بخصوص استفساراتك، وإرسال الإشعارات الفنية ورسائل الدعم، والامتثال للالتزامات القانونية. نحن لا نبيع معلوماتك الشخصية لأطراف ثالثة.',
        },
    },
    {
        key: 'protection',
        en: {
            title: 'Data Protection',
            body: 'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption, access controls, and regular security assessments.',
        },
        ar: {
            title: 'حماية البيانات',
            body: 'ننفذ تدابير تقنية وتنظيمية مناسبة لحماية بياناتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف. ويشمل ذلك التشفير وضوابط الوصول والتقييمات الأمنية الدورية.',
        },
    },
    {
        key: 'thirdParty',
        en: {
            title: 'Third-Party Services',
            body: 'We may engage trusted third-party service providers to perform functions on our behalf, such as hosting, analytics, and payment processing. These providers are contractually bound to protect your data and use it only for the purposes we specify.',
        },
        ar: {
            title: 'خدمات الطرف الثالث',
            body: 'قد نستعين بمقدمي خدمات خارجيين موثوقين لأداء وظائف نيابة عنا، مثل الاستضافة والتحليلات ومعالجة المدفوعات. يلتزم هؤلاء المزودون تعاقدياً بحماية بياناتك واستخدامها فقط للأغراض التي نحددها.',
        },
    },
    {
        key: 'rights',
        en: {
            title: 'Your Rights',
            body: 'You have the right to access, correct, or delete your personal data held by us. You may also object to or restrict certain processing activities. To exercise these rights, please contact us using the information below.',
        },
        ar: {
            title: 'حقوقك',
            body: 'لديك الحق في الوصول إلى بياناتك الشخصية المحفوظة لدينا أو تصحيحها أو حذفها. يمكنك أيضاً الاعتراض على أو تقييد بعض أنشطة المعالجة. لممارسة هذه الحقوق، يرجى الاتصال بنا باستخدام المعلومات أدناه.',
        },
    },
    {
        key: 'contact',
        en: {
            title: 'Contact Us',
            body: 'If you have any questions about this Privacy Policy or our data practices, please contact us at info@tutiasd.com or write to us at Khartoum, Sudan.',
        },
        ar: {
            title: 'اتصل بنا',
            body: 'إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه أو ممارساتنا المتعلقة بالبيانات، يرجى الاتصال بنا على info@tutiasd.com أو الكتابة إلينا على الخرطوم، السودان.',
        },
    },
];

export default function Privacy() {
    const { locale } = useI18n();

    return (
        <>
            <Head title={locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}>
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'سياسة الخصوصية لموقع توتيا'
                            : 'TUTIA Privacy Policy'
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
                                ? 'سياسة الخصوصية'
                                : 'Privacy Policy'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'كيف نحمي معلوماتك ونستخدمها'
                                : 'How we protect and use your information'}
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
