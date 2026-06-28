import {
    X,
    Lightbulb,
    AlertTriangle,
    AlertCircle,
    ArrowRight,
} from 'lucide-react';

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
    high: { icon: AlertCircle, color: 'text-[#dc2626]', bg: 'bg-red-100' },
    medium: {
        icon: AlertTriangle,
        color: 'text-[#d97706]',
        bg: 'bg-amber-100',
    },
    low: { icon: Lightbulb, color: 'text-[#2563eb]', bg: 'bg-blue-100' },
};

export default function RecommendationCard({
    priority,
    title,
    context,
    suggestedAction,
    onDismiss,
    onAction,
}: RecommendationCardProps) {
    const config =
        priorityConfig[priority as keyof typeof priorityConfig] ??
        priorityConfig.low;
    const Icon = config.icon;

    return (
        <div className="group relative rounded-lg border border-border/60 bg-white p-3 shadow-xs transition-all duration-200 hover:border-border hover:shadow-sm">
            <div className="flex items-start gap-2.5">
                <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                >
                    <Icon className={`h-3 w-3 ${config.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="pr-5 text-xs font-semibold text-foreground">
                        {title}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {context}
                    </div>
                    {onAction && (
                        <button
                            onClick={onAction}
                            className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-primary transition-all duration-200 hover:text-primary/80"
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
                    className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded text-muted-foreground/40 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-muted hover:text-muted-foreground"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}
