import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useScroll } from '@/hooks/use-scroll';
import { NAV_ITEMS, COMPANY_INFO } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { HeaderMobile } from './header-mobile';
import { LanguageSwitcher } from './language-switcher';
import { MegaMenu } from './mega-menu';
import { NavLink } from './nav-link';
import { TopBar } from './top-bar';

export function Header() {
    const { t } = useI18n();
    const { isScrolled } = useScroll();

    return (
        <header
            className={cn(
                'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-white/95 shadow-sm backdrop-blur-md dark:bg-neutral-950/95'
                    : 'bg-white dark:bg-neutral-950',
            )}
        >
            <TopBar />

            <div className="container-main flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xl font-bold text-brand-navy-500"
                    >
                        {COMPANY_INFO.name}
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {NAV_ITEMS.map((item) => {
                            if (item.hasMegaMenu) {
                                return <MegaMenu key={item.label} />;
                            }

                            return (
                                <NavLink key={item.label} href={item.href}>
                                    {t(item.label)}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <LanguageSwitcher minimal className="hidden md:flex" />
                    <Button
                        asChild
                        className="hidden md:inline-flex"
                        size="sm"
                    >
                        <Link href="/contact/consultation">
                            {t('nav.bookConsultation')}
                        </Link>
                    </Button>
                    <HeaderMobile />
                </div>
            </div>
        </header>
    );
}
