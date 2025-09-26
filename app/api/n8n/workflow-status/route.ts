import { type NextRequest, NextResponse } from "next/server"

const N8N_API_URL = "https://n8nx.cetoloji.com"
const N8N_API_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOTI2NGNkYy04NGQ4LTRjMzAtOTk5ZC0zZmNhODIyZDE4ZGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NDg3MDk2fQ.3bhtAAtA1NckJmgs-0iRttmsMoDDT9QDj4qZxplZwnI"

function extractPromptFromWorkflow(workflow: any): string | null {
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    return null
  }

  for (const node of workflow.nodes) {
    // Check for AI Agent node (LangChain agent)
    if (node.type === "@n8n/n8n-nodes-langchain.agent" || node.name === "AI Agent") {
      if (node.parameters?.options?.systemMessage) {
        console.log("[v0] Found prompt in AI Agent node systemMessage")
        return node.parameters.options.systemMessage.trim()
      }
      if (node.parameters?.systemMessage) {
        console.log("[v0] Found prompt in AI Agent node parameters")
        return node.parameters.systemMessage.trim()
      }
    }

    // Check for Code node with AI prompt
    if (node.type === "n8n-nodes-base.code" && node.parameters?.jsCode) {
      const jsCode = node.parameters.jsCode

      const promptPatterns = [
        /const\s+prompt\s*=\s*[`"']([^`"']*)[`"']/s,
        /prompt\s*:\s*[`"']([^`"']*)[`"']/s,
        /systemPrompt\s*=\s*[`"']([^`"']*)[`"']/s,
        /systemMessage\s*:\s*[`"']([^`"']*)[`"']/s,
        /"content"\s*:\s*[`"']([^`"']*)[`"']/s,
      ]

      for (const pattern of promptPatterns) {
        const match = jsCode.match(pattern)
        if (match && match[1]) {
          console.log("[v0] Found prompt in Code node with pattern:", pattern.source)
          return match[1].trim()
        }
      }
    }

    // Check for HTTP Request node with AI API call
    if (node.type === "n8n-nodes-base.httpRequest" && node.parameters?.body) {
      try {
        const body = typeof node.parameters.body === "string" ? JSON.parse(node.parameters.body) : node.parameters.body

        if (body.messages && Array.isArray(body.messages)) {
          const systemMessage = body.messages.find((msg: any) => msg.role === "system")
          if (systemMessage && systemMessage.content) {
            console.log("[v0] Found prompt in HTTP Request node system message")
            return systemMessage.content.trim()
          }
        }

        if (body.prompt && typeof body.prompt === "string") {
          console.log("[v0] Found prompt in HTTP Request node body")
          return body.prompt.trim()
        }
      } catch (e) {
        console.log("[v0] Error parsing HTTP Request body:", e)
      }
    }

    if (node.type === "n8n-nodes-base.openAi" && node.parameters?.prompt) {
      console.log("[v0] Found prompt in OpenAI node")
      return node.parameters.prompt.trim()
    }
  }

  console.log("[v0] No prompt found in any workflow nodes")
  return null
}

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

      const extractedPrompt = extractPromptFromWorkflow(workflow)
      console.log("[v0] Extracted prompt from workflow:", extractedPrompt ? "Found" : "Not found")

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
          prompt: extractedPrompt, // Include extracted prompt
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
      console.log("[v0] Total workflows found:", data.data?.length || 0)

      const workflows = (data.data || []).filter((workflow: any) => {
        const workflowName = workflow.name.toLowerCase()
        const instance = instanceName.toLowerCase()

        // Check multiple patterns for matching
        const isMatch =
          workflowName.includes(instance) ||
          workflowName.includes(`whatsapp-${instance}`) ||
          workflowName.includes(`${instance}-whatsapp`) ||
          workflowName.includes(`${instance}_whatsapp`) ||
          workflowName.includes(`whatsapp_${instance}`)

        console.log(
          `[v0] Checking workflow "${workflow.name}" against instance "${instanceName}": ${isMatch ? "MATCH" : "NO MATCH"}`,
        )
        return isMatch
      })

      console.log("[v0] Filtered workflows for instance:", workflows.length)

      const workflowsWithPrompts = workflows.map((workflow: any) => {
        const extractedPrompt = extractPromptFromWorkflow(workflow)
        console.log(`[v0] Extracted prompt from workflow ${workflow.id}:`, extractedPrompt ? "Found" : "Not found")

        return {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active,
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
          nodes: workflow.nodes?.length || 0,
          prompt: extractedPrompt, // Include extracted prompt
        }
      })

      return NextResponse.json({
        success: true,
        workflows: workflowsWithPrompts,
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
