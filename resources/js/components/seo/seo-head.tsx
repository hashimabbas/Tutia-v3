import { Head } from '@inertiajs/react';
import { useI18n } from '@/lib/i18n';

type BreadcrumbItem = {
  name: string;
  nameAr: string;
  url: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

export type SeoHeadProps = {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FaqItem[];
  noindex?: boolean;
};

const SITE_NAME = 'TUTIA';
const DEFAULT_OG_IMAGE = 'https://tutiasd.com/logo-transparent.png';
const SITE_URL = 'https://tutiasd.com';

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: 'TUTIA - Technology & Digital Transformation Partner',
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    description: 'Empowering Sudanese businesses with enterprise-grade digital solutions since 2017.',
    foundingDate: '2017',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Khartoum',
      addressCountry: 'SD',
    },
    sameAs: [
      'https://www.linkedin.com/company/tutia',
      'https://www.facebook.com/tutia',
    ],
  };
}

function serviceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    name: 'Digital Transformation & Technology Services',
    description: 'Enterprise-grade digital solutions including E-commerce, ERP, Connectivity, CRM, and custom software development for Sudanese businesses.',
    areaServed: {
      '@type': 'Country',
      name: 'SD',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'TUTIA Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'E-commerce Solutions' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'ERP Systems' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Connectivity & Infrastructure' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'CRM Solutions' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom Software Development' } },
      ],
    },
  };
}

function breadcrumbSchema(items: BreadcrumbItem[], locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: locale === 'ar' ? item.nameAr : item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

function faqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function SeoHead({
  title,
  description,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonicalUrl,
  breadcrumbs,
  faqs,
  noindex = false,
}: SeoHeadProps) {
  const { locale } = useI18n();
  const url = canonicalUrl ?? SITE_URL;
  const ogLocale = locale === 'ar' ? 'ar_AR' : 'en_US';

  return (
    <Head title={title}>
      <meta name="description" content={description} />

      <link rel="canonical" href={url} />

      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={ogLocale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      <script type="application/ld+json">
        {JSON.stringify(organizationSchema())}
      </script>

      <script type="application/ld+json">
        {JSON.stringify(serviceSchema())}
      </script>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema(breadcrumbs, locale))}
        </script>
      )}

      {faqs && faqs.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema(faqs))}
        </script>
      )}
    </Head>
  );
}
