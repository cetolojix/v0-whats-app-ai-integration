"use client"

import type React from "react"

import { useState } from "react"
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

interface AIChatTesterProps {
  instanceName: string
}

export function AIChatTester({ instanceName }: AIChatTesterProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [conversationId, setConversationId] = useState("")

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: "user",
      content: currentMessage,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName,
          message: currentMessage,
          sender: "test-user",
          conversationId: conversationId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response")
      }

      const aiMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: data.timestamp,
      }

      setMessages((prev) => [...prev, aiMessage])
      setConversationId(data.conversationId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
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

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Chat Tester
            </CardTitle>
            <CardDescription>Test AI responses for "{instanceName}"</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Bot className="h-3 w-3" />
              {messages.filter((m) => m.role === "assistant").length} responses
            </Badge>
            <Button onClick={clearChat} variant="outline" size="sm" disabled={messages.length === 0}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 border rounded-lg p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Start a Conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Send a message to test how your AI assistant responds to different types of inquiries.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-lg px-3 py-2 bg-muted">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Message Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message here... (Press Enter to send)"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="min-h-[60px] resize-none"
          />
          <Button onClick={sendMessage} disabled={!currentMessage.trim() || isLoading} className="px-3">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          This is a test environment. Messages are not sent to actual WhatsApp users.
        </div>
      </CardContent>
    </Card>
  )
}
