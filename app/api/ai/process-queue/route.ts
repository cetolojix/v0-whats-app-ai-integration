import { type NextRequest, NextResponse } from "next/server"
import { processQueuedMessages } from "@/lib/ai/processor"

// API endpoint to process queued messages (can be called by cron job)
export async function POST(request: NextRequest) {
  try {
    // Verify authorization (you might want to add a secret token)
    const authHeader = request.headers.get("authorization")
    const expectedToken = process.env.CRON_SECRET || "your-cron-secret"

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await processQueuedMessages()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[AI Queue API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Allow GET for health checks
export async function GET() {
  return NextResponse.json({ status: "AI processing queue is healthy" })
}
