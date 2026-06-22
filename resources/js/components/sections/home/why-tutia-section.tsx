import type {LucideIcon} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { DIFFERENTIATORS } from '@/lib/home-content';
import { useI18n } from '@/lib/i18n';


export function WhyTutiaSection() {
    const { t, locale } = useI18n();

    return (
        <Section background="white">
            <Container className="text-center">
                <Heading level="h2" className="mb-4">
                    {t('home.why.title')}
                </Heading>
                <Text variant="body-lg" muted className="mb-16 max-w-2xl mx-auto">
                    {t('home.why.subtitle')}
                </Text>
            </Container>

            <Container className="mt-10">
                <div className="grid gap-8 md:grid-cols-2">
                    {DIFFERENTIATORS.map((item) => {
                        const Icon = LucideIcons[item.icon as keyof typeof LucideIcons] as LucideIcon | undefined;

                        return (
                            <div
                                key={item.id}
                                className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm"
                            >
                                <div className="flex gap-5">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-gold-500/10">
                                        {Icon && <Icon className="size-6 text-brand-gold-500" />}
                                    </div>
                                    <div>
                                        <Heading level="h4" className="mb-2">
                                            {locale === 'ar' ? item.titleAr : item.title}
                                        </Heading>
                                        <Text variant="body-sm" muted>
                                            {locale === 'ar' ? item.descriptionAr : item.description}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Container>
        </Section>
    );
}
