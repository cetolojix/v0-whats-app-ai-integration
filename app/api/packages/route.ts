export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const packages = [
      {
        id: 1,
        name: "Starter",
        description: "Perfect for small businesses",
        price: 29,
        max_instances: 3,
        max_messages_per_month: 1000,
        features: ["Basic automation", "WhatsApp integration", "Email support"],
        is_active: true,
      },
      {
        id: 2,
        name: "Professional",
        description: "For growing businesses",
        price: 79,
        max_instances: 10,
        max_messages_per_month: 5000,
        features: ["Advanced automation", "Multiple integrations", "Priority support", "Analytics"],
        is_active: true,
      },
      {
        id: 3,
        name: "Enterprise",
        description: "For large organizations",
        price: 199,
        max_instances: 50,
        max_messages_per_month: 25000,
        features: ["Custom workflows", "API access", "Dedicated support", "Advanced analytics", "White-label"],
        is_active: true,
      },
    ]

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("[v0] Error in packages API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
