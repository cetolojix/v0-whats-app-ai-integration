import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WhatsAppInstanceManager } from "@/components/whatsapp-instance-manager"

export default async function InstancesPage() {
  try {
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
  } catch (error) {
    console.error("Supabase configuration error:", error)

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg border p-6 text-center">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Configuration Required</h1>
          <p className="text-muted-foreground mb-4">
            Supabase environment variables are missing. Please configure the following variables:
          </p>
          <div className="bg-muted rounded-md p-3 text-left text-sm font-mono mb-4">
            <div>SUPABASE_URL</div>
            <div>SUPABASE_ANON_KEY</div>
          </div>
          <p className="text-sm text-muted-foreground">
            Contact your administrator to configure these environment variables.
          </p>
        </div>
      </div>
    )
  }
}
