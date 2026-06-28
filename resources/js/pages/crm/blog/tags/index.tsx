import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Tag {
    id: number;
    name: string;
    slug: string;
    articles_count: number;
}

interface Props {
    tags: Tag[];
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

export default function TagsIndex({ tags }: Props) {
    const [editing, setEditing] = useState<Tag | null>(null);
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState('');

    const resetForm = () => { setName(''); setEditing(null); setCreating(false); };

    const startEdit = (tag: Tag) => { setName(tag.name); setEditing(tag); setCreating(true); };

    const save = () => {
        if (!name.trim()) return;
        if (editing) {
            router.patch(`/crm/blog/tags/${editing.id}`, { name }, { onSuccess: () => resetForm() });
        } else {
            router.post('/crm/blog/tags', { name }, { onSuccess: () => resetForm() });
        }
    };

    return (
        <>
            <Head title="Tags" />

            <div className="flex-1 space-y-6 py-8">
                <div className="flex items-center justify-between px-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
                        <p className="mt-1 text-sm text-gray-500">{tags.length} tags</p>
                    </div>
                    {!creating && (
                        <button onClick={() => { resetForm(); setCreating(true); }} className="inline-flex items-center gap-2 rounded-xl bg-[#2B4C8C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1e3a6e]">
                            <Plus className="size-4" />
                            New Tag
                        </button>
                    )}
                </div>

                <div className="grid gap-8 px-8 lg:grid-cols-5">
                    {creating && (
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-900">{editing ? 'Edit' : 'New'} Tag</h3>
                                <button onClick={resetForm} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="size-4" /></button>
                            </div>
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tag name" className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#2B4C8C]" onKeyDown={(e) => e.key === 'Enter' && save()} />
                            <button onClick={save} className="mt-3 w-full rounded-xl bg-[#2B4C8C] py-2 text-sm font-medium text-white transition-colors hover:bg-[#1e3a6e]">{editing ? 'Update' : 'Create'}</button>
                        </div>
                    )}

                    <div className={cn('flex flex-wrap gap-2', creating ? 'lg:col-span-4' : 'lg:col-span-5')}>
                        {tags.length === 0 ? (
                            <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16">
                                <p className="text-sm font-medium text-gray-500">No tags yet</p>
                                <p className="text-xs text-gray-400">Create your first tag</p>
                            </div>
                        ) : (
                            tags.map((tag) => (
                                <div key={tag.id} className="group inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm transition-all hover:shadow-md">
                                    <span className="text-sm font-medium text-gray-700">#{tag.name}</span>
                                    <span className="text-[10px] text-gray-400">{tag.articles_count}</span>
                                    <div className="hidden items-center gap-0.5 group-hover:flex">
                                        <button onClick={() => startEdit(tag)} className="rounded p-0.5 text-gray-400 hover:text-gray-600"><Pencil className="size-3" /></button>
                                        <button onClick={() => { if (confirm('Delete tag?')) router.delete(`/crm/blog/tags/${tag.id}`); }} className="rounded p-0.5 text-gray-400 hover:text-red-500"><Trash2 className="size-3" /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
