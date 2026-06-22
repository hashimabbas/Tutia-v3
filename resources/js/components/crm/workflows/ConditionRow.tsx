import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

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
                <label className="mb-1 block text-[10px] text-[#555570]">Field</label>
                <input
                    value={field}
                    onChange={e => setField(e.target.value)}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="e.g. deal.amount"
                />
            </div>
            <div className="w-36">
                <label className="mb-1 block text-[10px] text-[#555570]">Operator</label>
                <select
                    value={operator}
                    onChange={e => setOperator(e.target.value)}
                    className="w-full rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                >
                    {operators.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
            </div>
            <div className="flex-1">
                <label className="mb-1 block text-[10px] text-[#555570]">Value</label>
                <input
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
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
                <button onClick={handleDelete} className="rounded p-1.5 text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-red-400">
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}
