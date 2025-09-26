"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, User, Send, Loader2, MessageSquare, Trash2 } from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface YapayZekaChatTesterProps {
  instanceName: string
  customPrompt?: string
}

export function YapayZekaChatTester({ instanceName, customPrompt }: YapayZekaChatTesterProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [conversationId, setConversationId] = useState("")

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 50)

    return () => clearTimeout(timer)
  }, [messages])

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        scrollToBottom()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isLoading])

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: "user",
      content: currentMessage,
      timestamp: Date.now(),
    }

    const messageToSend = currentMessage
    setCurrentMessage("")
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError("")

    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName,
          message: messageToSend,
          sender: "test-user",
          conversationId: conversationId || undefined,
          customPrompt: customPrompt || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Yapay Zeka yanıtı alınamadı")
      }

      const aiMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: data.timestamp,
      }

      setMessages((prev) => [...prev, aiMessage])
      setConversationId(data.conversationId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Mesaj gönderilemedi"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }

  const clearChat = () => {
    setMessages([])
    setConversationId("")
    setError("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  return (
    <Card className="hologram-card flex flex-col border-0 bg-background/30 backdrop-blur-sm shadow-2xl h-[600px] md:h-[700px]">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <MessageSquare className="h-6 w-6 text-neon-cyan" />
              Yapay Zeka Sohbet Testi
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              "{instanceName}" için Yapay Zeka yanıtlarını test edin
              {customPrompt && (
                <Badge variant="outline" className="ml-2 text-xs bg-neon-blue/20 text-neon-cyan border-neon-cyan/30">
                  Özel Prompt Aktif
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 bg-background/50 border-border/50">
              <Bot className="h-3 w-3" />
              {messages.filter((m) => m.role === "assistant").length} yanıt
            </Badge>
            <Button
              onClick={clearChat}
              variant="outline"
              size="sm"
              disabled={messages.length === 0}
              className="hologram-card hover:bg-secondary/30 transition-all duration-300 bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-6 min-h-0">
        <div className="flex-1 border border-border/50 rounded-xl bg-background/20 backdrop-blur-sm relative min-h-0">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 pb-6">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px] text-center">
                  <div>
                    <Bot className="mx-auto h-16 w-16 text-neon-cyan mb-6 opacity-80" />
                    <h3 className="text-2xl font-bold text-foreground mb-3">Sohbeti Başlatın</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                      Yapay Zeka asistanınızın farklı türdeki sorulara nasıl yanıt verdiğini test etmek için bir mesaj
                      gönderin.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[85%] sm:max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-neon-blue to-neon-purple text-white shadow-neon-blue/30"
                              : "bg-gradient-to-br from-neon-cyan to-tech-orange text-white shadow-neon-cyan/30"
                          }`}
                        >
                          {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm break-words ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 text-foreground border border-neon-blue/30"
                              : "bg-background/50 text-foreground border border-border/50"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {new Date(message.timestamp).toLocaleTimeString("tr-TR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan to-tech-orange text-white shadow-lg shadow-neon-cyan/30">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div className="rounded-2xl px-4 py-3 bg-background/50 border border-border/50 backdrop-blur-sm shadow-lg">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-neon-cyan" />
                            <span className="text-sm text-muted-foreground">Yapay Zeka düşünüyor...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-500/30 bg-red-500/10 backdrop-blur-sm flex-shrink-0">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 flex-shrink-0 items-end">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              placeholder="Mesajınızı buraya yazın... (Göndermek için Enter'a basın)"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              rows={2}
              className="resize-none bg-background/50 border-border/50 backdrop-blur-sm focus:border-neon-cyan/50 focus:ring-neon-cyan/20 transition-all duration-200"
              style={{ minHeight: "60px", maxHeight: "60px" }}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!currentMessage.trim() || isLoading}
            className="tech-button px-4 py-3 text-white shadow-lg shadow-neon-blue/30 h-[60px] flex-shrink-0"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center opacity-70 flex-shrink-0">
          Bu bir test ortamıdır. Mesajlar gerçek WhatsApp kullanıcılarına gönderilmez.
        </div>
      </CardContent>
    </Card>
  )
}
