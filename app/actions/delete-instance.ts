"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function deleteInstance(instanceName: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { error } = await supabase.from("instances").delete().eq("instance_name", instanceName).eq("user_id", user.id)

  if (error) {
    console.error("[v0] Error deleting instance from database:", error.message)
    throw new Error(`Failed to delete instance: ${error.message}`)
  }

  console.log("[v0] Instance deleted from database:", instanceName)
  return { success: true }
}
