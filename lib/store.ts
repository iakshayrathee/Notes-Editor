import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Note, Message } from "./types";

interface StoreState {
  notes: Note[];
  currentNoteId: string | null;
  messages: Record<string, Message[]>;

  // Actions for notes
  addNote: () => string;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setCurrentNoteId: (id: string) => void;
  addMessage: (noteId: string, message: Message) => void;
  getMessages: (noteId: string) => Message[];
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      notes: [],
      currentNoteId: null,
      messages: {},

      addNote: () => {
        const newNote: Note = {
          id: Date.now().toString(),
          title: "Untitled Note",
          content: "",
          lastModified: new Date().toISOString(),
        };

        set((state) => ({
          notes: [...state.notes, newNote],
        }));

        return newNote.id;
      },

      updateNote: (id, data) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...data,
                  lastModified: new Date().toISOString(),
                }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          currentNoteId:
            state.currentNoteId === id
              ? state.notes.length > 1
                ? state.notes.find((note) => note.id !== id)?.id || null
                : null
              : state.currentNoteId,
        }));
      },

      setCurrentNoteId: (id) => {
        set({ currentNoteId: id });
      },

      addMessage: (noteId, message) => {
        set((state) => {
          const noteMessages = state.messages[noteId] || [];

          // If this is an update to an existing message (for loading states)
          if (noteMessages.some((m) => m.id === message.id)) {
            return {
              messages: {
                ...state.messages,
                [noteId]: noteMessages.map((m) =>
                  m.id === message.id ? message : m
                ),
              },
            };
          }

          // else add as a new message
          return {
            messages: {
              ...state.messages,
              [noteId]: [...noteMessages, message],
            },
          };
        });
      },

      getMessages: (noteId) => {
        return get().messages[noteId] || [];
      },
    }),
    {
      name: "notes-storage",
      partialize: (state) => ({
        notes: state.notes,
        messages: state.messages,
      }),
    }
  )
);
