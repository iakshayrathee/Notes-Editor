"use client";

import Sidebar from "@/app/components/Sidebar";
import NoteEditor from "@/app/components/NoteEditor";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <NoteEditor />
    </div>
  );
}