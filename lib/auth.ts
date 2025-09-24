import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/instances")
  }

  return { user, profile }
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  return profile
}

export async function isAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId)
  return profile?.role === "admin"
}
