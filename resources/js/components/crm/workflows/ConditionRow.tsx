import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

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
    condition: Condition;
    operators: OperatorMeta[];
    onDeleted: () => void;
    onUpdated: (condition: Condition) => void;
}

export default function ConditionRow({ workflowId, condition, operators, onDeleted, onUpdated }: Props) {
    const [field, setField] = useState(condition.field);
    const [operator, setOperator] = useState(condition.operator);
    const [value, setValue] = useState(condition.value ?? '');
    const [saving, setSaving] = useState(false);

    const hasChanges = field !== condition.field || operator !== condition.operator || value !== (condition.value ?? '');

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/crm/workflows/${workflowId}/conditions/${condition.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ field, operator, value: value || null }),
            });
            if (!res.ok) { toast.error('Failed to save condition'); return; }
            toast.success('Condition updated');
            onUpdated({ ...condition, field, operator, value: value || null });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const res = await fetch(`/crm/workflows/${workflowId}/conditions/${condition.id}`, { method: 'DELETE' });
        if (!res.ok) { toast.error('Failed to delete condition'); return; }
        toast.success('Condition deleted');
        onDeleted();
    };

    return (
        <div className="flex items-end gap-2">
            <div className="flex-1">
                <label className="mb-1 block text-[10px] text-gray-500">Field</label>
                <input
                    value={field}
                    onChange={e => setField(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="e.g. deal.amount"
                />
            </div>
            <div className="w-36">
                <label className="mb-1 block text-[10px] text-gray-500">Operator</label>
                <select
                    value={operator}
                    onChange={e => setOperator(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                >
                    {operators.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
            </div>
            <div className="flex-1">
                <label className="mb-1 block text-[10px] text-gray-500">Value</label>
                <input
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="Value"
                />
            </div>
            <div className="flex items-center gap-1 pb-0.5">
                {hasChanges && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-md bg-[#2B4C8C] px-2 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-[#3b5d9c] disabled:opacity-50"
                    >
                        {saving ? '...' : 'Save'}
                    </button>
                )}
                <button onClick={handleDelete} className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500">
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}
