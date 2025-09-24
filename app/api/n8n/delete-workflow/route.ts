export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

const N8N_API_URL = "https://n8nx.cetoloji.com"
const N8N_API_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOTI2NGNkYy04NGQ4LTRjMzAtOTk5ZC0zZmNhODIyZDE4ZGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NDg3MDk2fQ.3bhtAAtA1NckJmgs-0iRttmsMoDDT9QDj4qZxplZwnI"

export async function DELETE(request: NextRequest) {
  try {
    const { instanceName, workflowId } = await request.json()

    if (!instanceName && !workflowId) {
      return NextResponse.json({ error: "Either instanceName or workflowId is required" }, { status: 400 })
    }

    let workflowsToDelete: string[] = []

    if (workflowId) {
      // Delete specific workflow by ID
      workflowsToDelete = [workflowId]
    } else if (instanceName) {
      // Find workflows by instance name
      const listResponse = await fetch(`${N8N_API_URL}/api/v1/workflows`, {
        headers: {
          Authorization: `Bearer ${N8N_API_TOKEN}`,
        },
      })

      if (listResponse.ok) {
        const data = await listResponse.json()
        const matchingWorkflows = (data.data || []).filter(
          (workflow: any) => workflow.name && workflow.name.includes(instanceName),
        )
        workflowsToDelete = matchingWorkflows.map((workflow: any) => workflow.id)
      } else {
        console.error("[v0] Failed to list workflows:", listResponse.status, await listResponse.text())
      }
    }

    if (workflowsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No workflows found to delete",
        deleted: 0,
        failed: 0,
      })
    }

    // Delete each workflow
    const deleteResults = await Promise.allSettled(
      workflowsToDelete.map(async (id) => {
        const response = await fetch(`${N8N_API_URL}/api/v1/workflows/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${N8N_API_TOKEN}`,
          },
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error")
          throw new Error(`Failed to delete workflow ${id}: ${response.status} - ${errorText}`)
        }

        return { id, success: true }
      }),
    )

    const successful = deleteResults.filter((result) => result.status === "fulfilled").length
    const failed = deleteResults.filter((result) => result.status === "rejected").length

    console.log("[v0] Workflow deletion results:", { successful, failed, workflowIds: workflowsToDelete })

    return NextResponse.json({
      success: true,
      deleted: successful,
      failed,
      workflowIds: workflowsToDelete,
      message: `Successfully deleted ${successful} workflow(s)${failed > 0 ? `, ${failed} failed` : ""}`,
    })
  } catch (error) {
    console.error("Error deleting workflows:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to delete workflows"

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Please check n8n connection and workflow IDs",
      },
      { status: 500 },
    )
  }
}
