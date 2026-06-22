export type CaseStudySection = {
    title: string;
    titleAr: string;
    content: string;
    contentAr: string;
};

export type CaseStudyTech = {
    name: string;
    nameAr: string;
};

export type CaseStudy = {
    id: string;
    slug: string;
    client: string;
    clientAr: string;
    industry: string;
    industryAr: string;
    heroImage?: string;
    heroImageAr?: string;
    summary: string;
    summaryAr: string;
    resultMetric: string;
    resultMetricAr: string;
    resultLabel: string;
    resultLabelAr: string;
    sections: CaseStudySection[];
    technologies: CaseStudyTech[];
    clientQuote: string;
    clientQuoteAr: string;
    clientLogo?: string;
    featured: boolean;
};
