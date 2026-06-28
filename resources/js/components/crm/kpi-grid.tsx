interface KpiGridProps {
    items: {
        label: string;
        value: string | number;
        color?: string;
        onClick?: () => void;
    }[];
}

export default function KpiGrid({ items }: KpiGridProps) {
    return (
        <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-[#e2e6ef] bg-[#e2e6ef] shadow-sm">
            {items.map((item, i) => (
                <button
                    key={i}
                    onClick={item.onClick}
                    className={`flex flex-col items-center gap-0.5 bg-white px-3 py-3 transition-all ${item.onClick ? 'cursor-pointer hover:bg-[#f8f9fc]' : 'cursor-default'}`}
                >
                    <span
                        className="text-lg font-semibold tracking-tight"
                        style={{ color: item.color ?? '#1a1a2e' }}
                    >
                        {item.value}
                    </span>
                    <span className="text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
                        {item.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
