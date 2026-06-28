import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Author {
    id: number;
    name: string;
    email: string | null;
    title: string | null;
    avatar: string | null;
    biography: string | null;
    social_links: Record<string, string> | null;
    is_active: boolean;
    articles_count: number;
}

interface Props {
    authors: Author[];
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

export default function AuthorsIndex({ authors }: Props) {
    const [editing, setEditing] = useState<Author | null>(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', title: '', biography: '', social_links: '{}', is_active: true });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const resetForm = () => {
        setForm({ name: '', email: '', title: '', biography: '', social_links: '{}', is_active: true });
        setAvatarFile(null);
        setEditing(null);
        setCreating(false);
    };

    const startEdit = (author: Author) => {
        setForm({ name: author.name, email: author.email || '', title: author.title || '', biography: author.biography || '', social_links: JSON.stringify(author.social_links || {}), is_active: author.is_active });
        setEditing(author);
        setCreating(true);
    };

    const save = () => {
        if (!form.name.trim()) return;
        const payload = { ...form };
        if (!avatarFile) delete (payload as any).avatar;

        if (editing) {
            const data = new FormData();
            data.append('_method', 'PATCH');
            Object.entries(payload).forEach(([k, v]) => data.append(k, v));
            if (avatarFile) data.append('avatar', avatarFile);
            router.post(`/crm/blog/authors/${editing.id}`, data, { onSuccess: () => resetForm() });
        } else {
            const data = new FormData();
            Object.entries(payload).forEach(([k, v]) => data.append(k, v));
            if (avatarFile) data.append('avatar', avatarFile);
            router.post('/crm/blog/authors', data, { onSuccess: () => resetForm() });
        }
    };

    return (
        <>
            <Head title="Authors" />

            <div className="flex-1 space-y-6 py-8">
                <div className="flex items-center justify-between px-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Authors</h1>
                        <p className="mt-1 text-sm text-gray-500">{authors.length} authors</p>
                    </div>
                    {!creating && (
                        <button onClick={() => { resetForm(); setCreating(true); }} className="inline-flex items-center gap-2 rounded-xl bg-[#2B4C8C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1e3a6e]">
                            <Plus className="size-4" />
                            New Author
                        </button>
                    )}
                </div>

                <div className="grid gap-8 px-8 lg:grid-cols-3">
                    {creating && (
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-semibold text-gray-900">{editing ? 'Edit' : 'New'} Author</h3>
                                <button onClick={resetForm} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="size-4" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">Name</label>
                                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#2B4C8C]" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">Email</label>
                                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#2B4C8C]" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">Title</label>
                                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#2B4C8C]" placeholder="e.g. Senior Editor" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">Avatar</label>
                                    <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="mt-1 w-full text-xs text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-600 hover:file:bg-gray-100" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">Biography</label>
                                    <textarea value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2B4C8C]" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">Social Links (JSON)</label>
                                    <textarea value={form.social_links} onChange={(e) => setForm({ ...form, social_links: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono outline-none focus:border-[#2B4C8C]" placeholder='{"twitter": "https://..."}' />
                                </div>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300" />
                                    <span className="text-xs text-gray-600">Active</span>
                                </label>
                                <button onClick={save} className="w-full rounded-xl bg-[#2B4C8C] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1e3a6e]">{editing ? 'Update' : 'Create'} Author</button>
                            </div>
                        </div>
                    )}

                    <div className={cn('space-y-3', creating ? 'lg:col-span-2' : 'lg:col-span-3')}>
                        {authors.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16">
                                <p className="text-sm font-medium text-gray-500">No authors yet</p>
                                <p className="text-xs text-gray-400">Create your first author</p>
                            </div>
                        ) : (
                            authors.map((author) => (
                                <div key={author.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="size-10">
                                            {author.avatar ? <AvatarImage src={`/storage/${author.avatar}`} /> : null}
                                            <AvatarFallback className="bg-gray-100 text-xs text-gray-500">{author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{author.name}</p>
                                            <p className="text-[10px] text-gray-400">{author.title || 'No title'} &middot; {author.articles_count} articles</p>
                                        </div>
                                        {!author.is_active && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-medium text-gray-500 uppercase">Inactive</span>}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => startEdit(author)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"><Pencil className="size-3.5" /></button>
                                        <button onClick={() => { if (confirm('Delete this author?')) router.delete(`/crm/blog/authors/${author.id}`); }} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"><Trash2 className="size-3.5" /></button>
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
