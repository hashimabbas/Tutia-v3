import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Shield,
    HeartHandshake,
    Scale,
    TrendingUp,
} from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

const CORE_VALUES = [
    {
        id: 'trust',
        icon: Shield,
    },
    {
        id: 'commitment',
        icon: HeartHandshake,
    },
    {
        id: 'integrity',
        icon: Scale,
    },
    {
        id: 'results',
        icon: TrendingUp,
    },
];

export default function Values() {
    const { t, locale } = useI18n();

    return (
        <>
            <Head
                title={
                    locale === 'ar' ? 'قيمنا - توتيا' : 'Core Values - TUTIA'
                }
            >
                <meta
                    name="description"
                    content={
                        locale === 'ar'
                            ? 'القيم الأساسية لشركة توتيا'
                            : 'Core values of TUTIA'
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
                            {locale === 'ar' ? 'قيمنا' : 'Core Values'}
                        </Heading>
                        <Text
                            variant="body-lg"
                            className="mt-4 text-neutral-300"
                        >
                            {locale === 'ar'
                                ? 'المبادئ التي توجه كل قرار نتخذه'
                                : 'The principles that guide every decision we make'}
                        </Text>
                    </div>
                </Container>
            </Section>

            <Section>
                <Container>
                    <div className="mx-auto max-w-4xl space-y-16">
                        {CORE_VALUES.map((value, index) => {
                            const Icon = value.icon;
                            const isEven = index % 2 === 0;

                            return (
                                <div
                                    key={value.id}
                                    className={`flex flex-col items-center gap-8 md:flex-row ${
                                        !isEven ? 'md:flex-row-reverse' : ''
                                    }`}
                                >
                                    <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-brand-gold-500/10 md:size-32">
                                        <Icon className="size-10 text-brand-gold-500 md:size-14" />
                                    </div>
                                    <div
                                        className={`text-center ${isEven ? 'md:text-left' : 'md:text-right'}`}
                                    >
                                        <Heading level="h2">
                                            {t(`values.${value.id}`)}
                                        </Heading>
                                        <Text
                                            variant="body-lg"
                                            className="mt-4 text-neutral-600"
                                        >
                                            {t(`values.${value.id}Desc`)}
                                        </Text>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            <Section background="muted">
                <Container className="mx-auto max-w-3xl text-center">
                    <Heading level="h2">
                        {locale === 'ar' ? 'ثقافة توتيا' : 'TUTIA Culture'}
                    </Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {locale === 'ar'
                            ? 'تعرف على ثقافتنا وكيف نعمل لتحقيق رؤيتنا'
                            : 'Learn about our culture and how we work to achieve our vision'}
                    </Text>
                    <div className="mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            <Link href="/about/culture">
                                {locale === 'ar'
                                    ? 'استكشف ثقافتنا'
                                    : 'Explore Our Culture'}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </Section>
        </>
    );
}
