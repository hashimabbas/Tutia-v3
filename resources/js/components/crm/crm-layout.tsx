import type { ReactNode } from 'react';
import { CrmSidebar } from '@/components/crm/crm-sidebar';
import { CrmTopBar } from '@/components/crm/crm-top-bar';

export default function CrmLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0f]">
            <CrmSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <CrmTopBar />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
