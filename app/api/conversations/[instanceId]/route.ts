import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Get conversations for an instance
export async function GET(request: NextRequest, { params }: { params: { instanceId: string } }) {
  try {
    const { instanceId } = params
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all" // all, active, inactive

    const supabase = await createClient()

    // Verify user has access to this instance
    const { data: instance, error: instanceError } = await supabase
      .from("instances")
      .select("id, user_id")
      .eq("id", instanceId)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 })
    }

    // Build query
    let query = supabase
      .from("conversations")
      .select(`
        id,
        phone_number,
        contact_name,
        last_message_at,
        message_count,
        is_active,
        created_at,
        updated_at
      `)
      .eq("instance_id", instanceId)
      .order("last_message_at", { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`phone_number.ilike.%${search}%,contact_name.ilike.%${search}%`)
    }

    if (status === "active") {
      query = query.eq("is_active", true)
    } else if (status === "inactive") {
      query = query.eq("is_active", false)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: conversations, error, count } = await query

    if (error) {
      console.error("[Conversations API] Error fetching conversations:", error)
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("instance_id", instanceId)

    if (search) {
      countQuery = countQuery.or(`phone_number.ilike.%${search}%,contact_name.ilike.%${search}%`)
    }

    if (status === "active") {
      countQuery = countQuery.eq("is_active", true)
    } else if (status === "inactive") {
      countQuery = countQuery.eq("is_active", false)
    }

    const { count: totalCount } = await countQuery

    return NextResponse.json({
      conversations: conversations || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    })
  } catch (error) {
    console.error("[Conversations API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
