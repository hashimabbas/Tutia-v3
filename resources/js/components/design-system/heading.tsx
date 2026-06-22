import type { ReactNode, ElementType } from 'react';
import { cn } from '@/lib/utils';

type HeadingLevel = 'display' | 'h1' | 'h2' | 'h3' | 'h4';

const levelMap: Record<HeadingLevel, ElementType> = {
    display: 'h1',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
};

const styleMap: Record<HeadingLevel, string> = {
    display:
        'text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight',
    h1: 'text-[1.75rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.1] tracking-tight',
    h2: 'text-2xl md:text-[1.75rem] lg:text-[2.25rem] font-semibold leading-[1.15]',
    h3: 'text-lg md:text-xl lg:text-2xl font-semibold leading-[1.25]',
    h4: 'text-base md:text-lg lg:text-xl font-semibold leading-[1.3]',
};

export function Heading({
    level = 'h2',
    className,
    children,
    id,
}: {
    level?: HeadingLevel;
    className?: string;
    children: ReactNode;
    id?: string;
}) {
    const Tag = levelMap[level];

    return (
        <Tag id={id} className={cn(styleMap[level], 'text-brand-navy-900 dark:text-white', className)}>
            {children}
        </Tag>
    );
}
