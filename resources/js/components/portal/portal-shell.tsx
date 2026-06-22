import type { ReactNode } from 'react';
import { PortalSidebar } from '@/components/portal/portal-sidebar';
import { PortalTopbar } from '@/components/portal/portal-topbar';

interface PortalShellProps {
    children: ReactNode;
    title?: string;
}

export default function PortalShell({ children, title }: PortalShellProps) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0f]">
            <PortalSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <PortalTopbar title={title} />
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
