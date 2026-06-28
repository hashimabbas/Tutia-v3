import { CaseStudiesSection } from '@/components/sections/home/case-studies-section';
import { CoreCapabilitiesSection } from '@/components/sections/home/core-capabilities-section';
import { CrmSection } from '@/components/sections/home/crm-section';
import { FeaturedServicesSection } from '@/components/sections/home/featured-services-section';
import { FinalCtaSection } from '@/components/sections/home/final-cta-section';
import { HeroSection } from '@/components/sections/home/hero-section';
import { IndustriesSection } from '@/components/sections/home/industries-section';
import { MatgerShowcaseSection } from '@/components/sections/home/matger-showcase-section';
import { SuccessMetricsSection } from '@/components/sections/home/success-metrics-section';
import { TestimonialsSection } from '@/components/sections/home/testimonials-section';
import { TrustIndicatorsSection } from '@/components/sections/home/trust-indicators-section';
import { WhyTutiaSection } from '@/components/sections/home/why-tutia-section';
import { SeoHead } from '@/components/seo/seo-head';

export default function Home() {
    return (
        <>
            <SeoHead
                title="TUTIA — Technology & Digital Transformation Partner"
                description="Empowering Sudanese businesses with enterprise-grade digital solutions since 2017. E-commerce, ERP, Connectivity, and more."
                canonicalUrl="https://tutiasd.com"
                breadcrumbs={[{ name: 'Home', nameAr: 'الرئيسية', url: '/' }]}
            />

            <HeroSection />
            <TrustIndicatorsSection />
            <CoreCapabilitiesSection />
            <FeaturedServicesSection />
            <MatgerShowcaseSection />
            <IndustriesSection />
            <WhyTutiaSection />
            <SuccessMetricsSection />
            <CaseStudiesSection />
            <TestimonialsSection />
            <CrmSection />
            <FinalCtaSection />
        </>
    );
}
