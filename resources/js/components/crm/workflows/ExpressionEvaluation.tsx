import { cn } from '@/lib/utils';

interface MatchedRule {
    rule: string;
    passed: boolean;
}

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
    expression: string | null;
    matchedRules: MatchedRule[] | string[] | null;
    trace: TraceEntry[] | null;
    evaluatedRules: number;
    passedRules: number;
    status: string;
}

function isNewFormat(rules: MatchedRule[] | string[]): rules is MatchedRule[] {
    return rules.length > 0 && typeof rules[0] === 'object' && 'rule' in rules[0];
}

function isTraceFormat(trace: TraceEntry[] | null | undefined): trace is TraceEntry[] {
    return Array.isArray(trace) && trace.length > 0 && typeof trace[0] === 'object' && 'field' in trace[0];
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

function parseRuleLine(rule: string): { field: string; operator: string; value: string } | null {
    const match = rule.match(/^([A-Za-z_.]+)\s+(=|!=|>=|<=|>|<|in|not_in|contains|starts_with|ends_with)\s+(.+)$/);
    if (!match) return null;
    return { field: match[1], operator: match[2], value: match[3] };
}

function formatValue(val: unknown): string {
    if (val === null || val === undefined) return '\u2014';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    return String(val);
}

function RuleRow({ rule, passed }: { rule: string; passed: boolean }) {
    const parsed = parseRuleLine(rule);

    return (
        <div className="flex items-center gap-3 rounded-md px-3 py-2 text-xs">
            <span className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600',
            )}>
                {passed ? '\u2713' : '\u2717'}
            </span>
            {parsed ? (
                <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-gray-500">{parsed.field}</span>
                    <span className={cn(
                        'font-medium',
                        passed ? 'text-emerald-600' : 'text-red-600',
                    )}>
                        {formatOperator(parsed.operator)}
                    </span>
                    <span className="text-gray-900">{parsed.value}</span>
                </div>
            ) : (
                <span className="font-mono text-gray-900">{rule}</span>
            )}
        </div>
    );
}

function TraceRow({ entry }: { entry: TraceEntry }) {
    return (
        <div className={cn(
            'rounded-md border px-3 py-2.5',
            entry.passed
                ? 'border-emerald-200 bg-emerald-50/30'
                : 'border-red-200 bg-red-50/30',
        )}>
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className={cn(
                        'text-[10px]',
                        entry.passed ? 'text-emerald-600' : 'text-red-600',
                    )}>
                        {entry.passed ? '\u2713' : '\u2717'}
                    </span>
                    <span className="text-gray-500">{entry.field}</span>
                    <span className={cn(
                        'font-medium',
                        entry.passed ? 'text-emerald-600' : 'text-red-600',
                    )}>
                        {formatOperator(entry.operator)}
                    </span>
                    <span className="text-gray-900">{formatValue(entry.expected)}</span>
                </div>
                <span className={cn(
                    'text-[10px] font-medium',
                    entry.passed ? 'text-emerald-600' : 'text-red-600',
                )}>
                    {entry.passed ? 'Passed' : 'Failed'}
                </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-gray-500">
                <div>
                    <span className="text-gray-400">Actual: </span>
                    <span className="font-mono text-gray-600">{formatValue(entry.actual)}</span>
                </div>
                <div>
                    <span className="text-gray-400">Expected: </span>
                    <span className="font-mono text-gray-600">{formatValue(entry.expected)}</span>
                </div>
                <div>
                    <span className="text-gray-400">ID: </span>
                    <span className="font-mono text-gray-400">{entry.ruleId}</span>
                </div>
            </div>
        </div>
    );
}

export default function ExpressionEvaluation({
    expression,
    matchedRules,
    trace,
    evaluatedRules,
    passedRules,
    status,
}: Props) {
    const hasTrace = isTraceFormat(trace);

    if ((!matchedRules || matchedRules.length === 0) && !hasTrace) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                <p className="text-xs text-gray-500">No expression evaluation data available for this run.</p>
                <p className="mt-1 text-[10px] text-gray-400">
                    Expression evaluation results are only captured for v2 expression-based workflows.
                </p>
            </div>
        );
    }

    const passed = status === 'completed' || status === 'passed';
    const rules = matchedRules && matchedRules.length > 0
        ? (isNewFormat(matchedRules) ? matchedRules : matchedRules.map(r => ({ rule: r, passed })))
        : [];

    const rulesCount = rules.length;
    const rulesPassed = rules.filter(r => r.passed).length;
    const totalRules = evaluatedRules || rulesCount;
    const totalPassed = hasTrace ? trace.filter(t => t.passed).length : rulesPassed;

    return (
        <div className="space-y-4">
            {expression && (
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Expression</div>
                    <code className="text-sm text-gray-900 break-all font-mono">{expression}</code>
                </div>
            )}

            {rules.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Rule Evaluation</div>
                    <div className="space-y-1">
                        {rules.map((r, i) => (
                            <RuleRow key={i} rule={r.rule} passed={r.passed} />
                        ))}
                    </div>
                </div>
            )}

            {hasTrace && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Debug Trace</div>
                    <div className="space-y-2">
                        {trace.map((entry, i) => (
                            <TraceRow key={i} entry={entry} />
                        ))}
                    </div>
                </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Result</div>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                        passed
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-600',
                    )}>
                        <span className="text-[10px]">{passed ? '\u2713' : '\u2717'}</span>
                        {passed ? 'PASSED' : 'FAILED'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                        {totalPassed} of {totalRules} rules matched
                    </span>
                </div>
            </div>
        </div>
    );
}
