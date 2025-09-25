export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (email !== "admin@whatsapp-ai.com") {
      return NextResponse.json({ error: "Only admin email is allowed" }, { status: 403 })
    }

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Check if admin already exists
    const { data: existingUser } = await supabase.from("auth.users").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "Admin user already exists" }, { status: 409 })
    }

    // Create admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: "admin",
        created_by: "system",
      },
    })

    if (error) {
      console.error("[v0] Error creating admin user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Admin user created successfully:", data.user?.id)

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      userId: data.user?.id,
    })
  } catch (error) {
    console.error("[v0] Error in create-admin API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
