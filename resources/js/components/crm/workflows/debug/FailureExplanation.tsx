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
    passed: boolean;
    evaluatedRules: number;
    passedRules: number;
}

function formatValue(val: unknown): string {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
}

function extractComparisonRules(expression: string): string[] {
    const regex = /[A-Za-z_.]+(?:\s+(?:=|\!=|>=|<=|>|<|contains|starts_with|ends_with|in|not_in)\s+(?:"[^"]*"|'[^']*'|[A-Za-z_0-9.]+))+/g;
    const matches = expression.match(regex);
    return matches ? matches.map(m => m.trim()) : [];
}

function generateSummary(trace: TraceEntry[], passed: boolean): string {
    if (passed) return 'All expression rules passed successfully.';

    const failed = trace.filter(t => !t.passed);
    if (failed.length === 0) return 'Workflow failed for an unknown reason.';

    if (failed.length === 1) {
        const f = failed[0];
        return `Workflow stopped because ${f.rule} — expected ${formatValue(f.expected)} but actual value was ${formatValue(f.actual)}.`;
    }

    const first = failed[0];
    return `Workflow failed: ${first.rule} expected ${formatValue(first.expected)} but got ${formatValue(first.actual)} (and ${failed.length - 1} more rule${failed.length - 1 === 1 ? '' : 's'} failed).`;
}

export default function FailureExplanation({ trace, passed, evaluatedRules, passedRules }: Props) {
    const failed = trace.filter(t => !t.passed);
    const skippedCount = evaluatedRules - trace.length;

    if (passed) {
        return (
            <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.02] p-4">
                <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">Explanation</div>
                <p className="text-xs text-[#e8e8ed]">
                    {generateSummary(trace, passed)}
                </p>
                <p className="text-[10px] text-emerald-400/70 mt-1">
                    {passedRules} of {evaluatedRules} rules matched successfully.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="rounded-lg border border-red-400/10 bg-red-400/[0.02] p-4">
                <div className="text-[10px] uppercase tracking-wider text-red-400 mb-2">Explanation</div>
                <p className="text-xs text-[#e8e8ed]">{generateSummary(trace, passed)}</p>
            </div>

            {failed.length > 0 && (
                <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                    <div className="text-[10px] uppercase tracking-wider text-[#555570] mb-2">Failed Rules</div>
                    <div className="space-y-1.5">
                        {failed.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 rounded bg-red-400/[0.02] px-3 py-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-[10px] text-red-400">✗</span>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 font-mono text-xs">
                                        <span className="text-[#8b8b9e]">{f.field}</span>
                                        <span className="text-red-400">{f.operator}</span>
                                        <span className="text-[#e8e8ed]">{formatValue(f.expected)}</span>
                                    </div>
                                    <p className="text-[10px] text-[#555570] mt-0.5">
                                        Expected <span className="font-mono text-[#8b8b9e]">{formatValue(f.expected)}</span> but received <span className="font-mono text-[#8b8b9e]">{formatValue(f.actual)}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {skippedCount > 0 && (
                <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                    <div className="text-[10px] uppercase tracking-wider text-[#555570] mb-2">Skipped Rules</div>
                    <p className="text-[10px] text-[#555570]">
                        {skippedCount} rule{skippedCount === 1 ? '' : 's'} were not evaluated due to short-circuit logic. The expression result
                        was determined before these rules could be reached.
                    </p>
                </div>
            )}
        </div>
    );
}
