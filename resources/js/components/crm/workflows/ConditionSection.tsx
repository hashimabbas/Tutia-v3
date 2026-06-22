import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import VersionSwitch from '@/components/crm/workflows/VersionSwitch';
import ConditionBuilder from '@/components/crm/workflows/ConditionBuilder';
import ExpressionBuilder from '@/components/crm/workflows/ExpressionBuilder';
import type { ExpressionField, ExpressionOperator, ExpressionRule } from '@/types/expression';

interface Condition {
    id: number;
    field: string;
    operator: string;
    value: string | null;
    group_order: number;
}

interface OperatorMeta {
    key: string;
    label: string;
}

interface ConditionsVersion {
    key: string;
    label: string;
}

interface Props {
    workflowId: number;
    conditions?: Condition[];
    operators?: OperatorMeta[];
    expression: string | null;
    conditionsVersion: string;
    expressionFields: ExpressionField[];
    expressionOperators: ExpressionOperator[];
    conditionsVersions: ConditionsVersion[];
}

export default function ConditionSection({
    workflowId,
    conditions = [],
    operators = [],
    expression: initialExpression,
    conditionsVersion: initialVersion,
    expressionFields,
    expressionOperators,
    conditionsVersions,
}: Props) {
    const [version, setVersion] = useState(initialVersion);
    const [expression, setExpression] = useState<string>(initialExpression ?? '');
    const [expressionRows, setExpressionRows] = useState<ExpressionRule[]>([]);

    useEffect(() => {
        setVersion(initialVersion);
        setExpression(initialExpression ?? '');
    }, [initialVersion, initialExpression]);

    const handleVersionChange = async (newVersion: string) => {
        setVersion(newVersion);
        try {
            const res = await fetch(`/crm/workflows/${workflowId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ conditions_version: newVersion }),
            });
            if (!res.ok) { toast.error('Failed to switch conditions mode'); return; }
            toast.success(`Switched to ${newVersion === 'v1' ? 'Legacy' : 'Expression'} conditions`);
        } catch {
            toast.error('Failed to switch conditions mode');
        }
    };

    const handleExpressionChange = (expr: string, rows: ExpressionRule[]) => {
        setExpression(expr);
        setExpressionRows(rows);
    };

    const handleExpressionSave = async () => {
        try {
            const res = await fetch(`/crm/workflows/${workflowId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ expression, conditions_version: 'v2' }),
            });
            if (!res.ok) { toast.error('Failed to save expression'); return; }
            toast.success('Expression saved');
        } catch {
            toast.error('Failed to save expression');
        }
    };

    return (
        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-medium uppercase tracking-wider text-[#555570]">Conditions</h2>
                <VersionSwitch
                    versions={conditionsVersions}
                    value={version}
                    onChange={handleVersionChange}
                />
            </div>

            {version === 'v1' && (
                <div className="space-y-4">
                    {conditions.length === 0 && (
                        <p className="text-xs text-[#555570]">No conditions yet.</p>
                    )}

                    {conditions.length > 0 && (
                        <ConditionBuilder
                            workflowId={workflowId}
                            conditions={conditions}
                            operators={operators}
                        />
                    )}
                </div>
            )}

            {version === 'v2' && (
                <div className="space-y-4">
                    <ExpressionBuilder
                        workflowId={workflowId}
                        expression={expression}
                        fields={expressionFields}
                        operators={expressionOperators}
                        onExpressionChange={handleExpressionChange}
                    />

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleExpressionSave}
                            disabled={!expression}
                            className="rounded-md bg-[#2B4C8C] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3b5d9c] disabled:opacity-50"
                        >
                            Save Expression Conditions
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
