"use client"

import { useState } from "react"
import { YapayZekaChatTester } from "@/components/yapay-zeka-chat-tester"
import { Bot, User, Send, ArrowLeft, Settings, RotateCcw } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ChatTestPage() {
  const [customPrompt, setCustomPrompt] = useState(
    "Sen yardımsever bir müşteri hizmetleri asistanısın. Sorulara Türkçe olarak nazik ve profesyonel bir şekilde yanıt ver.",
  )
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [tempPrompt, setTempPrompt] = useState(customPrompt)

  const defaultPrompt =
    "Sen yardımsever bir müşteri hizmetleri asistanısın. Sorulara Türkçe olarak nazik ve profesyonel bir şekilde yanıt ver."

  const handleSavePrompt = () => {
    setCustomPrompt(tempPrompt)
    setShowPromptEditor(false)
  }

  const handleResetPrompt = () => {
    setTempPrompt(defaultPrompt)
    setCustomPrompt(defaultPrompt)
  }

  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/90 sticky top-0 z-50 relative">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-muted-foreground hover:text-neon-cyan transition-colors duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Ana Sayfa</span>
              </Link>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/30">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold neon-text">Sohbet Testi</span>
                  <div className="text-xs text-muted-foreground font-medium">Yapay Zeka Demo</div>
                </div>
              </div>
            </div>
            <Link
              href="/auth/register"
              className="tech-button px-6 py-2 text-white font-medium rounded-xl text-sm relative z-10 shadow-lg shadow-neon-blue/20"
            >
              Üye Ol
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Info Section */}
          <div className="text-center mb-8 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tech-gradient text-balance">Yapay Zeka Sohbet Testi</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              WhatsApp Yapay Zeka asistanımızı ücretsiz olarak test edin.
              <span className="text-neon-cyan font-semibold"> Gerçek zamanlı yanıtlar alın.</span>
            </p>
          </div>

          <div className="mb-6">
            <Card className="hologram-card border-0 bg-background/30 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                      <Settings className="h-5 w-5 text-neon-cyan" />
                      Yapay Zeka Prompt Ayarları
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Yapay zekanın davranışını özelleştirin ve farklı prompt'ları test edin
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-neon-blue/20 text-neon-cyan border-neon-cyan/30">
                      Özelleştirilebilir
                    </Badge>
                    <Button
                      onClick={() => setShowPromptEditor(!showPromptEditor)}
                      variant="outline"
                      size="sm"
                      className="hologram-card hover:bg-secondary/30 transition-all duration-300 bg-transparent"
                    >
                      {showPromptEditor ? "Gizle" : "Düzenle"}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {showPromptEditor && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Yapay Zeka Prompt (Yapay zekanın nasıl davranacağını belirler)
                      </label>
                      <Textarea
                        placeholder="Yapay zekanın rolünü ve davranışını tanımlayın..."
                        value={tempPrompt}
                        onChange={(e) => setTempPrompt(e.target.value)}
                        className="min-h-[120px] bg-background/50 border-border/50 backdrop-blur-sm focus:border-neon-cyan/50 focus:ring-neon-cyan/20"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleSavePrompt}
                        className="tech-button px-4 py-2 text-white shadow-lg shadow-neon-blue/30"
                      >
                        Prompt'u Kaydet
                      </Button>
                      <Button
                        onClick={handleResetPrompt}
                        variant="outline"
                        className="hologram-card hover:bg-secondary/30 transition-all duration-300 bg-transparent"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Varsayılana Dön
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground bg-background/30 p-3 rounded-lg border border-border/30">
                      <strong>İpucu:</strong> Prompt'u değiştirdikten sonra yeni bir sohbet başlatın. Farklı roller
                      deneyebilirsiniz: müşteri hizmetleri, satış danışmanı, teknik destek vb.
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          <div className="max-w-4xl mx-auto">
            <YapayZekaChatTester instanceName="demo-test" customPrompt={customPrompt} />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="hologram-card p-6 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-2xl flex items-center justify-center mx-auto">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Akıllı Yanıtlar</h3>
              <p className="text-sm text-muted-foreground">
                Gelişmiş yapay zeka ile doğal ve anlamlı konuşmalar yapın.
              </p>
            </div>

            <div className="hologram-card p-6 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-tech-orange rounded-2xl flex items-center justify-center mx-auto">
                <Send className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Hızlı İletişim</h3>
              <p className="text-sm text-muted-foreground">Anında yanıt alın ve kesintisiz sohbet deneyimi yaşayın.</p>
            </div>

            <div className="hologram-card p-6 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-2xl flex items-center justify-center mx-auto">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Kişisel Asistan</h3>
              <p className="text-sm text-muted-foreground">Size özel yanıtlar ve kişiselleştirilmiş destek alın.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12 space-y-6">
            <h2 className="text-3xl font-bold neon-text">Beğendiniz mi?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kendi WhatsApp botunuzu oluşturun ve müşterilerinizle 7/24 iletişim kurun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="tech-button inline-flex items-center justify-center px-8 py-3 text-white font-bold rounded-xl text-lg relative z-10 shadow-xl shadow-neon-blue/30"
              >
                <span className="relative z-10">Ücretsiz Başlayın</span>
              </Link>
              <Link
                href="/auth/login"
                className="hologram-card inline-flex items-center justify-center px-8 py-3 text-foreground font-bold rounded-xl text-lg hover:bg-secondary/30 transition-all duration-300"
              >
                Giriş Yapın
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
