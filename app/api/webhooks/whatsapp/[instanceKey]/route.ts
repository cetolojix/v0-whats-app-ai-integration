import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { WhatsAppWebhookPayload, WhatsAppMessage } from "@/lib/whatsapp/types"
import { processIncomingMessage } from "@/lib/ai/processor" // Import AI processor function

// Webhook verification for WhatsApp
export async function GET(request: NextRequest, { params }: { params: { instanceKey: string } }) {
  const { instanceKey } = params
  const searchParams = request.nextUrl.searchParams

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  console.log("[Webhook] Verification request for instance:", instanceKey)
  console.log("[Webhook] Mode:", mode, "Token:", token)

  // Verify the webhook (you should use a secure verify token)
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "your-verify-token"

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Webhook] Webhook verified successfully")
    return new NextResponse(challenge)
  }

  console.log("[Webhook] Webhook verification failed")
  return new NextResponse("Forbidden", { status: 403 })
}

// Handle incoming WhatsApp messages
export async function POST(request: NextRequest, { params }: { params: { instanceKey: string } }) {
  const { instanceKey } = params

  try {
    const payload: WhatsAppWebhookPayload = await request.json()
    console.log("[Webhook] Received payload for instance:", instanceKey)

    const supabase = await createClient()

    // Find the instance
    const { data: instance, error: instanceError } = await supabase
      .from("instances")
      .select("id, user_id, instance_name")
      .eq("instance_key", instanceKey)
      .single()

    if (instanceError || !instance) {
      console.error("[Webhook] Instance not found:", instanceKey, instanceError)
      return NextResponse.json({ error: "Instance not found" }, { status: 404 })
    }

    // Log the webhook payload for debugging
    await supabase.from("webhook_logs").insert({
      instance_id: instance.id,
      webhook_type: "incoming_webhook",
      payload: payload,
      processed: false,
    })

    // Process each entry in the webhook
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field === "messages") {
          await processMessages(supabase, instance, change.value.messages || [])
          await processContacts(supabase, instance, change.value.contacts || [])
        }

        if (change.field === "message_status") {
          await processMessageStatuses(supabase, instance, change.value.statuses || [])
        }
      }
    }

    // Mark webhook as processed
    await supabase
      .from("webhook_logs")
      .update({ processed: true })
      .eq("instance_id", instance.id)
      .eq("processed", false)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error)

    // Try to log the error if we have the instance
    try {
      const supabase = await createClient()
      const { data: instance } = await supabase.from("instances").select("id").eq("instance_key", instanceKey).single()

      if (instance) {
        await supabase.from("webhook_logs").insert({
          instance_id: instance.id,
          webhook_type: "error",
          payload: { error: error instanceof Error ? error.message : "Unknown error" },
          processed: false,
          error_message: error instanceof Error ? error.message : "Unknown error",
        })
      }
    } catch (logError) {
      console.error("[Webhook] Failed to log error:", logError)
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function processMessages(supabase: any, instance: any, messages: WhatsAppMessage[]) {
  for (const message of messages) {
    console.log("[Webhook] Processing message:", message.id)

    try {
      // Find or create conversation
      let { data: conversation, error: convError } = await supabase
        .from("conversations")
        .select("id")
        .eq("instance_id", instance.id)
        .eq("phone_number", message.from)
        .single()

      if (convError || !conversation) {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            instance_id: instance.id,
            phone_number: message.from,
            contact_name: null, // Will be updated when we process contacts
            last_message_at: new Date(Number.parseInt(message.timestamp) * 1000).toISOString(),
            message_count: 0,
            is_active: true,
          })
          .select("id")
          .single()

        if (createError) {
          console.error("[Webhook] Failed to create conversation:", createError)
          continue
        }

        conversation = newConv
      }

      // Extract message content based on type
      let content = ""
      let mediaUrl = null

      switch (message.type) {
        case "text":
          content = message.text?.body || ""
          break
        case "image":
          content = message.image?.caption || "[Image]"
          mediaUrl = message.image?.id
          break
        case "audio":
          content = "[Audio Message]"
          mediaUrl = message.audio?.id
          break
        case "document":
          content = message.document?.caption || `[Document: ${message.document?.filename}]`
          mediaUrl = message.document?.id
          break
        case "location":
          content = `[Location: ${message.location?.name || "Shared location"}]`
          break
        default:
          content = `[${message.type} message]`
      }

      // Save message to database
      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        message_id: message.id,
        sender_phone: message.from,
        recipient_phone: message.to,
        message_type: message.type,
        content: content,
        media_url: mediaUrl,
        is_from_bot: false,
        ai_response_generated: false,
        created_at: new Date(Number.parseInt(message.timestamp) * 1000).toISOString(),
      })

      if (messageError) {
        console.error("[Webhook] Failed to save message:", messageError)
        continue
      }

      console.log("[Webhook] Message saved, triggering AI processing for:", message.id)

      // Process AI response asynchronously (don't wait for it)
      processIncomingMessage({
        instanceId: instance.id,
        conversationId: conversation.id,
        messageId: message.id,
        userMessage: content,
        phoneNumber: message.from,
        contactName: null, // Will be updated by contact processing
      }).catch((error) => {
        console.error("[Webhook] AI processing failed for message:", message.id, error)
      })
    } catch (error) {
      console.error("[Webhook] Error processing message:", message.id, error)
    }
  }
}

async function processContacts(supabase: any, instance: any, contacts: any[]) {
  for (const contact of contacts) {
    try {
      // Update conversation with contact name
      await supabase
        .from("conversations")
        .update({
          contact_name: contact.profile.name,
          updated_at: new Date().toISOString(),
        })
        .eq("instance_id", instance.id)
        .eq("phone_number", contact.wa_id)

      console.log("[Webhook] Updated contact name for:", contact.wa_id)
    } catch (error) {
      console.error("[Webhook] Error updating contact:", error)
    }
  }
}

async function processMessageStatuses(supabase: any, instance: any, statuses: any[]) {
  for (const status of statuses) {
    try {
      // Update message status if needed
      console.log("[Webhook] Message status update:", status.id, status.status)

      // You could update a status field in the messages table if you add one
      // For now, just log the status update
    } catch (error) {
      console.error("[Webhook] Error processing status:", error)
    }
  }
}
