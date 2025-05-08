"use client"

import { useStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, FileText, Trash2, Menu, X, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Sidebar() {
  const { notes, setCurrentNoteId, addNote, deleteNote, currentNoteId } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null)

  const filteredNotes = notes.filter((note) => note.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0
    const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0
    return dateB - dateA
  })

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  return (
    <motion.div
      className={cn(
        "bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 h-screen transition-all flex flex-col",
        "shadow-sm relative z-10"
      )}
      initial={{ width: isCollapsed ? "4rem" : "16rem" }}
      animate={{ width: isCollapsed ? "4rem" : "16rem" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.h2 
              className="text-lg font-semibold text-slate-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              Notes
            </motion.h2>
          )}
        </AnimatePresence>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "h-8 w-8 rounded-full hover:bg-slate-200 transition-all duration-200",
                  isCollapsed && "mx-auto"
                )}
              >
                {isCollapsed ? 
                  <ChevronRight className="h-4 w-4 text-slate-600" /> : 
                  <X className="h-4 w-4 text-slate-600" />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            className="p-4 border-b border-slate-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-white border-slate-200 focus:border-slate-300 focus:ring-slate-200 transition-all"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 border-b border-slate-200 flex justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => {
                  const newNoteId = addNote();
                  setCurrentNoteId(newNoteId);
                }} 
                className={cn(
                  "transition-all duration-300 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900",
                  isCollapsed ? "w-10 h-10 p-0 rounded-full" : "w-full rounded-md"
                )}
              >
                <PlusCircle className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      New Note
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Create new note
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ScrollArea className="flex-1 px-3 overflow-visible"> {/* Increased padding, added overflow-visible */}
  <AnimatePresence>
    {sortedNotes.length === 0 ? (
      <motion.div 
        className="text-center py-4 text-slate-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {searchTerm ? "No matching notes" : "No notes yet"}
      </motion.div>
    ) : (
      <motion.ul 
        className="space-y-1 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {sortedNotes.map((note, index) => (
          <motion.li 
            key={note.id} 
            className="relative group w-full" // Full width for positioning
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onMouseEnter={() => setHoveredNoteId(note.id)}
            onMouseLeave={() => setHoveredNoteId(null)}
          >
            <Button
              variant="ghost"
              onClick={() => setCurrentNoteId(note.id)}
              className={cn(
                "w-full justify-start font-normal transition-all duration-200 pr-10", 
                isCollapsed ? "px-2" : "px-3",
                currentNoteId === note.id 
                  ? "bg-slate-200 text-slate-900" 
                  : "hover:bg-slate-100 text-slate-700 hover:text-slate-900",
                "rounded-lg relative"
              )}
            >
              <FileText className={cn(
                "h-4 w-4 transition-all flex-shrink-0",
                !isCollapsed && "mr-2",
                currentNoteId === note.id ? "text-slate-800" : "text-slate-500"
              )} />
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span 
                    className="truncate flex-1 text-left max-w-[calc(100%-2rem)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {window.matchMedia('(max-width: 768px)').matches 
                      ? index + 1 
                      : note.title || "Untitled"} 
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-1 z-10" 
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete note</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        ))}
      </motion.ul>
    )}
  </AnimatePresence>
</ScrollArea>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            className="p-4 border-t border-slate-200 bg-white/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="text-xs text-slate-500 flex items-center">
              <div className="flex-1">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </div>
              <div className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
