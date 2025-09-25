"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function updateInstanceStatus(instanceName: string, status: string) {
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

  const { error } = await supabase
    .from("instances")
    .update({
      status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("instance_name", instanceName)
    .eq("user_id", user.id)

  if (error) {
    console.error("[v0] Error updating instance status in database:", error.message)
    throw new Error(`Failed to update instance status: ${error.message}`)
  }

  console.log("[v0] Instance status updated to", status, "in database")
  return { success: true }
}
