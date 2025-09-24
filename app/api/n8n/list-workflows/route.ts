export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

const N8N_API_URL = "https://n8nx.cetoloji.com"
const N8N_API_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOTI2NGNkYy04NGQ4LTRjMzAtOTk5ZC0zZmNhODIyZDE4ZGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NDg3MDk2fQ.3bhtAAtA1NckJmgs-0iRttmsMoDDT9QDj4qZxplZwnI"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instance")

    // Get all workflows from n8n
    const response = await fetch(`${N8N_API_URL}/api/workflows`, {
      headers: {
        Authorization: `Bearer ${N8N_API_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch workflows`)
    }

    const data = await response.json()

    // Filter workflows for specific instance if provided
    let workflows = data.data || []

    if (instanceName) {
      workflows = workflows.filter((workflow: any) => workflow.name.includes(instanceName))
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

    return NextResponse.json({
      success: true,
      workflows: formattedWorkflows,
      total: formattedWorkflows.length,
    })
  } catch (error) {
    console.error("Error fetching workflows:", error)

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
