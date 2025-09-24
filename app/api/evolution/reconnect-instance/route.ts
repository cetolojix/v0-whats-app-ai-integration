import { type NextRequest, NextResponse } from "next/server"

const EVOLUTION_API_URL = "https://evolu.cetoloji.com"
const EVOLUTION_API_KEY = "hvsctnOWysGzOGHea8tEzV2iHCGr9H4Ln8n"

export async function POST(request: NextRequest) {
  try {
    const { instanceName } = await request.json()

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    console.log("[v0] Reconnecting instance:", instanceName)

    // First check current instance status
    const statusResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
      headers: {
        apikey: EVOLUTION_API_KEY,
        Accept: "application/json",
      },
    })

    if (!statusResponse.ok) {
      if (statusResponse.status === 404) {
        return NextResponse.json({ error: "Instance not found" }, { status: 404 })
      }
      throw new Error(`Failed to check instance status: ${statusResponse.status}`)
    }

    const statusData = await statusResponse.json()
    console.log("[v0] Current instance status:", statusData)

    // If already connected, no need to reconnect
    if (statusData.instance?.state === "open") {
      return NextResponse.json({
        success: true,
        status: "already_connected",
        message: "Instance is already connected",
        instanceName,
      })
    }

    // Try to restart the instance connection
    const restartResponse = await fetch(`${EVOLUTION_API_URL}/instance/restart/${instanceName}`, {
      method: "PUT",
      headers: {
        apikey: EVOLUTION_API_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!restartResponse.ok) {
      const errorData = await restartResponse.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${restartResponse.status}: Failed to restart instance`)
    }

    const restartData = await restartResponse.json()
    console.log("[v0] Instance restart response:", restartData)

    // Wait a moment for the instance to initialize
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Get new QR code for reconnection
    const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
      headers: {
        apikey: EVOLUTION_API_KEY,
        Accept: "application/json",
      },
    })

    if (qrResponse.ok) {
      const qrData = await qrResponse.json()
      console.log("[v0] New QR code generated for reconnection")

      return NextResponse.json({
        success: true,
        status: "reconnecting",
        message: "Instance restarted, new QR code generated",
        instanceName,
        qrCode: qrData.base64 || qrData.qrcode,
        requiresQRScan: true,
      })
    } else {
      // Even if QR generation fails, the restart was successful
      return NextResponse.json({
        success: true,
        status: "reconnecting",
        message: "Instance restarted successfully",
        instanceName,
        requiresQRScan: true,
      })
    }
  } catch (error) {
    console.error("[v0] Error reconnecting instance:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to reconnect instance"

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Please check if the instance exists and try again",
      },
      { status: 500 },
    )
  }
}
