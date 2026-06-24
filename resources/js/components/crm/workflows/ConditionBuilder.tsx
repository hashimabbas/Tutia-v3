import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import ConditionRow from '@/components/crm/workflows/ConditionRow';

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

interface Props {
    workflowId: number;
    conditions: Condition[];
    operators: OperatorMeta[];
}

export default function ConditionBuilder({ workflowId, conditions: initial, operators }: Props) {
    const [items, setItems] = useState(initial);

    const groups = items.reduce<Record<number, Condition[]>>((acc, c) => {
        (acc[c.group_order] ??= []).push(c);
        return acc;
    }, {});

    const groupOrders = Object.keys(groups).map(Number).sort();

    const handleAddCondition = async (groupOrder: number) => {
        const res = await fetch(`/crm/workflows/${workflowId}/conditions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ field: '', operator: 'eq', value: null, group_order: groupOrder }),
        });
        if (!res.ok) { toast.error('Failed to add condition'); return; }
        const data = await res.json();
        setItems(prev => [...prev, data.condition]);
        toast.success('Condition added');
    };

    const handleAddGroup = async () => {
        const nextGroup = groupOrders.length > 0 ? Math.max(...groupOrders) + 1 : 0;
        const res = await fetch(`/crm/workflows/${workflowId}/conditions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ field: '', operator: 'eq', value: null, group_order: nextGroup }),
        });
        if (!res.ok) { toast.error('Failed to add group'); return; }
        const data = await res.json();
        setItems(prev => [...prev, data.condition]);
        toast.success('Group added');
    };

    const handleDelete = useCallback((conditionId: number) => {
        setItems(prev => prev.filter(c => c.id !== conditionId));
    }, []);

    const handleUpdate = useCallback((updated: Condition) => {
        setItems(prev => prev.map(c => c.id === updated.id ? updated : c));
    }, []);

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">Conditions</h2>
                <button
                    onClick={handleAddGroup}
                    className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[10px] text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
                >
                    <Plus className="h-3 w-3" /> Add Group
                </button>
            </div>

            {items.length === 0 && (
                <p className="text-xs text-gray-400">No conditions yet. Add a condition group to start.</p>
            )}

            <div className="space-y-4">
                {groupOrders.map((group, gi) => (
                    <div key={group}>
                        {gi > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-px flex-1 bg-gray-200" />
                                <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">AND</span>
                                <div className="h-px flex-1 bg-gray-200" />
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">Group {gi + 1}</span>
                            </div>

                            {groups[group].map((condition, ci) => (
                                <div key={condition.id}>
                                    {ci > 0 && (
                                        <div className={cn(
                                            'flex items-center gap-2 mb-2',
                                            ci > 0 ? 'mt-2' : '',
                                        )}>
                                            <div className="h-px flex-1 bg-gray-200" />
                                            <span className="text-[10px] font-medium text-gray-400">AND</span>
                                            <div className="h-px flex-1 bg-gray-200" />
                                        </div>
                                    )}
                                    <ConditionRow
                                        workflowId={workflowId}
                                        condition={condition}
                                        operators={operators}
                                        onDeleted={() => handleDelete(condition.id)}
                                        onUpdated={handleUpdate}
                                    />
                                </div>
                            ))}

                            <button
                                onClick={() => handleAddCondition(group)}
                                className="flex items-center gap-1 text-[10px] text-gray-500 transition-colors hover:text-gray-700"
                            >
                                <Plus className="h-3 w-3" /> Add condition
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
