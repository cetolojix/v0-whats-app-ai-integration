"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "user"
  fallback?: React.ReactNode
}

export function RoleGuard({ children, requiredRole = "user", fallback }: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkRole = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push("/auth/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (!profile) {
          setIsAuthorized(false)
          return
        }

        if (requiredRole === "admin" && profile.role !== "admin") {
          setIsAuthorized(false)
          router.push("/dashboard")
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Role check error:", error)
        setIsAuthorized(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkRole()
  }, [requiredRole, router, supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return fallback || <div className="text-center py-8">Access denied</div>
  }

  return <>{children}</>
}
