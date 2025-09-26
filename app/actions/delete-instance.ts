"use server"

export async function deleteInstance(instanceName: string) {
  try {
    // Mock implementation - no actual database operations
    console.log("[v0] Mock delete instance:", instanceName)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting instance:", error)
    throw new Error(`Failed to delete instance: ${error}`)
  }
}
