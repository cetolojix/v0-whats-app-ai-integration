export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

const EVOLUTION_API_URL = "https://evolu.cetoloji.com"
const EVOLUTION_API_KEY = "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instance")

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    console.log(`[v0] Checking webhook status for instance: ${instanceName}`)

    // Check webhook configuration
    const response = await fetch(`${EVOLUTION_API_URL}/webhook/find/${instanceName}`, {
      method: "GET",
      headers: {
        apikey: EVOLUTION_API_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get webhook status: ${response.status}`)
    }

    const webhookData = await response.json()
    console.log(`[v0] Webhook status response:`, JSON.stringify(webhookData, null, 2))

    return NextResponse.json({
      success: true,
      instanceName,
      webhook: webhookData,
    })
  } catch (error) {
    console.error("[v0] Error checking webhook status:", error)
    return NextResponse.json({ error: "Failed to check webhook status" }, { status: 500 })
  }
}
