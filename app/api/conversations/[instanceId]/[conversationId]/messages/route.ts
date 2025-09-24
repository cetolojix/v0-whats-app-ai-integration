import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { instanceId: string; conversationId: string } },
) {
  try {
    const { instanceId, conversationId } = params
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const supabase = await createClient()

    // Verify user has access to this instance and conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select(`
        id,
        instance_id,
        instances!inner (
          id,
          user_id
        )
      `)
      .eq("id", conversationId)
      .eq("instance_id", instanceId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Get messages
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(`
        id,
        message_id,
        sender_phone,
        recipient_phone,
        message_type,
        content,
        media_url,
        is_from_bot,
        ai_response_generated,
        ai_model_used,
        processing_time_ms,
        created_at
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .range(from, to)

    if (messagesError) {
      console.error("[Messages API] Error fetching messages:", messagesError)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversationId)

    return NextResponse.json({
      messages: messages || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    })
  } catch (error) {
    console.error("[Messages API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
