import type { LocaleConfig, CompanyInfo, Value, Stat } from '@/types';

export const COMPANY_INFO: CompanyInfo = {
    name: 'TUTIA',
    tagline: 'Unlimited Trust',
    taglineAr: 'ثقة غير محدودة',
    phone: ['+249912329449', '+249965502009'],
    email: 'info@tutiasd.com',
    address: 'Khartoum, Sudan',
    addressAr: 'الخرطوم، السودان',
    poBox: 'P.O Box: 77003',
    social: {
        facebook: 'https://facebook.com/tutiasd',
        twitter: 'https://twitter.com/tutiasd',
        instagram: 'https://instagram.com/tutiasd',
        linkedin: 'https://linkedin.com/company/tutiasd',
        whatsapp: 'https://wa.me/249912329449',
    },
};

export const LOCALES: LocaleConfig[] = [
    {
        code: 'en',
        direction: 'ltr',
        label: 'English',
        labelAr: 'English',
        flag: '🇬🇧',
    },
    {
        code: 'ar',
        direction: 'rtl',
        label: 'العربية',
        labelAr: 'العربية',
        flag: '🇸🇩',
    },
];

export const VALUES: Value[] = [
    {
        id: 'trust',
        title: 'Trust',
        titleAr: 'الثقة',
        description:
            'We know that trust must be earned, so we strive every day to act in ways to build up trust in our clients, ourselves and others.',
        descriptionAr:
            'نحن نعلم أن الثقة يجب أن تُكتسب، لذا نسعى كل يوم للعمل بطرق تبني الثقة في عملائنا وأنفسنا والآخرين.',
        icon: 'shield-check',
    },
    {
        id: 'commitment',
        title: 'Commitment',
        titleAr: 'الالتزام',
        description:
            'We recognize the importance of providing excellent services and creating an environment where commitment is part of the fabric of who we are.',
        descriptionAr:
            'نحن ندرك أهمية تقديم خدمات ممتازة وخلق بيئة يكون فيها الالتزام جزءاً من نسيج من نحن.',
        icon: 'handshake',
    },
    {
        id: 'integrity',
        title: 'Integrity',
        titleAr: 'النزاهة',
        description:
            'We value our reputation and conduct our business with integrity, honesty, and respect for each individual.',
        descriptionAr:
            'نحن نقدر سمعتنا وندير أعمالنا بالنزاهة والصدق والاحترام لكل فرد.',
        icon: 'badge-check',
    },
    {
        id: 'results',
        title: 'Results',
        titleAr: 'النتائج',
        description:
            'We seek to deliver excellent results and we ensure our clients and customers that our results will absolutely exceed their expectations.',
        descriptionAr:
            'نسعى لتقديم نتائج ممتازة ونضمن لعملائنا أن نتائجنا ستتجاوز توقعاتهم تماماً.',
        icon: 'trending-up',
    },
];

export const STATS: Stat[] = [
    {
        label: 'Years in Business',
        labelAr: 'سنوات في العمل',
        value: 9,
        suffix: '+',
    },
    {
        label: 'Projects Completed',
        labelAr: 'مشروع مكتمل',
        value: 100,
        suffix: '+',
    },
    {
        label: 'Clients Served',
        labelAr: 'عميل خدمتهم',
        value: 50,
        suffix: '+',
    },
];

export const NAV_ITEMS = [
    { label: 'nav.home', href: '/', isActive: true },
    {
        label: 'nav.services',
        href: '/services',
        hasMegaMenu: true,
    },
    { label: 'nav.platform', href: '/platform' },
    { label: 'nav.work', href: '/work' },
    { label: 'nav.insights', href: '/insights' },
    { label: 'nav.gallery', href: '/gallery' },
    { label: 'nav.about', href: '/about' },
    { label: 'nav.contact', href: '/contact' },
];
