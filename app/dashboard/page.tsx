import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserDashboard } from "@/components/user-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Supabase client could not be initialized. Please check your environment variables.")
  }

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If user is admin, redirect to admin dashboard
  if (profile?.role === "admin") {
    redirect("/admin")
  }

  // Fetch user's instances
  const { data: instances } = await supabase
    .from("instances")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <UserDashboard user={user} profile={profile} instances={instances || []} />
}
