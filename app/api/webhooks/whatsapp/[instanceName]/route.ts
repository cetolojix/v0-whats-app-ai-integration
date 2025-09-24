import { type NextRequest, NextResponse } from "next/server"

interface WhatsAppMessage {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  message?: {
    conversation?: string
    extendedTextMessage?: {
      text: string
    }
  }
  messageTimestamp: number
  pushName?: string
}

interface WebhookPayload {
  event: string
  instance: string
  data: {
    messages?: WhatsAppMessage[]
    connection?: {
      state: string
      lastDisconnect?: any
    }
  }
}

export async function POST(request: NextRequest, { params }: { params: { instanceName: string } }) {
  try {
    const { instanceName } = params
    const payload: WebhookPayload = await request.json()

    console.log(`[Webhook] ${instanceName}:`, JSON.stringify(payload, null, 2))

    // Handle different webhook events
    switch (payload.event) {
      case "messages.upsert":
        if (payload.data.messages) {
          for (const message of payload.data.messages) {
            // Skip messages sent by us
            if (message.key.fromMe) continue

            // Extract message text
            const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text

            if (messageText) {
              // Trigger n8n workflow for AI response
              await triggerN8nWorkflow(instanceName, {
                messageId: message.key.id,
                from: message.key.remoteJid,
                text: messageText,
                timestamp: message.messageTimestamp,
                senderName: message.pushName,
              })
            }
          }
        }
        break

      case "connection.update":
        console.log(`[Connection] ${instanceName}:`, payload.data.connection?.state)
        // Handle connection state changes if needed
        break

      default:
        console.log(`[Webhook] Unknown event: ${payload.event}`)
    }

    return NextResponse.json({ success: true, processed: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function triggerN8nWorkflow(instanceName: string, messageData: any) {
  try {
    // Trigger the n8n workflow webhook
    const webhookUrl = `https://n8nx.cetoloji.com/webhook/${instanceName}`

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instanceName,
        messageType: "conversation",
        message: {
          conversation: messageData.text,
        },
        key: {
          remoteJid: messageData.from,
          id: messageData.messageId,
        },
        messageTimestamp: messageData.timestamp,
        pushName: messageData.senderName,
      }),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status}`)
    }

    console.log(`[n8n] Workflow triggered for ${instanceName}`)
  } catch (error) {
    console.error("Failed to trigger n8n workflow:", error)
  }
}
