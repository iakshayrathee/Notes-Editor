"use client"

import { useStore } from "@/lib/store"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, FileText, Trash2, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Sidebar() {
  const { notes, setCurrentNoteId, addNote, deleteNote, currentNoteId } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(false)


  const filteredNotes = notes.filter((note) => note.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0
    const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0
    return dateB - dateA
  })

  return (
    <div
      className={cn(
        "bg-slate-50 border-r border-slate-200 h-screen transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-200">
        {!isCollapsed && <h2 className="text-lg font-semibold text-slate-800">Notes</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("h-8 w-8", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-white"
            />
          </div>
        </div>
      )}

      <div className="p-4 border-b border-slate-200 flex justify-center">
        <Button onClick={() => addNote()} className={cn("transition-all", isCollapsed ? "w-10 h-10 p-0" : "w-full")}>
          <PlusCircle className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "New Note"}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {sortedNotes.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-sm">
              {searchTerm ? "No matching notes" : "No notes yet"}
            </div>
          ) : (
            <ul className="space-y-1">
              {sortedNotes.map((note) => (
                <li key={note.id} className="relative group">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentNoteId(note.id)}
                    className={cn(
                      "w-full justify-start font-normal hover:bg-slate-200 transition-all",
                      isCollapsed ? "px-2" : "px-3",
                      currentNoteId === note.id && "bg-slate-200",
                    )}
                  >
                    <FileText className={cn("h-4 w-4 text-slate-500", !isCollapsed && "mr-2")} />
                    {!isCollapsed && <span className="truncate">{note.title || "Untitled"}</span>}
                  </Button>

                  {!isCollapsed && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 h-7 w-7"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>

      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </div>
        </div>
      )}
    </div>
  )
}
