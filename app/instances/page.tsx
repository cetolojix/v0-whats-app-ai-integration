import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WhatsAppInstanceManager } from "@/components/whatsapp-instance-manager"

export default async function InstancesPage() {
  const supabase = await createClient()

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

  if (profile?.role === "admin") {
    redirect("/admin")
  }

  // Fetch user's instances
  const { data: instances } = await supabase
    .from("instances")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <WhatsAppInstanceManager user={user} profile={profile} instances={instances || []} />
}
