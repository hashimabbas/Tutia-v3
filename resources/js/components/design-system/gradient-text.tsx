import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function GradientText({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <span
            className={cn(
                'bg-linear-to-r from-brand-navy-500 to-brand-gold-500 bg-clip-text text-transparent',
                className,
            )}
        >
            {children}
        </span>
    );
}
