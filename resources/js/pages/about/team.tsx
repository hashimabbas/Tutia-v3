import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Handshake, Lightbulb, Award, Users } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

const TEAM_VALUES = [
    {
        icon: Handshake,
        title: 'Collaboration',
        titleAr: 'التعاون',
        description: 'We work together across teams and disciplines to deliver the best outcomes for our clients.',
        descriptionAr: 'نعمل معاً عبر الفرق والتخصصات لتحقيق أفضل النتائج لعملائنا.',
    },
    {
        icon: Lightbulb,
        title: 'Innovation',
        titleAr: 'الابتكار',
        description: 'We embrace creative thinking and continuous learning to stay ahead of the technology curve.',
        descriptionAr: 'نتبنى التفكير الإبداعي والتعلم المستمر لنبقى في صدارة المنحنى التقني.',
    },
    {
        icon: Award,
        title: 'Excellence',
        titleAr: 'التميز',
        description: 'We hold ourselves to the highest standards, delivering quality in everything we do.',
        descriptionAr: 'نلتزم بأعلى المعايير، ونقدم الجودة في كل ما نقوم به.',
    },
    {
        icon: Users,
        title: 'Diversity',
        titleAr: 'التنوع',
        description: 'We celebrate diverse perspectives and backgrounds, knowing they make our team stronger.',
        descriptionAr: 'نحتفي بوجهات النظر والخلفيات المتنوعة، مدركين أنها تجعل فريقنا أقوى.',
    },
];

export default function Team() {
    const { locale } = useI18n();

    return (
        <>
            <Head title={locale === 'ar' ? 'فريقنا - توتيا' : 'Our Team - TUTIA'}>
                <meta
                    name="description"
                    content={locale === 'ar' ? 'تعرف على فريق توتيا وقيمنا' : 'Meet the TUTIA team and our values'}
                />
            </Head>

            <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h1" className="text-white">
                            {locale === 'ar' ? 'فريقنا' : 'Our Team'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-300">
                            {locale === 'ar'
                                ? 'ناس توتيا - الشغف والخبرة يلتقيان'
                                : 'The people of TUTIA — where passion meets expertise'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl">
                    <Heading level="h2">
                        {locale === 'ar' ? 'تعرف على فريقنا' : 'Meet Our Team'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'في توتيا، فريقنا هو قلب كل ما نقوم به. نحن مجموعة من المهنيين الشغوفين الذين يجمعهم الالتزام بالتميز والرغبة المشتركة في إحداث تأثير حقيقي في المشهد التقني في السودان. كل عضو في فريقنا يجلب خبرات ووجهات نظر فريدة، مما يخلق بيئة ديناميكية حيث يزدهر الابتكار وتتحقق الأفكار.'
                            : 'At TUTIA, our team is the heart of everything we do. We\'re a group of passionate professionals united by a commitment to excellence and a shared desire to make a real impact in Sudan\'s technology landscape. Every member of our team brings unique expertise and perspective, creating a dynamic environment where innovation thrives and ideas become reality.'}
                    </Text>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'نؤمن بأن أفضل الحلول تأتي من فرق متنوعة تعمل معاً نحو هدف مشترك. سواء كنا نطور منصة تجارة إلكترونية، أو نبني نظام مؤسسي، أو نقدم استشارات تقنية، فإن نهجنا التعاوني يضمن أن كل مشروع يستفيد من كامل خبرتنا الجماعية.'
                            : 'We believe the best solutions come from diverse teams working together toward a common goal. Whether we\'re building an e-commerce platform, developing an enterprise system, or providing technology consulting, our collaborative approach ensures every project benefits from our full collective expertise.'}
                    </Text>
                </Container>
            </Section>

            <Section background="muted">
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <Heading level="h2">
                            {locale === 'ar' ? 'قيم فريقنا' : 'Our Team Values'}
                        </Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-600">
                            {locale === 'ar'
                                ? 'المبادئ التي توجهنا في كل ما نقوم به'
                                : 'The principles that guide us in everything we do'}
                        </Text>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-2">
                        {TEAM_VALUES.map((value) => {
                            const Icon = value.icon;

                            return (
                                <div
                                    key={value.title}
                                    className="rounded-xl border border-neutral-200 bg-white p-8 transition-all hover:shadow-md"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-gold-500/10">
                                            <Icon className="size-6 text-brand-gold-500" />
                                        </div>
                                        <div>
                                            <Heading level="h3">
                                                {locale === 'ar' ? value.titleAr : value.title}
                                            </Heading>
                                            <Text variant="body" className="mt-2 text-neutral-600">
                                                {locale === 'ar' ? value.descriptionAr : value.description}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section>
                <Container className="mx-auto max-w-3xl text-center">
                    <Button asChild variant="link" className="text-brand-navy-500">
                        <Link href="/about">
                            <ArrowLeft className="mr-2 size-4 rtl:rotate-180" />
                            {locale === 'ar' ? 'العودة إلى عن توتيا' : 'Back to About'}
                        </Link>
                    </Button>
                </Container>
            </Section>
        </>
    );
}
