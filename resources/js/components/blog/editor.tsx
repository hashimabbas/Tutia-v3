import { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Focus from '@tiptap/extension-focus';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Quote,
    List,
    ListOrdered,
    CheckSquare,
    Heading1,
    Heading2,
    Heading3,
    Link,
    Image,
    Table as TableIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Highlighter,
    Undo,
    Redo,
    Minus,
} from 'lucide-react';


interface EditorProps {
    content: string;
    onChange: (json: string) => void;
    placeholder?: string;
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

export function BlogEditor({ content, onChange, placeholder = 'Start writing...' }: EditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-[#2B4C8C] underline underline-offset-2 hover:text-[#1e3a6e]' },
            }),
            ImageExtension.configure({
                HTMLAttributes: { class: 'rounded-xl max-w-full h-auto my-4' },
            }),
            Table,
            TableRow,
            TableCell,
            TableHeader,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight.configure({ multicolor: true }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Placeholder.configure({ placeholder }),
            CharacterCount.configure({ limit: 100000 }),
            Focus.configure({ className: 'ring-2 ring-[#2B4C8C]/5 rounded-xl' }),
        ],
        content: content ? (typeof content === 'string' ? JSON.parse(content) : content) : '',
        onUpdate: ({ editor: ed }) => {
            const json = JSON.stringify(ed.getJSON());
            onChange(json);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#2B4C8C] prose-blockquote:border-l-[#2B4C8C] prose-blockquote:text-gray-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-xl focus:outline-none min-h-[400px] px-6 py-5',
            },
        },
    });

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/crm/blog/upload-image', {
                method: 'POST',
                headers: { Accept: 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                editor.chain().focus().setImage({ src: data.url }).run();
            }
        } catch {
        }
    }, [editor]);

    const addTable = useCallback(() => {
        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    if (!editor) return null;

    const ToolbarButton = ({ onClick, active, icon: Icon, title }: { onClick: () => void; active?: boolean; icon: typeof Bold; title: string }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                'rounded-lg p-1.5 transition-colors',
                active ? 'bg-[#2B4C8C]/10 text-[#2B4C8C]' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            )}
        >
            <Icon className="size-4" />
        </button>
    );

    return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 px-3 py-2">
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} icon={Heading1} title="Heading 1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={Heading2} title="Heading 2" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} icon={Heading3} title="Heading 3" />
                <span className="mx-1 h-5 w-px bg-gray-200" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} title="Bold" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} title="Italic" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={UnderlineIcon} title="Underline" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
                <span className="mx-1 h-5 w-px bg-gray-200" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} title="Bullet List" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} icon={CheckSquare} title="Task List" />
                <span className="mx-1 h-5 w-px bg-gray-200" />
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Align Left" />
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Align Center" />
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} icon={AlignRight} title="Align Right" />
                <span className="mx-1 h-5 w-px bg-gray-200" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={Quote} title="Blockquote" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} icon={Code} title="Code" />
                <ToolbarButton onClick={addImage} icon={Image} title="Image" />
                <ToolbarButton onClick={addTable} active={editor.isActive('table')} icon={TableIcon} title="Table" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} icon={Highlighter} title="Highlight" />
                <ToolbarButton onClick={setLink} active={editor.isActive('link')} icon={Link} title="Link" />
                <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={Minus} title="Divider" />
                <span className="mx-1 h-5 w-px bg-gray-200" />
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Undo" />
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Redo" />

                <span className="ml-auto text-[10px] text-gray-400">
                    {editor.storage.characterCount?.characters?.()?.toLocaleString() || 0} chars
                </span>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} className="min-h-[400px]" />

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
    );
}
