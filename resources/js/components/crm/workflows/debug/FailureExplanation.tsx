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
    const regex =
        /[A-Za-z_.]+(?:\s+(?:=|\!=|>=|<=|>|<|contains|starts_with|ends_with|in|not_in)\s+(?:"[^"]*"|'[^']*'|[A-Za-z_0-9.]+))+/g;
    const matches = expression.match(regex);
    return matches ? matches.map((m) => m.trim()) : [];
}

function generateSummary(trace: TraceEntry[], passed: boolean): string {
    if (passed) return 'All expression rules passed successfully.';

    const failed = trace.filter((t) => !t.passed);
    if (failed.length === 0) return 'Workflow failed for an unknown reason.';

    if (failed.length === 1) {
        const f = failed[0];
        return `Workflow stopped because ${f.rule} \u2014 expected ${formatValue(f.expected)} but actual value was ${formatValue(f.actual)}.`;
    }

    const first = failed[0];
    return `Workflow failed: ${first.rule} expected ${formatValue(first.expected)} but got ${formatValue(first.actual)} (and ${failed.length - 1} more rule${failed.length - 1 === 1 ? '' : 's'} failed).`;
}

export default function FailureExplanation({
    trace,
    passed,
    evaluatedRules,
    passedRules,
}: Props) {
    const failed = trace.filter((t) => !t.passed);
    const skippedCount = evaluatedRules - trace.length;

    if (passed) {
        return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
                <div className="mb-2 text-[10px] tracking-wider text-emerald-600 uppercase">
                    Explanation
                </div>
                <p className="text-xs text-gray-900">
                    {generateSummary(trace, passed)}
                </p>
                <p className="mt-1 text-[10px] text-emerald-600/70">
                    {passedRules} of {evaluatedRules} rules matched
                    successfully.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="rounded-xl border border-red-200 bg-red-50/30 p-4">
                <div className="mb-2 text-[10px] tracking-wider text-red-600 uppercase">
                    Explanation
                </div>
                <p className="text-xs text-gray-900">
                    {generateSummary(trace, passed)}
                </p>
            </div>

            {failed.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 text-[10px] tracking-wider text-gray-500 uppercase">
                        Failed Rules
                    </div>
                    <div className="space-y-1.5">
                        {failed.map((f, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 rounded bg-red-50/30 px-3 py-2"
                            >
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-[10px] text-red-600">
                                    {'\u2717'}
                                </span>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 font-mono text-xs">
                                        <span className="text-gray-600">
                                            {f.field}
                                        </span>
                                        <span className="text-red-600">
                                            {f.operator}
                                        </span>
                                        <span className="text-gray-900">
                                            {formatValue(f.expected)}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-[10px] text-gray-500">
                                        Expected{' '}
                                        <span className="font-mono text-gray-600">
                                            {formatValue(f.expected)}
                                        </span>{' '}
                                        but received{' '}
                                        <span className="font-mono text-gray-600">
                                            {formatValue(f.actual)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {skippedCount > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 text-[10px] tracking-wider text-gray-500 uppercase">
                        Skipped Rules
                    </div>
                    <p className="text-[10px] text-gray-500">
                        {skippedCount} rule{skippedCount === 1 ? '' : 's'} were
                        not evaluated due to short-circuit logic. The expression
                        result was determined before these rules could be
                        reached.
                    </p>
                </div>
            )}
        </div>
    );
}
