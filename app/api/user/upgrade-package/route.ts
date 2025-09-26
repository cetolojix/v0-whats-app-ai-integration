export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { packageName } = await request.json()

    if (!packageName) {
      return NextResponse.json({ error: "Package name is required" }, { status: 400 })
    }

    const mockPackages = {
      Starter: {
        id: 1,
        name: "Starter",
        description: "Perfect for small businesses",
        price: 29,
        max_instances: 3,
        max_messages_per_month: 1000,
      },
      Professional: {
        id: 2,
        name: "Professional",
        description: "For growing businesses",
        price: 79,
        max_instances: 10,
        max_messages_per_month: 5000,
      },
      Enterprise: {
        id: 3,
        name: "Enterprise",
        description: "For large organizations",
        price: 199,
        max_instances: 50,
        max_messages_per_month: 25000,
      },
    }

    const targetPackage = mockPackages[packageName as keyof typeof mockPackages]

    if (!targetPackage) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Package upgraded successfully",
      package: targetPackage,
    })
  } catch (error) {
    console.error("[v0] Error in upgrade package API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
