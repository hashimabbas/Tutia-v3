import { Head, Link } from '@inertiajs/react';
import { Shield, ArrowLeft, ArrowRight, Lock, Server, Globe, Wifi } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function Vpn() {
    const { locale } = useI18n();

    const benefits = locale === 'ar'
        ? [
            { icon: Lock, title: 'الوصول إلى موارد الشركة عن بُعد', desc: 'الوصول الآمن إلى قواعد بيانات الشركة والأدوات الإلكترونية وحسابات العمل من أي مكان' },
            { icon: Wifi, title: 'العمل بأمان على أي شبكة Wi-Fi', desc: 'حماية بياناتك من التهديدات الإلكترونية عند الاتصال من المطار أو الفندق أو الأماكن العامة' },
            { icon: Server, title: 'خوادم شركة مخصصة', desc: 'خوادم VPN مخصصة للشركة بأداء عالٍ وسرعة فائقة وعناوين IP ثابتة' },
            { icon: Globe, title: 'IP ثابت وآمن', desc: 'نفس عنوان IP في كل اتصال لضمان وصول آمن للموارد الداخلية والخدمات الحساسة' },
          ]
        : [
            { icon: Lock, title: 'Remote Access to Resources', desc: 'Secure access to company databases, online tools, and work accounts from anywhere' },
            { icon: Wifi, title: 'Work Safely on Any Wi-Fi', desc: 'Protect your data from cyber threats when connecting from airports, hotels, or public spaces' },
            { icon: Server, title: 'Dedicated Company Servers', desc: 'High-performance business VPN servers dedicated exclusively to your company with static IPs' },
            { icon: Globe, title: 'Static Secure IP', desc: 'Same IP address every time you connect, ensuring secure access to internal resources' },
          ];

    return (
        <>
            <Head title={locale === 'ar' ? 'VPN توتيا' : 'TUTIA VPN'}>
                <meta name="description" content="Business VPN solutions — secure remote access, data protection, dedicated servers, and static IPs" />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0">
                    <img src="/images/services/vpn_safety.jpg" alt="" className="size-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-900/95 via-brand-navy-900/90 to-brand-navy-900/85" />
                </div>
                <Container className="relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <Shield className="mx-auto mb-6 size-12 text-brand-gold-400" />
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'VPN توتيا' : 'TUTIA VPN'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'شبكات خاصة آمنة للشركات — وصول عن بُعد، حماية، وخوادم مخصصة'
                                : 'Secure business VPNs — remote access, data protection, and dedicated servers'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="mx-auto max-w-3xl">
                        <Heading level="h2">
                            {locale === 'ar' ? 'لماذا VPN توتيا؟' : 'Why TUTIA VPN?'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-600">
                            {locale === 'ar'
                                ? 'استخدام VPN توتيا ضروري لأي شركة حديثة لديها قوة عاملة مرنة ومتنقلة. يساعد VPN توتيا في حماية بيانات أعمالك من خلال الحفاظ على شبكة شركة آمنة واتصال إنترنت آمن، مما يسمح لك بضمان مستويات عالية من الخصوصية والأمان.'
                                : 'Using TUTIA VPN is essential for any modern business with a flexible and mobile workforce. TUTIA VPN helps protect your business data by maintaining a secure company network and internet connection, ensuring high levels of privacy and security.'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <Heading level="h2" className="text-center">
                        {locale === 'ar' ? 'المزايا الرئيسية' : 'Key Benefits'}
                    </Heading>
                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                        {benefits.map((benefit, i) => {
                            const Icon = benefit.icon;

                            return (
                                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-navy-200 hover:shadow-md">
                                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-navy-50">
                                        <Icon className="size-6 text-brand-navy-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900">{benefit.title}</h3>
                                    <Text variant="body-sm" className="mt-2 text-neutral-600">{benefit.desc}</Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section background="navy">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2" className="text-white">
                        {locale === 'ar' ? 'أمّن شبكة أعمالك اليوم' : 'Secure Your Business Network Today'}
                    </Heading>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/consultation">
                                {locale === 'ar' ? 'أمّن أعمالي' : 'Secure My Business'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            <Link href="/contact/consultation">
                                {locale === 'ar' ? 'تحدث مع خبير' : 'Talk to an Expert'}
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
