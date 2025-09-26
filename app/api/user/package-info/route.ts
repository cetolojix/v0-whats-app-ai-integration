export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const packageInfo = {
      id: 1,
      user_id: "mock-user-id",
      package_id: 2,
      package_name: "Professional",
      package_display_tr: "Profesyonel",
      package_display_en: "Professional",
      max_instances: 10,
      max_messages_per_month: 5000,
      current_instances: 3,
      current_messages_this_month: 1250,
      status: "active",
      started_at: "2024-01-01T00:00:00Z",
      expires_at: null,
      auto_renew: true,
    }

    return NextResponse.json({ packageInfo })
  } catch (error) {
    console.error("[v0] Error in user package info API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
