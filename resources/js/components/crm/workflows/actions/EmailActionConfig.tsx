import { registerActionConfig, type ActionConfigProps } from './registry';

function EmailActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Recipient</label>
                <input
                    value={value.to ?? ''}
                    onChange={e => onChange({ ...value, to: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="email@example.com"
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Subject</label>
                <input
                    value={value.subject ?? ''}
                    onChange={e => onChange({ ...value, subject: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="Notification subject"
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Template</label>
                <input
                    value={value.template ?? ''}
                    onChange={e => onChange({ ...value, template: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="notification.template"
                />
            </div>
        </div>
    );
}

registerActionConfig('send_email', EmailActionConfig);
