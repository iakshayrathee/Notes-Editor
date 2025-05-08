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
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  Undo,
  Redo,
  Clock,
  Save,
} from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Props {
  note: Note
}

export default function TiptapEditor({ note }: Props) {
  const { updateNote } = useStore()
  const [localTitle, setLocalTitle] = useState(note.title)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const editor = useEditor({
    extensions: [StarterKit, Heading.configure({ levels: [1, 2, 3] }), BulletList, OrderedList, ListItem],
    content: note.content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      setIsSaving(true)
      saveTimeoutRef.current = setTimeout(() => {
        updateNote(note.id, { content: html })
        setIsSaving(false)
        setLastSaved(new Date())
      }, 500)
    },
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none focus:outline-none min-h-[300px] px-4 py-2",
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

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setIsSaving(true)

    saveTimeoutRef.current = setTimeout(() => {
      updateNote(note.id, { title: newTitle })
      setIsSaving(false)
      setLastSaved(new Date())
    }, 500)
  }

  const formatLastSaved = () => {
    if (!lastSaved) return ""

    const now = new Date()
    const diff = now.getTime() - lastSaved.getTime()

    if (diff < 60000) {
      return "just now"
    }
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    }

    return lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!editor) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex space-x-2">
          <motion.div
            className="h-3 w-3 bg-slate-300 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.2 }}
          />
          <motion.div
            className="h-3 w-3 bg-slate-300 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.2, delay: 0.2 }}
          />
          <motion.div
            className="h-3 w-3 bg-slate-300 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.2, delay: 0.4 }}
          />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="w-full h-full flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-2 px-4 pt-4">
        <Input
          type="text"
          value={localTitle}
          onChange={handleTitleChange}
          placeholder="Note Title"
          className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 text-slate-800 transition-all duration-200 hover:bg-slate-50 focus:bg-slate-50 rounded-md flex-1 mr-2"
        />
        <motion.div
          className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 min-w-[120px] w-[120px]"
          animate={{
            backgroundColor: isSaving ? "rgb(241 245 249)" : "rgb(255 255 255)",
            borderColor: isSaving ? "rgb(226 232 240)" : "rgb(241 245 249)",
          }}
          transition={{ duration: 0.2 }}
        >
          {isSaving ? (
            <motion.div
              className="flex items-center justify-center w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Save className="h-3 w-3 mr-1 text-slate-400" />
              <span className="whitespace-nowrap">Saving...</span>
            </motion.div>
          ) : lastSaved ? (
            <motion.div
              className="flex items-center justify-center w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Clock className="h-3 w-3 mr-1 text-slate-400" />
              <span className="whitespace-nowrap">Saved {formatLastSaved()}</span>
            </motion.div>
          ) : (
            <span className="whitespace-nowrap">Ready to edit</span>
          )}
        </motion.div>
      </div>

      <TooltipProvider>
        <motion.div
          className="sticky top-0 z-10 bg-white border border-slate-200 px-4 py-2 flex flex-wrap gap-1 mb-4 rounded-lg shadow-sm w-full"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center space-x-1 mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="h-8 w-8 transition-all duration-200 hover:bg-slate-100"
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
                  className="h-8 w-8 transition-all duration-200 hover:bg-slate-100"
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
                className={cn(
                  "h-8 w-8 transition-all duration-200",
                  editor.isActive("heading", { level: 1 })
                    ? "bg-slate-200 text-slate-900"
                    : "hover:bg-slate-100 text-slate-700",
                )}
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
                className={cn(
                  "h-8 w-8 transition-all duration-200",
                  editor.isActive("heading", { level: 2 })
                    ? "bg-slate-200 text-slate-900"
                    : "hover:bg-slate-100 text-slate-700",
                )}
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
                className={cn(
                  "h-8 w-8 transition-all duration-200",
                  editor.isActive("heading", { level: 3 })
                    ? "bg-slate-200 text-slate-900"
                    : "hover:bg-slate-100 text-slate-700",
                )}
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
                className={cn(
                  "h-8 w-8 transition-all duration-200",
                  editor.isActive("bold") ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100 text-slate-700",
                )}
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
                className={cn(
                  "h-8 w-8 transition-all duration-200",
                  editor.isActive("italic") ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100 text-slate-700",
                )}
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
                className={cn(
                  "h-8 w-8 transition-all duration-200",
                  editor.isActive("bulletList") ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100 text-slate-700",
                )}
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
                className={cn(
                  "h-8 w-8 transition-all duration-200",
                  editor.isActive("orderedList") ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100 text-slate-700",
                )}
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
                className={cn(
                  "h-8 w-8 transition-all duration-200",
                  editor.isActive("paragraph") ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100 text-slate-700",
                )}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Paragraph</TooltipContent>
          </Tooltip>
        </motion.div>
      </TooltipProvider>

      <motion.div
        className="flex-1 overflow-y-auto bg-white rounded-lg border border-slate-200 shadow-sm relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{ height: 'calc(100% - 120px)' }}
      >
        <EditorContent editor={editor} className="min-h-[300px] h-full absolute inset-0 overflow-auto" />
      </motion.div>
    </motion.div>
  )
}
