'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter, Minus } from 'lucide-react'

interface EditorNotasProps {
  contenido?: string
  placeholder?: string
  onChange?: (html: string, json: object) => void
  minHeight?: number
}

export function EditorNotas({ contenido, placeholder = 'Escribe aquí...', onChange, minHeight = 160 }: EditorNotasProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
  StarterKit.configure({
    // desactiva los que manejas por separado
  }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Placeholder.configure({ placeholder }),
],
    content: contenido || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML(), editor.getJSON())
    },
  })

  if (!editor) return null

  const ToolBtn = ({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      type="button"
      style={{
        background: active ? 'var(--vino-pale)' : 'transparent',
        color: active ? 'var(--vino)' : '#4B5563',
        border: 'none', borderRadius: 4, padding: '4px 6px',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
      }}
    >
      {children}
    </button>
  )

  return (
    <div style={{ border: '0.5px solid #E8E8E8', borderRadius: 8, overflow: 'hidden', background: '#FAFAFA' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 8px', borderBottom: '0.5px solid #E8E8E8', background: '#fff', flexWrap: 'wrap' }}>
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={14} />
        </ToolBtn>
        <div style={{ width: '0.5px', height: 16, background: '#E8E8E8', margin: '0 4px' }} />
        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </ToolBtn>
        <div style={{ width: '0.5px', height: 16, background: '#E8E8E8', margin: '0 4px' }} />
        <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft size={14} />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter size={14} />
        </ToolBtn>
        <div style={{ width: '0.5px', height: 16, background: '#E8E8E8', margin: '0 4px' }} />
        <ToolBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={14} />
        </ToolBtn>
      </div>

      <EditorContent
        editor={editor}
        style={{ minHeight, padding: '10px 12px', fontSize: 13, lineHeight: 1.6, color: '#1F2937', outline: 'none' }}
      />
    </div>
  )
}