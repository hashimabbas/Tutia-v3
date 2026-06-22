export type CompanyInfo = {
    name: string;
    tagline: string;
    taglineAr: string;
    phone: string[];
    email: string;
    address: string;
    addressAr: string;
    poBox: string;
    social: {
        facebook: string;
        twitter: string;
        instagram: string;
        linkedin: string;
        whatsapp: string;
    };
};

export type Value = {
    id: string;
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
};

export type Stat = {
    label: string;
    labelAr: string;
    value: number;
    suffix?: string;
    suffixAr?: string;
};

export type BrandTestimonial = {
    id: string;
    quote: string;
    quoteAr: string;
    author: string;
    company: string;
    role?: string;
    roleAr?: string;
    avatar?: string;
};
