import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
};

export type MegaMenuItem = {
    title: string;
    titleAr: string;
    href: string;
    description?: string;
    descriptionAr?: string;
    icon?: LucideIcon;
};

export type MegaMenuCategory = {
    title: string;
    titleAr: string;
    items: MegaMenuItem[];
};

export type HeaderNavItem = {
    label: string;
    labelAr: string;
    href: string;
    hasMegaMenu?: boolean;
    megaMenuCategories?: MegaMenuCategory[];
};
