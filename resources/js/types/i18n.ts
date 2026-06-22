export type Locale = 'en' | 'ar';

export type Direction = 'ltr' | 'rtl';

export type LocaleConfig = {
    code: Locale;
    direction: Direction;
    label: string;
    labelAr: string;
    flag: string;
};
