interface ProjectStatusBadgeProps {
    status: string;
}

const statusConfig: Record<
    string,
    { color: string; bg: string; label: string }
> = {
    planned: { color: '#555570', bg: 'rgba(85,85,112,0.15)', label: 'Planned' },
    initiating: {
        color: '#3b6cdb',
        bg: 'rgba(59,108,219,0.15)',
        label: 'Initiating',
    },
    active: { color: '#34d399', bg: 'rgba(52,211,153,0.15)', label: 'Active' },
    at_risk: {
        color: '#fbbf24',
        bg: 'rgba(251,191,36,0.15)',
        label: 'At Risk',
    },
    completed: {
        color: '#34d399',
        bg: 'rgba(52,211,153,0.15)',
        label: 'Completed',
    },
    archived: {
        color: '#555570',
        bg: 'rgba(85,85,112,0.15)',
        label: 'Archived',
    },
};

export default function ProjectStatusBadge({
    status,
}: ProjectStatusBadgeProps) {
    const config = statusConfig[status] ?? {
        color: '#555570',
        bg: 'rgba(85,85,112,0.15)',
        label: status,
    };
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: config.bg, color: config.color }}
        >
            <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: config.color }}
            />
            {config.label}
        </span>
    );
}
