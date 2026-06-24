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
            <span className="text-[11px] font-medium text-gray-500">Conditions Mode:</span>
            <div className="flex rounded-md border border-gray-200 overflow-hidden">
                {versions.map(v => (
                    <button
                        key={v.key}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(v.key)}
                        className={`px-3 py-1 text-[11px] font-medium transition-colors ${
                            value === v.key
                                ? 'bg-[#2B4C8C] text-white'
                                : 'bg-white text-gray-500 hover:text-gray-700'
                        } disabled:opacity-50`}
                    >
                        {v.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
