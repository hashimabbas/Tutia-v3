import { cn } from '@/lib/utils';

interface Props {
    expression: string | null;
    passed: boolean;
    evaluatedRules: number;
    passedRules: number;
    traceCount: number;
}

export default function ExecutionSummary({
    expression,
    passed,
    evaluatedRules,
    passedRules,
    traceCount,
}: Props) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-[10px] tracking-wider text-gray-500 uppercase">
                Execution Summary
            </div>

            {expression && (
                <div className="mb-4">
                    <div className="mb-1 text-[10px] text-gray-400">
                        Expression
                    </div>
                    <code className="block rounded bg-gray-50/50 px-3 py-2 font-mono text-xs break-all text-gray-900">
                        {expression}
                    </code>
                </div>
            )}

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            passed
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-red-50 text-red-600',
                        )}
                    >
                        <span className="text-[10px]">
                            {passed ? '\u2713' : '\u2717'}
                        </span>
                        {passed ? 'PASSED' : 'FAILED'}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-gray-500">
                    <div>
                        Evaluated:{' '}
                        <span className="font-mono text-gray-600">
                            {evaluatedRules}
                        </span>
                    </div>
                    <div>
                        Passed:{' '}
                        <span
                            className={cn(
                                'font-mono',
                                passedRules > 0
                                    ? 'text-emerald-600'
                                    : 'text-gray-600',
                            )}
                        >
                            {passedRules}
                        </span>
                    </div>
                    <div>
                        Failed:{' '}
                        <span
                            className={cn(
                                'font-mono',
                                evaluatedRules - passedRules > 0
                                    ? 'text-red-600'
                                    : 'text-gray-600',
                            )}
                        >
                            {evaluatedRules - passedRules}
                        </span>
                    </div>
                    <div>
                        Trace Entries:{' '}
                        <span className="font-mono text-gray-600">
                            {traceCount}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
