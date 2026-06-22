import {
    ShoppingCart,
    Building2,
    Globe,
    Shield,
    Store,
    Plane,
    Radio,
    Building,
    Landmark,
    MapPin,
    Smartphone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
    CapabilityPillar,
    Industry,
    CaseStudyPreview,
    Differentiator,
    FeaturedService,
    MatgerStat,
} from '@/types';

export const CAPABILITIES: CapabilityPillar[] = [
    {
        id: 'digital-commerce',
        title: 'Digital Commerce',
        titleAr: 'التجارة الرقمية',
        description:
            'Launch and scale your online presence with marketplaces, payment gateways, and e-commerce platforms.',
        descriptionAr:
            'أطلق وسّع تواجدك الإلكتروني من خلال المتاجر الإلكترونية وبوابات الدفع ومنصات التجارة.',
        icon: 'ShoppingCart',
        href: '/services/commerce',
    },
    {
        id: 'enterprise-technology',
        title: 'Enterprise Technology',
        titleAr: 'التقنية المؤسسية',
        description:
            'Transform operations with ERP, travel automation, and multi-channel customer engagement.',
        descriptionAr:
            'حوّل عملياتك باستخدام أنظمة تخطيط الموارد وأتمتة السفر والتواصل متعدد القنوات.',
        icon: 'Building2',
        href: '/services/enterprise',
    },
    {
        id: 'digital-presence',
        title: 'Digital Presence',
        titleAr: 'الحضور الرقمي',
        description:
            'Build your brand with world-class websites, mobile apps, and digital experiences.',
        descriptionAr:
            'ابنِ علامتك التجارية بمواقع إلكترونية وتطبيقات جوالة وتجارب رقمية عالمية المستوى.',
        icon: 'Globe',
        href: '/services/digital',
    },
    {
        id: 'infrastructure-advisory',
        title: 'Infrastructure & Advisory',
        titleAr: 'البنية التحتية والاستشارات',
        description:
            'Secure, connect, and strategize with enterprise-grade infrastructure and expert consulting.',
        descriptionAr:
            'أمّن، ارتبط، وخطط باستخدام بنية تحتية مؤسسية واستشارات خبراء.',
        icon: 'Shield',
        href: '/services/infrastructure',
    },
];

export const FEATURED_SERVICES: FeaturedService[] = [
    {
        id: 'erp',
        title: 'ERP Systems',
        titleAr: 'أنظمة تخطيط الموارد',
        description:
            'Streamline operations from finance to HR with comprehensive enterprise resource planning.',
        descriptionAr:
            'بسّط العمليات من المالية إلى الموارد البشرية بتخطيط موارد المؤسسات الشامل.',
        features: [
            'Accounting, inventory, and HR management',
            'CRM and sales automation',
            'Real-time reporting and analytics',
        ],
        featuresAr: [
            'إدارة المحاسبة والمخزون والموارد البشرية',
            'أتمتة علاقات العملاء والمبيعات',
            'تقارير وتحليلات فورية',
        ],
        href: '/services/erp',
    },
    {
        id: 'ecommerce',
        title: 'E-Commerce Solutions',
        titleAr: 'حلول التجارة الإلكترونية',
        description:
            'Launch your online marketplace with Matger-TUTIA or build a custom store for your brand.',
        descriptionAr:
            'أطلق متجرك الإلكتروني عبر متجر توتيا أو ابنِ متجراً مخصصاً لعلامتك التجارية.',
        features: [
            'Multi-vendor marketplace platform',
            'Secure payment gateway integration',
            'Mobile-first shopping experience',
        ],
        featuresAr: [
            'منصة سوق متعدد البائعين',
            'دمج بوابات دفع آمنة',
            'تجربة تسوق متنقلة أولاً',
        ],
        href: '/services/ecommerce',
    },
    {
        id: 'connectivity',
        title: 'Connectivity Solutions',
        titleAr: 'حلول الاتصال',
        description:
            'Reliable mobile and Wi-Fi coverage solutions, anywhere in Sudan.',
        descriptionAr:
            'حلول تغطية جوالة ولاسلكية موثوقة في أي مكان في السودان.',
        features: [
            'Indoor and outdoor Wi-Fi deployment',
            'Mobile coverage assessment and installation',
            'Network maintenance and support',
        ],
        featuresAr: [
            'نشر شبكات واي فاي داخلية وخارجية',
            'تقييم وتركيب التغطية الجوالة',
            'صيانة الشبكات ودعم فني',
        ],
        href: '/services/connectivity',
    },
];

export const MATGER_STATS: MatgerStat[] = [
    {
        value: '500+',
        label: 'App Downloads',
        labelAr: 'تحميل التطبيق',
    },
    {
        value: 'Multi-Vendor',
        label: 'Active Merchants',
        labelAr: 'بائعون نشطون',
    },
    {
        value: 'Multi-Payment',
        label: 'Payment Methods',
        labelAr: 'طرق دفع',
    },
];

export const INDUSTRIES: Industry[] = [
    {
        id: 'retail',
        name: 'Retail & E-Commerce',
        nameAr: 'التجزئة والتجارة الإلكترونية',
        description:
            'Digital storefronts, marketplaces, and payment integration for modern retailers.',
        descriptionAr:
            'واجهات متاجر رقمية وأسواق إلكترونية ودمج مدفوعات للتجار المعاصرين.',
        icon: 'Store',
    },
    {
        id: 'travel',
        name: 'Travel & Tourism',
        nameAr: 'السفر والسياحة',
        description:
            'Ticketing systems, booking automation, and travel agency solutions.',
        descriptionAr:
            'أنظمة حجوزات وأتمتة حجز وحلول لوكالات السفر.',
        icon: 'Plane',
    },
    {
        id: 'telecom',
        name: 'Telecommunications',
        nameAr: 'الاتصالات',
        description:
            'Connectivity infrastructure, VPN, and network solutions for telecom operators.',
        descriptionAr:
            'بنية تحتية للاتصالات وشبكات خاصة وحلول شبكية لمشغلي الاتصالات.',
        icon: 'Radio',
    },
    {
        id: 'finance',
        name: 'Banking & Finance',
        nameAr: 'البنوك والمالية',
        description:
            'Payment gateways, ERP systems, and secure financial technology solutions.',
        descriptionAr:
            'بوابات دفع وأنظمة تخطيط موارد وحلول تقنية مالية آمنة.',
        icon: 'Building',
    },
    {
        id: 'government',
        name: 'Government',
        nameAr: 'القطاع الحكومي',
        description:
            'ICT consulting, digital transformation, and infrastructure for public sector.',
        descriptionAr:
            'استشارات تقنية وتحول رقمي وبنية تحتية للقطاع العام.',
        icon: 'Landmark',
    },
];

export const DIFFERENTIATORS: Differentiator[] = [
    {
        id: 'local-expertise',
        title: "Sudan's Technology Partner",
        titleAr: 'شريك السودان التقني',
        description:
            "We're not a global consultancy with a local office. We're a Sudanese company building Sudan's digital future, with deep understanding of the local market.",
        descriptionAr:
            'نحن لسنا شركة استشارات عالمية بمكتب محلي. نحن شركة سودانية تبني المستقبل الرقمي للسودان بفهم عميق للسوق المحلي.',
        icon: 'MapPin',
    },
    {
        id: 'proven-platform',
        title: 'Proven Platform',
        titleAr: 'منصة مثبتة',
        description:
            'Matger-TUTIA is a live, functioning marketplace with real merchants and real users. We don\'t just advise on technology — we build it.',
        descriptionAr:
            'متجر توتيا هو سوق إلكتروني حي يعمل بتجار حقيقيين ومستخدمين حقيقيين. لا نقدم استشارات تقنية فقط — بل نبنيها.',
        icon: 'Smartphone',
    },
    {
        id: 'end-to-end',
        title: 'End-to-End Delivery',
        titleAr: 'تسليم متكامل',
        description:
            'From strategy to implementation to ongoing support. One partner, full accountability, no handoffs.',
        descriptionAr:
            'من الاستراتيجية إلى التنفيذ إلى الدعم المستمر. شريك واحد، مسؤولية كاملة، لا تسليم بين أطراف.',
        icon: 'Building2',
    },
    {
        id: 'bilingual',
        title: 'Bilingual by Design',
        titleAr: 'ثنائي اللغة بالتصميم',
        description:
            'Arabic and English, equally polished. Your team, your clients, your stakeholders — we speak their language, literally and figuratively.',
        descriptionAr:
            'العربية والإنجليزية بنفس المستوى. فريقك، عملاؤك، شركاؤك — نتحدث لغتهم حرفياً ومجازياً.',
        icon: 'Globe',
    },
];

export const CASE_STUDY_PREVIEWS: CaseStudyPreview[] = [
    {
        id: 'matger-tutia',
        title: 'Matger-TUTIA Platform',
        titleAr: 'منصة متجر توتيا',
        summary:
            'Building Sudan\'s first multi-vendor e-commerce marketplace from concept to launch.',
        summaryAr:
            'بناء أول سوق إلكتروني متعدد البائعين في السودان من الفكرة إلى الإطلاق.',
        resultMetric: '500+',
        resultMetricAr: '500+',
        resultLabel: 'App Downloads',
        resultLabelAr: 'تحميل التطبيق',
        href: '/work/matger-tutia',
    },
    {
        id: 'erp-implementation',
        title: 'ERP Implementation',
        titleAr: 'تطبيق نظام تخطيط الموارد',
        summary:
            'Streamlining financial and operational processes for a Sudanese enterprise.',
        summaryAr:
            'تبسيط العمليات المالية والتشغيلية لمؤسسة سودانية.',
        resultMetric: '40%',
        resultMetricAr: '40%',
        resultLabel: 'Efficiency Gain',
        resultLabelAr: 'تحسين كفاءة',
        href: '/work/erp-implementation',
    },
    {
        id: 'connectivity-project',
        title: 'Connectivity Project',
        titleAr: 'مشروع الاتصال',
        summary:
            'Extending reliable mobile coverage across underserved areas in Khartoum.',
        summaryAr:
            'توسيع التغطية الجوالة الموثوقة في المناطق المحرومة في الخرطوم.',
        resultMetric: '95%',
        resultMetricAr: '95%',
        resultLabel: 'Coverage Improvement',
        resultLabelAr: 'تحسين التغطية',
        href: '/work/connectivity-project',
    },
];

export const METRICS_EXTENDED = [
    { value: 9, suffix: '+', label: 'Years in Business', labelAr: 'سنوات في العمل' },
    { value: 100, suffix: '+', label: 'Projects Completed', labelAr: 'مشروع مكتمل' },
    { value: 50, suffix: '+', label: 'Clients Served', labelAr: 'عميل خدمتهم' },
    { value: 11, suffix: '', label: 'Service Categories', labelAr: 'فئة خدمية' },
    { value: 2, suffix: '+', label: 'Mobile Apps', labelAr: 'تطبيق جوال' },
    { value: 500, suffix: '+', label: 'Platform Downloads', labelAr: 'تحميل المنصة' },
];

export const CAPABILITY_ICON_MAP: Record<string, LucideIcon> = {
    ShoppingCart,
    Building2,
    Globe,
    Shield,
};

export const INDUSTRY_ICON_MAP: Record<string, LucideIcon> = {
    Store,
    Plane,
    Radio,
    Building,
    Landmark,
};

export const DIFFERENTIATOR_ICON_MAP: Record<string, LucideIcon> = {
    MapPin,
    Smartphone,
    Building2,
    Globe,
};
