import { registerActionConfig, type ActionConfigProps } from './registry';

function CreateNoteActionConfig({ value, onChange }: ActionConfigProps) {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="mb-1 block text-[10px] text-[#555570]">Content</label>
                <textarea
                    value={value.content ?? ''}
                    onChange={e => onChange({ ...value, content: e.target.value })}
                    className="w-full rounded-md border border-[#1e1e2a] bg-transparent px-2.5 py-1.5 text-xs text-[#e8e8ed] outline-none focus:border-[#3b6cdb]"
                    placeholder="Note content"
                    rows={4}
                />
            </div>
        </div>
    );
}

registerActionConfig('create_note', CreateNoteActionConfig);
