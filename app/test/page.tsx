"use client"

import type React from "react"
import { SiteFooter } from "@/components/site-footer"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Settings, Trash2 } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function TestPage() {
  const [prompt, setPrompt] = useState(
    "Sen yardımcı bir WhatsApp AI asistanısın. Kullanıcılara nazik ve faydalı cevaplar ver.",
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPromptEditor, setShowPromptEditor] = useState(false)

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          systemPrompt: prompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputMessage)
    }
  }

  return (
    <div className="min-h-screen bg-background digital-grid flex flex-col">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/90 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-muted-foreground hover:text-neon-cyan transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Ana Sayfa</span>
              </Link>
              <div className="w-px h-6 bg-border" />
              <h1 className="text-2xl font-bold neon-text">AI Asistan Testi</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPromptEditor(!showPromptEditor)}
                className="border-neon-blue/50 hover:border-neon-blue hover:bg-neon-blue/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Prompt Ayarları
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="border-tech-orange/50 hover:border-tech-orange hover:bg-tech-orange/10 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Temizle
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl flex-1">
        <div className="h-[calc(100vh-12rem)]">
          {/* Mobile Layout - Toggle between prompt editor and chat */}
          <div className="lg:hidden">
            {showPromptEditor ? (
              <Card className="hologram-card h-full">
                <CardHeader>
                  <CardTitle className="text-neon-cyan flex items-center justify-between">
                    <div className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      AI Prompt Ayarları
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPromptEditor(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Sohbete Dön
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Asistan Davranışı</label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="AI asistanının nasıl davranacağını belirleyin..."
                      className="min-h-[200px] bg-background/50 border-border/50 focus:border-neon-blue resize-none"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>💡 İpucu: Prompt'u istediğiniz zaman değiştirebilir ve yeni sohbetlerde kullanabilirsiniz.</p>
                  </div>
                  <Button onClick={() => setShowPromptEditor(false)} className="w-full tech-button">
                    Sohbete Dön
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="hologram-card h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-neon-purple flex items-center">
                    <div className="w-3 h-3 bg-tech-green rounded-full mr-3 animate-pulse" />
                    Sohbet Alanı
                  </CardTitle>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">AI Asistanınızla Sohbet Edin</h3>
                            <p className="text-muted-foreground">Mesajınızı yazın ve AI asistanınızı test edin!</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              message.sender === "user"
                                ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white"
                                : "bg-card border border-border/50"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-card border border-border/50 rounded-2xl px-4 py-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="flex space-x-3 pt-4 border-t border-border/50">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Mesajınızı yazın..."
                      disabled={isLoading}
                      className="flex-1 bg-background/50 border-border/50 focus:border-neon-blue"
                    />
                    <Button
                      onClick={() => sendMessage(inputMessage)}
                      disabled={isLoading || !inputMessage.trim()}
                      className="tech-button px-6"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Desktop Layout - Side by side */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8 h-full">
            {/* Prompt Editor */}
            <div className="lg:col-span-1">
              <Card className="hologram-card h-full">
                <CardHeader>
                  <CardTitle className="text-neon-cyan flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    AI Prompt Ayarları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Asistan Davranışı</label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="AI asistanının nasıl davranacağını belirleyin..."
                      className="min-h-[200px] bg-background/50 border-border/50 focus:border-neon-blue resize-none"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>💡 İpucu: Prompt'u istediğiniz zaman değiştirebilir ve yeni sohbetlerde kullanabilirsiniz.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="hologram-card h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-neon-purple flex items-center">
                    <div className="w-3 h-3 bg-tech-green rounded-full mr-3 animate-pulse" />
                    Sohbet Alanı
                  </CardTitle>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">AI Asistanınızla Sohbet Edin</h3>
                            <p className="text-muted-foreground">Mesajınızı yazın ve AI asistanınızı test edin!</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              message.sender === "user"
                                ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white"
                                : "bg-card border border-border/50"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-card border border-border/50 rounded-2xl px-4 py-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="flex space-x-3 pt-4 border-t border-border/50">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Mesajınızı yazın..."
                      disabled={isLoading}
                      className="flex-1 bg-background/50 border-border/50 focus:border-neon-blue"
                    />
                    <Button
                      onClick={() => sendMessage(inputMessage)}
                      disabled={isLoading || !inputMessage.trim()}
                      className="tech-button px-6"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
