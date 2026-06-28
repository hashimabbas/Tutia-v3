import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Container({
    className,
    children,
    as: Tag = 'div',
}: {
    className?: string;
    children: ReactNode;
    as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';
}) {
    return <Tag className={cn('container-main', className)}>{children}</Tag>;
}
