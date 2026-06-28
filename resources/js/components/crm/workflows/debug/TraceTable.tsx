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
    if (val === null || val === undefined) return '\u2014';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    return String(val);
}

function formatOperator(op: string): string {
    const map: Record<string, string> = {
        '=': '=',
        '!=': '\u2260',
        '>': '>',
        '>=': '\u2265',
        '<': '<',
        '<=': '\u2264',
        contains: 'contains',
        starts_with: 'starts with',
        ends_with: 'ends with',
        in: 'in',
        not_in: 'not in',
    };
    return map[op] ?? op;
}

export default function TraceTable({ trace }: Props) {
    if (trace.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 text-[10px] tracking-wider text-gray-500 uppercase">
                    Trace Details
                </div>
                <p className="py-4 text-center text-xs text-gray-400">
                    No trace entries captured.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-[10px] tracking-wider text-gray-500 uppercase">
                Trace Details
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                                #
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                                Rule ID
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                                Field
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                                Op
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                                Actual
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                                Expected
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                                Result
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {trace.map((entry, i) => (
                            <tr
                                key={i}
                                className="border-b border-gray-100 last:border-0"
                            >
                                <td className="px-3 py-2 font-mono text-gray-400">
                                    {i + 1}
                                </td>
                                <td className="px-3 py-2 font-mono text-gray-400">
                                    {entry.ruleId}
                                </td>
                                <td className="px-3 py-2 font-mono text-gray-600">
                                    {entry.field}
                                </td>
                                <td className="px-3 py-2 font-mono text-gray-600">
                                    {formatOperator(entry.operator)}
                                </td>
                                <td className="px-3 py-2 font-mono text-gray-900">
                                    {formatValue(entry.actual)}
                                </td>
                                <td className="px-3 py-2 font-mono text-gray-900">
                                    {formatValue(entry.expected)}
                                </td>
                                <td className="px-3 py-2">
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                            entry.passed
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-red-50 text-red-600',
                                        )}
                                    >
                                        {entry.passed ? '\u2713' : '\u2717'}
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
