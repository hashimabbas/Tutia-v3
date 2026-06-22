import { Bell } from 'lucide-react';

interface PortalTopbarProps {
    title?: string;
}

export function PortalTopbar({ title }: PortalTopbarProps) {
    return (
        <header className="flex h-14 items-center justify-between border-b border-[#1e1e2a] bg-[#0f0f14] px-4">
            <div>
                {title && <h1 className="text-base font-semibold text-[#e8e8ed]">{title}</h1>}
            </div>
            <button className="relative rounded-lg p-2 text-[#8b8b9e] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#3b6cdb]" />
            </button>
        </header>
    );
}
