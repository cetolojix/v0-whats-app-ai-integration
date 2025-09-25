export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { debugLog } from "@/lib/debug"

export async function GET(request: NextRequest) {
  try {
    let supabase
    try {
      supabase = await createClient()
    } catch (clientError) {
      debugLog("[v0] Failed to create Supabase client:", clientError)

      if (clientError instanceof Error && clientError.message.includes("Missing Supabase environment variables")) {
        return NextResponse.json(
          {
            error: "Database not configured",
            details: "Supabase environment variables are missing. Please configure SUPABASE_URL and SUPABASE_ANON_KEY.",
            packageInfo: {
              user_id: "demo",
              package_name: "basic",
              display_name: "Basic Package (Demo Mode)",
              price: 0,
              features: ["Basic WhatsApp Integration", "Simple AI Responses"],
              limits: { messages_per_day: 100, instances: 1 },
              status: "active",
              demo_mode: true,
            },
          },
          { status: 200 },
        )
      }

      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    if (!supabase) {
      debugLog("[v0] Supabase client is null")
      return NextResponse.json(
        {
          error: "Database connection failed",
          packageInfo: {
            user_id: "demo",
            package_name: "basic",
            display_name: "Basic Package (Demo Mode)",
            price: 0,
            features: ["Basic WhatsApp Integration", "Simple AI Responses"],
            limits: { messages_per_day: 100, instances: 1 },
            status: "active",
            demo_mode: true,
          },
        },
        { status: 200 },
      )
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      debugLog("[v0] Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!user) {
      debugLog("[v0] No user found")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    debugLog("[v0] Fetching package info for user:", user.id)

    let packageInfo = null
    let error = null

    try {
      const { data, error: viewError } = await supabase
        .from("user_package_info")
        .select("*")
        .eq("user_id", user.id)
        .single()

      packageInfo = data
      error = viewError
    } catch (viewErr) {
      debugLog("[v0] View query failed, trying direct query:", viewErr)

      const { data: subscriptionData, error: subError } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          packages (
            id,
            name,
            display_name,
            price,
            features,
            limits
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      if (!subError && subscriptionData) {
        packageInfo = {
          user_id: user.id,
          package_id: subscriptionData.package_id,
          package_name: subscriptionData.packages?.name,
          display_name: subscriptionData.packages?.display_name,
          price: subscriptionData.packages?.price,
          features: subscriptionData.packages?.features,
          limits: subscriptionData.packages?.limits,
          status: subscriptionData.status,
          created_at: subscriptionData.created_at,
          expires_at: subscriptionData.expires_at,
        }
        error = null
      } else {
        error = subError
      }
    }

    if (error) {
      debugLog("[v0] Error fetching user package info:", error)

      if (error.code === "PGRST116" || error.code === "42P01" || error.code === "PGRST301") {
        // No rows found, table doesn't exist, or connection error
        debugLog("[v0] Database tables not found or connection error, returning default package info")

        return NextResponse.json({
          packageInfo: {
            user_id: user.id,
            package_name: "basic",
            display_name: "Basic Package",
            price: 0,
            features: ["Basic WhatsApp Integration", "Simple AI Responses"],
            limits: { messages_per_day: 100, instances: 1 },
            status: "active",
            fallback_mode: true,
          },
        })
      }

      try {
        const { data: packages, error: packagesError } = await supabase.from("packages").select("id, name").limit(1)

        if (packagesError) {
          debugLog("[v0] Packages table not found, returning default package info")
          return NextResponse.json({
            packageInfo: {
              user_id: user.id,
              package_name: "basic",
              display_name: "Basic Package",
              price: 0,
              features: ["Basic WhatsApp Integration", "Simple AI Responses"],
              limits: { messages_per_day: 100, instances: 1 },
              status: "active",
              fallback_mode: true,
            },
          })
        }

        // Get basic package
        const { data: basicPackage, error: packageError } = await supabase
          .from("packages")
          .select("id")
          .eq("name", "basic")
          .single()

        if (packageError || !basicPackage) {
          debugLog("[v0] Basic package not found:", packageError)
          return NextResponse.json({
            packageInfo: {
              user_id: user.id,
              package_name: "basic",
              display_name: "Basic Package",
              price: 0,
              features: ["Basic WhatsApp Integration", "Simple AI Responses"],
              limits: { messages_per_day: 100, instances: 1 },
              status: "active",
              fallback_mode: true,
            },
          })
        }

        // Create subscription for user
        const { error: subscriptionError } = await supabase.from("user_subscriptions").insert({
          user_id: user.id,
          package_id: basicPackage.id,
          status: "active",
        })

        if (subscriptionError) {
          debugLog("[v0] Failed to create subscription:", subscriptionError)
          return NextResponse.json({
            packageInfo: {
              user_id: user.id,
              package_name: "basic",
              display_name: "Basic Package",
              price: 0,
              features: ["Basic WhatsApp Integration", "Simple AI Responses"],
              limits: { messages_per_day: 100, instances: 1 },
              status: "active",
              fallback_mode: true,
            },
          })
        }

        // Retry getting package info
        const { data: retryPackageInfo, error: retryError } = await supabase
          .from("user_package_info")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (!retryError && retryPackageInfo) {
          debugLog("[v0] Successfully assigned basic package")
          return NextResponse.json({ packageInfo: retryPackageInfo })
        }

        debugLog("[v0] Failed to fetch package info after assignment:", retryError)
      } catch (assignmentError) {
        debugLog("[v0] Error during package assignment:", assignmentError)
      }

      return NextResponse.json({
        packageInfo: {
          user_id: user.id,
          package_name: "basic",
          display_name: "Basic Package",
          price: 0,
          features: ["Basic WhatsApp Integration", "Simple AI Responses"],
          limits: { messages_per_day: 100, instances: 1 },
          status: "active",
          fallback_mode: true,
        },
      })
    }

    debugLog("[v0] Package info fetched successfully")
    return NextResponse.json({ packageInfo })
  } catch (error) {
    debugLog("[v0] Error in user package info API:", error)

    return NextResponse.json({
      packageInfo: {
        user_id: "demo",
        package_name: "basic",
        display_name: "Basic Package (Error Recovery)",
        price: 0,
        features: ["Basic WhatsApp Integration", "Simple AI Responses"],
        limits: { messages_per_day: 100, instances: 1 },
        status: "active",
        error_recovery: true,
      },
    })
  }
}
