import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const EVOLUTION_API_URL = "https://evolu.cetoloji.com"
const EVOLUTION_API_KEY = "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L"

async function deleteN8nWorkflows(instanceName: string) {
  try {
    const N8N_API_URL = "https://n8nx.cetoloji.com"
    const N8N_API_TOKEN =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOTI2NGNkYy04NGQ4LTRjMzAtOTk5ZC0zZmNhODIyZDE4ZGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NDg3MDk2fQ.3bhtAAtA1NckJmgs-0iRttmsMoDDT9QDj4qZxplZwnI"

    // List workflows to find matching ones
    const listResponse = await fetch(`${N8N_API_URL}/api/v1/workflows`, {
      headers: {
        Authorization: `Bearer ${N8N_API_TOKEN}`,
      },
    })

    if (!listResponse.ok) {
      console.warn("[v0] Failed to list n8n workflows:", listResponse.status)
      return
    }

    const data = await listResponse.json()
    const matchingWorkflows = (data.data || []).filter(
      (workflow: any) => workflow.name && workflow.name.includes(instanceName),
    )

    if (matchingWorkflows.length === 0) {
      console.log("[v0] No n8n workflows found for instance:", instanceName)
      return
    }

    // Delete each matching workflow
    const deletePromises = matchingWorkflows.map(async (workflow: any) => {
      const deleteResponse = await fetch(`${N8N_API_URL}/api/v1/workflows/${workflow.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${N8N_API_TOKEN}`,
        },
      })

      if (deleteResponse.ok) {
        console.log("[v0] Deleted n8n workflow:", workflow.id, workflow.name)
      } else {
        console.warn("[v0] Failed to delete n8n workflow:", workflow.id, deleteResponse.status)
      }
    })

    await Promise.allSettled(deletePromises)
    console.log("[v0] N8n workflow cleanup completed for instance:", instanceName)
  } catch (error) {
    console.warn("[v0] Error during n8n workflow cleanup:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { instanceName } = await request.json()

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    console.log("[v0] Deleting instance:", instanceName)

    const response = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
      method: "DELETE",
      headers: {
        apikey: EVOLUTION_API_KEY,
        Accept: "application/json",
      },
    })

    console.log("[v0] Delete response status:", response.status)

    if (response.ok) {
      await deleteN8nWorkflows(instanceName)

      console.log("[v0] Instance deleted successfully:", instanceName)

      return NextResponse.json({
        success: true,
        message: `Instance ${instanceName} deleted successfully`,
        instanceName,
      })
    } else if (response.status === 404) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 })
    } else {
      const errorText = await response.text().catch(() => "Unknown error")
      console.log("[v0] Delete failed:", response.status, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
  } catch (error) {
    console.error("Error deleting instance:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to delete instance"

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Please check if the instance exists and API authentication is correct",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instance")

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    console.log("[v0] Deleting instance via DELETE method:", instanceName)

    const response = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
      method: "DELETE",
      headers: {
        apikey: EVOLUTION_API_KEY,
        Accept: "application/json",
      },
    })

    console.log("[v0] Delete response status:", response.status)

    if (response.ok) {
      await deleteN8nWorkflows(instanceName)

      return NextResponse.json({
        success: true,
        message: `Instance ${instanceName} deleted successfully`,
        instanceName,
      })
    } else if (response.status === 404) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 })
    } else {
      const errorText = await response.text().catch(() => "Unknown error")
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
  } catch (error) {
    console.error("Error deleting instance:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to delete instance"

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Please check if the instance exists and API authentication is correct",
      },
      { status: 500 },
    )
  }
}
