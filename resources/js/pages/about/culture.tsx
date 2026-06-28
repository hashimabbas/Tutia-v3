import { Head, Link } from '@inertiajs/react';
import { ArrowRight, TrendingUp, Target, Users } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

const BENEFITS = [
    {
        icon: TrendingUp,
        title: 'Growth',
        titleAr: 'النمو',
        description:
            'We invest in our people with continuous learning opportunities, mentorship, and clear career progression paths.',
        descriptionAr:
            'نستثمر في فريقنا من خلال فرص التعلم المستمر والإرشاد ومسارات التطور الوظيفي الواضحة.',
    },
    {
        icon: Target,
        title: 'Impact',
        titleAr: 'التأثير',
        description:
            "Work on meaningful projects that shape Sudan's digital future and make a real difference in people's lives.",
        descriptionAr:
            'اعمل على مشاريع هادفة تشكل المستقبل الرقمي في السودان وتحدث فرقاً حقيقياً في حياة الناس.',
    },
    {
        icon: Users,
        title: 'Community',
        titleAr: 'المجتمع',
        description:
            'Join a supportive, collaborative team where every voice is heard and every contribution is valued.',
        descriptionAr:
            'انضم إلى فريق داعم ومتعاون حيث كل صوت مسموع وكل مساهمة مقدرة.',
    },
];

export default function Culture() {
    const { locale } = useI18n();

    return (
        <>
            <Head
                title={
                    locale === 'ar' ? 'ثقافتنا - توتيا' : 'Our Culture - TUTIA'
                }
            >
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'ثقافة العمل في شركة توتيا'
                            : 'Work culture at TUTIA'
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
                            {locale === 'ar' ? 'ثقافتنا' : 'Our Culture'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'كيف نعمل ونبتكر وننمو معاً'
                                : 'How we work, innovate, and grow together'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {locale === 'ar' ? 'كيف نعمل' : 'How We Work'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'في توتيا، نعتمد منهجية رشيقة (Agile) تركز على التعاون المستمر والتكيف السريع مع المتغيرات. فرقنا تعمل في بيئة ديناميكية تشجع على الإبداع والتفكير خارج الصندوق، مع الحفاظ على أعلى معايير الجودة. نؤمن بالشفافية والتواصل المفتوح، ونتخذ القرارات بناءً على البيانات والتحليلات.'
                            : 'At TUTIA, we follow an Agile methodology focused on continuous collaboration and rapid adaptation to change. Our teams work in a dynamic environment that encourages creativity and thinking outside the box, while maintaining the highest quality standards. We believe in transparency and open communication, making decisions based on data and analysis.'}
                    </Text>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'كل مشروع نبدأه هو شراكة حقيقية مع عملائنا. نعمل جنباً إلى جنب معهم لفهم احتياجاتهم وتحدياتهم، لنقدم حلولاً مخصصة تتجاوز التوقعات. التعاون الجماعي هو جوهر ثقافتنا - نتبادل المعرفة وندعم بعضنا البعض لتحقيق أفضل النتائج.'
                            : 'Every project we start is a true partnership with our clients. We work shoulder to shoulder with them to understand their needs and challenges, delivering tailored solutions that exceed expectations. Team collaboration is at the heart of our culture — we share knowledge and support each other to achieve the best results.'}
                    </Text>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h2">
                            {locale === 'ar'
                                ? 'لماذا تنضم إلى توتيا'
                                : 'Why Join TUTIA'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-600"
                        >
                            {locale === 'ar'
                                ? 'فرص تنموية في بيئة عمل ملهمة'
                                : 'Growth opportunities in an inspiring work environment'}
                        </Text>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        {BENEFITS.map((benefit) => {
                            const Icon = benefit.icon;

                            return (
                                <div
                                    key={benefit.title}
                                    className="rounded-xl border border-neutral-200 bg-white p-8 text-center transition-all hover:shadow-md"
                                >
                                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-gold-500/10">
                                        <Icon className="size-7 text-brand-gold-500" />
                                    </div>
                                    <Heading level="h3" className="mt-6">
                                        {locale === 'ar'
                                            ? benefit.titleAr
                                            : benefit.title}
                                    </Heading>
                                    <Text
                                        variant="body"
                                        className="mt-3 text-neutral-600"
                                    >
                                        {locale === 'ar'
                                            ? benefit.descriptionAr
                                            : benefit.description}
                                    </Text>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2">
                        {locale === 'ar' ? 'انضم إلى فريقنا' : 'Join Our Team'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'كن جزءاً من رحلة توتيا لتحويل المشهد التقني في السودان'
                            : "Be part of TUTIA's journey to transform Sudan's technology landscape"}
                    </Text>
                    <div className="mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/contact">
                                {locale === 'ar'
                                    ? 'انضم إلينا'
                                    : 'Join Our Team'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>
        </>
    );
}
