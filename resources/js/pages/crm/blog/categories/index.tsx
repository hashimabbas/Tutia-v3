import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string;
    display_order: number;
    is_active: boolean;
    articles_count: number;
}

interface Props {
    categories: Category[];
}

const DEFAULT_COLORS = ['#2B4C8C', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#DB2777', '#65A30D'];

export default function CategoriesIndex({ categories }: Props) {
    const [editing, setEditing] = useState<Category | null>(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: '', slug: '', description: '', color: '#2B4C8C', display_order: 0, is_active: true });

    const resetForm = () => {
        setForm({ name: '', slug: '', description: '', color: '#2B4C8C', display_order: 0, is_active: true });
        setEditing(null);
        setCreating(false);
    };

    const startEdit = (cat: Category) => {
        setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', color: cat.color, display_order: cat.display_order, is_active: cat.is_active });
        setEditing(cat);
        setCreating(true);
    };

    const save = () => {
        if (!form.name.trim()) return;
        if (editing) {
            router.patch(`/crm/blog/categories/${editing.id}`, form, { onSuccess: () => resetForm() });
        } else {
            router.post('/crm/blog/categories', form, { onSuccess: () => resetForm() });
        }
    };

    return (
        <>
            <Head title="Categories" />

            <div className="flex-1 space-y-6 py-8">
                <div className="flex items-center justify-between px-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                        <p className="mt-1 text-sm text-gray-500">{categories.length} categories</p>
                    </div>
                    {!creating && (
                        <button onClick={() => { resetForm(); setCreating(true); }} className="inline-flex items-center gap-2 rounded-xl bg-[#2B4C8C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1e3a6e]">
                            <Plus className="size-4" />
                            New Category
                        </button>
                    )}
                </div>

                <div className="grid gap-8 px-8 lg:grid-cols-3">
                    {/* Form */}
                    {creating && (
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-semibold text-gray-900">{editing ? 'Edit' : 'New'} Category</h3>
                                <button onClick={resetForm} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="size-4" /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">Name</label>
                                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#2B4C8C]" placeholder="e.g. Technology" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">Slug</label>
                                    <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#2B4C8C]" placeholder="technology" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">Description</label>
                                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2B4C8C]" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">Color</label>
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                        {DEFAULT_COLORS.map((c) => (
                                            <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={cn('size-7 rounded-full border-2 transition-all', form.color === c ? 'border-gray-900 scale-110' : 'border-transparent')} style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300" />
                                        <span className="text-xs text-gray-600">Active</span>
                                    </label>
                                    <div>
                                        <label className="text-[10px] font-medium tracking-wider text-gray-500 uppercase mr-2">Order</label>
                                        <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="h-8 w-16 rounded-lg border border-gray-200 px-2 text-xs outline-none" />
                                    </div>
                                </div>
                                <button onClick={save} className="w-full rounded-xl bg-[#2B4C8C] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1e3a6e]">
                                    {editing ? 'Update' : 'Create'} Category
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Categories list */}
                    <div className={cn('space-y-2', creating ? 'lg:col-span-2' : 'lg:col-span-3')}>
                        {categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16">
                                <p className="text-sm font-medium text-gray-500">No categories yet</p>
                                <p className="text-xs text-gray-400">Create your first category</p>
                            </div>
                        ) : (
                            categories.map((cat) => (
                                <div key={cat.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-3.5 shadow-sm transition-shadow hover:shadow-md">
                                    <div className="flex items-center gap-3">
                                        <span className="size-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                                            <p className="text-[10px] text-gray-400">/{cat.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-gray-400">{cat.articles_count} articles</span>
                                        <button onClick={() => startEdit(cat)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"><Pencil className="size-3.5" /></button>
                                        <button onClick={() => { if (confirm('Delete this category?')) router.delete(`/crm/blog/categories/${cat.id}`); }} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"><Trash2 className="size-3.5" /></button>
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

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}
