interface Props {
    versions: { key: string; label: string }[]
    value: string
    onChange: (version: string) => void
    disabled?: boolean
}

export default function VersionSwitch({ versions, value, onChange, disabled }: Props) {
    if (versions.length < 2) return null

    return (
        <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#555570]">Conditions Mode:</span>
            <div className="flex rounded-md border border-[#1e1e2a] overflow-hidden">
                {versions.map(v => (
                    <button
                        key={v.key}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(v.key)}
                        className={`px-3 py-1 text-[11px] font-medium transition-colors ${
                            value === v.key
                                ? 'bg-[#2B4C8C] text-white'
                                : 'bg-[#0f0f14] text-[#555570] hover:text-[#8b8b9e]'
                        } disabled:opacity-50`}
                    >
                        {v.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
