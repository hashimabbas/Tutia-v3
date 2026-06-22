import type {LucideIcon} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { INDUSTRIES } from '@/lib/home-content';
import { useI18n } from '@/lib/i18n';

export function IndustriesSection() {
    const { t, locale } = useI18n();

    return (
        <Section background="muted">
            <Container>
                <div className="mx-auto max-w-3xl text-center">
                    <Heading level="h2">{t('home.industries.title')}</Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {t('home.industries.subtitle')}
                    </Text>
                </div>
                <div className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-5">
                    {INDUSTRIES.map((item) => {
                        const Icon = LucideIcons[item.icon as keyof typeof LucideIcons] as LucideIcon | undefined;

                        return (
                            <div
                                key={item.id}
                                className="flex flex-col items-center text-center rounded-xl bg-white p-6 shadow-sm border border-neutral-100 transition-all hover:shadow-md"
                            >
                                {Icon && <Icon className="mb-3 size-10 text-brand-navy-500" />}
                                <h3 className="text-base font-semibold text-neutral-900">
                                    {locale === 'ar' ? item.nameAr : item.name}
                                </h3>
                                <Text variant="body-sm" className="mt-2 text-neutral-600">
                                    {locale === 'ar' ? item.descriptionAr : item.description}
                                </Text>
                            </div>
                        );
                    })}
                </div>
            </Container>
        </Section>
    );
}
