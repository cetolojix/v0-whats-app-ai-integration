import { type NextRequest, NextResponse } from "next/server"
import { processIncomingMessage } from "@/lib/ai/processor"

// API endpoint to manually trigger AI processing for a message
export async function POST(request: NextRequest) {
  try {
    const { instanceId, conversationId, messageId, userMessage, phoneNumber, contactName } = await request.json()

    if (!instanceId || !conversationId || !messageId || !userMessage || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await processIncomingMessage({
      instanceId,
      conversationId,
      messageId,
      userMessage,
      phoneNumber,
      contactName,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[AI Process API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
