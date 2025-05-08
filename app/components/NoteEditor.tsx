"use client"

import { useStore } from "@/lib/store"
import TiptapEditor from "./TiptapEditor"
import AIChat from "./AIChat"
import { PlusCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export default function NoteEditor() {
  const { currentNoteId, notes, addNote } = useStore()
  const currentNote = notes.find((note) => note.id === currentNoteId)

  if (!currentNote) {
    return (
      <motion.div
        className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center max-w-md p-10 rounded-xl bg-white shadow-lg border border-slate-100"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2,
          }}
        >
          <motion.div
            className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <FileText className="h-8 w-8 text-slate-500" />
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-slate-800 mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            No Note Selected
          </motion.h2>
          <motion.p
            className="text-slate-500 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            Select a note from the sidebar or create a new one to get started with your writing journey.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Button
              onClick={() => {
                const newNoteId = addNote();
                // Set the current note to the newly created note
                useStore.getState().setCurrentNoteId(newNoteId);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 transition-all duration-300 px-6 py-6 w-full h-6"
              size="lg"
            >
              <PlusCircle className="h-5 w-5" />
              Create New Note
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentNoteId}
        className="flex-1 p-4 md:p-8 relative overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 to-white"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <TiptapEditor note={currentNote} />
        <AIChat noteId={currentNote.id} />
      </motion.div>
    </AnimatePresence>
  )
}
