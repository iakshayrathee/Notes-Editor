"use client"

import { useState, useRef, useEffect } from "react"
import { useStore } from "@/lib/store"
import type { Message } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, X, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"

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
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const geminiAPI = async (prompt: string): Promise<string> => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
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
      id: `user-${Date.now()}`,
      content: input,
      role: "user",
    }
    addMessage(noteId, userMessage)
    setInput("")

    try {
      const loadingId = `assistant-${Date.now()}`
      const loadingMessage: Message = {
        id: loadingId,
        content: "Thinking...",
        role: "assistant",
        isLoading: true,
      }
      addMessage(noteId, loadingMessage)

      const conversationHistory = getMessages(noteId)
        .filter((msg) => !msg.isLoading)
        .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n")

      const prompt = conversationHistory ? `${conversationHistory}\nUser: ${input}\nAssistant:` : input

      const aiResponse = await geminiAPI(prompt)

      const aiMessage: Message = {
        id: loadingId,
        content: aiResponse,
        role: "assistant",
        isLoading: false,
      }
      addMessage(noteId, aiMessage)
    } catch (error) {
      const errorMessage: Message = {
        id: `assistant-${Date.now() + 1}`,
        content: "Sorry, I couldn't process your request right now.",
        role: "assistant",
        isLoading: false,
      }
      addMessage(noteId, errorMessage)
    }
  }

  useEffect(() => {
    if (messagesEndRef.current && scrollAreaRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      console.log("ScrollArea height:", scrollAreaRef.current.getBoundingClientRect().height)
      console.log("Messages count:", messages.length)
    }
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  useEffect(() => {
    localStorage.setItem("chatOpen", JSON.stringify(isOpen))
    localStorage.setItem("chatMinimized", JSON.stringify(isMinimized))
  }, [isOpen, isMinimized])

  useEffect(() => {
    const savedOpen = localStorage.getItem("chatOpen")
    const savedMinimized = localStorage.getItem("chatMinimized")

    if (savedOpen) {
      setIsOpen(JSON.parse(savedOpen))
    }
    if (savedMinimized) {
      setIsMinimized(JSON.parse(savedMinimized))
    }
  }, [])

  const formatMessage = (content: string) => {
    if (!content) return ""

    content = content.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-slate-100 p-3 rounded-md my-3 overflow-x-auto text-sm font-mono border border-slate-200">$1</pre>',
    )
    content = content.replace(
      /`([^`]+)`/g,
      '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
    )
    content = content.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    content = content.replace(/\*([^*]+)\*/g, "<em>$1</em>")
    content = content.replace(/\n/g, "<br>")

    return content
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Button
              onClick={() => {
                setIsOpen(true)
                setIsMinimized(false)
              }}
              className="fixed bottom-4 right-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl hover:from-slate-800 hover:to-slate-900 transition-all duration-300 z-50"
              size="icon"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              "fixed right-4 bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col z-50 overflow-hidden",
              isMinimized ? "bottom-4 w-64 h-12" : "bottom-20 w-80 max-h-[500px] h-[70vh]",
            )}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "3rem" : "70vh",
              width: isMinimized ? "16rem" : "20rem",
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              height: { type: "spring", stiffness: 300, damping: 30 },
              width: { type: "spring", stiffness: 300, damping: 30 },
            }}
          >
            <motion.div
              className="flex items-center justify-between p-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-t-lg"
              layout
            >
              <motion.div className="flex items-center" layout>
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="bg-slate-200 text-slate-800 text-xs">AI</AvatarFallback>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                </Avatar>
                <motion.h3 className="font-medium text-sm text-slate-800" layout>
                  AI Assistant
                </motion.h3>
              </motion.div>
              <motion.div className="flex items-center space-x-1" layout>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-slate-100 transition-colors"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? (
                    <ChevronUp className="h-4 w-4 text-slate-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-600" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-slate-100 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4 text-slate-600" />
                </Button>
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  className="flex flex-col flex-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ScrollArea
                    ref={scrollAreaRef}
                    className="p-4 overflow-y-auto flex-1"
                    style={{ height: "calc(70vh - 9rem)", maxHeight: "calc(70vh - 9rem)" }}
                  >
                    <div className="min-h-full">
                      {messages.length === 0 && (
                        <motion.div
                          className="flex flex-col items-center text-center p-4 mt-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 20,
                              delay: 0.3,
                            }}
                            className="bg-slate-100 rounded-full p-4 mb-4"
                          >
                            <Sparkles className="h-8 w-8 text-slate-500" />
                          </motion.div>
                          <motion.h3
                            className="text-slate-800 font-medium mb-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            AI Assistant
                          </motion.h3>
                          <motion.p
                            className="text-slate-500 text-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            Ask me anything about your notes or how I can help you.
                          </motion.p>
                        </motion.div>
                      )}
                      {messages.map((msg, index) => (
                        <motion.div
                          key={msg.id}
                          className={cn("flex mb-4", msg.role === "user" ? "justify-end" : "justify-start")}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {msg.role === "assistant" && (
                            <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                              <AvatarFallback className="bg-slate-200 text-slate-800 text-xs">AI</AvatarFallback>
                              <AvatarImage src="/placeholder.svg?height=40&width=40" />
                            </Avatar>
                          )}
                          <motion.div
                            className={cn(
                              "max-w-[80%] rounded-lg p-3 text-sm shadow-sm break-words",
                              msg.role === "user"
                                ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-tr-none"
                                : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200",
                            )}
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          >
                            {msg.isLoading ? (
                              <div className="flex space-x-1 items-center h-5">
                                <motion.div
                                  className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{
                                    duration: 0.6,
                                    repeat: Number.POSITIVE_INFINITY,
                                    repeatType: "loop",
                                    ease: "easeInOut",
                                    delay: 0,
                                  }}
                                />
                                <motion.div
                                  className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{
                                    duration: 0.6,
                                    repeat: Number.POSITIVE_INFINITY,
                                    repeatType: "loop",
                                    ease: "easeInOut",
                                    delay: 0.15,
                                  }}
                                />
                                <motion.div
                                  className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{
                                    duration: 0.6,
                                    repeat: Number.POSITIVE_INFINITY,
                                    repeatType: "loop",
                                    ease: "easeInOut",
                                    delay: 0.3,
                                  }}
                                />
                              </div>
                            ) : (
                              <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                            )}
                          </motion.div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <motion.div
                    className="p-3 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
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
                        className="flex-1 border-slate-200 focus:border-slate-300 focus:ring-slate-200 transition-all bg-white"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim()}
                        className={cn(
                          "h-8 w-8 rounded-full transition-all duration-300",
                          input.trim()
                            ? "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
                            : "bg-slate-200 text-slate-400",
                        )}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}