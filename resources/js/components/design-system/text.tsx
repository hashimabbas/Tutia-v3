import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TextVariant = 'body-lg' | 'body' | 'body-sm' | 'caption' | 'overline';

const variantMap: Record<TextVariant, string> = {
    'body-lg': 'text-base md:text-lg leading-relaxed',
    body: 'text-sm md:text-base leading-relaxed',
    'body-sm': 'text-sm md:text-sm leading-relaxed',
    caption: 'text-xs leading-snug text-neutral-500',
    overline:
        'text-xs md:text-sm font-semibold uppercase tracking-widest text-brand-navy-500',
};

export function Text({
    variant = 'body',
    className,
    children,
    as: Tag = 'p',
    muted = false,
}: {
    variant?: TextVariant;
    className?: string;
    children: ReactNode;
    as?: 'p' | 'span' | 'div' | 'label';
    muted?: boolean;
}) {
    return (
        <Tag
            className={cn(
                variantMap[variant],
                muted && 'text-neutral-500',
                !muted &&
                    variant === 'body' &&
                    'text-neutral-700 dark:text-neutral-300',
                className,
            )}
        >
            {children}
        </Tag>
    );
}
