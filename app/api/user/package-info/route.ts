export const dynamic = "force-dynamic"

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

    const { data: userPackage, error } = await supabase
      .from("user_packages")
      .select(`
        *,
        packages (
          id,
          name,
          display_name_tr,
          display_name_en,
          max_instances,
          price_yearly,
          price_monthly,
          features,
          is_active
        )
      `)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single()

    if (error) {
      debugLog("[v0] Error fetching user package info:", error)

      if (error.code === "PGRST116") {
        // No rows found - assign basic package
        debugLog("[v0] No package info found, assigning basic package to user:", user.id)

        // Get basic package
        const { data: basicPackage } = await supabase
          .from("packages")
          .select("id")
          .eq("name", "basic")
          .eq("is_active", true)
          .single()

        if (basicPackage) {
          // Create user package assignment
          const { error: assignError } = await supabase.from("user_packages").insert({
            user_id: user.id,
            package_id: basicPackage.id,
            is_active: true,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          })

          if (!assignError) {
            // Retry getting package info
            const { data: retryUserPackage, error: retryError } = await supabase
              .from("user_packages")
              .select(`
                *,
                packages (
                  id,
                  name,
                  display_name_tr,
                  display_name_en,
                  max_instances,
                  price_yearly,
                  price_monthly,
                  features,
                  is_active
                )
              `)
              .eq("user_id", user.id)
              .eq("is_active", true)
              .single()

            if (!retryError && retryUserPackage) {
              return NextResponse.json({ packageInfo: retryUserPackage })
            }
          }
        }
      }

      return NextResponse.json({ error: "Failed to fetch package information" }, { status: 500 })
    }

    return NextResponse.json({ packageInfo: userPackage })
  } catch (error) {
    debugLog("[v0] Error in user package info API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
