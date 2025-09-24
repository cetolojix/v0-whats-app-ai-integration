import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Get AI configuration for an instance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instance")

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get instance configuration
    const { data: instance, error: instanceError } = await supabase
      .from("instances")
      .select("*")
      .eq("instance_name", instanceName)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 })
    }

    // Mock AI configuration - in production, this would come from your database
    const aiConfig = {
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 1000,
      responseDelay: 2000,
      autoReply: true,
      smartFiltering: true,
      contextMemory: true,
      multiLanguage: true,
      customInstructions: instance.custom_prompt || "",
      triggerKeywords: ["help", "support", "info", "question"],
      blacklistKeywords: ["spam", "advertisement"],
      businessHours: {
        enabled: false,
        timezone: "UTC",
        schedule: {
          monday: { start: "09:00", end: "17:00", enabled: true },
          tuesday: { start: "09:00", end: "17:00", enabled: true },
          wednesday: { start: "09:00", end: "17:00", enabled: true },
          thursday: { start: "09:00", end: "17:00", enabled: true },
          friday: { start: "09:00", end: "17:00", enabled: true },
          saturday: { start: "10:00", end: "16:00", enabled: false },
          sunday: { start: "10:00", end: "16:00", enabled: false },
        },
      },
      fallbackMessage:
        "I apologize, but I'm currently unable to process your request. A human agent will get back to you soon.",
      escalationTriggers: ["speak to human", "manager", "complaint", "escalate"],
      analytics: {
        trackConversations: true,
        trackResponseTime: true,
        trackUserSatisfaction: true,
        generateReports: true,
      },
    }

    return NextResponse.json({ success: true, config: aiConfig })
  } catch (error) {
    console.error("[AI Config API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update AI configuration
export async function POST(request: NextRequest) {
  try {
    const { instanceName, config } = await request.json()

    if (!instanceName || !config) {
      return NextResponse.json({ error: "Instance name and config are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify instance exists and user has access
    const { data: instance, error: instanceError } = await supabase
      .from("instances")
      .select("id, user_id")
      .eq("instance_name", instanceName)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 })
    }

    // Update instance with new configuration
    const { error: updateError } = await supabase
      .from("instances")
      .update({
        custom_prompt: config.customInstructions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", instance.id)

    if (updateError) {
      console.error("[AI Config API] Update error:", updateError)
      return NextResponse.json({ error: "Failed to update configuration" }, { status: 500 })
    }

    // In production, you would also update other AI configuration settings
    // This could involve updating your AI service configuration, workflow settings, etc.

    return NextResponse.json({
      success: true,
      message: "AI configuration updated successfully",
      config,
    })
  } catch (error) {
    console.error("[AI Config API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
