import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Factor {
    key: string;
    label: string;
    max_score: number;
    score: number;
    details?: string;
}

interface HealthBreakdownPanelProps {
    score: number;
    tier: string;
    factors: Factor[];
    trend?: string;
}

const tierConfig: Record<string, { color: string; bg: string; label: string }> = {
    healthy: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', label: 'Healthy' },
    at_risk: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', label: 'At Risk' },
    critical: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'Critical' },
};

const trendIcon: Record<string, string> = {
    improving: '↑',
    declining: '↓',
    stable: '→',
};

export default function HealthBreakdownPanel({ score, tier, factors, trend }: HealthBreakdownPanelProps) {
    const config = tierConfig[tier] ?? tierConfig.at_risk;

    return (
        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold" style={{ color: config.color }}>{score}</span>
                    <div>
                        <div className="text-xs font-medium text-[#e8e8ed]">Delivery Health</div>
                        <div className="text-[10px]" style={{ color: config.color }}>{config.label} {trend ? trendIcon[trend] ?? '' : ''}</div>
                    </div>
                </div>
                <div className="h-10 w-10 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: config.color, color: config.color }}>
                    {score}
                </div>
            </div>
            <div className="space-y-1.5">
                {factors.map(f => {
                    const pct = f.max_score > 0 ? Math.round((f.score / f.max_score) * 100) : 0;
                    return (
                        <Tooltip key={f.key}>
                            <TooltipTrigger asChild>
                                <div className="group cursor-default">
                                    <div className="mb-0.5 flex items-center justify-between">
                                        <span className="text-[11px] text-[#8b8b9e]">{f.label}</span>
                                        <span className="text-[11px] font-medium" style={{ color: f.score >= 0 ? '#34d399' : '#f87171' }}>
                                            {f.score > 0 ? '+' : ''}{f.score}/{f.max_score}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a24]">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${pct}%`,
                                                backgroundColor: pct >= 70 ? '#34d399' : pct >= 40 ? '#fbbf24' : '#f87171',
                                            }}
                                        />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            {f.details && (
                                <TooltipContent side="bottom" className="border-[#1e1e2a] bg-[#0f0f14] p-2 text-[10px] text-[#8b8b9e] max-w-48">
                                    {f.details}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
}
