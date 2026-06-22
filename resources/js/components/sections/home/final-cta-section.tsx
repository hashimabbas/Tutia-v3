import { Link } from '@inertiajs/react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { COMPANY_INFO } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';


export function FinalCtaSection() {
    const { t, locale } = useI18n();

    return (
        <Section background="navy" className="relative">
            <div className="absolute top-0 left-1/2 h-1 w-24 -translate-x-1/2 bg-brand-gold-500" />

            <Container className="flex flex-col items-center text-center">
                <Heading level="h2" className="mb-8 text-white">
                    {t('home.finalCta.title')}
                </Heading>

                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link href="/contact/consultation">
                        <Button
                            size="lg"
                            className="bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                        >
                            {t('home.finalCta.consultation') || 'Book a Free Consultation'}
                        </Button>
                    </Link>
                    <Link href="/contact/proposal">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            {t('home.finalCta.proposal') || 'Request a Proposal'}
                        </Button>
                    </Link>
                </div>

                <Text variant="caption" muted className="mt-10">
                    {locale === 'ar' ? COMPANY_INFO.taglineAr : COMPANY_INFO.tagline}
                </Text>
            </Container>
        </Section>
    );
}
