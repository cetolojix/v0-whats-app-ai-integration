"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()

      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("[v0] Auth callback error:", error)
          router.push("/auth/login?error=callback_error")
          return
        }

        if (data.session) {
          console.log("[v0] Auth callback successful, redirecting to instances")
          router.push("/instances")
        } else {
          console.log("[v0] No session found, redirecting to login")
          router.push("/auth/login")
        }
      } catch (err) {
        console.error("[v0] Auth callback error:", err)
        router.push("/auth/login?error=callback_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Hesap Doğrulanıyor...</h2>
        <p className="text-gray-600">Lütfen bekleyin, hesabınız doğrulanıyor.</p>
      </div>
    </div>
  )
}
