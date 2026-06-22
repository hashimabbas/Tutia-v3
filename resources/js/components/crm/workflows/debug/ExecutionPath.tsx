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
    expression: string | null;
}

function formatOperator(op: string): string {
    const map: Record<string, string> = {
        '=': '=', '!=': '≠', '>': '>', '>=': '≥', '<': '<', '<=': '≤',
        contains: 'contains', starts_with: 'starts with', ends_with: 'ends with', in: 'in', not_in: 'not in',
    };
    return map[op] ?? op;
}

function formatValue(val: unknown): string {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    return String(val);
}

function extractComparisonRules(expression: string): string[] {
    const regex = /[A-Za-z_.]+(?:\s+(?:=|\!=|>=|<=|>|<|contains|starts_with|ends_with|in|not_in)\s+(?:"[^"]*"|'[^']*'|[A-Za-z_0-9.]+))+/g;
    const matches = expression.match(regex);
    return matches ? matches.map(m => m.trim()) : [];
}

interface Step {
    type: 'evaluated' | 'skipped';
    rule: string;
    passed?: boolean;
    actual?: string | number | boolean | null;
    expected?: string | number | boolean | null;
    field?: string;
}

function buildSteps(trace: TraceEntry[], expression: string | null): Step[] {
    if (!expression) {
        return trace.map(t => ({
            type: 'evaluated' as const,
            rule: t.rule,
            passed: t.passed,
            actual: t.actual,
            expected: t.expected,
            field: t.field,
        }));
    }

    const allRules = extractComparisonRules(expression);
    const traceRuleSet = new Set(trace.map(t => t.rule));
    const steps: Step[] = [];

    let traceIdx = 0;
    for (const ruleText of allRules) {
        if (traceRuleSet.has(ruleText) && traceIdx < trace.length) {
            const t = trace[traceIdx];
            steps.push({ type: 'evaluated', rule: t.rule, passed: t.passed, actual: t.actual, expected: t.expected, field: t.field });
            traceIdx++;
        } else {
            steps.push({ type: 'skipped', rule: ruleText });
        }
    }

    return steps;
}

export default function ExecutionPath({ trace, expression }: Props) {
    const steps = buildSteps(trace, expression);

    if (steps.length === 0) {
        return (
            <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                <div className="text-[10px] uppercase tracking-wider text-[#555570] mb-3">Execution Path</div>
                <p className="text-xs text-center text-[#555570] py-4">No execution path available.</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
            <div className="text-[10px] uppercase tracking-wider text-[#555570] mb-3">Execution Path</div>
            <div className="relative">
                {steps.map((step, i) => (
                    <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                        <div className="flex flex-col items-center">
                            <span className={cn(
                                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold z-10',
                                step.type === 'skipped'
                                    ? 'bg-[#1a1a24] text-[#555570]'
                                    : step.passed
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-red-400/10 text-red-400',
                            )}>
                                {step.type === 'skipped' ? '⏭' : (step.passed ? '✓' : '✗')}
                            </span>
                            {i < steps.length - 1 && (
                                <div className="mt-0.5 w-px flex-1 bg-[#1e1e2a]" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1 pt-1">
                            {step.type === 'skipped' ? (
                                <div>
                                    <span className="text-xs font-mono text-[#555570]">{step.rule}</span>
                                    <p className="text-[10px] text-[#555570] mt-0.5">
                                        Not evaluated — short-circuit prevented execution
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-1.5 font-mono text-xs">
                                        <span className="text-[#8b8b9e]">{step.field}</span>
                                        <span className={cn('font-medium', step.passed ? 'text-emerald-400' : 'text-red-400')}>
                                            {formatOperator(trace[0]?.operator || '')}
                                        </span>
                                        <span className="text-[#e8e8ed]">{formatValue(step.expected)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[#555570]">
                                        <div>
                                            Actual: <span className="font-mono text-[#8b8b9e]">{formatValue(step.actual)}</span>
                                        </div>
                                        <span className={cn(
                                            'text-[10px] font-medium',
                                            step.passed ? 'text-emerald-400' : 'text-red-400',
                                        )}>
                                            {step.passed ? 'Passed' : 'Failed'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
