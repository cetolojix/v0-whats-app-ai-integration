import { type NextRequest, NextResponse } from "next/server"

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
  timestamp?: number
}

interface ChatRequest {
  instanceName: string
  message: string
  sender: string
  conversationId?: string
  customPrompt?: string
  context?: ChatMessage[]
}

// In-memory conversation storage (in production, use a database)
const conversations = new Map<string, ChatMessage[]>()

export async function POST(request: NextRequest) {
  try {
    const { instanceName, message, sender, conversationId, customPrompt, context }: ChatRequest = await request.json()

    if (!instanceName || !message || !sender) {
      return NextResponse.json({ error: "Missing required fields: instanceName, message, sender" }, { status: 400 })
    }

    // Generate conversation ID if not provided
    const convId = conversationId || `${instanceName}-${sender}`

    // Get or create conversation history
    const conversationHistory = conversations.get(convId) || []

    // Add user message to history
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    }
    conversationHistory.push(userMessage)

    // Prepare system prompt
    const systemPrompt = getSystemPrompt(instanceName, customPrompt)

    // Prepare messages for AI
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
    ]

    // Generate AI response
    const aiResponse = await generateAIResponse(messages)

    // Add AI response to history
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: aiResponse,
      timestamp: Date.now(),
    }
    conversationHistory.push(assistantMessage)

    // Store updated conversation (limit to last 20 messages)
    conversations.set(convId, conversationHistory.slice(-20))

    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversationId: convId,
      messageCount: conversationHistory.length,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("AI chat error:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to generate AI response"

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Please check AI service configuration",
      },
      { status: 500 },
    )
  }
}

function getSystemPrompt(instanceName: string, customPrompt?: string): string {
  if (customPrompt) {
    return customPrompt
  }

  return `You are an intelligent WhatsApp AI assistant for ${instanceName}. 

Your role:
- Provide helpful, accurate, and friendly responses
- Maintain a professional yet conversational tone
- Keep responses concise but informative
- Remember context from the conversation
- If you don't know something, be honest about it
- Always be respectful and helpful

Guidelines:
- Respond in the same language as the user
- Use emojis sparingly and appropriately
- For business inquiries, be professional
- For casual chat, be friendly and engaging
- If asked about sensitive topics, redirect politely
- Always end with a helpful note or question when appropriate

Current time: ${new Date().toLocaleString()}
Instance: ${instanceName}`
}

async function generateAIResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    console.log("[v0] OpenAI response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] OpenAI error:", errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] OpenAI response:", JSON.stringify(data, null, 2))

    return data.choices[0]?.message?.content || "I apologize, but I cannot generate a response right now."
  } catch (error) {
    console.error("[v0] Error generating AI response:", error)

    // Fallback to mock responses if OpenAI fails
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || ""

    if (lastMessage.includes("hello") || lastMessage.includes("hi") || lastMessage.includes("hey")) {
      return "Hello! 👋 How can I help you today?"
    }

    if (lastMessage.includes("help") || lastMessage.includes("support")) {
      return "I'm here to help! Please let me know what you need assistance with, and I'll do my best to provide you with the information you're looking for."
    }

    if (lastMessage.includes("price") || lastMessage.includes("cost") || lastMessage.includes("pricing")) {
      return "I'd be happy to help you with pricing information! Could you please specify which product or service you're interested in?"
    }

    if (lastMessage.includes("thank")) {
      return "You're very welcome! Is there anything else I can help you with today?"
    }

    if (lastMessage.includes("bye") || lastMessage.includes("goodbye")) {
      return "Goodbye! Feel free to reach out anytime if you need assistance. Have a great day! 😊"
    }

    // Default response
    return (
      "Thank you for your message! I understand you're asking about: " +
      lastMessage.substring(0, 50) +
      "... Let me help you with that. Could you provide a bit more detail so I can give you the most accurate information?"
    )
  }
}

// Get conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    const history = conversations.get(conversationId) || []

    return NextResponse.json({
      success: true,
      conversationId,
      messages: history,
      messageCount: history.length,
    })
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 })
  }
}
