export type CapabilityPillar = {
    id: string;
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
    href: string;
};

export type Industry = {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
};

export type CaseStudyPreview = {
    id: string;
    title: string;
    titleAr: string;
    summary: string;
    summaryAr: string;
    resultMetric: string;
    resultMetricAr: string;
    resultLabel: string;
    resultLabelAr: string;
    href: string;
};

export type Differentiator = {
    id: string;
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
};

export type FeaturedService = {
    id: string;
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    features: string[];
    featuresAr: string[];
    href: string;
};

export type MatgerStat = {
    value: string;
    label: string;
    labelAr: string;
};
