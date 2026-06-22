export type ServiceCategory = {
    id: string;
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
    services: Service[];
};

export type Service = {
    slug: string;
    title: string;
    titleAr: string;
    shortDescription: string;
    shortDescriptionAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
    features: string[];
    featuresAr: string[];
    benefits: string[];
    benefitsAr: string[];
    process: ProcessStep[];
    processAr: ProcessStep[];
    cta: string;
    ctaAr: string;
    href: string;
    category: string;
};

export type ProcessStep = {
    step: number;
    title: string;
    description: string;
};
