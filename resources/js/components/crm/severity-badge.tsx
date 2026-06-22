interface SeverityBadgeProps {
    severity: string;
    size?: 'sm' | 'md';
}

const severityConfig: Record<string, { color: string; bg: string; label: string }> = {
    blocker: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'Blocker' },
    critical: { color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: 'Critical' },
    high: { color: '#f97316', bg: 'rgba(249,115,22,0.15)', label: 'High' },
    major: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Major' },
    medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Medium' },
    low: { color: '#3b6cdb', bg: 'rgba(59,108,219,0.15)', label: 'Low' },
    minor: { color: '#555570', bg: 'rgba(85,85,112,0.15)', label: 'Minor' },
};

export default function SeverityBadge({ severity, size = 'sm' }: SeverityBadgeProps) {
    const config = severityConfig[severity] ?? { color: '#555570', bg: 'rgba(85,85,112,0.15)', label: severity };
    const px = size === 'md' ? 'px-2.5 py-0.5' : 'px-1.5 py-0.5';
    const fs = size === 'md' ? 'text-[11px]' : 'text-[9px]';
    return (
        <span
            className={`inline-flex items-center rounded-full font-medium ${px} ${fs}`}
            style={{ backgroundColor: config.bg, color: config.color }}
        >
            {config.label}
        </span>
    );
}
