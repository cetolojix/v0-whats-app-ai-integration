import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const EVOLUTION_API_URL = "https://evolu.cetoloji.com"

const EVOLUTION_API_KEY = "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instance")

    console.log("[v0] Getting QR code for instance:", instanceName)

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    const headers = {
      apikey: EVOLUTION_API_KEY,
      Accept: "application/json",
      "Content-Type": "application/json",
    }

    // First check if instance exists and is ready
    const statusResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
      headers,
    })

    console.log("[v0] Status check response:", statusResponse.status)

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text()
      console.log("[v0] Status check error:", errorText)
      return NextResponse.json({ error: "Instance not found or not ready" }, { status: 404 })
    }

    const statusData = await statusResponse.json()
    console.log("[v0] Instance status:", JSON.stringify(statusData, null, 2))

    // If already connected, return status instead of QR
    if (statusData.instance?.state === "open") {
      console.log("[v0] Instance is already connected, returning success status")
      return NextResponse.json(
        {
          success: true,
          status: "already_connected",
          message: "Instance is already connected to WhatsApp",
          instanceName,
          connected: true,
        },
        { status: 200 },
      )
    }

    // Get QR code from Evolution API v2
    const response = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
      headers,
    })

    console.log("[v0] QR code response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] QR code error response:", errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }

      throw new Error(errorData.message || `HTTP ${response.status}: Failed to get QR code`)
    }

    const data = await response.json()
    console.log("[v0] QR code data:", JSON.stringify(data, null, 2))

    if (!data.qrcode && !data.base64) {
      throw new Error("No QR code data received from Evolution API")
    }

    // Return QR code data
    return NextResponse.json({
      success: true,
      qrCode: data.base64 || data.qrcode,
      instanceName,
      expiresIn: 60, // QR codes typically expire in 60 seconds
    })
  } catch (error) {
    console.error("[v0] Error getting QR code:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to get QR code"

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Please ensure the instance exists and try again",
      },
      { status: 500 },
    )
  }
}
