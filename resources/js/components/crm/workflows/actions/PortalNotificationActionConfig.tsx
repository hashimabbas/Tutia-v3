import { registerActionConfig, type ActionConfigProps } from './registry';

function PortalNotificationActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">Title</label>
                <input
                    value={value.title ?? ''}
                    onChange={e => onChange({ ...value, title: e.target.value })}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="Notification title"
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">Message</label>
                <textarea
                    value={value.message ?? ''}
                    onChange={e => onChange({ ...value, message: e.target.value })}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="Notification message"
                    rows={3}
                />
            </div>
        </div>
    );
}

registerActionConfig('send_portal_notification', PortalNotificationActionConfig);
