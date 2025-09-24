"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export const dynamic = "force-dynamic"

export default function RegisterPage() {
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("") // Email alanı eklendi
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState("register")
  const [verificationCode, setVerificationCode] = useState("")
  const [supabaseAvailable, setSupabaseAvailable] = useState(true)
  const router = useRouter()

  const getSupabaseClient = () => {
    try {
      return createClient()
    } catch (error) {
      console.log("[v0] Supabase client creation failed:", error)
      setSupabaseAvailable(false)
      return null
    }
  }

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

  const sendVerificationCode = async () => {
    try {
      const response = await fetch("/api/send-verification-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formatPhoneNumber(phone),
        }),
      })

      const result = await response.json()

      if (result.success) {
        console.log("[v0] SMS verification code sent successfully")
        return true
      } else {
        console.error("[v0] SMS sending failed:", result.error)
        setError(result.error || "SMS gönderilemedi")
        return false
      }
    } catch (error) {
      console.error("[v0] SMS API error:", error)
      setError("SMS gönderim hatası")
      return false
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

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

    const formattedPhone = formatPhoneNumber(phone)
    if (!formattedPhone.match(/^\+90\d{10}$/)) {
      setError("Geçerli bir Türkiye telefon numarası girin (örn: 05XXXXXXXXX)")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    console.log("[v0] Starting registration with phone:", formattedPhone, "and email:", email)

    try {
      const codeSent = await sendVerificationCode()
      if (codeSent) {
        setStep("verify")
        setMessage("Telefon numaranıza doğrulama kodu gönderildi")
      } else {
        setError("Doğrulama kodu gönderilemedi")
      }
    } catch (err) {
      console.error("[v0] Registration error:", err)
      setError("Kayıt sırasında bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode || verificationCode.length !== 6) {
      setError("6 haneli doğrulama kodunu girin")
      return
    }

    setLoading(true)
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
          fullName: fullName,
          email: email,
          password: password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        console.log("[v0] Phone verification successful, user created")

        const supabase = getSupabaseClient()
        if (!supabase) {
          setError("Veritabanı bağlantısı mevcut değil. Hesap oluşturuldu ancak otomatik giriş yapılamadı.")
          setTimeout(() => {
            router.push("/auth/login")
          }, 2000)
          return
        }

        if (result.loginCredentials) {
          console.log("[v0] Login credentials received, attempting automatic login...")
          setMessage("Hesabınız başarıyla oluşturuldu! Otomatik olarak giriş yapılıyor...")

          // Otomatik login yap
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: result.loginCredentials.email,
            password: result.loginCredentials.password,
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
        } else if (result.session) {
          console.log("[v0] Session token received, setting session...")
          setMessage("Hesabınız başarıyla oluşturuldu! Otomatik olarak giriş yapılıyor...")

          // Supabase client ile session'ı set et
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          })

          if (sessionError) {
            console.error("[v0] Session set error:", sessionError)
            setError("Giriş yapılamadı, lütfen manuel olarak giriş yapın")
            setTimeout(() => {
              router.push("/auth/login")
            }, 2000)
          } else {
            console.log("[v0] Session set successfully, redirecting...")
            setTimeout(() => {
              router.push("/instances")
            }, 1000)
          }
        } else if (result.magicLink) {
          console.log("[v0] Magic link received, redirecting...")
          setMessage("Hesabınız başarıyla oluşturuldu! Otomatik olarak giriş yapılıyor...")

          // Magic link'e yönlendir
          window.location.href = result.magicLink
        } else {
          setMessage("Hesabınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.")

          // 2 saniye sonra login sayfasına yönlendir
          setTimeout(() => {
            router.push("/auth/login")
          }, 2000)
        }
      } else {
        console.error("[v0] Phone verification failed:", result.error)
        setError(result.error || "Doğrulama başarısız")
      }
    } catch (err) {
      console.error("[v0] Verification error:", err)
      setError("Doğrulama sırasında bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    const codeSent = await sendVerificationCode()
    if (codeSent) {
      setMessage("Yeni doğrulama kodu gönderildi")
      setError("")
    } else {
      setError("Doğrulama kodu gönderilemedi")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === "register" ? "Hesap Oluştur" : "Telefon Doğrulama"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === "register"
              ? "WhatsApp AI Automation platformuna katılın"
              : "Telefon numaranıza gönderilen 6 haneli kodu girin"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Adınız ve soyadınız"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Adresi</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon Numarası</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">Türkiye telefon numarası formatında girin</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Şifrenizi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {!supabaseAvailable && (
                <Alert>
                  <AlertDescription className="text-amber-600">
                    Veritabanı bağlantısı mevcut değil. Kayıt işlemi tamamlanabilir ancak otomatik giriş
                    yapılamayabilir.
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "SMS Gönderiliyor..." : "Doğrulama Kodu Gönder"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyPhone} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Doğrulama Kodu</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="6 haneli kod"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500">{phone} numarasına gönderilen kodu girin</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Hesap Oluşturuluyor..." : "Hesabı Oluştur"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={handleResendCode}
                disabled={loading}
              >
                Kodu Yeniden Gönder
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{" "}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Giriş Yap
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
