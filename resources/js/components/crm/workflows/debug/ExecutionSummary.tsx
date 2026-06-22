import { cn } from '@/lib/utils';

interface Props {
    expression: string | null;
    passed: boolean;
    evaluatedRules: number;
    passedRules: number;
    traceCount: number;
}

export default function ExecutionSummary({ expression, passed, evaluatedRules, passedRules, traceCount }: Props) {
    return (
        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
            <div className="text-[10px] uppercase tracking-wider text-[#555570] mb-3">Execution Summary</div>

            {expression && (
                <div className="mb-4">
                    <div className="text-[10px] text-[#555570] mb-1">Expression</div>
                    <code className="block rounded bg-[#0a0a0f] px-3 py-2 text-xs text-[#e8e8ed] font-mono break-all">
                        {expression}
                    </code>
                </div>
            )}

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                        passed
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-400/10 text-red-400',
                    )}>
                        <span className="text-[10px]">{passed ? '✓' : '✗'}</span>
                        {passed ? 'PASSED' : 'FAILED'}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-[#555570]">
                    <div>
                        Evaluated:{' '}
                        <span className="font-mono text-[#8b8b9e]">{evaluatedRules}</span>
                    </div>
                    <div>
                        Passed:{' '}
                        <span className={cn('font-mono', passedRules > 0 ? 'text-emerald-400' : 'text-[#8b8b9e]')}>
                            {passedRules}
                        </span>
                    </div>
                    <div>
                        Failed:{' '}
                        <span className={cn('font-mono', evaluatedRules - passedRules > 0 ? 'text-red-400' : 'text-[#8b8b9e]')}>
                            {evaluatedRules - passedRules}
                        </span>
                    </div>
                    <div>
                        Trace Entries: <span className="font-mono text-[#8b8b9e]">{traceCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
