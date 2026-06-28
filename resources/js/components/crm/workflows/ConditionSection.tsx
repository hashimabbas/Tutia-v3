import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowRightLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import VersionSwitch from '@/components/crm/workflows/VersionSwitch';
import ConditionBuilder from '@/components/crm/workflows/ConditionBuilder';
import ExpressionBuilder from '@/components/crm/workflows/ExpressionBuilder';
import type {
    ExpressionField,
    ExpressionOperator,
    ExpressionRule,
} from '@/types/expression';

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
    const [expression, setExpression] = useState<string>(
        initialExpression ?? '',
    );
    const [expressionRows, setExpressionRows] = useState<ExpressionRule[]>([]);
    const [converting, setConverting] = useState(false);
    const [conversionPreview, setConversionPreview] = useState<{
        expression: string;
        valid: boolean;
        warnings: string[];
    } | null>(null);

    useEffect(() => {
        setVersion(initialVersion);
        setExpression(initialExpression ?? '');
    }, [initialVersion, initialExpression]);

    const handleVersionChange = async (newVersion: string) => {
        setVersion(newVersion);
        try {
            const res = await fetch(`/crm/workflows/${workflowId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ conditions_version: newVersion }),
            });
            if (!res.ok) {
                toast.error('Failed to switch conditions mode');
                return;
            }
            toast.success(
                `Switched to ${newVersion === 'v1' ? 'Legacy' : 'Expression'} conditions`,
            );
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
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ expression, conditions_version: 'v2' }),
            });
            if (!res.ok) {
                toast.error('Failed to save expression');
                return;
            }
            toast.success('Expression saved');
        } catch {
            toast.error('Failed to save expression');
        }
    };

    const handleConvertToExpression = async () => {
        setConverting(true);
        setConversionPreview(null);
        try {
            const res = await fetch(
                '/crm/workflows/expression/convert-legacy',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ conditions }),
                },
            );
            if (!res.ok) {
                toast.error('Failed to convert conditions');
                return;
            }
            const data = await res.json();
            setConversionPreview(data);
            setExpression(data.expression);
            toast.success('Legacy conditions converted to expression');
        } catch {
            toast.error('Failed to convert conditions');
        } finally {
            setConverting(false);
        }
    };

    const handleSwitchToV2 = async () => {
        try {
            const res = await fetch(`/crm/workflows/${workflowId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ expression, conditions_version: 'v2' }),
            });
            if (!res.ok) {
                toast.error('Failed to switch to v2');
                return;
            }
            setVersion('v2');
            setConversionPreview(null);
            toast.success('Switched to expression conditions');
        } catch {
            toast.error('Failed to switch to v2');
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Conditions
                </h2>
                <VersionSwitch
                    versions={conditionsVersions}
                    value={version}
                    onChange={handleVersionChange}
                />
            </div>

            {version === 'v1' && (
                <div className="space-y-4">
                    {conditions.length === 0 && (
                        <p className="text-xs text-gray-500">
                            No conditions yet.
                        </p>
                    )}

                    {conditions.length > 0 && (
                        <ConditionBuilder
                            workflowId={workflowId}
                            conditions={conditions}
                            operators={operators}
                        />
                    )}

                    {conditions.length > 0 && (
                        <button
                            type="button"
                            onClick={handleConvertToExpression}
                            disabled={converting}
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ArrowRightLeft className="size-3.5" />
                            {converting
                                ? 'Converting...'
                                : 'Convert to Expression'}
                        </button>
                    )}

                    {conversionPreview && (
                        <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                            <div className="flex items-center gap-1.5 text-emerald-700">
                                {conversionPreview.valid ? (
                                    <CheckCircle2 className="size-4" />
                                ) : (
                                    <AlertTriangle className="size-4" />
                                )}
                                <span className="text-xs font-medium">
                                    {conversionPreview.valid
                                        ? 'Valid Expression'
                                        : 'Conversion Issues'}
                                </span>
                            </div>

                            <code className="block rounded border border-emerald-100 bg-white px-2 py-1.5 font-mono text-xs text-gray-800">
                                {conversionPreview.expression || '(empty)'}
                            </code>

                            {conversionPreview.warnings.length > 0 && (
                                <ul className="space-y-0.5">
                                    {conversionPreview.warnings.map((w, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-1 text-xs text-amber-700"
                                        >
                                            <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                                            <span>{w}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSwitchToV2}
                                    className="rounded-md bg-[#2B4C8C] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3b5d9c]"
                                >
                                    Switch to V2 with Expression
                                </button>
                            </div>
                        </div>
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
