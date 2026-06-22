import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

export function FooterColumn({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                {title}
            </h3>
            <ul className="space-y-2">{children}</ul>
        </div>
    );
}

export function FooterLink({
    href,
    children,
}: {
    href: string;
    children: ReactNode;
}) {
    return (
        <li>
            <Link
                href={href}
                className="text-sm text-neutral-500 transition-colors hover:text-brand-navy-500 dark:text-neutral-400 dark:hover:text-brand-navy-300"
            >
                {children}
            </Link>
        </li>
    );
}
