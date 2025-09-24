export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all active packages
    const { data: packages, error } = await supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("max_instances", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching packages:", error)
      return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
    }

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("[v0] Error in packages API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
