import ExecutionSummary from './ExecutionSummary';
import TraceTable from './TraceTable';
import ExecutionPath from './ExecutionPath';
import FailureExplanation from './FailureExplanation';

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
    trace: TraceEntry[] | null;
    matchedRules: unknown[] | null;
    evaluatedRules: number;
    passedRules: number;
    status: string;
}

function isTraceFormat(trace: TraceEntry[] | null | undefined): trace is TraceEntry[] {
    return Array.isArray(trace) && trace.length > 0 && typeof trace[0] === 'object' && 'field' in trace[0];
}

export default function WorkflowDebugConsole({
    expression,
    trace,
    matchedRules,
    evaluatedRules,
    passedRules,
    status,
}: Props) {
    const hasTrace = isTraceFormat(trace);
    const passed = status === 'completed' || status === 'passed';

    if (!expression && !hasTrace) {
        return (
            <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-6 text-center">
                <p className="text-xs text-[#555570]">No expression debug data available for this run.</p>
                <p className="mt-1 text-[10px] text-[#555570]">
                    Debug data is only captured for v2 expression-based workflows.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ExecutionSummary
                expression={expression}
                passed={passed}
                evaluatedRules={evaluatedRules}
                passedRules={passedRules}
                traceCount={trace?.length ?? 0}
            />

            <FailureExplanation
                trace={trace ?? []}
                passed={passed}
                evaluatedRules={evaluatedRules}
                passedRules={passedRules}
            />

            <ExecutionPath
                trace={trace ?? []}
                expression={expression}
            />

            {hasTrace && (
                <TraceTable trace={trace!} />
            )}
        </div>
    );
}
