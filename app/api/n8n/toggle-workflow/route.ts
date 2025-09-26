import { type NextRequest, NextResponse } from "next/server"

const N8N_API_URL = "https://n8nx.cetoloji.com"
const N8N_API_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOTI2NGNkYy04NGQ4LTRjMzAtOTk5ZC0zZmNhODIyZDE4ZGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NDg3MDk2fQ.3bhtAAtA1NckJmgs-0iRttmsMoDDT9QDj4qZxplZwnI"

export async function POST(request: NextRequest) {
  try {
    const { workflowId, active } = await request.json()

    console.log("[v0] Toggling workflow:", { workflowId, active })

    if (!workflowId) {
      return NextResponse.json({ error: "Workflow ID is required" }, { status: 400 })
    }

    const action = active ? "activate" : "deactivate"
    const url = `${N8N_API_URL}/api/v1/workflows/${workflowId}/${action}`

    console.log("[v0] Making request to:", url)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-N8N-API-KEY": N8N_API_TOKEN,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    console.log("[v0] n8n response status:", response.status)

    const contentType = response.headers.get("content-type")
    if (contentType && !contentType.includes("application/json")) {
      const textResponse = await response.text()
      console.log("[v0] n8n returned non-JSON response:", textResponse.substring(0, 200))

      return NextResponse.json(
        {
          error: "n8n service unavailable",
          details: "n8n API returned HTML instead of JSON - service may be down or misconfigured",
          contentType,
          status: response.status,
        },
        { status: 503 },
      )
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to ${action} workflow: ${response.status} - ${errorData.message || "Unknown error"}`)
    }

    const result = await response.json()

    console.log("[v0] Workflow toggled successfully:", result)

    return NextResponse.json({
      success: true,
      workflowId,
      active,
      message: `Otomatik yanıt sistemi ${active ? "aktif edildi" : "deaktif edildi"}`,
    })
  } catch (error) {
    console.error("[v0] Error toggling workflow:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to toggle workflow"

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Please check n8n connection and workflow ID",
        apiUrl: N8N_API_URL,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
