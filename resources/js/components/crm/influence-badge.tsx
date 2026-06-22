import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface InfluenceBadgeProps {
    slug: string | null;
    name?: string;
    size?: 'sm' | 'md';
}

const influenceConfig: Record<string, { label: string; color: string; bg: string }> = {
    decision_maker: { label: 'DM', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
    influencer: { label: 'IN', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
    champion: { label: 'CH', color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
    blocker: { label: 'BL', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
};

export default function InfluenceBadge({ slug, name, size = 'sm' }: InfluenceBadgeProps) {
    if (!slug) return null;

    const config = influenceConfig[slug];
    if (!config) return null;

    const sizeClasses = size === 'md' ? 'h-5 min-w-5 text-[10px]' : 'h-4 min-w-4 text-[9px]';

    const badge = (
        <span
            className={`inline-flex items-center justify-center rounded px-1 font-semibold uppercase leading-none ${sizeClasses}`}
            style={{ backgroundColor: config.bg, color: config.color }}
        >
            {config.label}
        </span>
    );

    if (name) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{badge}</TooltipTrigger>
                <TooltipContent side="top" className="border-[#1e1e2a] bg-[#0f0f14] text-[11px] text-[#e8e8ed]">
                    {name}
                </TooltipContent>
            </Tooltip>
        );
    }

    return badge;
}
