"use client"

import { useState, useRef, useEffect } from "react"
import { useStore } from "@/lib/store"
import type { Message } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, X, ChevronDown, ChevronUp, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { AvatarFallback } from "@/components/ui/avatar"
import { AvatarImage } from "@/components/ui/avatar"

interface Props {
  noteId: string
}

export default function AIChat({ noteId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const { addMessage, getMessages } = useStore()
  const messages = getMessages(noteId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const geminiAPI = async (prompt: string): Promise<string> => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
      
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch from Gemini API: ${response.status}`)
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response at this time."
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      return "Sorry, I encountered an error while processing your request."
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    }
    addMessage(noteId, userMessage)
    setInput("")

    try {
      const loadingId = Date.now().toString()
      const loadingMessage: Message = {
        id: loadingId,
        content: "Thinking...",
        role: "assistant",
        isLoading: true,
      }
      addMessage(noteId, loadingMessage)

      const conversationHistory = getMessages(noteId)
        .filter(msg => !msg.isLoading) 
        .slice(-4) 
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n')
      
      // Prepare prompt with conversation history
      const prompt = conversationHistory 
        ? `${conversationHistory}\nUser: ${input}\nAssistant:` 
        : input

      const aiResponse = await geminiAPI(prompt)

      const aiMessage: Message = {
        id: loadingId,
        content: aiResponse,
        role: "assistant",
      }
      addMessage(noteId, aiMessage)
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I couldn't process your request right now.",
        role: "assistant",
      }
      addMessage(noteId, errorMessage)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const formatMessage = (content: string) => {
    if (!content) return ""

    // code blocks
    content = content.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-slate-100 p-2 rounded my-2 overflow-x-auto text-sm">$1</pre>',
    )

    // inline code
    content = content.replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 rounded text-sm">$1</code>')

    // bold
    content = content.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")

    //  italic
    content = content.replace(/\*([^*]+)\*/g, "<em>$1</em>")

    // line breaks
    content = content.replace(/\n/g, "<br>")

    return content
  }

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(!isOpen)
          setIsMinimized(false)
        }}
        className="fixed bottom-4 right-4 bg-slate-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all z-50"
        size="icon"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div
          className={cn(
            "fixed right-4 bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col z-50 transition-all duration-300 ease-in-out",
            isMinimized ? "bottom-4 w-64 h-12" : "bottom-20 w-80 max-h-[500px] h-[70vh]",
          )}
        >
          <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50 rounded-t-lg">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarFallback>AI</AvatarFallback>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
              </Avatar>
              <h3 className="font-medium text-sm">AI Assistant</h3>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <Bot className="h-12 w-12 text-slate-300 mb-2" />
                    <h3 className="text-slate-800 font-medium mb-1">AI Assistant</h3>
                    <p className="text-slate-500 text-sm">Ask me anything about your notes or how I can help you.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                        {msg.role === "assistant" && (
                          <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                            <AvatarFallback>AI</AvatarFallback>
                            <AvatarImage src="/placeholder.svg?height=40&width=40" />
                          </Avatar>
                        )}

                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg p-3 text-sm",
                            msg.role === "user"
                              ? "bg-slate-800 text-white rounded-tr-none"
                              : "bg-slate-100 text-slate-800 rounded-tl-none",
                          )}
                        >
                          {msg.isLoading ? (
                            <div className="flex space-x-1 items-center h-5">
                              <div
                                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              ></div>
                              <div
                                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              ></div>
                              <div
                                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              ></div>
                            </div>
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="p-3 border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-center space-x-2"
                >
                  <Input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!input.trim()} className="h-8 w-8">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
