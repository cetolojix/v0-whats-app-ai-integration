import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin-dashboard"
import { debugLog } from "@/lib/debug"

export default async function AdminPage() {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Supabase client could not be initialized. Please check your environment variables.")
  }

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
    debugLog("[v0] User is not admin, redirecting to instances. Profile:", profile)
    redirect("/instances")
  }

  debugLog("[v0] User is admin, fetching data")

  let users = []
  let instances = []

  try {
    // Fetch all users and instances for admin
    const { data: usersData, error: usersError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (usersError) {
      debugLog("[v0] Error fetching users:", usersError)
    } else {
      users = usersData || []
    }

    // Try to fetch from admin view, fallback to regular instances table
    const { data: instancesData, error: instancesError } = await supabase
      .from("admin_instances_view")
      .select("*")
      .order("created_at", { ascending: false })

    if (instancesError) {
      debugLog("[v0] Error fetching from admin view, trying regular instances:", instancesError)

      // Fallback to regular instances table with manual join
      const { data: fallbackInstances, error: fallbackError } = await supabase
        .from("instances")
        .select(`
          *,
          profiles!instances_user_id_fkey (
            email,
            full_name,
            role
          )
        `)
        .order("created_at", { ascending: false })

      if (fallbackError) {
        debugLog("[v0] Error fetching instances fallback:", fallbackError)
      } else {
        // Transform the data to match expected format
        instances =
          fallbackInstances?.map((instance) => ({
            ...instance,
            user_email: instance.profiles?.email,
            user_full_name: instance.profiles?.full_name,
            user_role: instance.profiles?.role,
          })) || []
      }
    } else {
      instances = instancesData || []
    }
  } catch (error) {
    debugLog("[v0] Unexpected error fetching data:", error)
  }

  debugLog("[v0] Data fetched:", {
    usersCount: users.length,
    instancesCount: instances.length,
  })

  return <AdminDashboard users={users} instances={instances} currentUser={user} />
}
