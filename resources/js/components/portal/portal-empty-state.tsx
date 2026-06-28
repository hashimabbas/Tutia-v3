import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface PortalEmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
}

export function PortalEmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
}: PortalEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1a24]">
                <Icon className="h-6 w-6 text-[#555570]" />
            </div>
            <h3 className="text-sm font-medium text-[#e8e8ed]">{title}</h3>
            {description && (
                <p className="mt-1 text-[11px] text-[#8b8b9e]">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-3 rounded-lg bg-[#3b6cdb] px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#2d56b0]"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
