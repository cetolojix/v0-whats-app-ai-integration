import { type NextRequest, NextResponse } from "next/server"
import { debugLog } from "@/lib/debug"

const N8N_API_URL = "https://n8nx.cetoloji.com"
const N8N_API_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOTI2NGNkYy04NGQ4LTRjMzAtOTk5ZC0zZmNhODIyZDE4ZGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NDg3MDk2fQ.3bhtAAtA1NckJmgs-0iRttmsMoDDT9QDj4qZxplZwnI"

const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY ||
  "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"

interface WorkflowTemplate {
  name: string
  nodes: any[]
  connections: any
  settings: any
  active?: boolean
  pinData?: any
  meta?: any
}

export async function POST(request: NextRequest) {
  try {
    const { instanceName, workflowType = "advanced-ai", customPrompt } = await request.json()

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    debugLog("[v0] Creating workflow for instance:", instanceName)

    const credentialsId = await createEvolutionApiCredentials(instanceName)
    const openaiCredentialsId = await createOpenAICredentials(instanceName)

    const workflowTemplate = getWorkflowTemplate(
      instanceName,
      workflowType,
      customPrompt,
      credentialsId,
      openaiCredentialsId,
    )

    debugLog("[v0] Workflow template created:", workflowTemplate.name)

    const createUrl = `${N8N_API_URL}/api/v1/workflows`
    debugLog("[v0] Creating workflow at:", createUrl)

    // Create workflow in n8n
    const response = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": N8N_API_TOKEN,
      },
      body: JSON.stringify(workflowTemplate),
    })

    debugLog("[v0] n8n create workflow response status:", response.status)

    if (!response.ok) {
      const responseText = await response.text()
      debugLog("[v0] n8n create workflow error response:", responseText)

      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }

      throw new Error(errorData.message || `HTTP ${response.status}: Failed to create n8n workflow`)
    }

    const data = await response.json()
    debugLog("[v0] Workflow created successfully:", data.id)

    if (data.id) {
      await activateWorkflow(data.id)
    }

    return NextResponse.json({
      success: true,
      workflowId: data.id,
      workflowName: workflowTemplate.name,
      instanceName,
      webhookUrl: `${N8N_API_URL}/webhook/${instanceName}`,
    })
  } catch (error) {
    debugLog("[v0] Error creating n8n workflow:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to create workflow"

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Please check n8n connection and try again",
      },
      { status: 500 },
    )
  }
}

async function createEvolutionApiCredentials(instanceName: string): Promise<string> {
  try {
    debugLog("[v0] Creating Evolution API credentials for:", instanceName)

    const credentialsData = {
      name: `Evolution API - ${instanceName}`,
      type: "httpHeaderAuth",
      data: JSON.stringify({
        name: "apikey",
        value: "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L",
        allowedDomains: ["evolu.cetoloji.com", "n8nx.cetoloji.com"],
      }),
    }

    const response = await fetch(`${N8N_API_URL}/api/v1/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": N8N_API_TOKEN,
      },
      body: JSON.stringify(credentialsData),
    })

    debugLog("[v0] Evolution API credentials response status:", response.status)

    if (!response.ok) {
      const responseText = await response.text()
      debugLog("[v0] Evolution API credentials error:", responseText)

      // If credentials already exist, try to find existing ones
      if (response.status === 400 || response.status === 409) {
        return await findExistingCredentials(instanceName)
      }

      throw new Error(`Failed to create Evolution API credentials: ${response.status}`)
    }

    const data = await response.json()
    debugLog("[v0] Evolution API credentials created successfully:", data.id)

    return data.id
  } catch (error) {
    debugLog("[v0] Error creating Evolution API credentials:", error)
    // Return a default credentials ID or create inline credentials
    return "default-evolution-credentials"
  }
}

async function findExistingCredentials(instanceName: string): Promise<string> {
  try {
    const response = await fetch(`${N8N_API_URL}/api/v1/credentials`, {
      method: "GET",
      headers: {
        "X-N8N-API-KEY": N8N_API_TOKEN,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const existingCredential = data.data?.find(
        (cred: any) => cred.name === `Evolution API - ${instanceName}` || cred.type === "httpHeaderAuth",
      )

      if (existingCredential) {
        debugLog("[v0] Found existing Evolution API credentials:", existingCredential.id)
        return existingCredential.id
      }
    }

    return "default-evolution-credentials"
  } catch (error) {
    debugLog("[v0] Error finding existing credentials:", error)
    return "default-evolution-credentials"
  }
}

async function createOpenAICredentials(instanceName: string): Promise<string> {
  try {
    debugLog("[v0] Using OpenAI credentials ID: aNaP6DdPT7y6vJ6h")
    return "aNaP6DdPT7y6vJ6h"
  } catch (error) {
    debugLog("[v0] Error using OpenAI credentials:", error)
    return "aNaP6DdPT7y6vJ6h"
  }
}

function getWorkflowTemplate(
  instanceName: string,
  workflowType: string,
  customPrompt?: string,
  credentialsId?: string,
  openaiCredentialsId?: string,
): WorkflowTemplate {
  const baseSystemPrompt =
    customPrompt ||
    `You are a helpful WhatsApp AI assistant for ${instanceName}. 
Respond in a friendly, professional manner. Keep responses concise and helpful. 
If you don't know something, be honest about it. Always maintain a positive tone.`

  const templates: Record<string, WorkflowTemplate> = {
    "basic-ai": {
      name: `WhatsApp AI - ${instanceName}`,
      settings: {
        executionOrder: "v1",
      },
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: `/${instanceName}`,
            responseMode: "responseNode",
            options: {},
          },
          id: "webhook-trigger",
          name: "WhatsApp Webhook",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [240, 300],
          webhookId: `whatsapp-${instanceName}`,
        },
        {
          parameters: {
            conditions: {
              options: {
                caseSensitive: true,
                leftValue: "",
                typeValidation: "strict",
              },
              conditions: [
                {
                  leftValue: "={{ $json.messageType }}",
                  rightValue: "conversation",
                  operator: {
                    type: "string",
                    operation: "equals",
                  },
                },
              ],
              combinator: "and",
            },
            options: {},
          },
          id: "message-filter",
          name: "Is Text Message",
          type: "n8n-nodes-base.if",
          typeVersion: 2,
          position: [460, 300],
        },
        {
          parameters: {
            resource: "text",
            operation: "complete",
            model: "gpt-3.5-turbo",
            prompt: `${baseSystemPrompt}\\n\\nUser message: {{ $json.message.conversation }}`,
            maxTokens: 150,
            temperature: 0.7,
          },
          credentials: {
            openAiApi: {
              apiKey: OPENAI_API_KEY,
            },
          },
          id: "ai-response",
          name: "Generate AI Response",
          type: "n8n-nodes-base.openAi",
          typeVersion: 1,
          position: [680, 200],
        },
        {
          parameters: {
            method: "POST",
            url: `https://evolu.cetoloji.com/message/sendText/${instanceName}`,
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: "apikey",
                  value: "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L",
                },
                {
                  name: "Content-Type",
                  value: "application/json",
                },
              ],
            },
            sendBody: true,
            contentType: "json",
            jsonParameters: {
              parameters: [
                {
                  name: "number",
                  value: "={{ $json.key.remoteJid }}",
                },
                {
                  name: "text",
                  value: "={{ $json.data.choices[0].text || $json.choices[0].message.content }}",
                },
              ],
            },
            options: {},
          },
          id: "send-response",
          name: "Send AI Response",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 4,
          position: [900, 200],
        },
        {
          parameters: {
            respondWith: "json",
            responseBody:
              '={{ { "success": true, "messageId": $json.key?.id, "timestamp": new Date().toISOString() } }}',
          },
          id: "webhook-response",
          name: "Webhook Response",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [1120, 300],
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: '={{ { "success": true, "skipped": "non-text message" } }}',
          },
          id: "skip-response",
          name: "Skip Non-Text",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [680, 400],
        },
      ],
      connections: {
        "WhatsApp Webhook": {
          main: [
            [
              {
                node: "Is Text Message",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
        "Is Text Message": {
          main: [
            [
              {
                node: "Generate AI Response",
                type: "main",
                index: 0,
              },
            ],
            [
              {
                node: "Skip Non-Text",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
        "Generate AI Response": {
          main: [
            [
              {
                node: "Send AI Response",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
        "Send AI Response": {
          main: [
            [
              {
                node: "Webhook Response",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
      },
    },
    "business-support": {
      name: `Business Support AI - ${instanceName}`,
      settings: {
        executionOrder: "v1",
      },
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: `/${instanceName}`,
            responseMode: "responseNode",
            options: {},
          },
          id: "webhook-trigger",
          name: "WhatsApp Webhook",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            conditions: {
              conditions: [
                {
                  leftValue: "={{ $json.messageType }}",
                  rightValue: "conversation",
                  operator: {
                    type: "string",
                    operation: "equals",
                  },
                },
              ],
            },
          },
          id: "message-filter",
          name: "Filter Messages",
          type: "n8n-nodes-base.if",
          typeVersion: 2,
          position: [460, 300],
        },
        {
          parameters: {
            resource: "text",
            operation: "complete",
            model: "gpt-3.5-turbo",
            prompt: `You are a professional business support AI for ${instanceName}. 
Analyze customer inquiries and provide helpful responses. Categories include:
- Product information
- Pricing questions  
- Technical support
- Order status
- General inquiries

Always be professional, helpful, and concise. If you need to escalate to a human, say so clearly.

User message: {{ $json.message.conversation }}`,
            maxTokens: 200,
            temperature: 0.7,
          },
          credentials: {
            openAiApi: {
              apiKey: OPENAI_API_KEY,
            },
          },
          id: "ai-categorize",
          name: "Categorize & Respond",
          type: "n8n-nodes-base.openAi",
          typeVersion: 1,
          position: [680, 200],
        },
        {
          parameters: {
            method: "POST",
            url: `https://evolu.cetoloji.com/message/sendText/${instanceName}`,
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: "apikey",
                  value: "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L",
                },
              ],
            },
            sendBody: true,
            contentType: "json",
            jsonParameters: {
              parameters: [
                {
                  name: "number",
                  value: "={{ $json.key.remoteJid }}",
                },
                {
                  name: "text",
                  value: "={{ $json.data.choices[0].text || $json.choices[0].message.content }}",
                },
              ],
            },
          },
          id: "send-response",
          name: "Send Response",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 4,
          position: [900, 200],
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: '={{ { "success": true, "processed": true } }}',
          },
          id: "webhook-response",
          name: "Success Response",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [1120, 300],
        },
      ],
      connections: {
        "WhatsApp Webhook": {
          main: [
            [
              {
                node: "Filter Messages",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
        "Filter Messages": {
          main: [
            [
              {
                node: "Categorize & Respond",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
        "Categorize & Respond": {
          main: [
            [
              {
                node: "Send Response",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
        "Send Response": {
          main: [
            [
              {
                node: "Success Response",
                type: "main",
                index: 0,
              },
            ],
          ],
        },
      },
    },
    "advanced-ai": getAdvancedWorkflowTemplate(instanceName, customPrompt, credentialsId, openaiCredentialsId),
  }

  return templates[workflowType] || templates["basic-ai"]
}

function getAdvancedWorkflowTemplate(
  instanceName: string,
  customPrompt?: string,
  credentialsId?: string,
  openaiCredentialsId?: string,
): WorkflowTemplate {
  const systemPrompt =
    customPrompt ||
    `You are a helpful customer service assistant. Your responsibilities:
- Help users with their questions politely and professionally  
- Try to understand their queries and provide clear answers
- Escalate to human support when you cannot resolve issues
- Always be respectful and understanding
- Respond in Turkish language
- Keep responses concise and helpful`

  return {
    name: `WhatsApp Bot - ${instanceName}`,
    nodes: [
      {
        parameters: {
          httpMethod: "POST",
          path: `${instanceName}`,
          options: {},
        },
        type: "n8n-nodes-base.webhook",
        typeVersion: 2.1,
        position: [-560, 0],
        id: "c992f890-6fd4-4d13-8002-bf3e8722af4c",
        name: "Webhook",
        webhookId: `${instanceName}`,
      },
      {
        parameters: {
          jsCode: `
console.log("[v0] === WEBHOOK DEBUG START ===");
console.log("[v0] Full webhook data:", JSON.stringify($input.all(), null, 2));
console.log("[v0] First item data:", JSON.stringify($input.first().json, null, 2));

const data = $input.first().json;
console.log("[v0] Checking all possible phone number paths:");
console.log("[v0] sender:", data.sender);
console.log("[v0] data.key.remoteJid:", data.data?.key?.remoteJid);
console.log("[v0] key.remoteJid:", data.key?.remoteJid);
console.log("[v0] data.remoteJid:", data.data?.remoteJid);
console.log("[v0] remoteJid:", data.remoteJid);

console.log("[v0] Checking message text paths:");
console.log("[v0] data.message?.conversation:", data.data?.message?.conversation);
console.log("[v0] message?.conversation:", data.message?.conversation);
console.log("[v0] data.message?.extendedTextMessage?.text:", data.data?.message?.extendedTextMessage?.text);
console.log("[v0] message?.extendedTextMessage?.text:", data.message?.extendedTextMessage?.text);

let phoneNumber = data.sender || 
                 data.data?.key?.remoteJid || 
                 data.key?.remoteJid || 
                 data.data?.remoteJid || 
                 data.remoteJid || 
                 'unknown';

if (phoneNumber && phoneNumber !== 'unknown') {
  phoneNumber = phoneNumber.replace(/@s\\.whatsapp\\.net|@c\\.us/g, '');
  console.log("[v0] Cleaned phone number:", phoneNumber);
}

let messageText = data.data?.message?.conversation || 
                 data.message?.conversation || 
                 data.data?.message?.extendedTextMessage?.text || 
                 data.message?.extendedTextMessage?.text || 
                 data.data?.message?.imageMessage?.caption ||
                 data.message?.imageMessage?.caption ||
                 'No message text found';

console.log("[v0] Final extracted phone number:", phoneNumber);
console.log("[v0] Final extracted message text:", messageText);
console.log("[v0] === WEBHOOK DEBUG END ===");

return [{
  ...data,
  extractedPhone: phoneNumber,
  extractedMessage: messageText
}];
          `,
        },
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [-400, 0],
        id: "debug-webhook-data",
        name: "Debug Webhook Data",
      },
      {
        parameters: {
          promptType: "define",
          text: "={{ $json.body.data.message.conversation }}",
          options: {
            systemMessage: systemPrompt,
          },
        },
        type: "@n8n/n8n-nodes-langchain.agent",
        typeVersion: 2.2,
        position: [-240, 0],
        id: "8edc815a-fef6-4ce5-ac76-f1bb6315b29d",
        name: "AI Agent",
      },
      {
        parameters: {
          model: {
            __rl: true,
            value: "gpt-4o-mini",
            mode: "list",
            cachedResultName: "gpt-4o-mini",
          },
          options: {},
        },
        credentials: {
          openAiApi: {
            id: "aNaP6DdPT7y6vJ6h",
            name: `OpenAI - ${instanceName}`,
          },
        },
        type: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
        typeVersion: 1.2,
        position: [-320, 208],
        id: "e2156648-d090-4361-8859-e5cf01ced748",
        name: "OpenAI Chat Model",
      },
      {
        parameters: {
          sessionIdType: "customKey",
          sessionKey: "={{ $('Debug Webhook Data').first().json.extractedPhone || 'default-session' }}",
          contextWindowLength: 10,
        },
        type: "@n8n/n8n-nodes-langchain.memoryBufferWindow",
        typeVersion: 1.2,
        position: [-192, 256],
        id: "bc63e2f7-83d8-498a-b589-74f06ba233b8",
        name: "Window Buffer Memory",
      },
      {
        parameters: {
          method: "POST",
          url: `https://evolu.cetoloji.com/message/sendText/${instanceName}`,
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: "apikey",
                value: "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L",
              },
              {
                name: "Content-Type",
                value: "application/json",
              },
            ],
          },
          sendBody: true,
          contentType: "json",
          bodyParameters: {
            parameters: [
              {
                name: "number",
                value:
                  "={{ ( $('Webhook').first().json.body?.data?.key?.remoteJid || $('Webhook').first().json.body?.key?.remoteJid || $('Webhook').first().json.data?.key?.remoteJid || $('Webhook').first().json.key?.remoteJid || '' ).replace('@s.whatsapp.net','') }}",
              },
              {
                name: "text",
                value: "={{ $('AI Agent').first().json.output || $('AI Agent').first().json.result || 'Merhaba' }}",
              },
              {
                name: "instanceName",
                value: instanceName,
              },
            ],
          },
          options: {},
        },
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4,
        position: [112, 0],
        id: "563ae60e-b4d9-4290-9cde-086f23a3c7ca",
        name: "Send text",
      },
    ],
    connections: {
      Webhook: {
        main: [
          [
            {
              node: "Debug Webhook Data",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Debug Webhook Data": {
        main: [
          [
            {
              node: "AI Agent",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "OpenAI Chat Model": {
        ai_languageModel: [
          [
            {
              node: "AI Agent",
              type: "ai_languageModel",
              index: 0,
            },
          ],
        ],
      },
      "AI Agent": {
        main: [
          [
            {
              node: "Send text",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Window Buffer Memory": {
        ai_memory: [
          [
            {
              node: "AI Agent",
              type: "ai_memory",
              index: 0,
            },
          ],
        ],
      },
    },
    settings: {
      executionOrder: "v1",
    },
  }
}

async function activateWorkflow(workflowId: string) {
  try {
    debugLog("[v0] Activating workflow:", workflowId)

    const activateUrl = `${N8N_API_URL}/api/v1/workflows/${workflowId}/activate`
    const response = await fetch(activateUrl, {
      method: "POST",
      headers: {
        "X-N8N-API-KEY": N8N_API_TOKEN,
      },
    })

    debugLog("[v0] Workflow activation response status:", response.status)

    if (!response.ok) {
      const responseText = await response.text()
      debugLog("[v0] Workflow activation error:", responseText)
      throw new Error(`Failed to activate workflow: ${response.status}`)
    }

    debugLog("[v0] Workflow activated successfully:", workflowId)
  } catch (error) {
    debugLog("[v0] Error activating workflow:", error)
    throw error
  }
}
