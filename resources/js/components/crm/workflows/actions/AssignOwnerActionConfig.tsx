import { registerActionConfig, type ActionConfigProps } from './registry';

const ASSIGN_MODES = [
    { key: 'specific', label: 'Specific User' },
    { key: 'manager', label: 'Manager' },
    { key: 'round_robin', label: 'Round Robin (Team)' },
];

function AssignOwnerActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">Assign Mode</label>
                <select
                    value={value.mode ?? 'specific'}
                    onChange={e => onChange({ ...value, mode: e.target.value })}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                >
                    {ASSIGN_MODES.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
            </div>
            {value.mode === 'specific' && (
                <div>
                    <label className="mb-1 block text-[10px] text-gray-500">User ID</label>
                    <input
                        type="number"
                        min={1}
                        value={value.user_id ?? ''}
                        onChange={e => onChange({ ...value, user_id: parseInt(e.target.value) || undefined })}
                        className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                        placeholder="User ID"
                    />
                </div>
            )}
            {value.mode === 'round_robin' && (
                <div>
                    <label className="mb-1 block text-[10px] text-gray-500">Team ID</label>
                    <input
                        type="number"
                        min={1}
                        value={value.team_id ?? ''}
                        onChange={e => onChange({ ...value, team_id: parseInt(e.target.value) || undefined })}
                        className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                        placeholder="Team ID"
                    />
                </div>
            )}
        </div>
    );
}

registerActionConfig('assign_owner', AssignOwnerActionConfig);
