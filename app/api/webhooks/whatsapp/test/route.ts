import { type NextRequest, NextResponse } from "next/server"

// Test endpoint to simulate WhatsApp webhook calls
export async function POST(request: NextRequest) {
  try {
    const { instanceKey, message, from } = await request.json()

    if (!instanceKey || !message || !from) {
      return NextResponse.json({ error: "Missing required fields: instanceKey, message, from" }, { status: 400 })
    }

    // Create a mock WhatsApp webhook payload
    const mockPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "test-entry-id",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "1234567890",
                  phone_number_id: "test-phone-id",
                },
                contacts: [
                  {
                    profile: {
                      name: "Test User",
                    },
                    wa_id: from,
                  },
                ],
                messages: [
                  {
                    id: `test-msg-${Date.now()}`,
                    from: from,
                    to: "1234567890",
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: "text",
                    text: {
                      body: message,
                    },
                  },
                ],
              },
              field: "messages",
            },
          ],
        },
      ],
    }

    // Forward to the actual webhook handler
    const webhookUrl = new URL(`/api/webhooks/whatsapp/${instanceKey}`, request.url)

    const response = await fetch(webhookUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockPayload),
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: "Test webhook sent successfully",
      result,
    })
  } catch (error) {
    console.error("[Test Webhook] Error:", error)
    return NextResponse.json({ error: "Failed to send test webhook" }, { status: 500 })
  }
}
