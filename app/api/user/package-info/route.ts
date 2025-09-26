import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { debugLog } from "@/lib/debug"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { data: packageInfo, error } = await supabase
      .from("user_package_info")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error) {
      debugLog("[v0] Error fetching user package info:", error)

      if (error.code === "PGRST116") {
        // No rows found
        debugLog("[v0] No package info found, assigning basic package to user:", user.id)

        // Get basic package
        const { data: basicPackage } = await supabase.from("packages").select("id").eq("name", "basic").single()

        if (basicPackage) {
          // Create subscription for user
          const { error: subscriptionError } = await supabase.from("user_subscriptions").insert({
            user_id: user.id,
            package_id: basicPackage.id,
            status: "active",
          })

          if (!subscriptionError) {
            // Retry getting package info
            const { data: retryPackageInfo, error: retryError } = await supabase
              .from("user_package_info")
              .select("*")
              .eq("user_id", user.id)
              .single()

            if (!retryError && retryPackageInfo) {
              return NextResponse.json({ packageInfo: retryPackageInfo })
            }
          }
        }
      }

      return NextResponse.json({ error: "Failed to fetch package information" }, { status: 500 })
    }

    return NextResponse.json({ packageInfo })
  } catch (error) {
    debugLog("[v0] Error in user package info API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
