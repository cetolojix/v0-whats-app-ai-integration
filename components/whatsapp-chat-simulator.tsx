"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { User, Send, Loader2, MessageSquare, Trash2, Phone, CheckCircle2 } from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: number
  messageId?: string
  phoneNumber?: string
}

interface WhatsAppChatSimulatorProps {
  instanceName: string
}

export function WhatsAppChatSimulator({ instanceName }: WhatsAppChatSimulatorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(`whatsapp-chat-${instanceName}`)
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch (err) {
        console.error("Failed to load saved messages:", err)
      }
    }
  }, [instanceName])

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`whatsapp-chat-${instanceName}`, JSON.stringify(messages))
    }
  }, [messages, instanceName])

  const sendMessage = async () => {
    if (!currentMessage.trim() || !phoneNumber.trim() || isLoading) return

    // Validate phone number format
    const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, "")
    if (!cleanPhoneNumber.startsWith("+") && !cleanPhoneNumber.startsWith("90")) {
      setError("Telefon numarası +90 ile başlamalı veya 90 ile başlamalıdır")
      return
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: currentMessage,
      timestamp: Date.now(),
      phoneNumber: cleanPhoneNumber,
    }

    setMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Send message via WhatsApp
      const response = await fetch("/api/evolution/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName,
          number: cleanPhoneNumber,
          message: currentMessage,
          messageType: "text",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "WhatsApp mesajı gönderilemedi")
      }

      // Show success message
      setSuccess(`WhatsApp mesajı başarıyla gönderildi! Mesaj ID: ${data.messageId}`)

      // Add confirmation message to chat
      const confirmationMessage: ChatMessage = {
        role: "assistant",
        content: `✅ WhatsApp mesajı gönderildi!\n📱 Alıcı: ${cleanPhoneNumber}\n🆔 Mesaj ID: ${data.messageId}\n⏰ Zaman: ${new Date(data.timestamp).toLocaleString("tr-TR")}`,
        timestamp: data.timestamp || Date.now(),
        messageId: data.messageId,
      }

      setMessages((prev) => [...prev, confirmationMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Mesaj gönderilemedi"
      setError(errorMessage)

      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        role: "assistant",
        content: `❌ Hata: ${errorMessage}`,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, errorChatMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem(`whatsapp-chat-${instanceName}`)
    setError("")
    setSuccess("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              WhatsApp Chat Simulator
            </CardTitle>
            <CardDescription>Gerçek WhatsApp numaralarına mesaj gönderin - "{instanceName}"</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Phone className="h-3 w-3" />
              {messages.filter((m) => m.role === "user").length} mesaj gönderildi
            </Badge>
            <Button onClick={clearChat} variant="outline" size="sm" disabled={messages.length === 0}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Phone Number Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Alıcı Telefon Numarası</label>
          <Input
            placeholder="+905551234567 veya 905551234567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">Türkiye için +90 veya 90 ile başlayan format kullanın</p>
        </div>

        <Separator />

        {/* Chat Messages */}
        <ScrollArea className="flex-1 border rounded-lg p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageSquare className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">WhatsApp Sohbeti Başlatın</h3>
                <p className="text-sm text-muted-foreground">
                  Telefon numarası girin ve gerçek WhatsApp kullanıcılarına mesaj gönderin.
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
                        message.role === "user" ? "bg-green-600 text-white" : "bg-blue-600 text-white"
                      }`}
                    >
                      {message.role === "user" ? <User className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.role === "user"
                          ? "bg-green-600 text-white"
                          : message.content.includes("✅")
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : message.content.includes("❌")
                              ? "bg-red-50 text-red-800 border border-red-200"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs opacity-70">{new Date(message.timestamp).toLocaleString("tr-TR")}</p>
                        {message.phoneNumber && <p className="text-xs opacity-70 font-mono">{message.phoneNumber}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="rounded-lg px-3 py-2 bg-muted">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">WhatsApp mesajı gönderiliyor...</span>
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

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Message Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="WhatsApp mesajınızı yazın... (Enter ile gönder)"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !phoneNumber.trim()}
            className="min-h-[60px] resize-none"
          />
          <Button
            onClick={sendMessage}
            disabled={!currentMessage.trim() || !phoneNumber.trim() || isLoading}
            className="px-3 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center bg-yellow-50 p-2 rounded border border-yellow-200">
          ⚠️ Bu gerçek WhatsApp mesajlaşmasıdır. Mesajlar gerçek telefon numaralarına gönderilecektir.
        </div>
      </CardContent>
    </Card>
  )
}
