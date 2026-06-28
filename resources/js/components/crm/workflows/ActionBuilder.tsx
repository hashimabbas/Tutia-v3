import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import ActionCard from '@/components/crm/workflows/ActionCard';
import type { ActionContext } from '@/components/crm/workflows/actions/registry';

interface Action {
    id: number;
    action_type: string;
    configuration_json: Record<string, any> | null;
    sort_order: number;
    stop_on_fail: boolean;
}

interface ActionMeta {
    key: string;
    label: string;
}

interface Props {
    workflowId: number;
    actions: Action[];
    actionTypes: ActionMeta[];
    context?: ActionContext;
}

export default function ActionBuilder({
    workflowId,
    actions: initial,
    actionTypes,
    context,
}: Props) {
    const [items, setItems] = useState(initial);

    const handleAdd = async () => {
        const nextOrder =
            items.length > 0
                ? Math.max(...items.map((a) => a.sort_order)) + 1
                : 1;
        const res = await fetch(`/crm/workflows/${workflowId}/actions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ action_type: '', sort_order: nextOrder }),
        });
        if (!res.ok) {
            toast.error('Failed to add action');
            return;
        }
        const data = await res.json();
        setItems((prev) => [...prev, data.action]);
        toast.success('Action added');
    };

    const handleDelete = useCallback((actionId: number) => {
        setItems((prev) => prev.filter((a) => a.id !== actionId));
    }, []);

    const handleUpdate = useCallback((updated: Action) => {
        setItems((prev) =>
            prev.map((a) => (a.id === updated.id ? updated : a)),
        );
    }, []);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                </h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[10px] text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
                >
                    <Plus className="h-3 w-3" /> Add Action
                </button>
            </div>

            {items.length === 0 && (
                <p className="text-xs text-gray-400">
                    No actions yet. Add an action to define what happens when
                    conditions are met.
                </p>
            )}

            <div className="space-y-3">
                {items
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((action) => (
                        <ActionCard
                            key={action.id}
                            workflowId={workflowId}
                            action={action}
                            actionTypes={actionTypes}
                            context={context}
                            onDeleted={() => handleDelete(action.id)}
                            onUpdated={handleUpdate}
                        />
                    ))}
            </div>
        </div>
    );
}
