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
                <label className="mb-1 block text-[10px] text-[#555570]">Assign Mode</label>
                <select
                    value={value.mode ?? 'specific'}
                    onChange={e => onChange({ ...value, mode: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                >
                    {ASSIGN_MODES.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
            </div>
            {value.mode === 'specific' && (
                <div>
                    <label className="mb-1 block text-[10px] text-[#555570]">User ID</label>
                    <input
                        type="number"
                        min={1}
                        value={value.user_id ?? ''}
                        onChange={e => onChange({ ...value, user_id: parseInt(e.target.value) || undefined })}
                        className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                        placeholder="User ID"
                    />
                </div>
            )}
            {value.mode === 'round_robin' && (
                <div>
                    <label className="mb-1 block text-[10px] text-[#555570]">Team ID</label>
                    <input
                        type="number"
                        min={1}
                        value={value.team_id ?? ''}
                        onChange={e => onChange({ ...value, team_id: parseInt(e.target.value) || undefined })}
                        className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                        placeholder="Team ID"
                    />
                </div>
            )}
        </div>
    );
}

registerActionConfig('assign_owner', AssignOwnerActionConfig);
