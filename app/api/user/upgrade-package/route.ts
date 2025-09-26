import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { packageName } = await request.json()

    if (!packageName) {
      return NextResponse.json({ error: "Package name is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the target package
    const { data: targetPackage, error: packageError } = await supabase
      .from("packages")
      .select("*")
      .eq("name", packageName)
      .eq("is_active", true)
      .single()

    if (packageError || !targetPackage) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 })
    }

    // Update user's subscription
    const { error: updateError } = await supabase.from("user_subscriptions").upsert(
      {
        user_id: user.id,
        package_id: targetPackage.id,
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: null, // For now, no expiration
        auto_renew: true,
      },
      {
        onConflict: "user_id",
      },
    )

    if (updateError) {
      console.error("[v0] Error updating user subscription:", updateError)
      return NextResponse.json({ error: "Failed to upgrade package" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Package upgraded successfully",
      package: targetPackage,
    })
  } catch (error) {
    console.error("[v0] Error in upgrade package API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
