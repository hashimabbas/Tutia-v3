import { Section, Container, MetricCard, Text } from '@/components/design-system';
import { STATS } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';

const CLIENT_LOGOS = [
    { src: '/images/customers/bdr.png', alt: 'BDR', style: { filter: 'brightness(0) saturate(100%) invert(22%) sepia(8%) saturate(2140%) hue-rotate(200deg) brightness(95%) contrast(88%)' } },
    { src: '/images/customers/hyundai.png', alt: 'Hyundai', style: { filter: 'none' } },
    { src: '/images/customers/nissan.png', alt: 'Nissan', style: { filter: 'none' } },
    { src: '/images/customers/jac.png', alt: 'JAC', style: { filter: 'none' } },
    { src: '/images/customers/bajaj.png', alt: 'Bajaj', style: { filter: 'none' } },
    { src: '/images/customers/mobipay.png', alt: 'Mobipay', style: { filter: 'none' } },
    { src: '/images/customers/sudia-cargo.png', alt: 'Sudia Cargo', style: { filter: 'none' } },
    { src: '/images/customers/icrc.jpg', alt: 'ICRC', style: { filter: 'none' } },
    { src: '/images/customers/sanofi.png', alt: 'Sanofi', style: { filter: 'none' } },
    { src: '/images/customers/u.s.embassy.png', alt: 'U.S. Embassy', style: { filter: 'none' } },
    { src: '/images/customers/biritish-conucil.png', alt: 'British Council', style: { filter: 'none' } },
    { src: '/images/customers/faisal.jpg', alt: 'Faisal', style: { filter: 'none' } },
];

const PARTNER_LOGOS = [
    { src: '/images/partner/bank-khartoum.png', alt: 'Bank of Khartoum', style: { filter: 'none' } },
    { src: '/images/partner/maestros.png', alt: 'Maestros', style: { filter: 'none' } },
    { src: '/images/partner/zolpay.png', alt: 'Zolpay', style: { filter: 'none' } },
    { src: '/images/partner/trust.png', alt: 'Trust', style: { filter: 'none' } },
    { src: '/images/partner/tradive.png', alt: 'Tradive', style: { filter: 'none' } },
    { src: '/images/partner/nilogy.png', alt: 'Nilogy', style: { filter: 'none' } },
];

const gradientPairs = [
    'from-blue-50 to-blue-100/50',
    'from-emerald-50 to-emerald-100/50',
    'from-amber-50 to-amber-100/50',
    'from-rose-50 to-rose-100/50',
    'from-violet-50 to-violet-100/50',
    'from-cyan-50 to-cyan-100/50',
    'from-orange-50 to-orange-100/50',
    'from-teal-50 to-teal-100/50',
    'from-pink-50 to-pink-100/50',
    'from-indigo-50 to-indigo-100/50',
    'from-lime-50 to-lime-100/50',
    'from-red-50 to-red-100/50',
];

const partnerGradientPairs = [
    'from-purple-50 to-purple-100/50',
    'from-sky-50 to-sky-100/50',
    'from-green-50 to-green-100/50',
    'from-yellow-50 to-yellow-100/50',
    'from-fuchsia-50 to-fuchsia-100/50',
    'from-stone-50 to-stone-100/50',
];

export function TrustIndicatorsSection() {
    const { locale } = useI18n();

    return (
        <Section background="muted">
            <Container>
                <div className="grid grid-cols-3 gap-8 md:gap-12">
                    {STATS.map((stat) => (
                        <MetricCard
                            key={stat.label}
                            value={`${stat.value}${stat.suffix ?? ''}`}
                            label={locale === 'ar' ? stat.labelAr : stat.label}
                        />
                    ))}
                </div>

                <div className="mt-16">
                    <Text variant="overline" as="p" className="text-center">
                        {locale === 'ar' ? 'عملاؤنا' : 'Our Clients'}
                    </Text>
                    <div className="mt-8 grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
                        {CLIENT_LOGOS.map((logo, i) => (
                            <div
                                key={logo.src}
                                className={`group flex items-center justify-center rounded-xl bg-gradient-to-br ${gradientPairs[i % gradientPairs.length]} p-5 ring-1 ring-neutral-200/60 transition-all duration-300 hover:scale-105 hover:ring-brand-gold-300/50 hover:shadow-lg hover:shadow-neutral-200/50`}
                            >
                                <img
                                    src={logo.src}
                                    alt={logo.alt}
                                    className="h-9 w-auto object-contain transition-all duration-300 md:h-11"
                                    style={logo.style}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-14">
                    <Text variant="overline" as="p" className="text-center">
                        {locale === 'ar' ? 'شركاؤنا' : 'Our Partners'}
                    </Text>
                    <div className="mt-8 grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
                        {PARTNER_LOGOS.map((logo, i) => (
                            <div
                                key={logo.src}
                                className={`group flex items-center justify-center rounded-xl bg-gradient-to-br ${partnerGradientPairs[i % partnerGradientPairs.length]} p-5 ring-1 ring-neutral-200/60 transition-all duration-300 hover:scale-105 hover:ring-brand-gold-300/50 hover:shadow-lg hover:shadow-neutral-200/50`}
                            >
                                <img
                                    src={logo.src}
                                    alt={logo.alt}
                                    className="h-9 w-auto object-contain transition-all duration-300 md:h-11"
                                    style={logo.style}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </Section>
    );
}
