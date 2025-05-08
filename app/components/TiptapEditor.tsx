"use client"

import type React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"
import { useStore } from "@/lib/store"
import type { Note } from "@/lib/types"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, AlignLeft, Undo, Redo } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface Props {
  note: Note
}

export default function TiptapEditor({ note }: Props) {
  const { updateNote } = useStore()
  const [localTitle, setLocalTitle] = useState(note.title)
  const [isSaving, setIsSaving] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit, Heading.configure({ levels: [1, 2, 3] }), BulletList, OrderedList, ListItem],
    content: note.content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setIsSaving(true)
      updateNote(note.id, { content: html })

      setTimeout(() => {
        setIsSaving(false)
      }, 500)
    },
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none focus:outline-none min-h-[300px] px-4",
      },
    },
  })

  useEffect(() => {
    setLocalTitle(note.title)
  }, [note.title])

  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content)
    }
  }, [note.content, editor])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setLocalTitle(newTitle)
    setIsSaving(true)
    updateNote(note.id, { title: newTitle })

    setTimeout(() => {
      setIsSaving(false)
    }, 500)
  }

  if (!editor) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-slate-300 rounded-full"></div>
          <div className="h-3 w-3 bg-slate-300 rounded-full"></div>
          <div className="h-3 w-3 bg-slate-300 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 px-4 pt-4">
        <Input
          type="text"
          value={localTitle}
          onChange={handleTitleChange}
          placeholder="Note Title"
          className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 text-slate-800"
        />
        <div className="text-xs text-slate-500">{isSaving ? "Saving..." : "Saved"}</div>
      </div>

      <TooltipProvider>
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap gap-1 mb-4 rounded-md shadow-sm">
          <div className="flex items-center space-x-1 mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="h-8 w-8"
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="h-8 w-8"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn("h-8 w-8", editor.isActive("heading", { level: 1 }) && "bg-slate-100")}
              >
                <Heading1 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn("h-8 w-8", editor.isActive("heading", { level: 2 }) && "bg-slate-100")}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn("h-8 w-8", editor.isActive("heading", { level: 3 }) && "bg-slate-100")}
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 3</TooltipContent>
          </Tooltip>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn("h-8 w-8", editor.isActive("bold") && "bg-slate-100")}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn("h-8 w-8", editor.isActive("italic") && "bg-slate-100")}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn("h-8 w-8", editor.isActive("bulletList") && "bg-slate-100")}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn("h-8 w-8", editor.isActive("orderedList") && "bg-slate-100")}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={cn("h-8 w-8", editor.isActive("paragraph") && "bg-slate-100")}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Paragraph</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <div className="flex-1 overflow-y-auto bg-white rounded-md border border-slate-200">
        <EditorContent editor={editor} className="min-h-[300px] h-full" />
      </div>
    </div>
  )
}
