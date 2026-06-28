import { registerActionConfig, type ActionConfigProps } from './registry';

function WhatsAppActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">
                    Phone Number
                </label>
                <input
                    value={value.phone ?? ''}
                    onChange={(e) =>
                        onChange({ ...value, phone: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="+201234567890"
                />
            </div>
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">
                    Template
                </label>
                <input
                    value={value.template ?? ''}
                    onChange={(e) =>
                        onChange({ ...value, template: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="whatsapp.template"
                />
            </div>
        </div>
    );
}

registerActionConfig('send_whatsapp', WhatsAppActionConfig);
