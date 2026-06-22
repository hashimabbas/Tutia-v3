import { registerActionConfig, type ActionConfigProps } from './registry';

function SmsActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Phone Number</label>
                <input
                    value={value.phone ?? ''}
                    onChange={e => onChange({ ...value, phone: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="+201234567890"
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Template</label>
                <input
                    value={value.template ?? ''}
                    onChange={e => onChange({ ...value, template: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="sms.template"
                />
            </div>
        </div>
    );
}

registerActionConfig('send_sms', SmsActionConfig);
