// AI configuration and provider setup
export interface AIConfig {
  provider: "openai" | "anthropic" | "groq" | "grok"
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  autoReplyEnabled: boolean
  responseDelaySeconds: number
  conversationMemoryEnabled: boolean
  maxConversationHistory: number
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: "openai",
  model: "gpt-4",
  systemPrompt: `You are a helpful WhatsApp assistant. You should:
- Respond in a friendly and conversational tone
- Keep responses concise and relevant
- Ask clarifying questions when needed
- Be helpful and informative
- Respond in the same language as the user`,
  temperature: 0.7,
  maxTokens: 1000,
  autoReplyEnabled: true,
  responseDelaySeconds: 2,
  conversationMemoryEnabled: true,
  maxConversationHistory: 10,
}

export const AI_PROVIDERS = {
  openai: {
    name: "OpenAI",
    models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
    description: "Most capable and widely used AI models",
  },
  anthropic: {
    name: "Anthropic Claude",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    description: "Excellent for reasoning and analysis",
  },
  groq: {
    name: "Groq",
    models: ["llama-3.1-70b-versatile", "llama-3.1-8b-instant"],
    description: "Ultra-fast inference speeds",
  },
  grok: {
    name: "xAI Grok",
    models: ["grok-beta"],
    description: "Real-time information and witty responses",
  },
} as const

export type AIProvider = keyof typeof AI_PROVIDERS
