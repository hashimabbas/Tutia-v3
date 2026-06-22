import { registerActionConfig, type ActionConfigProps } from './registry';

function PortalNotificationActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Title</label>
                <input
                    value={value.title ?? ''}
                    onChange={e => onChange({ ...value, title: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="Notification title"
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Message</label>
                <textarea
                    value={value.message ?? ''}
                    onChange={e => onChange({ ...value, message: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="Notification message"
                    rows={3}
                />
            </div>
        </div>
    );
}

registerActionConfig('send_portal_notification', PortalNotificationActionConfig);
