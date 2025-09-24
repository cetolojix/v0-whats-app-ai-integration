import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Get single conversation details
export async function GET(
  request: NextRequest,
  { params }: { params: { instanceId: string; conversationId: string } },
) {
  try {
    const { instanceId, conversationId } = params
    const supabase = await createClient()

    const { data: conversation, error } = await supabase
      .from("conversations")
      .select(`
        id,
        phone_number,
        contact_name,
        last_message_at,
        message_count,
        is_active,
        created_at,
        updated_at,
        instances!inner (
          id,
          instance_name,
          user_id
        )
      `)
      .eq("id", conversationId)
      .eq("instance_id", instanceId)
      .single()

    if (error || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("[Conversation API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update conversation (e.g., mark as active/inactive, update contact name)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { instanceId: string; conversationId: string } },
) {
  try {
    const { instanceId, conversationId } = params
    const { is_active, contact_name } = await request.json()

    const supabase = await createClient()

    // Verify access
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select(`
        id,
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

    // Update conversation
    const updates: any = { updated_at: new Date().toISOString() }
    if (typeof is_active === "boolean") updates.is_active = is_active
    if (contact_name !== undefined) updates.contact_name = contact_name

    const { data: updatedConversation, error: updateError } = await supabase
      .from("conversations")
      .update(updates)
      .eq("id", conversationId)
      .select()
      .single()

    if (updateError) {
      console.error("[Conversation API] Update error:", updateError)
      return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 })
    }

    return NextResponse.json({ conversation: updatedConversation })
  } catch (error) {
    console.error("[Conversation API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
