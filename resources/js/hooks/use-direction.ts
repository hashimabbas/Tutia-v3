import { useEffect } from 'react';
import type { Direction, Locale } from '@/types';

export function useDirection(locale: Locale): Direction {
    const direction: Direction = locale === 'ar' ? 'rtl' : 'ltr';

    useEffect(() => {
        document.documentElement.dir = direction;
        document.documentElement.lang = locale;
    }, [direction, locale]);

    return direction;
}
