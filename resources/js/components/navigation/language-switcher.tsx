import { Globe } from 'lucide-react';
import { LOCALES } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({
    className,
    minimal = false,
}: {
    className?: string;
    minimal?: boolean;
}) {
    const { locale, setLocale } = useI18n();

    const handleToggle = () => {
        setLocale(locale === 'en' ? 'ar' : 'en');
    };

    if (minimal) {
        return (
            <button
                onClick={handleToggle}
                className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 text-sm font-medium transition-colors hover:text-brand-navy-500',
                    className,
                )}
                aria-label={
                    locale === 'en' ? 'Switch to Arabic' : 'Switch to English'
                }
            >
                <Globe className="size-3.5" />
                <span>{locale === 'en' ? 'AR' : 'EN'}</span>
            </button>
        );
    }

    return (
        <div className={cn('flex items-center gap-1', className)}>
            {LOCALES.map((loc) => (
                <button
                    key={loc.code}
                    onClick={() => setLocale(loc.code)}
                    className={cn(
                        'rounded px-2 py-1 text-xs font-medium transition-colors',
                        locale === loc.code
                            ? 'bg-brand-navy-500 text-white'
                            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
                    )}
                >
                    {loc.label}
                </button>
            ))}
        </div>
    );
}
