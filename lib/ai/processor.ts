import { createClient } from "@/lib/supabase/server"
import { generateAIResponse, type ConversationMessage } from "./client"
import { createWhatsAppClient } from "@/lib/whatsapp/client"
import { DEFAULT_AI_CONFIG } from "./config"

export interface ProcessMessageOptions {
  instanceId: string
  conversationId: string
  messageId: string
  userMessage: string
  phoneNumber: string
  contactName?: string
}

export async function processIncomingMessage({
  instanceId,
  conversationId,
  messageId,
  userMessage,
  phoneNumber,
  contactName,
}: ProcessMessageOptions) {
  console.log("[AI Processor] Processing message:", messageId)

  const supabase = await createClient()

  try {
    // Get AI configuration for this instance
    let { data: aiConfig, error: configError } = await supabase
      .from("ai_configurations")
      .select("*")
      .eq("instance_id", instanceId)
      .single()

    if (configError || !aiConfig) {
      console.log("[AI Processor] No AI config found, creating default config")

      // Create default AI configuration
      const { data: newConfig, error: createError } = await supabase
        .from("ai_configurations")
        .insert({
          instance_id: instanceId,
          ...DEFAULT_AI_CONFIG,
        })
        .select("*")
        .single()

      if (createError) {
        console.error("[AI Processor] Failed to create AI config:", createError)
        return { success: false, error: "Failed to create AI configuration" }
      }

      aiConfig = newConfig
    }

    // Check if auto-reply is enabled
    if (!aiConfig.auto_reply_enabled) {
      console.log("[AI Processor] Auto-reply disabled for instance:", instanceId)
      return { success: true, message: "Auto-reply disabled" }
    }

    // Get conversation history if memory is enabled
    let conversationHistory: ConversationMessage[] = []

    if (aiConfig.conversation_memory_enabled) {
      const { data: recentMessages, error: historyError } = await supabase
        .from("messages")
        .select("content, is_from_bot, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(aiConfig.max_conversation_history * 2) // Get more to account for bot messages

      if (!historyError && recentMessages) {
        conversationHistory = recentMessages
          .reverse() // Oldest first
          .map((msg) => ({
            role: msg.is_from_bot ? ("assistant" as const) : ("user" as const),
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }))
      }
    }

    // Generate AI response
    console.log("[AI Processor] Generating AI response...")
    const aiResponse = await generateAIResponse({
      config: {
        provider: aiConfig.ai_provider as any,
        model: aiConfig.model_name,
        systemPrompt: aiConfig.system_prompt,
        temperature: Number(aiConfig.temperature),
        maxTokens: aiConfig.max_tokens,
        autoReplyEnabled: aiConfig.auto_reply_enabled,
        responseDelaySeconds: aiConfig.response_delay_seconds,
        conversationMemoryEnabled: aiConfig.conversation_memory_enabled,
        maxConversationHistory: aiConfig.max_conversation_history,
      },
      userMessage,
      conversationHistory,
      phoneNumber,
      contactName,
    })

    console.log("[AI Processor] AI response generated:", aiResponse.response.substring(0, 100) + "...")

    // Add response delay if configured
    if (aiConfig.response_delay_seconds > 0) {
      console.log("[AI Processor] Waiting", aiConfig.response_delay_seconds, "seconds before sending...")
      await new Promise((resolve) => setTimeout(resolve, aiConfig.response_delay_seconds * 1000))
    }

    // Get instance details for WhatsApp client
    const { data: instance, error: instanceError } = await supabase
      .from("instances")
      .select("instance_key")
      .eq("id", instanceId)
      .single()

    if (instanceError || !instance) {
      console.error("[AI Processor] Instance not found:", instanceError)
      return { success: false, error: "Instance not found" }
    }

    // Send response via WhatsApp
    const whatsappClient = createWhatsAppClient(instance.instance_key)
    if (!whatsappClient) {
      console.error("[AI Processor] WhatsApp client not configured for instance:", instance.instance_key)
      return { success: false, error: "WhatsApp client not configured" }
    }

    const sendResult = await whatsappClient.sendTextMessage(phoneNumber, aiResponse.response)
    console.log("[AI Processor] Message sent via WhatsApp:", sendResult.messages[0].id)

    // Save AI response to database
    const { error: saveError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      message_id: sendResult.messages[0].id,
      sender_phone: sendResult.contacts[0].wa_id, // Bot's phone number
      recipient_phone: phoneNumber,
      message_type: "text",
      content: aiResponse.response,
      is_from_bot: true,
      ai_response_generated: true,
      ai_model_used: aiResponse.model,
      processing_time_ms: aiResponse.processingTime,
    })

    if (saveError) {
      console.error("[AI Processor] Failed to save AI response:", saveError)
      // Don't return error here as the message was sent successfully
    }

    // Mark original message as processed
    await supabase.from("messages").update({ ai_response_generated: true }).eq("message_id", messageId)

    return {
      success: true,
      response: aiResponse.response,
      processingTime: aiResponse.processingTime,
      model: aiResponse.model,
    }
  } catch (error) {
    console.error("[AI Processor] Error processing message:", error)

    // Log error to database
    await supabase.from("webhook_logs").insert({
      instance_id: instanceId,
      webhook_type: "ai_processing_error",
      payload: {
        messageId,
        error: error instanceof Error ? error.message : "Unknown error",
        phoneNumber,
        userMessage: userMessage.substring(0, 100),
      },
      processed: false,
      error_message: error instanceof Error ? error.message : "Unknown error",
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Background job processor for handling AI responses asynchronously
export async function processQueuedMessages() {
  console.log("[AI Processor] Processing queued messages...")

  const supabase = await createClient()

  // Find messages that need AI processing
  const { data: pendingMessages, error } = await supabase
    .from("messages")
    .select(`
      id,
      message_id,
      content,
      conversation_id,
      sender_phone,
      conversations!inner (
        id,
        phone_number,
        contact_name,
        instance_id,
        instances!inner (
          id,
          instance_key
        )
      )
    `)
    .eq("is_from_bot", false)
    .eq("ai_response_generated", false)
    .order("created_at", { ascending: true })
    .limit(10) // Process in batches

  if (error) {
    console.error("[AI Processor] Error fetching pending messages:", error)
    return
  }

  if (!pendingMessages || pendingMessages.length === 0) {
    console.log("[AI Processor] No pending messages to process")
    return
  }

  console.log("[AI Processor] Found", pendingMessages.length, "pending messages")

  // Process each message
  for (const message of pendingMessages) {
    try {
      await processIncomingMessage({
        instanceId: message.conversations.instance_id,
        conversationId: message.conversation_id,
        messageId: message.message_id,
        userMessage: message.content,
        phoneNumber: message.sender_phone,
        contactName: message.conversations.contact_name,
      })
    } catch (error) {
      console.error("[AI Processor] Error processing queued message:", message.id, error)
    }
  }
}
