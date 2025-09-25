"use client"

import type React from "react"

import { useState } from "react"
import { NavigationHeader } from "@/components/navigation-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, Lock, CreditCard, ArrowRight, User, Building, Phone, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState("standart")
  const [currentStep, setCurrentStep] = useState(1) // 1: Form, 2: Success
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [showVerificationInput, setShowVerificationInput] = useState(false)
  const [isVerificationSent, setIsVerificationSent] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    company: "",
    taxNumber: "",
    address: "",
    city: "",
    acceptTerms: false,
    acceptKvkk: false,
  })

  const plans = [
    {
      id: "baslangic",
      name: "Başlangıç",
      price: "999",
      features: ["1.000 kişi/ay", "1 WhatsApp hattı", "Temel otomasyon"],
    },
    {
      id: "standart",
      name: "Standart",
      price: "1.999",
      features: ["2.000 kişi/ay", "3 WhatsApp hattı", "AI destekli cevaplar"],
      popular: true,
    },
    {
      id: "profesyonel",
      name: "Profesyonel",
      price: "4.999",
      features: ["5.000 kişi/ay", "5 WhatsApp hattı", "Gelişmiş AI"],
    },
  ]

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value
    setFormData({ ...formData, phone })

    if (phone.replace(/\D/g, "").length >= 10) {
      setShowVerificationInput(true)
    } else {
      setShowVerificationInput(false)
      setIsVerificationSent(false)
      setIsPhoneVerified(false)
      setVerificationCode("")
    }
  }

  const sendVerificationCode = async () => {
    if (!formData.phone) {
      setError("Telefon numarası gerekli")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      })

      const result = await response.json()

      if (result.success) {
        setIsVerificationSent(true)
        setError("")
      } else {
        setError(result.error || "SMS gönderilemedi")
      }
    } catch (error) {
      setError("Bağlantı hatası")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPhone = async () => {
    if (!verificationCode) {
      setError("Doğrulama kodu gerekli")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, code: verificationCode }),
      })

      const result = await response.json()

      if (result.success) {
        setIsPhoneVerified(true)
        setError("")
      } else {
        setError(result.error || "Doğrulama başarısız")
      }
    } catch (error) {
      setError("Bağlantı hatası")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPhoneVerified) {
      setError("Önce telefon numaranızı doğrulayın")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor")
      return
    }

    if (formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalı")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, selectedPlan }),
      })

      const result = await response.json()

      if (result.success) {
        setCurrentStep(2)
      } else {
        setError(result.error || "Üyelik oluşturulamadı")
      }
    } catch (error) {
      setError("Bağlantı hatası")
    } finally {
      setIsLoading(false)
    }
  }

  // Success Step
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-background digital-grid flex flex-col">
        <div className="circuit-pattern absolute inset-0 pointer-events-none" />
        <NavigationHeader />

        <div className="container mx-auto px-6 py-12 flex-1 relative z-10">
          <div className="max-w-md mx-auto">
            <Card className="hologram-card">
              <CardContent className="p-8 text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-tech-green mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Üyelik Başarılı!</h2>
                <p className="text-muted-foreground">Hesabınız başarıyla oluşturuldu. Artık giriş yapabilirsiniz.</p>
                <Button onClick={() => router.push("/login")} className="w-full tech-button">
                  Giriş Sayfasına Git
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background digital-grid flex flex-col">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <NavigationHeader />

      <div className="container mx-auto px-6 py-12 flex-1 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tech-gradient">Üyelik Oluştur</h1>
            <p className="text-xl text-muted-foreground">WhatsApp AI otomasyonuna başlamak için bilgilerinizi girin</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Plan Selection */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="hologram-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-neon-blue" />
                    <span>Paket Seçimi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? "border-neon-blue bg-neon-blue/10"
                          : "border-border/50 hover:border-neon-cyan/50"
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{plan.name}</h3>
                        {plan.popular && (
                          <span className="text-xs bg-neon-purple text-white px-2 py-1 rounded-full">Popüler</span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-neon-blue mb-2">₺{plan.price}/ay</div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card className="hologram-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-2 text-tech-green">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Güvenli Ödeme</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>SSL Sertifikası</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>İyzico Güvenli Ödeme</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>KVKK Uyumlu</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Signup Form */}
            <div className="lg:col-span-2">
              <Card className="hologram-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-neon-purple" />
                    <span>Üyelik Bilgileri</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Ad *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                          className="hologram-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Soyad *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                          className="hologram-input"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-posta *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="hologram-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Telefon *{isPhoneVerified && <CheckCircle className="w-4 h-4 text-tech-green inline ml-2" />}
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          required
                          className="hologram-input"
                          placeholder="0555 123 45 67"
                          disabled={isPhoneVerified}
                        />
                      </div>
                    </div>

                    {showVerificationInput && !isPhoneVerified && (
                      <div className="space-y-4 p-4 border border-neon-blue/30 rounded-lg bg-neon-blue/5">
                        <div className="flex items-center space-x-2 text-neon-blue">
                          <Phone className="w-4 h-4" />
                          <span className="font-semibold">Telefon Doğrulama</span>
                        </div>

                        {!isVerificationSent ? (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {formData.phone} numarasına doğrulama kodu göndermek için butona tıklayın.
                            </p>
                            <Button
                              type="button"
                              onClick={sendVerificationCode}
                              disabled={isLoading || !formData.phone}
                              className="tech-button"
                            >
                              {isLoading ? "Gönderiliyor..." : "Doğrulama Kodu Gönder"}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {formData.phone} numarasına gönderilen 6 haneli kodu girin:
                            </p>
                            <div className="flex space-x-2">
                              <Input
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="123456"
                                maxLength={6}
                                className="hologram-input text-center text-lg tracking-widest flex-1"
                              />
                              <Button
                                type="button"
                                onClick={verifyPhone}
                                disabled={isLoading || !verificationCode}
                                className="tech-button px-6"
                              >
                                {isLoading ? "Doğrulanıyor..." : "Doğrula"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Password Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Şifre *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          className="hologram-input"
                          minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                          className="hologram-input"
                          minLength={6}
                        />
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                        <Building className="w-5 h-5 text-tech-orange" />
                        <span>Şirket Bilgileri</span>
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Şirket Adı *</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            required
                            className="hologram-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxNumber">Vergi Numarası</Label>
                          <Input
                            id="taxNumber"
                            value={formData.taxNumber}
                            onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                            className="hologram-input"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Adres *</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          required
                          className="hologram-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">Şehir *</Label>
                        <Select onValueChange={(value) => setFormData({ ...formData, city: value })}>
                          <SelectTrigger className="hologram-input">
                            <SelectValue placeholder="Şehir seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="istanbul">İstanbul</SelectItem>
                            <SelectItem value="ankara">Ankara</SelectItem>
                            <SelectItem value="izmir">İzmir</SelectItem>
                            <SelectItem value="bursa">Bursa</SelectItem>
                            <SelectItem value="antalya">Antalya</SelectItem>
                            <SelectItem value="other">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="acceptTerms"
                          checked={formData.acceptTerms}
                          onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                        />
                        <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                          <Link href="/terms" className="text-neon-blue hover:underline">
                            Kullanım Şartları
                          </Link>
                          'nı okudum ve kabul ediyorum. *
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="acceptKvkk"
                          checked={formData.acceptKvkk}
                          onCheckedChange={(checked) => setFormData({ ...formData, acceptKvkk: checked as boolean })}
                        />
                        <Label htmlFor="acceptKvkk" className="text-sm leading-relaxed">
                          <Link href="/kvkk" className="text-neon-blue hover:underline">
                            KVKK Aydınlatma Metni
                          </Link>
                          'ni okudum ve kişisel verilerimin işlenmesini kabul ediyorum. *
                        </Label>
                      </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full tech-button py-6 text-lg font-semibold rounded-xl group"
                      disabled={!formData.acceptTerms || !formData.acceptKvkk || !isPhoneVerified || isLoading}
                    >
                      {isLoading ? "Üyelik Oluşturuluyor..." : "Üyeliği Başlat"}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                      Zaten hesabınız var mı?{" "}
                      <Link href="/login" className="text-neon-blue hover:underline">
                        Giriş yapın
                      </Link>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
