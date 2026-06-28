import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useDirection } from '@/hooks/use-direction';
import { I18nContext } from '@/lib/i18n';
import { t as translate, getDirection } from '@/lib/i18n';
import type { Locale, Direction } from '@/types';

export function I18nProvider({
    children,
    initialLocale = 'en',
}: {
    children: ReactNode;
    initialLocale?: Locale;
}) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale);
    const direction: Direction = useDirection(locale);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        document.documentElement.dir = getDirection(newLocale);
        document.documentElement.lang = newLocale;
    }, []);

    const t = useCallback(
        (key: string): string => translate(locale, key),
        [locale],
    );

    return (
        <I18nContext.Provider value={{ locale, direction, t, setLocale }}>
            {children}
        </I18nContext.Provider>
    );
}
