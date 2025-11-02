import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Pilcrow,
  AlignCenter,
  AlignLeft,
  AlignRight,
  ImageIcon,
} from 'lucide-react';
import { cn } from '../../utils/lib';

const Toolbar = ({ editor }) => {
  if (!editor) return null;

  const addImage = useCallback(() => {
    const url = window.prompt('Nhập URL của ảnh:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="border-border-default bg-background-secondary flex flex-wrap items-center gap-1 rounded-t-md border-b p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={cn(
          'cursor-pointer rounded-md p-1.5 transition-colors',
          editor.isActive('paragraph')
            ? 'bg-primary/20 text-primary'
            : 'hover:bg-foreground'
        )}
      >
        <Pilcrow className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          'cursor-pointer rounded-md p-1.5 transition-colors',
          editor.isActive('bold')
            ? 'bg-primary/20 text-primary'
            : 'hover:bg-foreground'
        )}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          'cursor-pointer rounded-md p-1.5 transition-colors',
          editor.isActive('italic')
            ? 'bg-primary/20 text-primary'
            : 'hover:bg-foreground'
        )}
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          'cursor-pointer rounded-md p-1.5 transition-colors',
          editor.isActive('heading', { level: 2 })
            ? 'bg-primary/20 text-primary'
            : 'hover:bg-foreground'
        )}
      >
        <Heading2 className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'cursor-pointer rounded-md p-1.5 transition-colors',
          editor.isActive('bulletList')
            ? 'bg-primary/20 text-primary'
            : 'hover:bg-foreground'
        )}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'cursor-pointer rounded-md p-1.5 transition-colors',
          editor.isActive('orderedList')
            ? 'bg-primary/20 text-primary'
            : 'hover:bg-foreground'
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={cn(
          'cursor-pointer rounded-md p-1.5 transition-colors',
          editor.isActive({ textAlign: 'left' })
            ? 'bg-primary/20 text-primary'
            : 'hover:bg-foreground'
        )}
      >
        <AlignLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={cn(
          'cursor-pointer rounded-md p-1.5 transition-colors',
          editor.isActive({ textAlign: 'center' })
            ? 'bg-primary/20 text-primary'
            : 'hover:bg-foreground'
        )}
      >
        <AlignCenter className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={cn(
          'cursor-pointer rounded-md p-1.5 transition-colors',
          editor.isActive({ textAlign: 'right' })
            ? 'bg-primary/20 text-primary'
            : 'hover:bg-foreground'
        )}
      >
        <AlignRight className="h-4 w-4" />
      </button>

      {/* Nút chèn ảnh */}
      <button
        type="button"
        onClick={addImage}
        className="hover:bg-foreground cursor-pointer rounded-md p-1.5 transition-colors"
      >
        <ImageIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

const uploadImage = async (file) => {
  console.log('File đã được paste hoặc thả vào, bắt đầu upload:', file.name);
  // --- LOGIC UPLOAD CLOUDINARY SẼ Ở ĐÂY ---
  // 1. Hiển thị placeholder loading (phần nâng cao)
  // 2. Gọi API upload
  // 3. Chờ URL trả về
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Giả lập mạng
  // 4. Trả về URL thật
  const url = `https://res.cloudinary.com/demo/image/upload/docs/models.jpg?t=${Date.now()}`;
  console.log('Upload thành công, URL:', url);
  return url;
};

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: false,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap-content',
      },
      handlePaste(view, event, slice) {
        const files = (event.clipboardData || event.dataTransfer)?.files;
        if (!files || files.length === 0) {
          return false;
        }

        const imageFiles = Array.from(files).filter((file) =>
          /image/i.test(file.type)
        );
        if (imageFiles.length === 0) {
          return false;
        }

        event.preventDefault();

        imageFiles.forEach(async (file) => {
          const imageUrl = await uploadImage(file);
          if (imageUrl) {
            const { schema } = view.state;
            const node = schema.nodes.image.create({ src: imageUrl });
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction);
          }
        });

        return true;
      },
      handleDrop(view, event, slice, moved) {
        // Tương tự handlePaste, nhưng cho sự kiện kéo-thả
        // Code xử lý gần như y hệt, bạn có thể tách ra thành hàm chung
        // ... (Tạm thời bỏ qua để giữ sự đơn giản) ...
        return false;
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  const [, setRenderTrigger] = useState(0);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const forceRerender = () => {
      setRenderTrigger((prev) => prev + 1);
    };

    editor.on('transaction', forceRerender);
    editor.on('selectionUpdate', forceRerender);

    return () => {
      editor.off('transaction', forceRerender);
      editor.off('selectionUpdate', forceRerender);
    };
  }, [editor]);

  return (
    <div className="border-border-default focus-within:border-primary bg-background-secondary rounded-md border">
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        spellCheck="false"
        className="min-h-[200px] p-4"
      />
    </div>
  );
}
