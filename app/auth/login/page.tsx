"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [supabaseAvailable, setSupabaseAvailable] = useState(true)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting login with username:", username)

      const supabase = createClient()
      if (!supabase) {
        setError("Veritabanı bağlantısı mevcut değil. Lütfen sistem yöneticisi ile iletişime geçin.")
        setSupabaseAvailable(false)
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", username)
        .single()

      if (profileError || !profileData) {
        console.log("[v0] Profile not found for username:", username)
        setError("Bu kullanıcı adı ile kayıtlı kullanıcı bulunamadı.")
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      })

      console.log("[v0] Login response:", { data, error })

      if (error) {
        console.log("[v0] Login error:", error.message)

        if (error.message === "Invalid login credentials") {
          setError("Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.")
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

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Giriş Yap</CardTitle>
              <CardDescription>Hesabınıza giriş yapmak için kullanıcı adınız ve şifrenizi girin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Kullanıcı Adı</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="kullaniciadi"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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
