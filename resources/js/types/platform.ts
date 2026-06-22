export type PlatformFeature = {
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
};

export type AppInfo = {
    platform: 'ios' | 'android';
    name: string;
    url: string;
    rating?: string;
    downloads?: string;
};

export type PlatformStat = {
    label: string;
    labelAr: string;
    value: string;
    icon: string;
};

export type SellerBenefit = {
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
};

export type BuyerFeature = {
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
};
