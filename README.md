# Notes Editor

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2.3-black" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-blue" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.1-38bdf8" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Tiptap-2.1.12-yellow" alt="Tiptap" />
  <img src="https://img.shields.io/badge/Zustand-4.5.2-orange" alt="Zustand" />
  <img src="https://img.shields.io/badge/Framer_Motion-12.10.3-purple" alt="Framer Motion" />
</p>

A modern, feature-rich note-taking application with AI assistance capabilities. This elegant and intuitive notes editor combines a clean UI with powerful features to enhance your note-taking experience.

## ✨ Features

- **Rich Text Editing**: Format your notes with headings, bold, italic, and lists using the Tiptap editor
- **Real-time Auto-saving**: Never lose your work with automatic saving to local storage
- **Note Organization**: Create, search, and manage multiple notes with ease
- **AI Assistant**: Get help with your notes using the integrated Gemini AI assistant
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Collapsible Sidebar**: Maximize your writing space with a toggleable sidebar
- **Beautiful Animations**: Smooth transitions powered by Framer Motion
- **Dark Mode Support**: Coming soon

## 🚀 Tech Stack

- **Frontend Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: Zustand with persistence middleware
- **Rich Text Editor**: Tiptap (based on ProseMirror)
- **Animations**: Framer Motion
- **AI Integration**: Google Gemini API

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- A Gemini API key (for AI assistant functionality)

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/akshayrathee/notepad.git
cd notepad
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following content:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

## 🏃‍♂️ Running the Application

1. **Start the development server**

```bash
npm run dev
# or
yarn dev
```

2. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to use the application.

## 🧩 Project Structure

```
/app
  /components        # React components
    - AIChat.tsx     # AI assistant chat interface
    - NoteEditor.tsx # Main note editing container
    - Sidebar.tsx    # Notes navigation sidebar
    - TiptapEditor.tsx # Rich text editor implementation
  /page.tsx          # Main application page
/lib
  - store.ts        # Zustand store for state management
  - types.ts        # TypeScript type definitions
  - utils.ts        # Utility functions
/styles             # Global styles
```

## 🔍 Key Features Explained

### Rich Text Editing
The application uses Tiptap to provide a powerful rich text editing experience with support for various formatting options including headings, lists, and text styling.

### Auto-saving
All changes to notes are automatically saved to localStorage with a debounce mechanism to prevent excessive updates while providing real-time feedback on the saving status.

### AI Assistant
Each note has its own AI chat history powered by Google's Gemini API. The chat interface can be toggled, minimized, and maximized for a seamless experience.

## 🏗️ Building for Production

```bash
npm run build
# or
yarn build
```

Then start the production server:

```bash
npm run start
# or
yarn start
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and React by Akshay Rathee