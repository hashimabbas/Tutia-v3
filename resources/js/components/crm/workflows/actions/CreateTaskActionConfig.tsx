import { registerActionConfig, type ActionConfigProps } from './registry';

function CreateTaskActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">
                    Title
                </label>
                <input
                    value={value.title ?? ''}
                    onChange={(e) =>
                        onChange({ ...value, title: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="Task title"
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">
                    Priority
                </label>
                <select
                    value={value.priority ?? 'medium'}
                    onChange={(e) =>
                        onChange({ ...value, priority: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">
                    Due (days from now)
                </label>
                <input
                    type="number"
                    min={0}
                    value={value.due_days ?? 7}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            due_days: parseInt(e.target.value) || 7,
                        })
                    }
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                />
            </div>
        </div>
    );
}

registerActionConfig('create_task', CreateTaskActionConfig);
