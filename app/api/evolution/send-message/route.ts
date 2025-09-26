import { type NextRequest, NextResponse } from "next/server"

const EVOLUTION_API_URL = "https://evolu.cetoloji.com"
const EVOLUTION_API_KEY = "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L"

export async function POST(request: NextRequest) {
  try {
    const { instanceName, number, message, messageType = "text" } = await request.json()

    console.log("[v0] Sending message:", { instanceName, number, messageType })

    if (!instanceName || !number || !message) {
      return NextResponse.json({ error: "Missing required fields: instanceName, number, message" }, { status: 400 })
    }

    // Format phone number (ensure it includes country code)
    const formattedNumber = number.includes("@") ? number : `${number}@s.whatsapp.net`

    let endpoint = ""
    let payload = {}

    switch (messageType) {
      case "text":
        endpoint = `${EVOLUTION_API_URL}/message/sendText/${instanceName}`
        payload = {
          number: formattedNumber,
          text: message,
        }
        break
      case "media":
        endpoint = `${EVOLUTION_API_URL}/message/sendMedia/${instanceName}`
        payload = {
          number: formattedNumber,
          mediatype: "image", // or 'video', 'audio', 'document'
          media: message, // URL or base64
        }
        break
      default:
        return NextResponse.json({ error: "Unsupported message type" }, { status: 400 })
    }

    console.log("[v0] Evolution API request:", { endpoint, payload })

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify(payload),
    })

    console.log("[v0] Evolution API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Evolution API error response:", errorText)

      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { message: errorText }
      }

      throw new Error(`HTTP ${response.status}: ${errorData.message || "Failed to send message"}`)
    }

    const data = await response.json()
    console.log("[v0] Evolution API success response:", data)

    return NextResponse.json({
      success: true,
      messageId: data.key?.id,
      timestamp: data.messageTimestamp,
      instanceName,
      recipient: number,
      data,
    })
  } catch (error) {
    console.error("[v0] Error sending message:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to send message"

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Please check the instance status and recipient number",
      },
      { status: 500 },
    )
  }
}
