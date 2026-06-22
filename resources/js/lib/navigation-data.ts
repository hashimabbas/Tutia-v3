import { ShoppingCart, CreditCard, MessageSquareText, Building2, Ticket, Headset, Globe, Smartphone, Wifi, Shield, BrainCircuit } from 'lucide-react';
import type { MegaMenuCategory } from '@/types';

export const SERVICE_CATEGORIES: MegaMenuCategory[] = [
    {
        title: 'services.categories.commerce',
        titleAr: 'التجارة الرقمية',
        items: [
            {
                title: 'services.ecommerce',
                titleAr: 'حلول التجارة الإلكترونية',
                href: '/services/ecommerce',
                description: 'B2C marketplace & online store setup',
                descriptionAr: 'سوق إلكتروني ومتاجر إلكترونية',
                icon: ShoppingCart,
            },
            {
                title: 'services.paymentGateway',
                titleAr: 'بوابة الدفع',
                href: '/services/payment-gateway',
                description: 'Multi-currency, recurring billing',
                descriptionAr: 'مدفوعات متعددة العملات',
                icon: CreditCard,
            },
            {
                title: 'services.bulkSms',
                titleAr: 'الرسائل النصية',
                href: '/services/bulk-sms',
                description: 'SMS marketing & notifications',
                descriptionAr: 'تسويق وإشعارات عبر الرسائل',
                icon: MessageSquareText,
            },
        ],
    },
    {
        title: 'services.categories.enterprise',
        titleAr: 'التقنية المؤسسية',
        items: [
            {
                title: 'services.erp',
                titleAr: 'أنظمة تخطيط الموارد',
                href: '/services/erp',
                description: 'Accounting, CRM, HR, Inventory',
                descriptionAr: 'محاسبة، علاقات عملاء، موارد بشرية',
                icon: Building2,
            },
            {
                title: 'services.ticketing',
                titleAr: 'نظام الحجوزات',
                href: '/services/ticketing',
                description: 'Travel agency automation',
                descriptionAr: 'أتمتة وكالات السفر',
                icon: Ticket,
            },
            {
                title: 'services.callCenter',
                titleAr: 'مركز الاتصال',
                href: '/services/call-center',
                description: 'Multi-channel call center',
                descriptionAr: 'مركز اتصال متعدد القنوات',
                icon: Headset,
            },
        ],
    },
    {
        title: 'services.categories.digital',
        titleAr: 'الحضور الرقمي',
        items: [
            {
                title: 'services.webDevelopment',
                titleAr: 'تطوير المواقع',
                href: '/services/web-development',
                description: 'Websites, portals, web applications',
                descriptionAr: 'مواقع، بوابات، تطبيقات ويب',
                icon: Globe,
            },
            {
                title: 'services.mobileApps',
                titleAr: 'التطبيقات الجوالة',
                href: '/services/mobile-apps',
                description: 'iOS & Android app development',
                descriptionAr: 'تطوير تطبيقات iOS وأندرويد',
                icon: Smartphone,
            },
        ],
    },
    {
        title: 'services.categories.infrastructure',
        titleAr: 'البنية التحتية والاستشارات',
        items: [
            {
                title: 'services.connectivity',
                titleAr: 'حلول الاتصال',
                href: '/services/connectivity',
                description: 'Mobile/Wi-Fi coverage solutions',
                descriptionAr: 'حلول التغطية الجوالة واللاسلكية',
                icon: Wifi,
            },
            {
                title: 'services.vpn',
                titleAr: 'خدمات الشبكات الخاصة',
                href: '/services/vpn',
                description: 'Business VPN & security',
                descriptionAr: 'شبكات خاصة وأمن للشركات',
                icon: Shield,
            },
            {
                title: 'services.consulting',
                titleAr: 'الاستشارات التقنية',
                href: '/services/consulting',
                description: 'Technology strategy & advisory',
                descriptionAr: 'استشارات استراتيجية تقنية',
                icon: BrainCircuit,
            },
        ],
    },
];

export const PLATFORM_SUB_ITEMS = [
    { href: '/platform', label: 'platform.overview', labelAr: 'نظرة عامة' },
    { href: '/platform/sellers', label: 'platform.forSellers', labelAr: 'للبائعين' },
    { href: '/platform/buyers', label: 'platform.forBuyers', labelAr: 'للمشترين' },
    { href: '/platform/apps', label: 'platform.mobileApps', labelAr: 'التطبيقات الجوالة' },
];
