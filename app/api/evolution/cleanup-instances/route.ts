import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const EVOLUTION_API_URL = "https://evolu.cetoloji.com"
const API_KEY = "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L"

export async function POST(request: NextRequest) {
  try {
    const { currentInstance } = await request.json()

    console.log("[v0] Cleanup disabled - supporting multiple instances. Current instance:", currentInstance)

    const listResponse = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
      method: "GET",
      headers: {
        apikey: API_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!listResponse.ok) {
      throw new Error(`Failed to list instances: ${listResponse.status}`)
    }

    const instances = await listResponse.json()
    console.log("[v0] Found instances:", instances)

    return NextResponse.json({
      success: true,
      instances: instances,
      deletedCount: 0,
      message: `Found ${instances.length} instances - cleanup disabled for multi-instance support`,
    })
  } catch (error) {
    console.error("[v0] Cleanup failed:", error)
    return NextResponse.json({ error: "Failed to list instances" }, { status: 500 })
  }
}
