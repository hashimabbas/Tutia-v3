import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Section, Container, GradientText, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { COMPANY_INFO } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';

export function HeroSection() {
    const { t, locale } = useI18n();

    return (
        <Section background="navy" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold-500/5 via-transparent to-transparent" />
            <Container>
                <div className="mx-auto max-w-4xl text-center">
                    <img
                        src="/logo-transparent.png"
                        alt={COMPANY_INFO.name}
                        className="mx-auto mb-6 h-16 w-auto brightness-0 invert"
                    />
                    <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
                        {t('home.hero.tutia')}
                    </h1>
                    <p className="mt-3 text-xl font-semibold tracking-wide text-brand-gold-400 md:text-2xl">
                        {locale === 'ar' ? COMPANY_INFO.taglineAr : COMPANY_INFO.tagline}
                    </p>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {locale === 'ar' ? t('home.hero.positioningAr') : t('home.hero.positioning')}
                    </Text>
                    <div className="mx-auto mt-6 h-px w-24 bg-brand-gold-500/40" />
                    <GradientText className="mt-6 block text-3xl font-bold md:text-4xl lg:text-5xl">
                        {t('home.hero.headline')}
                    </GradientText>
                    <Text variant="body-lg" className="mt-4 text-neutral-300">
                        {t('home.hero.subheadline')}
                    </Text>
                    <div className="mt-10 flex items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                            <Link href="/contact/consultation">
                                {t('home.hero.ctaPrimary')}
                                <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            <Link href="/services">
                                {t('home.hero.ctaSecondary')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
