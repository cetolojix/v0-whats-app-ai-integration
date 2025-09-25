import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

interface ChatRequest {
  message: string
  systemPrompt?: string
}

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Chat API called")

    const { message, systemPrompt }: ChatRequest = await request.json()
    console.log("[v0] Request data:", { message: message?.substring(0, 50), hasSystemPrompt: !!systemPrompt })

    if (!message) {
      console.log("[v0] Missing message field")
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Use provided system prompt or default
    const defaultPrompt =
      "Sen yardımcı bir WhatsApp AI asistanısın. Kullanıcılara nazik ve faydalı cevaplar ver. Türkçe yanıt ver."
    const prompt = systemPrompt || defaultPrompt

    console.log("[v0] Using system prompt:", prompt.substring(0, 50))

    // Generate AI response using AI SDK with Groq
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `${prompt}\n\nKullanıcı: ${message}\n\nAsistan:`,
      maxTokens: 200,
      temperature: 0.7,
    })

    console.log("[v0] AI response generated:", text?.substring(0, 50))

    const responseData = {
      message: text || "Üzgünüm, şu anda bir yanıt oluşturamıyorum.",
      timestamp: Date.now(),
    }

    console.log("[v0] Returning successful response")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] Chat API error:", error)

    // Fallback response if AI fails
    const fallbackResponse = getFallbackResponse(request)

    const responseData = {
      message: fallbackResponse,
      timestamp: Date.now(),
      fallback: true,
    }

    console.log("[v0] Returning fallback response")
    return NextResponse.json(responseData)
  }
}

function getFallbackResponse(request: NextRequest): string {
  // Simple fallback responses
  const responses = [
    "Merhaba! Size nasıl yardımcı olabilirim?",
    "Mesajınızı aldım. Size yardımcı olmaya çalışacağım.",
    "Teşekkür ederim! Başka nasıl yardımcı olabilirim?",
    "Anlıyorum. Bu konuda size daha fazla bilgi verebilirim.",
    "Mükemmel soru! Size detaylı bir yanıt vermeye çalışacağım.",
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}
