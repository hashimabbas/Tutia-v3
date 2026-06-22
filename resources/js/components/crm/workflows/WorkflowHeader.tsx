import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Play, Pause, Copy, Trash2 } from 'lucide-react';

interface Workflow {
    id: number;
    name: string;
    description: string | null;
    entity_type: string;
    is_active: boolean;
    version: number;
}

interface Props {
    workflow: Workflow;
    entityTypes: string[];
}

export default function WorkflowHeader({ workflow: initial, entityTypes }: Props) {
    const [name, setName] = useState(initial.name);
    const [description, setDescription] = useState(initial.description ?? '');
    const [entityType, setEntityType] = useState(initial.entity_type);
    const [saving, setSaving] = useState(false);

    const hasChanges = name !== initial.name || description !== (initial.description ?? '') || entityType !== initial.entity_type;

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/crm/workflows/${initial.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ name, description, entity_type: entityType }),
            });
            if (!res.ok) { toast.error('Failed to save'); return; }
            toast.success('Workflow saved');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async () => {
        const res = await fetch(`/crm/workflows/${initial.id}/toggle`, { method: 'POST' });
        if (!res.ok) { toast.error('Failed to toggle'); return; }
        toast.success(initial.is_active ? 'Workflow paused' : 'Workflow activated');
    };

    const handleDuplicate = async () => {
        const res = await fetch(`/crm/workflows/${initial.id}/duplicate`, { method: 'POST' });
        if (!res.ok) { toast.error('Failed to duplicate'); return; }
        toast.success('Duplicated');
    };

    const handleDelete = async () => {
        if (!confirm('Delete this workflow?')) return;
        const res = await fetch(`/crm/workflows/${initial.id}`, { method: 'DELETE' });
        if (!res.ok) { toast.error('Failed to delete'); return; }
        toast.success('Workflow deleted');
    };

    return (
        <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="flex-1 rounded-md border border-[#1e1e2a] bg-transparent px-3 py-1.5 text-sm font-medium text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                            placeholder="Workflow name"
                        />
                        <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium',
                            initial.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#1a1a24] text-[#555570]',
                        )}>
                            {initial.is_active ? <Play className="h-2.5 w-2.5" fill="currentColor" /> : <Pause className="h-2.5 w-2.5" />}
                            {initial.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="rounded bg-[#1a1a24] px-2 py-0.5 text-[10px] text-[#555570]">v{initial.version}</span>
                    </div>

                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-3 py-1.5 text-xs text-[#8b8b9e] outline-none focus:border-[#3b6cdb]"
                        placeholder="Description (optional)"
                        rows={2}
                    />

                    <div className="flex items-center gap-3">
                        <select
                            value={entityType}
                            onChange={e => setEntityType(e.target.value)}
                            className="rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#8b8b9e] outline-none focus:border-[#3b6cdb]"
                        >
                            {entityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        {hasChanges && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded-md bg-[#2B4C8C] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3b5d9c] disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={handleToggle} className="rounded p-1.5 text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]" title={initial.is_active ? 'Deactivate' : 'Activate'}>
                        {initial.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={handleDuplicate} className="rounded p-1.5 text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]" title="Duplicate">
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={handleDelete} className="rounded p-1.5 text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-red-400" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
