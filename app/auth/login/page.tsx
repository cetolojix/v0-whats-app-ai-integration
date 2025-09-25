"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [supabaseAvailable, setSupabaseAvailable] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setShowResendConfirmation(false)

    try {
      console.log("[v0] Attempting login with email:", email)

      const supabase = createClient()
      if (!supabase) {
        setError("Veritabanı bağlantısı mevcut değil. Lütfen sistem yöneticisi ile iletişime geçin.")
        setSupabaseAvailable(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Login response:", { data, error })

      if (error) {
        console.log("[v0] Login error:", error.message)

        if (error.message === "Email not confirmed") {
          setError(
            "Email adresiniz henüz doğrulanmamış. Email adresinizi kontrol edin veya yeni doğrulama emaili gönderin.",
          )
          setShowResendConfirmation(true)
        } else if (error.message === "Invalid login credentials") {
          setError("Email veya şifre hatalı. Lütfen tekrar deneyin.")
        } else {
          setError(error.message)
        }
        return
      }

      console.log("[v0] Login successful, redirecting to instances")
      router.push("/instances")
    } catch (error: unknown) {
      console.log("[v0] Login catch error:", error)
      if (error instanceof Error && error.message.includes("Missing Supabase environment variables")) {
        setError("Sistem yapılandırması eksik. Lütfen sistem yöneticisi ile iletişime geçin.")
        setSupabaseAvailable(false)
      } else {
        setError(error instanceof Error ? error.message : "Bir hata oluştu")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (countdown > 0) {
      setError(`Lütfen ${countdown} saniye bekleyin ve tekrar deneyin.`)
      return
    }

    if (!supabaseAvailable) {
      setError("Veritabanı bağlantısı mevcut değil.")
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        if (error.message.includes("For security purposes")) {
          const match = error.message.match(/after (\d+) seconds/)
          if (match) {
            const seconds = Number.parseInt(match[1])
            setCountdown(seconds)
            setError(`Güvenlik amacıyla ${seconds} saniye beklemeniz gerekiyor.`)
          } else {
            setError("Doğrulama emaili gönderilemedi: " + error.message)
          }
        } else {
          setError("Doğrulama emaili gönderilemedi: " + error.message)
        }
      } else {
        setError("Doğrulama emaili gönderildi! Email adresinizi kontrol edin.")
        setShowResendConfirmation(false)
        setCountdown(60)
      }
    } catch (error) {
      setError("Doğrulama emaili gönderilemedi. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmEmail = async () => {
    if (email === "admin@whatsapp-ai.com") {
      try {
        const response = await fetch("/api/confirm-admin-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })

        if (response.ok) {
          setError("Admin email doğrulandı! Tekrar giriş yapmayı deneyin.")
        } else {
          setError("Email doğrulanamadı. Lütfen destek ile iletişime geçin.")
        }
      } catch (error) {
        setError("Email doğrulanamadı. Lütfen destek ile iletişime geçin.")
      }
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Giriş Yap</CardTitle>
              <CardDescription>Hesabınıza giriş yapmak için email ve şifrenizi girin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Şifre</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-500">
                      <p>{error}</p>
                      {error.includes("Email") &&
                        error.includes("doğrulanmamış") &&
                        email === "admin@whatsapp-ai.com" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full bg-transparent"
                            onClick={handleConfirmEmail}
                          >
                            Admin Email Doğrula
                          </Button>
                        )}
                      {showResendConfirmation && email !== "admin@whatsapp-ai.com" && supabaseAvailable && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full bg-transparent"
                          onClick={handleResendConfirmation}
                          disabled={isLoading || countdown > 0}
                        >
                          {countdown > 0 ? `Doğrulama Emaili Gönder (${countdown}s)` : "Doğrulama Emaili Gönder"}
                        </Button>
                      )}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading || !supabaseAvailable}>
                    {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                  </Button>
                  {!supabaseAvailable && (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                      <p>Sistem yapılandırması tamamlanmamış. Lütfen aşağıdaki environment variable'ları ayarlayın:</p>
                      <ul className="mt-2 text-xs list-disc list-inside">
                        <li>SUPABASE_URL</li>
                        <li>NEXT_PUBLIC_SUPABASE_URL</li>
                        <li>SUPABASE_ANON_KEY</li>
                        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center text-sm">
                  Hesabınız yok mu?{" "}
                  <Link href="/auth/register" className="underline underline-offset-4">
                    Kayıt Ol
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
