interface KpiGridProps {
    items: { label: string; value: string | number; color?: string; onClick?: () => void }[];
}

export default function KpiGrid({ items }: KpiGridProps) {
    return (
        <div className="grid grid-cols-4 gap-px rounded-lg border border-[#1e1e2a] bg-[#1e1e2a] overflow-hidden">
            {items.map((item, i) => (
                <button
                    key={i}
                    onClick={item.onClick}
                    className={`flex flex-col items-center gap-0.5 bg-[#0f0f14] px-3 py-2.5 transition-colors ${item.onClick ? 'hover:bg-[#14141e] cursor-pointer' : 'cursor-default'}`}
                >
                    <span className="text-sm font-semibold" style={{ color: item.color ?? '#e8e8ed' }}>
                        {item.value}
                    </span>
                    <span className="text-[10px] text-[#555570]">{item.label}</span>
                </button>
            ))}
        </div>
    );
}
