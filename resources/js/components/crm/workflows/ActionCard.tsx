import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Trash2, GripVertical } from 'lucide-react';
import ActionConfigRenderer from '@/components/crm/workflows/actions/ActionConfigRenderer';
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
    action: Action;
    actionTypes: ActionMeta[];
    context?: ActionContext;
    onDeleted: () => void;
    onUpdated: (action: Action) => void;
}

export default function ActionCard({ workflowId, action, actionTypes, context, onDeleted, onUpdated }: Props) {
    const [actionType, setActionType] = useState(action.action_type);
    const [config, setConfig] = useState<Record<string, any>>(action.configuration_json ?? {});
    const [stopOnFail, setStopOnFail] = useState(action.stop_on_fail);
    const [saving, setSaving] = useState(false);

    const hasTypeChanges = actionType !== action.action_type;
    const hasConfigChanges = JSON.stringify(config) !== JSON.stringify(action.configuration_json ?? {});
    const hasFlagChanges = stopOnFail !== action.stop_on_fail;
    const hasChanges = hasTypeChanges || hasConfigChanges || hasFlagChanges;

    useEffect(() => {
        if (hasTypeChanges) {
            setConfig({});
        }
    }, [actionType]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const body: Record<string, any> = { action_type: actionType, stop_on_fail: stopOnFail };
            if (hasConfigChanges || hasTypeChanges) {
                body.configuration_json = config;
            }
            const res = await fetch(`/crm/workflows/${workflowId}/actions/${action.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) { toast.error('Failed to save action'); return; }
            toast.success('Action saved');
            onUpdated({ ...action, action_type: actionType, configuration_json: config, stop_on_fail: stopOnFail });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const res = await fetch(`/crm/workflows/${workflowId}/actions/${action.id}`, { method: 'DELETE' });
        if (!res.ok) { toast.error('Failed to delete action'); return; }
        toast.success('Action deleted');
        onDeleted();
    };

    const actionMeta = actionTypes.find(a => a.key === actionType);

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-start gap-3">
                <div className="mt-1 text-gray-300">
                    <GripVertical className="h-4 w-4" />
                </div>

                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                            {action.sort_order}
                        </span>
                        <div className="flex-1">
                            <select
                                value={actionType}
                                onChange={e => setActionType(e.target.value)}
                                className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                            >
                                <option value="">Select action...</option>
                                {actionTypes.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {actionType && (
                        <div className="rounded-md border border-gray-200 bg-white p-3">
                            <ActionConfigRenderer
                                actionType={actionType}
                                value={config}
                                onChange={setConfig}
                                context={context}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={stopOnFail}
                                onChange={e => setStopOnFail(e.target.checked)}
                                className="rounded border-gray-300 bg-white text-[#2B4C8C] focus:ring-[#3b6cdb]"
                            />
                            <span className="text-[10px] text-gray-500">Stop on fail</span>
                        </label>

                        <div className="flex items-center gap-1">
                            {hasChanges && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="rounded-md bg-[#2B4C8C] px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-[#3b5d9c] disabled:opacity-50"
                                >
                                    {saving ? '...' : 'Save'}
                                </button>
                            )}
                            <button onClick={handleDelete} className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
