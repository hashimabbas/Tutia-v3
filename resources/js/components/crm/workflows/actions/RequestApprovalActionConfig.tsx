import { registerActionConfig, type ActionConfigProps } from './registry';

function RequestApprovalActionConfig({ value, onChange, context }: ActionConfigProps) {
    const flows = context?.approvalFlows ?? [];

    const selected = flows.find(f => f.id === value.approval_flow_id);

    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Approval Flow</label>
                <select
                    value={value.approval_flow_id ?? ''}
                    onChange={e => onChange({ ...value, approval_flow_id: Number(e.target.value) })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-[#0f0f14] px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                >
                    <option value="">Select approval flow...</option>
                    {flows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
            </div>

            {selected && (
                <div className="flex items-center gap-3 text-[10px] text-[#555570]">
                    <span>Strategy: <span className="text-[#8b8b9e]">{selected.strategy}</span></span>
                    <span>Steps: <span className="text-[#8b8b9e]">{selected.steps_count}</span></span>
                </div>
            )}
        </div>
    );
}

registerActionConfig('request_approval', RequestApprovalActionConfig);
