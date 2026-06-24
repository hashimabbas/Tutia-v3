import { registerActionConfig, type ActionConfigProps } from './registry';

function CreateChangeOrderActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">Title</label>
                <input
                    value={value.title ?? ''}
                    onChange={e => onChange({ ...value, title: e.target.value })}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="Change order title"
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">Description</label>
                <textarea
                    value={value.description ?? ''}
                    onChange={e => onChange({ ...value, description: e.target.value })}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="Description of the change"
                    rows={2}
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">Impact Analysis</label>
                <textarea
                    value={value.impact_analysis ?? ''}
                    onChange={e => onChange({ ...value, impact_analysis: e.target.value })}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="Impact on scope, timeline, resources"
                    rows={2}
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">Estimated Cost</label>
                <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={value.estimated_cost ?? ''}
                    onChange={e => onChange({ ...value, estimated_cost: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="0.00"
                />
            </div>
        </div>
    );
}

registerActionConfig('create_change_order', CreateChangeOrderActionConfig);
