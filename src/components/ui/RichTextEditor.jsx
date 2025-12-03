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

const Toolbar = ({ editor, disabled }) => {
  // ✅ Add disabled prop
  if (!editor) return null;

  const addImage = useCallback(() => {
    // ✅ Block image upload when disabled
    if (disabled) return;

    const url = window.prompt('Nhập URL của ảnh:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor, disabled]);

  // ✅ Button component để reuse logic
  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    disabled: buttonDisabled,
  }) => (
    <button
      type="button"
      onClick={buttonDisabled ? undefined : onClick} // ✅ Disable onClick
      disabled={buttonDisabled} // ✅ HTML disabled attribute
      className={cn(
        'rounded-md p-1.5 transition-colors',
        buttonDisabled
          ? 'cursor-not-allowed opacity-40' // ✅ Disabled styling
          : 'hover:bg-foreground cursor-pointer',
        isActive && !buttonDisabled ? 'bg-primary/20 text-primary' : ''
      )}
    >
      {children}
    </button>
  );

  return (
    <div
      className={cn(
        'border-border-default bg-background-secondary flex flex-wrap items-center gap-1 rounded-t-md border-b p-2',
        disabled && 'opacity-60' // ✅ Gray out entire toolbar when disabled
      )}
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={editor.isActive('paragraph')}
        disabled={disabled}
      >
        <Pilcrow className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        disabled={disabled}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        disabled={disabled}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        disabled={disabled}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        disabled={disabled}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        disabled={disabled}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        disabled={disabled}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        disabled={disabled}
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        disabled={disabled}
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton onClick={addImage} isActive={false} disabled={disabled}>
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
};

const uploadImage = async (file) => {
  console.log('File đã được paste hoặc thả vào, bắt đầu upload:', file.name);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const url = `https://res.cloudinary.com/demo/image/upload/docs/models.jpg?t=${Date.now()}`;
  console.log('Upload thành công, URL:', url);
  return url;
};

export default function RichTextEditor({ value, onChange, disabled = false }) {
  // ✅ Add disabled prop with default
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
    editable: !disabled, // ✅ Make editor non-editable when disabled
    editorProps: {
      attributes: {
        class: cn(
          'tiptap-content',
          disabled && 'opacity-80 cursor-not-allowed' // ✅ Visual feedback when disabled
        ),
      },
      handlePaste(view, event, slice) {
        // ✅ Block paste when disabled
        if (disabled) return false;

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
        // ✅ Block drop when disabled
        if (disabled) return false;

        // Drop image logic would go here
        return false;
      },
    },
    onUpdate({ editor }) {
      // ✅ Block onChange when disabled
      if (!disabled) {
        onChange(editor.getHTML());
      }
    },
  });

  const [, setRenderTrigger] = useState(0);

  // ✅ Update editor editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

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
    <div
      className={cn(
        'border-border-default bg-background-secondary rounded-md border',
        disabled
          ? 'cursor-not-allowed opacity-75' // ✅ Disabled container styling
          : 'focus-within:border-primary'
      )}
    >
      <Toolbar editor={editor} disabled={disabled} />

      <EditorContent
        editor={editor}
        spellCheck="false"
        className={cn(
          'min-h-[200px] p-4',
          disabled && 'pointer-events-none' // ✅ Block all pointer events when disabled
        )}
      />
    </div>
  );
}
