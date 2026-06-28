import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Container } from './container';

type SectionBackground = 'white' | 'muted' | 'navy' | 'dark';

const backgroundMap: Record<SectionBackground, string> = {
    white: 'bg-white',
    muted: 'bg-neutral-50',
    navy: 'bg-brand-navy-900 text-white',
    dark: 'bg-neutral-950 text-white',
};

export function Section({
    className,
    children,
    background = 'white',
    id,
    containerClassName,
}: {
    className?: string;
    children: ReactNode;
    background?: SectionBackground;
    id?: string;
    containerClassName?: string;
}) {
    return (
        <section
            id={id}
            className={cn(
                'section-padding',
                backgroundMap[background],
                className,
            )}
        >
            <Container className={containerClassName}>{children}</Container>
        </section>
    );
}
