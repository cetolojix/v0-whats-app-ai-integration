import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mesaj gereklidir" }, { status: 400 })
    }

    // Generate AI response using Groq
    const { text } = await generateText({
      model: "groq/llama-3.1-8b-instant",
      prompt: `Sen yardımcı bir müşteri hizmetleri asistanısın. Görevlerin:
- Kullanıcıların sorularına kibarca ve profesyonelce yardım et
- Sorularını anlamaya çalış ve net cevaplar ver
- Çözemediğin konularda insan desteğine yönlendir
- Her zaman saygılı ve anlayışlı ol
- Türkçe yanıt ver
- Yanıtlarını kısa ve yardımcı tut

Kullanıcı mesajı: ${message}`,
      maxTokens: 500,
    })

    return NextResponse.json({
      response: text,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat test error:", error)
    return NextResponse.json({ error: "Yapay Zeka yanıtı alınırken bir hata oluştu" }, { status: 500 })
  }
}
