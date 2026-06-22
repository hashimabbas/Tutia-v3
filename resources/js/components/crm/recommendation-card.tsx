import { X, Lightbulb, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';

interface RecommendationCardProps {
    ruleKey: string;
    priority: string;
    title: string;
    context: string;
    suggestedAction: string;
    onDismiss?: () => void;
    onAction?: () => void;
}

const priorityConfig = {
    high: { icon: AlertCircle, color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
    medium: { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    low: { icon: Lightbulb, color: '#3b6cdb', bg: 'rgba(59,108,219,0.1)' },
};

export default function RecommendationCard({ priority, title, context, suggestedAction, onDismiss, onAction }: RecommendationCardProps) {
    const config = priorityConfig[priority as keyof typeof priorityConfig] ?? priorityConfig.low;
    const Icon = config.icon;

    return (
        <div className="group relative rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3 transition-colors hover:border-[#2a2a3a]">
            <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: config.bg }}>
                    <Icon className="h-3 w-3" style={{ color: config.color }} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="pr-5 text-xs font-medium text-[#e8e8ed]">{title}</div>
                    <div className="mt-0.5 text-[11px] text-[#8b8b9e]">{context}</div>
                    {onAction && (
                        <button
                            onClick={onAction}
                            className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#3b6cdb] transition-colors hover:text-[#5b8cfb]"
                        >
                            Take action
                            <ArrowRight className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded text-[#555570] opacity-0 transition-all hover:bg-[#1a1a24] hover:text-[#8b8b9e] group-hover:opacity-100"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}
