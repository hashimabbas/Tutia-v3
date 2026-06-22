export type TeamMember = {
    id: string;
    name: string;
    role: string;
    roleAr: string;
    bio: string;
    bioAr: string;
    photo?: string;
    social?: {
        linkedin?: string;
        twitter?: string;
    };
};

export type Leadership = {
    id: string;
    name: string;
    title: string;
    titleAr: string;
    bio: string;
    bioAr: string;
    photo?: string;
};

export type Partner = {
    name: string;
    logo?: string;
    url?: string;
};

export type Client = {
    name: string;
    logo?: string;
    industry?: string;
    industryAr?: string;
};
