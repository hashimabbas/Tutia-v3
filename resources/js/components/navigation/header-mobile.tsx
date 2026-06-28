import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NAV_ITEMS, COMPANY_INFO } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';
import { SERVICE_CATEGORIES } from '@/lib/navigation-data';
import { LanguageSwitcher } from './language-switcher';
import { SocialLinks } from './social-links';

export function HeaderMobile() {
    const [open, setOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const { t } = useI18n();

    const handleNav = () => {
        setOpen(false);
        setServicesOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label={t('common.menu')}
                >
                    <Menu className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm p-0">
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4 dark:border-neutral-700">
                        <Link
                            href="/"
                            className="text-xl font-bold text-brand-navy-500"
                            onClick={handleNav}
                        >
                            {COMPANY_INFO.name}
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            aria-label={t('common.close')}
                        >
                            <X className="size-5" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        <nav className="space-y-1">
                            {NAV_ITEMS.map((item) => {
                                if (item.hasMegaMenu) {
                                    return (
                                        <div
                                            key={item.href}
                                            className="space-y-1"
                                        >
                                            <button
                                                onClick={() =>
                                                    setServicesOpen(
                                                        !servicesOpen,
                                                    )
                                                }
                                                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                            >
                                                {t('nav.services')}
                                                <svg
                                                    className={`size-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>
                                            {servicesOpen && (
                                                <div className="ml-3 space-y-1 border-l-2 border-brand-navy-200 pl-3 dark:border-brand-navy-700">
                                                    <Link
                                                        href="/services"
                                                        className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-navy-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                        onClick={handleNav}
                                                    >
                                                        {t('services.title')}
                                                    </Link>
                                                    {SERVICE_CATEGORIES.map(
                                                        (cat) => (
                                                            <div
                                                                key={cat.title}
                                                                className="space-y-1"
                                                            >
                                                                <span className="block px-3 py-1 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                                    {t(
                                                                        cat.title,
                                                                    )}
                                                                </span>
                                                                {cat.items.map(
                                                                    (svc) => (
                                                                        <Link
                                                                            key={
                                                                                svc.href
                                                                            }
                                                                            href={
                                                                                svc.href
                                                                            }
                                                                            className="block rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                                            onClick={
                                                                                handleNav
                                                                            }
                                                                        >
                                                                            {t(
                                                                                svc.title,
                                                                            )}
                                                                        </Link>
                                                                    ),
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                        onClick={handleNav}
                                    >
                                        {t(item.label)}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="border-t border-neutral-200 px-4 py-4 dark:border-neutral-700">
                        <div className="flex items-center justify-between">
                            <LanguageSwitcher />
                            <SocialLinks />
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-neutral-500">
                            <a
                                href={`tel:${COMPANY_INFO.phone[0]}`}
                                className="block"
                            >
                                {COMPANY_INFO.phone[0]}
                            </a>
                            <a
                                href={`mailto:${COMPANY_INFO.email}`}
                                className="block"
                            >
                                {COMPANY_INFO.email}
                            </a>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
