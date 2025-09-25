import { type NextRequest, NextResponse } from "next/server"

const N8N_API_URL = "https://n8nx.cetoloji.com"
const N8N_API_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOTI2NGNkYy04NGQ4LTRjMzAtOTk5ZC0zZmNhODIyZDE4ZGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NDg3MDk2fQ.3bhtAAtA1NckJmgs-0iRttmsMoDDT9QDj4qZxplZwnI"

export async function POST(request: NextRequest) {
  try {
    const { instanceName } = await request.json()

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    console.log("[v0] Getting workflow prompt for instance:", instanceName)

    let workflowsResponse
    try {
      workflowsResponse = await fetch(`${N8N_API_URL}/api/v1/workflows`, {
        method: "GET",
        headers: {
          "X-N8N-API-KEY": N8N_API_TOKEN,
          "Content-Type": "application/json",
        },
      })
    } catch (fetchError) {
      console.error("[v0] Network error fetching workflows:", fetchError)
      return NextResponse.json(
        {
          error: "Unable to connect to N8N API. Please check if the N8N server is running and accessible.",
          details: fetchError instanceof Error ? fetchError.message : "Network error",
        },
        { status: 503 },
      )
    }

    if (!workflowsResponse.ok) {
      console.error("[v0] Failed to fetch workflows:", workflowsResponse.status, workflowsResponse.statusText)
      return NextResponse.json(
        {
          error: `N8N API returned error: ${workflowsResponse.status} ${workflowsResponse.statusText}`,
        },
        { status: 500 },
      )
    }

    let workflowsData
    try {
      workflowsData = await workflowsResponse.json()
    } catch (parseError) {
      console.error("[v0] Failed to parse workflows response:", parseError)
      return NextResponse.json(
        {
          error: "Invalid response from N8N API",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Workflows response:", JSON.stringify(workflowsData).substring(0, 500) + "...")

    // Find the workflow for this instance
    const workflows = workflowsData.workflows || workflowsData.data || []
    let workflow = workflows.find(
      (w: any) => w.name === `WhatsApp Bot - ${instanceName}` || w.name.includes(instanceName),
    )

    // If no workflow found with instance name, try to find any WhatsApp Bot workflow
    if (!workflow) {
      console.log("[v0] No exact match found, looking for any WhatsApp Bot workflow...")
      workflow = workflows.find((w: any) => w.name.includes("WhatsApp Bot") || w.name.includes("WhatsApp AI"))

      if (workflow) {
        console.log("[v0] Found alternative WhatsApp Bot workflow:", workflow.name)
      }
    }

    if (!workflow) {
      console.log("[v0] No workflow found for instance:", instanceName)
      return NextResponse.json({ error: "Workflow not found for this instance" }, { status: 404 })
    }

    console.log("[v0] Found workflow:", workflow.id, workflow.name)

    let workflowDetailResponse
    try {
      workflowDetailResponse = await fetch(`${N8N_API_URL}/api/v1/workflows/${workflow.id}`, {
        method: "GET",
        headers: {
          "X-N8N-API-KEY": N8N_API_TOKEN,
          "Content-Type": "application/json",
        },
      })
    } catch (fetchError) {
      console.error("[v0] Network error fetching workflow details:", fetchError)
      return NextResponse.json(
        {
          error: "Unable to connect to N8N API for workflow details",
          details: fetchError instanceof Error ? fetchError.message : "Network error",
        },
        { status: 503 },
      )
    }

    if (!workflowDetailResponse.ok) {
      console.error(
        "[v0] Failed to fetch workflow details:",
        workflowDetailResponse.status,
        workflowDetailResponse.statusText,
      )
      return NextResponse.json(
        {
          error: `Failed to fetch workflow details: ${workflowDetailResponse.status} ${workflowDetailResponse.statusText}`,
        },
        { status: 500 },
      )
    }

    let workflowDetail
    try {
      workflowDetail = await workflowDetailResponse.json()
    } catch (parseError) {
      console.error("[v0] Failed to parse workflow details response:", parseError)
      return NextResponse.json(
        {
          error: "Invalid workflow details response from N8N API",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Got workflow details, looking for AI Agent node...")

    // Find the AI Agent node in the workflow
    const aiAgentNode = workflowDetail.nodes?.find(
      (node: any) => node.type === "@n8n/n8n-nodes-langchain.agent" || node.name === "AI Agent",
    )

    if (!aiAgentNode) {
      console.log("[v0] No AI Agent node found in workflow")
      return NextResponse.json({ error: "AI Agent node not found in workflow" }, { status: 404 })
    }

    // Extract the current prompt from the AI Agent node
    let currentPrompt = aiAgentNode.parameters?.text || ""

    if (currentPrompt.includes("{{ $json") || currentPrompt.includes("={{") || currentPrompt.trim() === "") {
      currentPrompt = "Sen yardımcı bir WhatsApp AI asistanısın. Kullanıcılara nazik ve faydalı cevaplar ver."
    }

    console.log("[v0] Current prompt found:", currentPrompt.substring(0, 100) + "...")

    return NextResponse.json({
      success: true,
      prompt: currentPrompt,
      workflowId: workflow.id,
      workflowName: workflow.name,
    })
  } catch (error) {
    console.error("[v0] Error getting workflow prompt:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
