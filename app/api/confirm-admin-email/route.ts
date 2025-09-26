import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (email !== "admin@whatsapp-ai.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: users, error: getUserError } = await supabase.auth.admin.listUsers()

    if (getUserError) {
      console.error("Error getting users:", getUserError)
      return NextResponse.json({ error: "Failed to get users" }, { status: 500 })
    }

    const user = users.users.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    })

    if (error) {
      console.error("Error confirming email:", error)
      return NextResponse.json({ error: "Failed to confirm email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in confirm-admin-email API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
