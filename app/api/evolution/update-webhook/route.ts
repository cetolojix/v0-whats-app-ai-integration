export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

const EVOLUTION_API_URL = "https://evolu.cetoloji.com"
const EVOLUTION_API_KEY = "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L"

export async function POST(request: NextRequest) {
  try {
    const { instanceName, webhookUrl } = await request.json()

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    console.log(`[v0] Updating webhook for instance: ${instanceName}`)

    const webhookPayload = {
      url:
        webhookUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhooks/whatsapp/${instanceName}`,
      events: [
        "messages.upsert",
        "messages.update",
        "messages.delete",
        "connection.update",
        "qrcode.updated",
        "messages.set",
        "presence.update",
        "chats.upsert",
        "chats.update",
        "chats.delete",
        "contacts.upsert",
        "contacts.update",
      ],
      base64: false,
      enabled: true,
    }

    const response = await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
      method: "POST",
      headers: {
        apikey: EVOLUTION_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to update webhook: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`[v0] Webhook updated successfully:`, JSON.stringify(data, null, 2))

    return NextResponse.json({
      success: true,
      instanceName,
      webhook: data,
    })
  } catch (error) {
    console.error("[v0] Error updating webhook:", error)
    return NextResponse.json({ error: "Failed to update webhook" }, { status: 500 })
  }
}
