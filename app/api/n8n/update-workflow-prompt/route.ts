export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

const N8N_API_URL = "https://n8nx.cetoloji.com"
const N8N_API_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOTI2NGNkYy04NGQ4LTRjMzAtOTk5ZC0zZmNhODIyZDE4ZGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NDg3MDk2fQ.3bhtAAtA1NckJmgs-0iRttmsMoDDT9QDj4qZxplZwnI"

export async function POST(request: NextRequest) {
  try {
    const { instanceName, customPrompt } = await request.json()

    if (!instanceName || !customPrompt) {
      return NextResponse.json({ error: "Instance name and custom prompt are required" }, { status: 400 })
    }

    console.log("[v0] Updating workflow prompt for instance:", instanceName)
    console.log("[v0] New prompt:", customPrompt.substring(0, 100) + "...")

    const workflowsResponse = await fetch(`${N8N_API_URL}/api/v1/workflows`, {
      method: "GET",
      headers: {
        "X-N8N-API-KEY": N8N_API_TOKEN,
      },
    })

    if (!workflowsResponse.ok) {
      throw new Error("Failed to fetch workflows")
    }

    const workflowsData = await workflowsResponse.json()
    console.log("[v0] Workflows response:", workflowsData)

    const workflows = workflowsData.workflows || workflowsData.data || []

    let workflow = workflows.find((w: any) => w.id === "jJgBK6BzBeHD1ZYA")

    if (!workflow) {
      // Exact name match
      workflow = workflows.find((w: any) => w.name === `WhatsApp Bot - ${instanceName}`)
    }

    if (!workflow) {
      // Instance name içeren WhatsApp Bot workflow
      workflow = workflows.find((w: any) => w.name.includes(instanceName) && w.name.includes("WhatsApp Bot"))
    }

    if (!workflow) {
      // Herhangi bir WhatsApp Bot workflow
      workflow = workflows.find((w: any) => w.name.includes("WhatsApp Bot"))
      console.log("[v0] Found alternative WhatsApp Bot workflow:", workflow?.name)
    }

    if (!workflow) {
      console.log("[v0] No workflow found for instance, creating new workflow:", instanceName)

      try {
        const createUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/n8n/create-workflow`
        console.log("[v0] Calling create-workflow API at:", createUrl)

        const createResponse = await fetch(createUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instanceName,
            workflowType: "advanced-ai",
            customPrompt,
          }),
        })

        console.log("[v0] Create workflow response status:", createResponse.status)
        console.log("[v0] Create workflow response headers:", Object.fromEntries(createResponse.headers.entries()))

        if (!createResponse.ok) {
          const errorText = await createResponse.text()
          console.log("[v0] Create workflow error response:", errorText)

          let errorDetails = errorText
          try {
            const errorJson = JSON.parse(errorText)
            errorDetails = errorJson.error || errorJson.message || errorText
          } catch {
            // Keep as text if not JSON
          }

          throw new Error(`Failed to create workflow: ${createResponse.status} - ${errorDetails}`)
        }

        const createResult = await createResponse.json()
        console.log("[v0] Workflow created successfully:", createResult.workflowId)

        return NextResponse.json({
          success: true,
          workflowId: createResult.workflowId,
          workflowName: createResult.workflowName,
          message: "New workflow created and AI prompt set successfully",
          created: true,
        })
      } catch (createError) {
        console.error("[v0] Error creating workflow:", createError)

        const errorMessage = createError instanceof Error ? createError.message : "Unknown error"

        return NextResponse.json(
          {
            error: "Failed to create workflow for this instance",
            details: errorMessage,
            suggestion:
              "The n8n server might be unavailable or there could be a configuration issue. Please check the n8n connection and try again.",
            instanceName,
            timestamp: new Date().toISOString(),
          },
          { status: 500 },
        )
      }
    }

    console.log("[v0] Found workflow:", workflow.id, workflow.name)

    // Get the full workflow details
    const workflowDetailResponse = await fetch(`${N8N_API_URL}/api/v1/workflows/${workflow.id}`, {
      method: "GET",
      headers: {
        "X-N8N-API-KEY": N8N_API_TOKEN,
      },
    })

    if (!workflowDetailResponse.ok) {
      throw new Error("Failed to fetch workflow details")
    }

    const workflowDetail = await workflowDetailResponse.json()
    console.log("[v0] Got workflow details, updating AI Agent node...")

    const updatedNodes = workflowDetail.nodes.map((node: any) => {
      if (node.name === "AI Agent" || node.type === "@n8n/n8n-nodes-langchain.agent") {
        console.log("[v0] Updating AI Agent node with new prompt")
        return {
          ...node,
          parameters: {
            ...node.parameters,
            options: {
              ...node.parameters.options,
              systemMessage: customPrompt,
            },
          },
        }
      }
      return node
    })

    // Update the workflow
    const updateResponse = await fetch(`${N8N_API_URL}/api/v1/workflows/${workflow.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": N8N_API_TOKEN,
      },
      body: JSON.stringify({
        name: workflowDetail.name,
        nodes: updatedNodes,
        connections: workflowDetail.connections,
        settings: workflowDetail.settings,
      }),
    })

    console.log("[v0] Workflow update response status:", updateResponse.status)

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      console.log("[v0] Workflow update error:", errorText)
      throw new Error(`Failed to update workflow: ${updateResponse.status}`)
    }

    const updateResult = await updateResponse.json()
    console.log("[v0] Workflow updated successfully:", updateResult.id)

    return NextResponse.json({
      success: true,
      workflowId: workflow.id,
      workflowName: workflow.name,
      message: "AI prompt updated successfully",
    })
  } catch (error) {
    console.error("[v0] Error updating workflow prompt:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to update workflow prompt"

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Please check n8n connection and try again",
      },
      { status: 500 },
    )
  }
}
