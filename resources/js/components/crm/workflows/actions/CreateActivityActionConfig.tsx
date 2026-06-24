import { registerActionConfig, type ActionConfigProps } from './registry';

const ACTIVITY_TYPES = ['call', 'meeting', 'email', 'demo', 'follow_up', 'other'];

function CreateActivityActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">Activity Type</label>
                <select
                    value={value.type ?? 'call'}
                    onChange={e => onChange({ ...value, type: e.target.value })}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                >
                    {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">Subject</label>
                <input
                    value={value.subject ?? ''}
                    onChange={e => onChange({ ...value, subject: e.target.value })}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="Activity subject"
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">Description</label>
                <textarea
                    value={value.description ?? ''}
                    onChange={e => onChange({ ...value, description: e.target.value })}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="Optional description"
                    rows={2}
                />
            </div>
        </div>
    );
}

registerActionConfig('create_activity', CreateActivityActionConfig);
