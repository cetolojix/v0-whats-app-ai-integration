"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function forceLogoutUser(userId: string) {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Failed to initialize Supabase client")
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Check if current user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required")
  }

  try {
    // Delete all user sessions
    const { error: sessionError } = await supabase.from("user_sessions").delete().eq("user_id", userId)

    if (sessionError) {
      throw new Error(`Failed to logout user: ${sessionError.message}`)
    }

    // Log admin action
    await supabase.rpc("log_system_activity", {
      p_user_id: userId,
      p_admin_user_id: user.id,
      p_activity_type: "ADMIN_ACTION",
      p_resource_type: "users",
      p_resource_id: userId,
      p_description: `Admin forced logout for user`,
      p_metadata: { action: "force_logout" },
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Error forcing logout:", error)
    throw new Error("Failed to force logout user")
  }
}

export async function suspendUser(userId: string) {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Failed to initialize Supabase client")
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Check if current user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required")
  }

  try {
    // Update user role to suspended
    const { error: updateError } = await supabase.from("profiles").update({ role: "suspended" }).eq("id", userId)

    if (updateError) {
      throw new Error(`Failed to suspend user: ${updateError.message}`)
    }

    // Log admin action
    await supabase.rpc("log_system_activity", {
      p_user_id: userId,
      p_admin_user_id: user.id,
      p_activity_type: "ADMIN_ACTION",
      p_resource_type: "users",
      p_resource_id: userId,
      p_description: `Admin suspended user`,
      p_metadata: { action: "suspend_user" },
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Error suspending user:", error)
    throw new Error("Failed to suspend user")
  }
}

export async function forceDisconnectInstance(instanceId: string) {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Failed to initialize Supabase client")
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Check if current user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required")
  }

  try {
    // Update instance status to disconnected
    const { error: updateError } = await supabase
      .from("instances")
      .update({
        status: "disconnected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", instanceId)

    if (updateError) {
      throw new Error(`Failed to disconnect instance: ${updateError.message}`)
    }

    // Log admin action
    await supabase.rpc("log_system_activity", {
      p_user_id: null,
      p_admin_user_id: user.id,
      p_activity_type: "ADMIN_ACTION",
      p_resource_type: "instances",
      p_resource_id: instanceId,
      p_description: `Admin force disconnected instance`,
      p_metadata: { action: "force_disconnect" },
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Error disconnecting instance:", error)
    throw new Error("Failed to disconnect instance")
  }
}

export async function terminateUserSession(sessionId: string) {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Failed to initialize Supabase client")
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Check if current user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required")
  }

  try {
    // Delete specific session
    const { error: sessionError } = await supabase.from("user_sessions").delete().eq("id", sessionId)

    if (sessionError) {
      throw new Error(`Failed to terminate session: ${sessionError.message}`)
    }

    // Log admin action
    await supabase.rpc("log_system_activity", {
      p_user_id: null,
      p_admin_user_id: user.id,
      p_activity_type: "ADMIN_ACTION",
      p_resource_type: "system",
      p_resource_id: sessionId,
      p_description: `Admin terminated user session`,
      p_metadata: { action: "terminate_session", session_id: sessionId },
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Error terminating session:", error)
    throw new Error("Failed to terminate session")
  }
}
