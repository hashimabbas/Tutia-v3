import { createContext, useContext } from 'react';
import type { Locale, Direction } from '@/types';
import { ar } from './locales/ar';
import { en } from './locales/en';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeepRecord extends Record<string, string | DeepRecord> {}

const translations: Record<Locale, DeepRecord> = {
    en: en as DeepRecord,
    ar: ar as DeepRecord,
};

function getNestedValue(obj: DeepRecord, path: string): string {
    const keys = path.split('.');
    let current: DeepRecord | string = obj;

    for (const key of keys) {
        if (typeof current === 'object' && current !== null && key in current) {
            const value: DeepRecord | string = current[key];

            if (typeof value === 'string') {
                current = value;
            } else {
                current = value;
            }
        } else {
            return path;
        }
    }

    return typeof current === 'string' ? current : path;
}

export function t(locale: Locale, key: string): string {
    const translation = translations[locale];

    if (!translation) {
        return key;
    }

    return getNestedValue(translation, key);
}

export function getDirection(locale: Locale): Direction {
    return locale === 'ar' ? 'rtl' : 'ltr';
}

export type I18nContextType = {
    locale: Locale;
    direction: Direction;
    t: (key: string) => string;
    setLocale: (locale: Locale) => void;
};

export const I18nContext = createContext<I18nContextType | null>(null);

export function useI18n(): I18nContextType {
    const context = useContext(I18nContext);

    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }

    return context;
}
