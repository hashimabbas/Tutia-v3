import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect } from 'react';

interface Example {
    expression: string;
    label: string;
    description: string;
}

interface Props {
    tab: 'workflows' | 'approvals';
    onFilter: (expression: string) => void;
    onClear: () => void;
    isActive: boolean;
    matchInfo?: { count: number; total: number; percentage: number } | null;
}

const WORKFLOW_FIELDS = [
    { path: 'workflow.status', type: 'string', hint: 'active, inactive' },
    { path: 'workflow.total_runs', type: 'numeric', hint: '≥ 0' },
    { path: 'workflow.completed', type: 'numeric' },
    { path: 'workflow.failed', type: 'numeric' },
    { path: 'workflow.paused', type: 'numeric' },
    { path: 'workflow.success_rate', type: 'numeric', hint: '0–100' },
    { path: 'workflow.failure_rate', type: 'numeric', hint: '0–100' },
    { path: 'workflow.health_score', type: 'numeric', hint: '0–100' },
    { path: 'workflow.trigger_count', type: 'numeric', hint: '≥ 0' },
    { path: 'workflow.avg_duration_seconds', type: 'numeric' },
    { path: 'workflow.action_failure_rate', type: 'numeric', hint: '0–100' },
];

const APPROVAL_FIELDS = [
    { path: 'approval.status', type: 'string', hint: 'pending, approved, rejected' },
    { path: 'approval.total', type: 'numeric' },
    { path: 'approval.approved', type: 'numeric' },
    { path: 'approval.rejected', type: 'numeric' },
    { path: 'approval.pending', type: 'numeric' },
    { path: 'approval.escalated', type: 'numeric' },
    { path: 'approval.approval_rate', type: 'numeric', hint: '0–100' },
    { path: 'approval.escalation_rate', type: 'numeric', hint: '0–100' },
    { path: 'approval.avg_resolution_minutes', type: 'numeric' },
    { path: 'approval.health_score', type: 'numeric', hint: '0–100' },
];

const OPERATORS = ['=', '!=', '>', '>=', '<', '<='];

export default function SegmentFilter({ tab, onFilter, onClear, isActive, matchInfo }: Props) {
    const [expression, setExpression] = useState('');
    const [showFields, setShowFields] = useState(false);
    const [showExamples, setShowExamples] = useState(false);
    const [examples, setExamples] = useState<Example[]>([]);

    const fields = tab === 'workflows' ? WORKFLOW_FIELDS : APPROVAL_FIELDS;

    useEffect(() => {
        fetch(`/crm/analytics/api/segment/examples?tab=${tab}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((r) => r.json())
            .then((data) => setExamples(data.examples ?? []))
            .catch(() => {});
    }, [tab]);

    const handleApply = useCallback(() => {
        const trimmed = expression.trim();
        if (trimmed) {
            onFilter(trimmed);
        }
    }, [expression, onFilter]);

    const handleClear = useCallback(() => {
        setExpression('');
        onClear();
    }, [onClear]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleApply();
        }
    }, [handleApply]);

    const insertExpression = useCallback((expr: string) => {
        setExpression(expr);
    }, []);

    return (
        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-3">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={expression}
                        onChange={(e) => setExpression(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowFields(true)}
                        placeholder={tab === 'workflows'
                            ? 'e.g. workflow.health_score < 50 AND workflow.failure_rate > 15'
                            : 'e.g. approval.escalation_rate > 25'
                        }
                        className="w-full rounded-md border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-1.5 text-xs text-[#e8e8ed] placeholder-[#555570] font-mono outline-none transition-colors focus:border-[#3b6cdb]"
                    />
                </div>
                <button
                    onClick={handleApply}
                    disabled={!expression.trim()}
                    className={cn(
                        'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                        expression.trim()
                            ? 'bg-[#3b6cdb] text-white hover:bg-[#2d5bbf]'
                            : 'bg-[#1a1a24] text-[#555570] cursor-not-allowed',
                    )}
                >
                    Apply Segment
                </button>
                {isActive && (
                    <button
                        onClick={handleClear}
                        className="rounded-md border border-[#1e1e2a] px-3 py-1.5 text-[11px] text-[#555570] hover:text-[#e8e8ed] transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            {matchInfo && (
                <div className="mt-2 text-[10px] text-[#8b8b9e]">
                    {matchInfo.count} of {matchInfo.total} matched ({matchInfo.percentage}%)
                </div>
            )}

            {showFields && (
                <div className="mt-2 rounded-md border border-[#1e1e2a] bg-[#0a0a0f] p-2">
                    <div className="flex flex-wrap gap-1.5">
                        {fields.map((f) => (
                            <button
                                key={f.path}
                                type="button"
                                onClick={() => {
                                    setExpression((prev) => {
                                        const prefix = prev && !prev.endsWith(' ') ? `${prev} ` : prev;
                                        return `${prefix}${f.path} `;
                                    });
                                }}
                                className="rounded px-2 py-0.5 text-[10px] font-mono transition-colors hover:bg-[#1a1a24] text-[#8b8b9e] hover:text-[#e8e8ed]"
                            >
                                {f.path}
                                <span className="ml-1 text-[#555570]">({f.type})</span>
                                {f.hint && <span className="ml-1 text-[#3b6cdb]/60">{f.hint}</span>}
                            </button>
                        ))}
                    </div>
                    <p className="mt-1.5 text-[9px] text-[#555570]">
                        Operators: {OPERATORS.join(', ')} · Supports AND, OR, NOT · Click a field to insert · Press Enter to apply
                    </p>
                </div>
            )}

            {examples.length > 0 && (
                <>
                    <button
                        type="button"
                        onClick={() => setShowExamples(!showExamples)}
                        className="mt-2 flex items-center gap-1 text-[10px] text-[#555570] hover:text-[#8b8b9e] transition-colors"
                    >
                        <span>{showExamples ? '▼' : '▶'} Example Expressions</span>
                        <span className="text-[#3b6cdb]/60">({examples.length})</span>
                    </button>

                    {showExamples && (
                        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                            {examples.map((ex) => (
                                <button
                                    key={ex.expression}
                                    type="button"
                                    onClick={() => insertExpression(ex.expression)}
                                    title={ex.description}
                                    className="rounded border border-[#1e1e2a] bg-[#0a0a0f] px-2 py-1.5 text-left transition-colors hover:border-[#3b6cdb]/40"
                                >
                                    <p className="text-[10px] font-mono text-[#e8e8ed]">{ex.expression}</p>
                                    <p className="mt-0.5 text-[9px] text-[#555570]">{ex.label}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
