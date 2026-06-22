import { cn } from '@/lib/utils';

interface TraceEntry {
    field: string;
    operator: string;
    expected: string | number | boolean | null;
    actual: string | number | boolean | null;
    passed: boolean;
    rule: string;
    ruleId: string;
}

interface Props {
    trace: TraceEntry[];
}

function formatValue(val: unknown): string {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    return String(val);
}

function formatOperator(op: string): string {
    const map: Record<string, string> = {
        '=': '=', '!=': '≠', '>': '>', '>=': '≥', '<': '<', '<=': '≤',
        contains: 'contains', starts_with: 'starts with', ends_with: 'ends with', in: 'in', not_in: 'not in',
    };
    return map[op] ?? op;
}

export default function TraceTable({ trace }: Props) {
    if (trace.length === 0) {
        return (
            <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                <div className="text-[10px] uppercase tracking-wider text-[#555570] mb-3">Trace Details</div>
                <p className="text-xs text-center text-[#555570] py-4">No trace entries captured.</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
            <div className="text-[10px] uppercase tracking-wider text-[#555570] mb-3">Trace Details</div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-[#1e1e2a]">
                            <th className="px-3 py-2 text-left text-[10px] text-[#555570] font-medium uppercase tracking-wider">#</th>
                            <th className="px-3 py-2 text-left text-[10px] text-[#555570] font-medium uppercase tracking-wider">Rule ID</th>
                            <th className="px-3 py-2 text-left text-[10px] text-[#555570] font-medium uppercase tracking-wider">Field</th>
                            <th className="px-3 py-2 text-left text-[10px] text-[#555570] font-medium uppercase tracking-wider">Op</th>
                            <th className="px-3 py-2 text-left text-[10px] text-[#555570] font-medium uppercase tracking-wider">Actual</th>
                            <th className="px-3 py-2 text-left text-[10px] text-[#555570] font-medium uppercase tracking-wider">Expected</th>
                            <th className="px-3 py-2 text-left text-[10px] text-[#555570] font-medium uppercase tracking-wider">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trace.map((entry, i) => (
                            <tr key={i} className="border-b border-[#1e1e2a]/50 last:border-0">
                                <td className="px-3 py-2 text-[#555570] font-mono">{i + 1}</td>
                                <td className="px-3 py-2 font-mono text-[#555570]">{entry.ruleId}</td>
                                <td className="px-3 py-2 font-mono text-[#8b8b9e]">{entry.field}</td>
                                <td className="px-3 py-2 font-mono text-[#8b8b9e]">{formatOperator(entry.operator)}</td>
                                <td className="px-3 py-2 font-mono text-[#e8e8ed]">{formatValue(entry.actual)}</td>
                                <td className="px-3 py-2 font-mono text-[#e8e8ed]">{formatValue(entry.expected)}</td>
                                <td className="px-3 py-2">
                                    <span className={cn(
                                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                        entry.passed
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-red-400/10 text-red-400',
                                    )}>
                                        {entry.passed ? '✓' : '✗'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
