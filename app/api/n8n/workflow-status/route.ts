import { type NextRequest, NextResponse } from "next/server"

const N8N_API_URL = "https://n8nx.cetoloji.com"
const N8N_API_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOTI2NGNkYy04NGQ4LTRjMzAtOTk5ZC0zZmNhODIyZDE4ZGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NDg3MDk2fQ.3bhtAAtA1NckJmgs-0iRttmsMoDDT9QDj4qZxplZwnI"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get("workflowId")
    const instanceName = searchParams.get("instance")

    console.log("[v0] n8n API request:", { workflowId, instanceName, apiUrl: N8N_API_URL })

    if (!workflowId && !instanceName) {
      return NextResponse.json({ error: "Either workflowId or instanceName is required" }, { status: 400 })
    }

    if (workflowId) {
      // Get specific workflow status
      const url = `${N8N_API_URL}/api/v1/workflows/${workflowId}`
      console.log("[v0] Fetching workflow from:", url)

      const response = await fetch(url, {
        headers: {
          "X-N8N-API-KEY": N8N_API_TOKEN,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("[v0] n8n response status:", response.status)
      console.log("[v0] n8n response headers:", Object.fromEntries(response.headers.entries()))

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
        if (response.status === 404) {
          return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
        }
        throw new Error(`HTTP ${response.status}: Failed to get workflow status`)
      }

      const workflow = await response.json()

      return NextResponse.json({
        success: true,
        workflow: {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active,
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
          nodes: workflow.nodes?.length || 0,
          connections: Object.keys(workflow.connections || {}).length,
        },
      })
    } else {
      // Get workflows by instance name
      const url = `${N8N_API_URL}/api/v1/workflows`
      console.log("[v0] Fetching workflows from:", url)

      const response = await fetch(url, {
        headers: {
          "X-N8N-API-KEY": N8N_API_TOKEN,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("[v0] n8n workflows response status:", response.status)

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
        throw new Error(`HTTP ${response.status}: Failed to fetch workflows`)
      }

      const data = await response.json()
      const workflows = (data.data || []).filter((workflow: any) => workflow.name.includes(instanceName))

      return NextResponse.json({
        success: true,
        workflows: workflows.map((workflow: any) => ({
          id: workflow.id,
          name: workflow.name,
          active: workflow.active,
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
          nodes: workflow.nodes?.length || 0,
        })),
        total: workflows.length,
      })
    }
  } catch (error) {
    console.error("[v0] Error getting workflow status:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to get workflow status"

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
