"use client"

import type React from "react"

import { NavigationHeader } from "@/components/navigation-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HeadphonesIcon } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      category: "",
    })
    setIsSubmitting(false)

    // Show success message (you can implement a toast here)
    alert("Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background digital-grid flex flex-col">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <NavigationHeader />

      <div className="container mx-auto px-6 py-12 flex-1 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tech-gradient">İletişim</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              WhatsApp AI otomasyon çözümlerimiz hakkında merak ettiklerinizi sorun.
              <span className="text-neon-cyan font-semibold"> Uzman ekibimiz size yardımcı olmaya hazır!</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Cards */}
              <Card className="hologram-card">
                <CardHeader>
                  <CardTitle className="text-neon-blue flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    E-posta İletişim
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Genel Sorular:</p>
                    <p className="text-sm text-muted-foreground">info@whatsappai.com</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Teknik Destek:</p>
                    <p className="text-sm text-muted-foreground">destek@whatsappai.com</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Satış:</p>
                    <p className="text-sm text-muted-foreground">satis@whatsappai.com</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hologram-card">
                <CardHeader>
                  <CardTitle className="text-neon-purple flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Telefon Desteği
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Müşteri Hizmetleri:</p>
                    <p className="text-sm text-muted-foreground">+90 (212) 555 0123</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Teknik Destek:</p>
                    <p className="text-sm text-muted-foreground">+90 (212) 555 0124</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-tech-green">
                    <div className="w-2 h-2 bg-tech-green rounded-full animate-pulse" />
                    <span>7/24 Destek Hattı</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hologram-card">
                <CardHeader>
                  <CardTitle className="text-neon-cyan flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Ofis Adresi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      WhatsApp AI Automation Platform
                      <br />
                      Teknoloji Merkezi
                      <br />
                      İstanbul, Türkiye
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hologram-card">
                <CardHeader>
                  <CardTitle className="text-tech-orange flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Çalışma Saatleri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Pazartesi - Cuma:</p>
                    <p className="text-sm text-muted-foreground">09:00 - 18:00</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Hafta Sonu:</p>
                    <p className="text-sm text-muted-foreground">Sadece acil destek</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Teknik Destek:</p>
                    <p className="text-sm text-muted-foreground">7/24 Aktif</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="hologram-card">
                <CardHeader>
                  <CardTitle className="text-neon-green flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Bize Mesaj Gönderin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Ad Soyad *</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Adınız ve soyadınız"
                          required
                          className="bg-background/50 border-border/50 focus:border-neon-blue"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">E-posta *</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="ornek@email.com"
                          required
                          className="bg-background/50 border-border/50 focus:border-neon-blue"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Telefon</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+90 (5xx) xxx xx xx"
                          className="bg-background/50 border-border/50 focus:border-neon-blue"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Konu Kategorisi *</label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger className="bg-background/50 border-border/50 focus:border-neon-blue">
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Genel Bilgi</SelectItem>
                            <SelectItem value="sales">Satış ve Fiyatlandırma</SelectItem>
                            <SelectItem value="technical">Teknik Destek</SelectItem>
                            <SelectItem value="billing">Faturalama</SelectItem>
                            <SelectItem value="partnership">İş Ortaklığı</SelectItem>
                            <SelectItem value="other">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Konu *</label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="Mesajınızın konusu"
                        required
                        className="bg-background/50 border-border/50 focus:border-neon-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Mesaj *</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Detaylı mesajınızı buraya yazın..."
                        required
                        rows={6}
                        className="bg-background/50 border-border/50 focus:border-neon-blue resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="tech-button flex-1 flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Mesaj Gönder
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setFormData({
                            name: "",
                            email: "",
                            phone: "",
                            subject: "",
                            message: "",
                            category: "",
                          })
                        }
                        className="border-border/50 hover:border-tech-orange hover:bg-tech-orange/10"
                      >
                        Temizle
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      * işaretli alanlar zorunludur. Mesajınız 24 saat içinde yanıtlanacaktır.
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Support */}
          <div className="text-center space-y-6 py-8">
            <h2 className="text-3xl font-bold neon-text">Hızlı Destek</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Acil durumlar için 7/24 teknik destek hattımızı arayabilir veya platformumuzu ücretsiz test edebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+902125550124"
                className="tech-button inline-flex items-center justify-center px-8 py-3 text-white font-semibold rounded-xl"
              >
                <HeadphonesIcon className="w-5 h-5 mr-2" />
                Acil Destek: (212) 555 0124
              </a>
              <a
                href="/test"
                className="hologram-card inline-flex items-center justify-center px-8 py-3 text-foreground font-semibold rounded-xl hover:bg-secondary/30 transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Ücretsiz Test Et
              </a>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
