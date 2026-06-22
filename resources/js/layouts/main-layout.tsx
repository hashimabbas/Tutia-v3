import type { ReactNode } from 'react';
import { Footer } from '@/components/navigation/footer';
import { Header } from '@/components/navigation/header';
import { SkipLink } from '@/components/shared/skip-link';

export default function MainLayout({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <>
            <SkipLink />
            <Header />
            <main
                id="main-content"
                className={`min-h-screen pt-[calc(4rem+var(--topbar-height,2.5rem))] ${className ?? ''}`}
            >
                {children}
            </main>
            <Footer />
        </>
    );
}
