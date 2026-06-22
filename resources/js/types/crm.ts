export type FormType =
    | 'quick-contact'
    | 'demo-request'
    | 'consultation'
    | 'proposal'
    | 'quote'
    | 'seller-registration'
    | 'newsletter'
    | 'resource-download';

export type LeadStage =
    | 'new'
    | 'contacted'
    | 'qualified'
    | 'proposal-sent'
    | 'negotiating'
    | 'closed-won'
    | 'closed-lost'
    | 'on-hold';

export type LeadSource = 'google' | 'social' | 'referral' | 'direct' | 'whatsapp' | 'phone';

export type QuickContactData = {
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
};

export type DemoRequestData = {
    name: string;
    email: string;
    phone: string;
    company: string;
    service: string;
    preferredDate: string;
};

export type ConsultationData = {
    name: string;
    email: string;
    phone: string;
    company?: string;
    brief: string;
    timeSlot: string;
};

export type ProposalData = {
    projectType: string;
    budget: string;
    timeline: string;
    requirements: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
};

export type QuoteData = {
    name: string;
    email: string;
    phone: string;
    service: string;
    requirements: string;
};

export type SellerRegistrationData = {
    businessName: string;
    ownerName: string;
    phone: string;
    email: string;
    category: string;
    location: string;
};

export type NewsletterData = {
    email: string;
};

export type FormSubmission<T = Record<string, unknown>> = {
    type: FormType;
    data: T;
    source: LeadSource;
    page: string;
};
