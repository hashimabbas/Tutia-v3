import { registerActionConfig, type ActionConfigProps } from './registry';

function CreateTaskActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Title</label>
                <input
                    value={value.title ?? ''}
                    onChange={e => onChange({ ...value, title: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="Task title"
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Priority</label>
                <select
                    value={value.priority ?? 'medium'}
                    onChange={e => onChange({ ...value, priority: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Due (days from now)</label>
                <input
                    type="number"
                    min={0}
                    value={value.due_days ?? 7}
                    onChange={e => onChange({ ...value, due_days: parseInt(e.target.value) || 7 })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                />
            </div>
        </div>
    );
}

registerActionConfig('create_task', CreateTaskActionConfig);
