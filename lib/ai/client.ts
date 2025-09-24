import { generateText, streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"
import type { AIConfig } from "./config"

// Get the appropriate AI model based on provider and model name
function getAIModel(provider: string, modelName: string) {
  switch (provider) {
    case "openai":
      return openai(modelName)
    case "anthropic":
      return anthropic(modelName)
    case "groq":
      return groq(modelName)
    case "grok":
      return xai(modelName)
    default:
      return openai("gpt-4") // fallback
  }
}

export interface ConversationMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface AIGenerateOptions {
  config: AIConfig
  userMessage: string
  conversationHistory?: ConversationMessage[]
  phoneNumber: string
  contactName?: string
}

export async function generateAIResponse({
  config,
  userMessage,
  conversationHistory = [],
  phoneNumber,
  contactName,
}: AIGenerateOptions) {
  const model = getAIModel(config.provider, config.model)

  // Build conversation context
  const messages = []

  // Add system prompt with context
  const systemPrompt = `${config.systemPrompt}

Contact Information:
- Phone: ${phoneNumber}
- Name: ${contactName || "Unknown"}

Instructions:
- Keep responses concise and helpful
- Maintain a friendly, professional tone
- If you don't know something, say so honestly`

  messages.push({
    role: "system" as const,
    content: systemPrompt,
  })

  // Add conversation history if enabled
  if (config.conversationMemoryEnabled && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-config.maxConversationHistory).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    messages.push(...recentHistory)
  }

  // Add current user message
  messages.push({
    role: "user" as const,
    content: userMessage,
  })

  try {
    const startTime = Date.now()

    const { text } = await generateText({
      model,
      messages,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    })

    const processingTime = Date.now() - startTime

    return {
      response: text,
      processingTime,
      model: config.model,
      provider: config.provider,
    }
  } catch (error) {
    console.error("[AI] Error generating response:", error)
    throw new Error(`AI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function streamAIResponse({
  config,
  userMessage,
  conversationHistory = [],
  phoneNumber,
  contactName,
}: AIGenerateOptions) {
  const model = getAIModel(config.provider, config.model)

  // Build messages similar to generateAIResponse
  const messages = []

  const systemPrompt = `${config.systemPrompt}

Contact Information:
- Phone: ${phoneNumber}
- Name: ${contactName || "Unknown"}`

  messages.push({
    role: "system" as const,
    content: systemPrompt,
  })

  if (config.conversationMemoryEnabled && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-config.maxConversationHistory).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    messages.push(...recentHistory)
  }

  messages.push({
    role: "user" as const,
    content: userMessage,
  })

  return streamText({
    model,
    messages,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  })
}
