import { registerActionConfig, type ActionConfigProps } from './registry';

function CreateNoteActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-gray-500">Content</label>
                <textarea
                    value={value.content ?? ''}
                    onChange={e => onChange({ ...value, content: e.target.value })}
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                    placeholder="Note content"
                    rows={4}
                />
            </div>
        </div>
    );
}

registerActionConfig('create_note', CreateNoteActionConfig);
