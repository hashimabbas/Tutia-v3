import { registerActionConfig, type ActionConfigProps } from './registry';

function RequestApprovalActionConfig({
    value,
    onChange,
    context,
}: ActionConfigProps) {
    const flows = context?.approvalFlows ?? [];

    const selected = flows.find((f) => f.id === value.approval_flow_id);

    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">
                    Approval Flow
                </label>
                <select
                    value={value.approval_flow_id ?? ''}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            approval_flow_id: Number(e.target.value),
                        })
                    }
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                >
                    <option value="">Select approval flow...</option>
                    {flows.map((f) => (
                        <option key={f.id} value={f.id}>
                            {f.name}
                        </option>
                    ))}
                </select>
            </div>

            {selected && (
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span>
                        Strategy:{' '}
                        <span className="text-gray-600">
                            {selected.strategy}
                        </span>
                    </span>
                    <span>
                        Steps:{' '}
                        <span className="text-gray-600">
                            {selected.steps_count}
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
}

registerActionConfig('request_approval', RequestApprovalActionConfig);
