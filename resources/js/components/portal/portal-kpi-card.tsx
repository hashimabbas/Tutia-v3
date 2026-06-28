import type { LucideIcon } from 'lucide-react';

interface PortalKpiCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    subtext?: string;
    color?: string;
}

export function PortalKpiCard({
    icon: Icon,
    label,
    value,
    subtext,
    color = '#3b6cdb',
}: PortalKpiCardProps) {
    return (
        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
            <div className="mb-2 flex items-center gap-2">
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${color}14` }}
                >
                    <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <span className="text-[11px] text-[#8b8b9e]">{label}</span>
            </div>
            <div className="text-xl font-bold text-[#e8e8ed]">{value}</div>
            {subtext && (
                <p className="mt-0.5 text-[10px] text-[#555570]">{subtext}</p>
            )}
        </div>
    );
}
