import { Section, Container, Heading } from '@/components/design-system';
import { METRICS_EXTENDED } from '@/lib/home-content';
import { useI18n } from '@/lib/i18n';


export function SuccessMetricsSection() {
    const { t, locale } = useI18n();

    return (
        <Section background="navy">
            <Container>
                <Heading level="h2" className="mb-16 text-center text-white">
                    {t('home.metrics.title')}
                </Heading>
            </Container>

            <Container>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
                    {METRICS_EXTENDED.map((item, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <span className="text-3xl font-bold text-brand-gold-400 md:text-4xl">
                                {item.value}{item.suffix}
                            </span>
                            <span className="mt-2 text-sm text-neutral-400">
                                {locale === 'ar' ? item.labelAr : item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
