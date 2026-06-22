const tierConfig: Record<string, { color: string; label: string }> = {
    'On Track': { color: '#22c55e', label: 'On Track' },
    'At Risk': { color: '#eab308', label: 'At Risk' },
    Behind: { color: '#ef4444', label: 'Behind' },
    Unknown: { color: '#555570', label: 'Unknown' },
};

interface PortalHealthBadgeProps {
    tier: string;
}

export function PortalHealthBadge({ tier }: PortalHealthBadgeProps) {
    const config = tierConfig[tier] ?? tierConfig.Unknown;

    return (
        <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
                backgroundColor: `${config.color}14`,
                color: config.color,
            }}
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
            {config.label}
        </span>
    );
}
