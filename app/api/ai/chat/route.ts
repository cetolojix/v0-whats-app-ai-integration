import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

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

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] AI chat API called")

    const { instanceName, message, sender, conversationId, customPrompt, context }: ChatRequest = await request.json()
    console.log("[v0] Request data:", { instanceName, message: message.substring(0, 50), sender })

    if (!instanceName || !message || !sender) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields: instanceName, message, sender" }, { status: 400 })
    }

    // Generate conversation ID if not provided
    const convId = conversationId || `${instanceName}-${sender}`
    console.log("[v0] Using conversation ID:", convId)

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

    console.log("[v0] Prepared messages for AI:", messages.length)

    // Generate AI response using AI SDK
    const aiResponse = await generateAIResponse(messages)
    console.log("[v0] AI response generated:", aiResponse.substring(0, 50))

    // Add AI response to history
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: aiResponse,
      timestamp: Date.now(),
    }
    conversationHistory.push(assistantMessage)

    // Store updated conversation (limit to last 20 messages)
    conversations.set(convId, conversationHistory.slice(-20))

    const responseData = {
      success: true,
      response: aiResponse,
      conversationId: convId,
      messageCount: conversationHistory.length,
      timestamp: Date.now(),
    }

    console.log("[v0] Returning successful response")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] AI chat error:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to generate AI response"

    const errorResponse = {
      error: errorMessage,
      details: "Please check AI service configuration",
      timestamp: Date.now(),
    }

    console.log("[v0] Returning error response:", errorResponse)
    return NextResponse.json(errorResponse, { status: 500 })
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
    console.log("[v0] Generating AI response using AI SDK with Groq")

    const prompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n\n")
    console.log("[v0] Prepared prompt for Groq:", prompt.substring(0, 100))

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"), // Updated to correct model version
      prompt: prompt, // Using prompt instead of messages
      maxTokens: 150,
      temperature: 0.7,
    })

    console.log("[v0] AI SDK response generated successfully")
    return text || "I apologize, but I cannot generate a response right now."
  } catch (error) {
    console.error("[v0] Error generating AI response:", error)

    // Fallback to mock responses if AI SDK fails
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
