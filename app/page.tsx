'use client';

import { useState } from 'react';

export default function Home() {
  const [note, setNote] = useState('');

  return (
    <div className="min-h-screen p-4 bg-white dark:bg-gray-900">
      <main className="max-w-4xl mx-auto">
        <textarea
          className="w-full h-[calc(100vh-2rem)] p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Start typing your note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </main>
    </div>
  );
}
