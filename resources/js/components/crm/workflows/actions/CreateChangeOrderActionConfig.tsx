import { registerActionConfig, type ActionConfigProps } from './registry';

function CreateChangeOrderActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Title</label>
                <input
                    value={value.title ?? ''}
                    onChange={e => onChange({ ...value, title: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="Change order title"
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Description</label>
                <textarea
                    value={value.description ?? ''}
                    onChange={e => onChange({ ...value, description: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="Description of the change"
                    rows={2}
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Impact Analysis</label>
                <textarea
                    value={value.impact_analysis ?? ''}
                    onChange={e => onChange({ ...value, impact_analysis: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="Impact on scope, timeline, resources"
                    rows={2}
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Estimated Cost</label>
                <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={value.estimated_cost ?? ''}
                    onChange={e => onChange({ ...value, estimated_cost: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="0.00"
                />
            </div>
        </div>
    );
}

registerActionConfig('create_change_order', CreateChangeOrderActionConfig);
