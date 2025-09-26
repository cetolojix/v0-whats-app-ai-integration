"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const turkishCities = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Amasya",
  "Ankara",
  "Antalya",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Isparta",
  "Mersin",
  "İstanbul",
  "İzmir",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Kahramanmaraş",
  "Mardin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Şanlıurfa",
  "Uşak",
  "Van",
  "Yozgat",
  "Zonguldak",
  "Aksaray",
  "Bayburt",
  "Karaman",
  "Kırıkkale",
  "Batman",
  "Şırnak",
  "Bartın",
  "Ardahan",
  "Iğdır",
  "Yalova",
  "Karabük",
  "Kilis",
  "Osmaniye",
  "Düzce",
]

export default function RegisterPage() {
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyTaxNumber, setCompanyTaxNumber] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")
  const [isPersonalUse, setIsPersonalUse] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [showVerificationInput, setShowVerificationInput] = useState(false)
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const formatPhoneNumber = (phone: string) => {
    // Türkiye telefon numarası formatı: +90XXXXXXXXXX
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.startsWith("0")) {
      return "+90" + cleaned.substring(1)
    } else if (cleaned.startsWith("90")) {
      return "+" + cleaned
    } else if (cleaned.length === 10) {
      return "+90" + cleaned
    }
    return phone
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    if (isPhoneVerified) {
      setIsPhoneVerified(false)
      setShowVerificationInput(false)
      setVerificationCode("")
    }
  }

  const handleSendVerification = async () => {
    if (!phone.trim()) {
      setError("Telefon numaranızı girin")
      return
    }

    const formattedPhone = formatPhoneNumber(phone)
    if (formattedPhone.length !== 13) {
      setError("Geçerli bir telefon numarası girin")
      return
    }

    setVerificationLoading(true)
    setError("")

    try {
      const response = await fetch("/api/send-verification-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formattedPhone,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowVerificationInput(true)
        setMessage("Doğrulama kodu gönderildi")
      } else {
        setError(data.error || "SMS gönderilemedi")
      }
    } catch (err) {
      console.error("[v0] SMS send error:", err)
      setError("SMS gönderimi sırasında hata oluştu")
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError("Doğrulama kodunu girin")
      return
    }

    setVerificationLoading(true)
    setError("")

    try {
      const response = await fetch("/api/verify-sms-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formatPhoneNumber(phone),
          code: verificationCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsPhoneVerified(true)
        setMessage("Telefon numaranız doğrulandı ✓")
        setShowVerificationInput(false)
      } else {
        setError(data.error || "Doğrulama kodu hatalı")
      }
    } catch (err) {
      console.error("[v0] Verification error:", err)
      setError("Doğrulama sırasında hata oluştu")
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone.trim()) {
      setError("Telefon numaranız gereklidir")
      return
    }

    if (!isPhoneVerified) {
      setError("Önce telefon numaranızı doğrulayın")
      return
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor")
      return
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır")
      return
    }

    if (!fullName.trim()) {
      setError("Ad soyad gereklidir")
      return
    }

    if (!email.trim()) {
      setError("Email adresi gereklidir")
      return
    }

    if (!city) {
      setError("İl seçimi gereklidir")
      return
    }

    if (!isPersonalUse && !companyName.trim()) {
      setError("Şirket adı gereklidir")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (authError) {
        console.error("[v0] Auth signup error:", authError)
        setError(authError.message || "Kayıt başarısız")
        return
      }

      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          phone: formatPhoneNumber(phone),
          role: "user",
          username: email.split("@")[0],
          city: city,
          address: address,
          company_name: isPersonalUse ? "Kişisel Kullanım" : companyName,
          company_address: companyAddress,
          company_tax_number: companyTaxNumber,
          account_type: isPersonalUse ? "personal" : "company",
        })

        if (profileError) {
          console.error("[v0] Profile creation error:", profileError)
          setError("Profil oluşturulamadı: " + profileError.message)
          return
        }

        console.log("[v0] Registration successful")
        setMessage("Hesabınız başarıyla oluşturuldu! Otomatik olarak giriş yapılıyor...")

        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })

        if (loginError) {
          console.error("[v0] Auto login error:", loginError)
          setError("Hesap oluşturuldu ancak otomatik giriş yapılamadı. Lütfen manuel olarak giriş yapın.")
          setTimeout(() => {
            router.push("/auth/login")
          }, 2000)
        } else {
          console.log("[v0] Auto login successful, redirecting...")
          setTimeout(() => {
            router.push("/instances")
          }, 1000)
        }
      }
    } catch (err) {
      console.error("[v0] Registration error:", err)
      setError("Kayıt sırasında bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const shouldShowVerificationButton = () => {
    const cleaned = phone.replace(/\D/g, "")
    return cleaned.length >= 10 && !isPhoneVerified && !showVerificationInput
  }

  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/90 sticky top-0 z-50 relative">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/30">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold neon-text">WhatsApp AI</span>
                <div className="text-xs text-muted-foreground font-medium">Automation Platform</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-muted-foreground hover:text-neon-cyan transition-colors duration-300 font-medium"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <Card className="hologram-card shadow-2xl shadow-neon-blue/20">
            <CardHeader className="space-y-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-neon-blue/40">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <CardTitle className="text-3xl font-bold neon-text">Hesap Oluştur</CardTitle>
              <CardDescription className="text-lg text-foreground/80">
                WhatsApp AI Automation platformuna katılın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neon-cyan border-b border-neon-cyan/30 pb-2">
                    Kişisel Bilgiler
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-foreground font-medium">
                        Ad Soyad
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Adınız ve soyadınız"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-neon-cyan"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium">
                        Email Adresi
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-neon-cyan"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground font-medium">
                        Telefon Numarası
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="05XXXXXXXXX"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-neon-cyan"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Türkiye telefon numarası formatında girin</p>

                      {shouldShowVerificationButton() && (
                        <Button
                          type="button"
                          onClick={handleSendVerification}
                          disabled={verificationLoading}
                          className="w-full mt-2 bg-neon-purple hover:bg-neon-purple/80 text-white"
                        >
                          {verificationLoading ? "Kod Gönderiliyor..." : "Doğrulama Kodu Gönder"}
                        </Button>
                      )}

                      {showVerificationInput && (
                        <div className="space-y-2 mt-2">
                          <Input
                            type="text"
                            placeholder="6 haneli doğrulama kodu"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="bg-background/50 border-border/50 focus:border-neon-cyan"
                            maxLength={6}
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={verificationLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            {verificationLoading ? "Doğrulanıyor..." : "Kodu Doğrula"}
                          </Button>
                        </div>
                      )}

                      {isPhoneVerified && (
                        <div className="flex items-center space-x-2 mt-2 text-green-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm">Telefon numarası doğrulandı</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-foreground font-medium">
                        İl
                      </Label>
                      <Select value={city} onValueChange={setCity} required>
                        <SelectTrigger className="bg-background/50 border-border/50 focus:border-neon-cyan">
                          <SelectValue placeholder="İl seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {turkishCities.map((cityName) => (
                            <SelectItem key={cityName} value={cityName}>
                              {cityName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-foreground font-medium">
                      Adres
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Tam adresiniz"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-background/50 border-border/50 focus:border-neon-cyan"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="personalUse" checked={isPersonalUse} onCheckedChange={setIsPersonalUse} />
                  <Label htmlFor="personalUse" className="text-sm text-foreground">
                    Kişisel kullanım için kayıt oluyorum
                  </Label>
                </div>

                {!isPersonalUse && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neon-purple border-b border-neon-purple/30 pb-2">
                      Şirket Bilgileri
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-foreground font-medium">
                          Şirket Adı *
                        </Label>
                        <Input
                          id="companyName"
                          type="text"
                          placeholder="Şirket adınız"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-neon-cyan"
                          required={!isPersonalUse}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyWebsite" className="text-foreground font-medium">
                          Şirket Web Sitesi
                        </Label>
                        <Input
                          id="companyWebsite"
                          type="url"
                          placeholder="https://www.sirketiniz.com"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-neon-cyan"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyAddress" className="text-foreground font-medium">
                          Şirket Adresi
                        </Label>
                        <Input
                          id="companyAddress"
                          type="text"
                          placeholder="Şirket adresiniz"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-neon-cyan"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyTaxNumber" className="text-foreground font-medium">
                          Vergi Numarası
                        </Label>
                        <Input
                          id="companyTaxNumber"
                          type="text"
                          placeholder="10 haneli vergi numarası"
                          value={companyTaxNumber}
                          onChange={(e) => setCompanyTaxNumber(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-neon-cyan"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-tech-orange border-b border-tech-orange/30 pb-2">
                    Güvenlik
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground font-medium">
                        Şifre
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="En az 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-neon-cyan"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                        Şifre Tekrar
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Şifrenizi tekrar girin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-neon-cyan"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {message && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <AlertDescription className="text-green-400">{message}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full tech-button text-white font-bold py-3 text-lg shadow-2xl shadow-neon-blue/30"
                  disabled={loading || !isPhoneVerified}
                >
                  {loading ? "Hesap Oluşturuluyor..." : "Üyelik Tamamla"}
                </Button>
              </form>

              <div className="text-center pt-6 border-t border-border/30">
                <p className="text-muted-foreground">
                  Zaten hesabınız var mı?{" "}
                  <Link
                    href="/auth/login"
                    className="text-neon-cyan hover:text-neon-cyan/80 font-medium transition-colors"
                  >
                    Giriş Yap
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
