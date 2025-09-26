import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin-dashboard"
import { debugLog } from "@/lib/debug"

export default async function AdminPage() {
  const supabase = await createClient()

  debugLog("[v0] Admin page accessed")

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  debugLog("[v0] User authentication check:", { user: user?.email, error })

  if (error || !user) {
    debugLog("[v0] User not authenticated, redirecting to login")
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  debugLog("[v0] Profile check:", { profile, profileError, userId: user.id })

  if (!profile || profile.role !== "admin") {
    debugLog("[v0] User is not admin, redirecting to dashboard. Profile:", profile)
    redirect("/dashboard")
  }

  debugLog("[v0] User is admin, fetching data")

  // Fetch all users and instances for admin
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: instances, error: instancesError } = await supabase
    .from("admin_instances_view")
    .select("*")
    .order("created_at", { ascending: false })

  debugLog("[v0] Data fetched:", {
    usersCount: users?.length,
    instancesCount: instances?.length,
    usersError,
    instancesError,
  })

  return <AdminDashboard users={users || []} instances={instances || []} currentUser={user} />
}
