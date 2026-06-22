import { registerActionConfig, type ActionConfigProps } from './registry';

const ACTIVITY_TYPES = ['call', 'meeting', 'email', 'demo', 'follow_up', 'other'];

function CreateActivityActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Activity Type</label>
                <select
                    value={value.type ?? 'call'}
                    onChange={e => onChange({ ...value, type: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                >
                    {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Subject</label>
                <input
                    value={value.subject ?? ''}
                    onChange={e => onChange({ ...value, subject: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="Activity subject"
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Description</label>
                <textarea
                    value={value.description ?? ''}
                    onChange={e => onChange({ ...value, description: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="Optional description"
                    rows={2}
                />
            </div>
        </div>
    );
}

registerActionConfig('create_activity', CreateActivityActionConfig);
