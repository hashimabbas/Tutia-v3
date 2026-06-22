import { Link } from '@inertiajs/react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { COMPANY_INFO } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';
import { FooterColumn, FooterLink } from './footer-column';
import { LanguageSwitcher } from './language-switcher';
import { SocialLinks } from './social-links';

export function Footer() {
    const { t, locale } = useI18n();

    return (
        <footer className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="container-main py-16">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <FooterColumn title={t('footer.contactUs')}>
                        <div className="space-y-3 text-sm text-neutral-500 dark:text-neutral-400">
                            <p className="font-semibold text-neutral-900 dark:text-white">
                                {COMPANY_INFO.name}
                            </p>
                            <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 size-4 shrink-0" />
                                <span>
                                    {locale === 'ar' ? COMPANY_INFO.addressAr : COMPANY_INFO.address}
                                    <br />
                                    {COMPANY_INFO.poBox}
                                </span>
                            </div>
                            <a
                                href={`tel:${COMPANY_INFO.phone[0]}`}
                                className="flex items-center gap-2 transition-colors hover:text-brand-navy-500"
                            >
                                <Phone className="size-4" />
                                <span>{COMPANY_INFO.phone[0]}</span>
                            </a>
                            <a
                                href={`tel:${COMPANY_INFO.phone[1]}`}
                                className="flex items-center gap-2 transition-colors hover:text-brand-navy-500"
                            >
                                <Phone className="size-4" />
                                <span>{COMPANY_INFO.phone[1]}</span>
                            </a>
                            <a
                                href={`mailto:${COMPANY_INFO.email}`}
                                className="flex items-center gap-2 transition-colors hover:text-brand-navy-500"
                            >
                                <Mail className="size-4" />
                                <span>{COMPANY_INFO.email}</span>
                            </a>
                        </div>
                    </FooterColumn>

                    <FooterColumn title={t('footer.ourServices')}>
                        <FooterLink href="/services/ecommerce">
                            {t('services.ecommerce')}
                        </FooterLink>
                        <FooterLink href="/services/erp">
                            {t('services.erp')}
                        </FooterLink>
                        <FooterLink href="/services/web-development">
                            {t('services.webDevelopment')}
                        </FooterLink>
                        <FooterLink href="/services/connectivity">
                            {t('services.connectivity')}
                        </FooterLink>
                        <FooterLink href="/services/vpn">
                            {t('services.vpn')}
                        </FooterLink>
                        <FooterLink href="/services/mobile-apps">
                            {t('services.mobileApps')}
                        </FooterLink>
                        <FooterLink href="/services/payment-gateway">
                            {t('services.paymentGateway')}
                        </FooterLink>
                        <FooterLink href="/services/bulk-sms">
                            {t('services.bulkSms')}
                        </FooterLink>
                        <FooterLink href="/services/consulting">
                            {t('services.consulting')}
                        </FooterLink>
                        <FooterLink href="/services/call-center">
                            {t('services.callCenter')}
                        </FooterLink>
                    </FooterColumn>

                    <FooterColumn title={t('footer.quickLinks')}>
                        <FooterLink href="/about">
                            {t('footer.aboutUs')}
                        </FooterLink>
                        <FooterLink href="/work">
                            {t('footer.ourWork')}
                        </FooterLink>
                        <FooterLink href="/platform">
                            {t('footer.platform')}
                        </FooterLink>
                        <FooterLink href="/insights">
                            {t('footer.insights')}
                        </FooterLink>
                        <FooterLink href="/contact">
                            {t('footer.contact')}
                        </FooterLink>
                    </FooterColumn>

                    <FooterColumn title={t('footer.followUs')}>
                        <div className="space-y-4">
                            <SocialLinks className="gap-3 [&_a]:text-neutral-500 [&_a]:hover:text-brand-navy-500 [&_a_svg]:size-5" />
                            <LanguageSwitcher />
                        </div>
                    </FooterColumn>
                </div>
            </div>

            <div className="border-t border-neutral-200 py-6 dark:border-neutral-800">
                <div className="container-main flex flex-col items-center justify-between gap-4 text-sm text-neutral-500 md:flex-row dark:text-neutral-400">
                    <p>
                        &copy; {new Date().getFullYear()} {COMPANY_INFO.name}.{' '}
                        {t('footer.allRightsReserved')}
                    </p>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/legal/privacy"
                            className="transition-colors hover:text-brand-navy-500"
                        >
                            {t('footer.privacyPolicy')}
                        </Link>
                        <Link
                            href="/legal/terms"
                            className="transition-colors hover:text-brand-navy-500"
                        >
                            {t('footer.termsOfService')}
                        </Link>
                        <Link
                            href="/legal/cookies"
                            className="transition-colors hover:text-brand-navy-500"
                        >
                            {t('footer.cookiePolicy')}
                        </Link>
                    </div>
                    <p className="text-xs text-brand-gold-500">
                        &ldquo;{t('footer.tagline')}&rdquo;
                    </p>
                </div>
            </div>
        </footer>
    );
}
