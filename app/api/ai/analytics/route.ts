import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Get AI analytics for an instance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instance")
    const timeframe = searchParams.get("timeframe") || "7d" // 1d, 7d, 30d

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get instance
    const { data: instance, error: instanceError } = await supabase
      .from("instances")
      .select("id, user_id")
      .eq("instance_name", instanceName)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 })
    }

    // Calculate date range
    const now = new Date()
    const daysBack = timeframe === "1d" ? 1 : timeframe === "7d" ? 7 : 30
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Get message analytics
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(`
        id,
        is_from_bot,
        ai_response_generated,
        ai_model_used,
        processing_time_ms,
        created_at,
        conversations!inner (
          instance_id
        )
      `)
      .eq("conversations.instance_id", instance.id)
      .gte("created_at", startDate.toISOString())

    if (messagesError) {
      console.error("[AI Analytics API] Messages error:", messagesError)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    // Process analytics
    const totalMessages = messages?.length || 0
    const aiMessages = messages?.filter((m) => m.is_from_bot) || []
    const userMessages = messages?.filter((m) => !m.is_from_bot) || []

    const avgResponseTime =
      aiMessages.length > 0
        ? aiMessages.reduce((sum, m) => sum + (m.processing_time_ms || 0), 0) / aiMessages.length
        : 0

    // Group by model
    const modelUsage = aiMessages.reduce(
      (acc, m) => {
        const model = m.ai_model_used || "unknown"
        acc[model] = (acc[model] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Group by day for charts
    const dailyStats = []
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      const dayMessages =
        messages?.filter((m) => {
          const msgDate = new Date(m.created_at)
          return msgDate >= dayStart && msgDate <= dayEnd
        }) || []

      dailyStats.push({
        date: dayStart.toISOString().split("T")[0],
        totalMessages: dayMessages.length,
        aiMessages: dayMessages.filter((m) => m.is_from_bot).length,
        userMessages: dayMessages.filter((m) => !m.is_from_bot).length,
        avgResponseTime: dayMessages
          .filter((m) => m.is_from_bot && m.processing_time_ms)
          .reduce((sum, m, _, arr) => sum + (m.processing_time_ms || 0) / arr.length, 0),
      })
    }

    const analytics = {
      summary: {
        totalMessages,
        aiMessages: aiMessages.length,
        userMessages: userMessages.length,
        avgResponseTime: Math.round(avgResponseTime),
        responseRate: userMessages.length > 0 ? Math.round((aiMessages.length / userMessages.length) * 100) : 0,
      },
      modelUsage,
      dailyStats,
      timeframe,
    }

    return NextResponse.json({ success: true, analytics })
  } catch (error) {
    console.error("[AI Analytics API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
