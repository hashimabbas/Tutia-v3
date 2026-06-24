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
        <div className="rounded-xl border border-border/60 bg-white p-4 shadow-xs">
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
                        className="w-full rounded-lg border border-input bg-muted/30 px-3 py-2 text-xs text-foreground placeholder-muted-foreground/60 font-mono outline-none transition-all duration-200 focus:border-brand-navy-300 focus:bg-white focus:ring-1 focus:ring-brand-navy-200"
                    />
                </div>
                <button
                    onClick={handleApply}
                    disabled={!expression.trim()}
                    className={cn(
                        'rounded-lg px-4 py-2 text-[11px] font-medium transition-all duration-200',
                        expression.trim()
                            ? 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-[0.98]'
                            : 'bg-muted text-muted-foreground cursor-not-allowed',
                    )}
                >
                    Apply Segment
                </button>
                {isActive && (
                    <button
                        onClick={handleClear}
                        className="rounded-lg border border-border/60 px-4 py-2 text-[11px] font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.98]"
                    >
                        Clear
                    </button>
                )}
            </div>

            {matchInfo && (
                <div className="mt-2 text-[10px] text-muted-foreground">
                    {matchInfo.count} of {matchInfo.total} matched ({matchInfo.percentage}%)
                </div>
            )}

            {showFields && (
                <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3">
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
                                className="rounded-md bg-white px-2 py-1 text-[10px] font-mono text-muted-foreground shadow-xs transition-all duration-200 hover:bg-brand-navy-50 hover:text-brand-navy-700 hover:shadow-sm"
                            >
                                {f.path}
                                <span className="ml-1 text-muted-foreground/50">({f.type})</span>
                                {f.hint && <span className="ml-1 text-brand-navy-300">{f.hint}</span>}
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-[9px] text-muted-foreground/60">
                        Operators: {OPERATORS.join(', ')} · Supports AND, OR, NOT · Click a field to insert · Press Enter to apply
                    </p>
                </div>
            )}

            {examples.length > 0 && (
                <>
                    <button
                        type="button"
                        onClick={() => setShowExamples(!showExamples)}
                        className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <span>{showExamples ? '▼' : '▶'} Example Expressions</span>
                        <span className="text-brand-navy-400/60">({examples.length})</span>
                    </button>

                    {showExamples && (
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                            {examples.map((ex) => (
                                <button
                                    key={ex.expression}
                                    type="button"
                                    onClick={() => insertExpression(ex.expression)}
                                    title={ex.description}
                                    className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-left transition-all duration-200 hover:border-brand-navy-200 hover:bg-brand-navy-50/50 hover:shadow-sm"
                                >
                                    <p className="text-[10px] font-mono text-foreground">{ex.expression}</p>
                                    <p className="mt-0.5 text-[9px] text-muted-foreground">{ex.label}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
