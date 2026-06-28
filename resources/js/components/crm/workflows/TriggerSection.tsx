import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface Trigger {
    id: number;
    event_key: string;
}

interface EventMeta {
    key: string;
    label: string;
}

interface Props {
    workflowId: number;
    triggers: Trigger[];
    events: EventMeta[];
}

export default function TriggerSection({
    workflowId,
    triggers,
    events,
}: Props) {
    const [selected, setSelected] = useState(triggers[0]?.event_key ?? '');
    const [adding, setAdding] = useState(false);

    const hasTrigger = triggers.length > 0;

    const handleSave = async () => {
        if (!selected) return;
        setAdding(true);
        try {
            if (hasTrigger) {
                const res = await fetch(
                    `/crm/workflows/${workflowId}/triggers/${triggers[0].id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },
                        body: JSON.stringify({ event_key: selected }),
                    },
                );
                if (!res.ok) {
                    toast.error('Failed to update trigger');
                    return;
                }
                toast.success('Trigger updated');
            } else {
                const res = await fetch(
                    `/crm/workflows/${workflowId}/triggers`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },
                        body: JSON.stringify({ event_key: selected }),
                    },
                );
                if (!res.ok) {
                    toast.error('Failed to add trigger');
                    return;
                }
                toast.success('Trigger added');
            }
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async () => {
        if (!hasTrigger) return;
        const res = await fetch(
            `/crm/workflows/${workflowId}/triggers/${triggers[0].id}`,
            { method: 'DELETE' },
        );
        if (!res.ok) {
            toast.error('Failed to remove trigger');
            return;
        }
        toast.success('Trigger removed');
        setSelected('');
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Trigger
                </h2>
                {hasTrigger && (
                    <button
                        onClick={handleDelete}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            <div className="space-y-3">
                <div>
                    <label className="mb-1.5 block text-[10px] text-gray-500">
                        When this event occurs
                    </label>
                    <select
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    >
                        <option value="">Select an event...</option>
                        {events.map((e) => (
                            <option key={e.key} value={e.key}>
                                {e.label}
                            </option>
                        ))}
                    </select>
                </div>

                {selected && selected !== (triggers[0]?.event_key ?? '') && (
                    <button
                        onClick={handleSave}
                        disabled={adding}
                        className="rounded-md bg-[#2B4C8C] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3b5d9c] disabled:opacity-50"
                    >
                        {adding
                            ? 'Saving...'
                            : hasTrigger
                              ? 'Update'
                              : 'Add Trigger'}
                    </button>
                )}
            </div>
        </div>
    );
}
