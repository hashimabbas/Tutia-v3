import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HealthScoreBadgeProps {
    score: number;
    tier: string;
    size?: 'sm' | 'md' | 'lg';
    trend?: string;
    factors?: { name: string; weight: number; score: number }[];
}

const tierConfig = {
    healthy: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', label: 'Healthy' },
    at_risk: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', label: 'At Risk' },
    critical: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'Critical' },
};

const trendIcon: Record<string, string> = {
    improving: '↑',
    declining: '↓',
    stable: '→',
};

export default function HealthScoreBadge({ score, tier, size = 'md', trend, factors }: HealthScoreBadgeProps) {
    const config = tierConfig[tier as keyof typeof tierConfig] ?? tierConfig.at_risk;
    const sizeClasses = size === 'lg' ? 'text-sm px-3 py-1' : size === 'md' ? 'text-xs px-2.5 py-0.5' : 'text-[10px] px-2 py-0.5';

    const badge = (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses}`}
            style={{ backgroundColor: config.bg, color: config.color }}
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
            {score}
            {trend && <span className="text-[10px] opacity-70">{trendIcon[trend] ?? ''}</span>}
        </span>
    );

    if (!factors) return badge;

    return (
        <Tooltip>
            <TooltipTrigger asChild>{badge}</TooltipTrigger>
            <TooltipContent side="bottom" className="w-56 border-[#1e1e2a] bg-[#0f0f14] p-3 text-xs text-[#e8e8ed]">
                <div className="mb-2 text-[11px] font-medium">{score} — {config.label}</div>
                <div className="space-y-1.5">
                    {factors.map(f => (
                        <div key={f.name} className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="text-[#8b8b9e]">{f.name}</span>
                            <span className={f.score > 0 ? 'text-[#34d399]' : f.score < 0 ? 'text-[#f87171]' : 'text-[#555570]'}>
                                {f.score > 0 ? '+' : ''}{f.score}
                            </span>
                        </div>
                    ))}
                </div>
            </TooltipContent>
        </Tooltip>
    );
}
