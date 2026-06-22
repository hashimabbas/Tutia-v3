import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function NavLink({
    href,
    children,
    className,
    active = false,
    onClick,
}: {
    href: string;
    children: ReactNode;
    className?: string;
    active?: boolean;
    onClick?: () => void;
}) {
    const isExternal = href.startsWith('http');

    if (isExternal) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    'inline-flex items-center px-3 py-2 text-sm font-medium transition-colors',
                    active
                        ? 'text-brand-navy-500'
                        : 'text-neutral-700 hover:text-brand-navy-500 dark:text-neutral-200 dark:hover:text-brand-navy-300',
                    className,
                )}
            >
                {children}
            </a>
        );
    }

    return (
        <Link
            href={href}
            className={cn(
                'inline-flex items-center px-3 py-2 text-sm font-medium transition-colors',
                active
                    ? 'text-brand-navy-500'
                    : 'text-neutral-700 hover:text-brand-navy-500 dark:text-neutral-200 dark:hover:text-brand-navy-300',
                className,
            )}
            onClick={onClick}
        >
            {children}
        </Link>
    );
}
