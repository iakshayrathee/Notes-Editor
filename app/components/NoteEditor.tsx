"use client"

import { useStore } from "@/lib/store"
import TiptapEditor from "./TiptapEditor"
import AIChat from "./AIChat"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NoteEditor() {
  const { currentNoteId, notes, addNote } = useStore()
  const currentNote = notes.find((note) => note.id === currentNoteId)

  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md p-8 rounded-lg bg-white shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Note Selected</h2>
          <p className="text-slate-500 mb-6">Select a note from the sidebar or create a new one to get started.</p>
          <Button onClick={() => addNote()} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create New Note
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-8 relative overflow-hidden flex flex-col">
      <TiptapEditor note={currentNote} />
      <AIChat noteId={currentNote.id} />
    </div>
  )
}
