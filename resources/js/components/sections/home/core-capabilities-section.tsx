import { Link } from '@inertiajs/react';
import type {LucideIcon} from 'lucide-react';
import { ChevronRight  } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { CAPABILITIES } from '@/lib/home-content';
import { useI18n } from '@/lib/i18n';


export function CoreCapabilitiesSection() {
    const { t, locale } = useI18n();

    return (
        <Section background="white">
            <Container>
                <div className="mx-auto max-w-3xl text-center">
                    <Heading level="h2">{t('home.capabilities.title')}</Heading>
                    <Text variant="body-lg" className="mt-4 text-neutral-600">
                        {t('home.capabilities.subtitle')}
                    </Text>
                </div>
                <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {CAPABILITIES.map((item) => {
                        const Icon = LucideIcons[item.icon as keyof typeof LucideIcons] as LucideIcon | undefined;

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="rounded-xl border border-neutral-200 p-6 transition-all hover:border-brand-navy-200 hover:shadow-md"
                            >
                                {Icon && <Icon className="mb-4 size-10 text-brand-navy-500" />}
                                <h3 className="text-lg font-semibold text-neutral-900">
                                    {locale === 'ar' ? item.titleAr : item.title}
                                </h3>
                                <Text variant="body-sm" className="mt-2 text-neutral-600">
                                    {locale === 'ar' ? item.descriptionAr : item.description}
                                </Text>
                                <span className="mt-4 inline-flex items-center text-sm font-medium text-brand-navy-500">
                                    {t('services.cta.learnMore')}
                                    <ChevronRight className="ml-1 size-4 rtl:rotate-180" />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </Container>
        </Section>
    );
}
