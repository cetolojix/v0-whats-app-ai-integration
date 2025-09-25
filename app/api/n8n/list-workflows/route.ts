export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

const N8N_API_URL = "https://n8nx.cetoloji.com"
const N8N_API_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOTI2NGNkYy04NGQ4LTRjMzAtOTk5ZC0zZmNhODIyZDE4ZGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NDg3MDk2fQ.3bhtAAtA1NckJmgs-0iRttmsMoDDT9QDj4qZxplZwnI"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instance")

    console.log("[v0] n8n API request:", { workflowId: null, instanceName, apiUrl: N8N_API_URL })

    const response = await fetch(`${N8N_API_URL}/api/v1/workflows`, {
      method: "GET",
      headers: {
        "X-N8N-API-KEY": N8N_API_TOKEN,
      },
    })

    console.log("[v0] Fetching workflows from:", `${N8N_API_URL}/api/v1/workflows`)
    console.log("[v0] n8n workflows response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] n8n workflows error:", errorText)
      throw new Error(`HTTP ${response.status}: Failed to fetch workflows`)
    }

    const data = await response.json()

    console.log("[v0] Raw workflows data structure:", Object.keys(data))
    console.log("[v0] Raw workflows count:", data.data?.length || 0)

    // Get workflows from the response
    let workflows = data.data || []
    console.log(
      "[v0] All available workflows:",
      workflows.map((w: any) => ({ id: w.id, name: w.name })),
    )

    if (instanceName) {
      console.log("[v0] Filtering workflows for instance:", instanceName)

      const specificWorkflowId = "jJgBK6BzBeHD1ZYA"
      let filteredWorkflows = workflows.filter((workflow: any) => workflow.id === specificWorkflowId)

      if (filteredWorkflows.length > 0) {
        console.log("[v0] Found specific workflow by ID:", specificWorkflowId)
        workflows = filteredWorkflows
      } else {
        // Eski filtreleme mantığı
        filteredWorkflows = workflows.filter((workflow: any) => {
          const nameContainsInstance = workflow.name.includes(instanceName)
          const isWhatsAppBot = workflow.name.includes("WhatsApp Bot") || workflow.name.includes("WhatsApp AI")
          const matchesBoth = nameContainsInstance && isWhatsAppBot

          console.log("[v0] Checking workflow:", workflow.name, {
            nameContainsInstance,
            isWhatsAppBot,
            matchesBoth,
          })

          return matchesBoth
        })

        if (filteredWorkflows.length === 0) {
          console.log("[v0] No exact matches found, looking for any WhatsApp Bot workflows...")
          filteredWorkflows = workflows.filter(
            (workflow: any) => workflow.name.includes("WhatsApp Bot") || workflow.name.includes("WhatsApp AI"),
          )
          console.log(
            "[v0] Found alternative WhatsApp Bot workflows:",
            filteredWorkflows.map((w: any) => w.name),
          )
        }

        workflows = filteredWorkflows
      }

      console.log(
        "[v0] Final filtered workflows for",
        instanceName + ":",
        workflows.map((w: any) => w.name),
      )
    }

    // Format workflow data
    const formattedWorkflows = workflows.map((workflow: any) => ({
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      nodes: workflow.nodes?.length || 0,
      tags: workflow.tags || [],
    }))

    console.log("[v0] Final formatted workflows count:", formattedWorkflows.length)

    return NextResponse.json({
      success: true,
      workflows: formattedWorkflows,
      total: formattedWorkflows.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching workflows:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to fetch workflows"

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Please check n8n connection",
      },
      { status: 500 },
    )
  }
}
