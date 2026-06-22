import { Link } from '@inertiajs/react';
import { ArrowRight, Smartphone, Store } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { COMPANY_INFO } from '@/lib/constants';
import { MATGER_STATS } from '@/lib/home-content';
import { useI18n } from '@/lib/i18n';

export function MatgerShowcaseSection() {
    const { t, locale } = useI18n();

    return (
        <Section background="white">
            <Container>
                <div className="grid items-center gap-12 md:grid-cols-2">
                    <div className="flex items-center justify-center rounded-xl bg-neutral-100 p-12">
                        <div className="text-center">
                            <Smartphone className="mx-auto size-16 text-neutral-400" />
                            <Text variant="body-sm" muted className="mt-4">
                                {locale === 'ar' ? 'لقطة شاشة التطبيق' : 'App Screenshot'}
                            </Text>
                        </div>
                    </div>
                    <div>
                        <Heading level="h2">{t('home.matger.title')}</Heading>
                        <Text variant="body-lg" className="mt-4 text-neutral-600">
                            {t('platform.subtitle')}
                        </Text>
                        <div className="mt-8 grid grid-cols-3 gap-6">
                            {MATGER_STATS.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <span className="block text-2xl font-bold text-brand-navy-500">
                                        {stat.value}
                                    </span>
                                    <Text variant="caption" className="mt-1">
                                        {locale === 'ar' ? stat.labelAr : stat.label}
                                    </Text>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Button asChild size="lg" className="bg-brand-gold-500 text-white hover:bg-brand-gold-600">
                                <Link href="/platform">
                                    {t('cta.explorePlatform')}
                                    <ArrowRight className="ml-2 size-4 rtl:rotate-180" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="/platform/register">
                                    <Store className="mr-2 size-4 rtl:rotate-180" />
                                    {t('platform.sellerRegistration')}
                                </Link>
                            </Button>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a
                                href={`https://play.google.com/store/apps/details?id=${COMPANY_INFO.name.toLowerCase()}.matger`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src="/images/andriod_botton.png"
                                    alt="Google Play"
                                    className="h-12 w-auto"
                                />
                            </a>
                            <a
                                href={`https://apps.apple.com/app/${COMPANY_INFO.name.toLowerCase()}-matger`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src="/images/ios_botton.png"
                                    alt="App Store"
                                    className="h-12 w-auto"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
