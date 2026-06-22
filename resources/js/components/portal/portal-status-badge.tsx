const statusStyles: Record<string, { color: string; bg: string }> = {
    'Not Started': { color: '#555570', bg: '#1a1a24' },
    'Getting Started': { color: '#3b6cdb', bg: '#1a1a24' },
    'In Progress': { color: '#3b6cdb', bg: '#1a1a24' },
    'At Risk': { color: '#eab308', bg: '#1a1a24' },
    Completed: { color: '#22c55e', bg: '#1a1a24' },
    Archived: { color: '#555570', bg: '#1a1a24' },
};

interface PortalStatusBadgeProps {
    status: string;
}

export function PortalStatusBadge({ status }: PortalStatusBadgeProps) {
    const style = statusStyles[status] ?? { color: '#8b8b9e', bg: '#1a1a24' };

    return (
        <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: style.bg, color: style.color }}
        >
            {status}
        </span>
    );
}
