export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { SMSService } from "@/lib/sms-service"
import { storeVerificationCode } from "@/lib/verification-store"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: "Telefon numarası gerekli" }, { status: 400 })
    }

    const smsService = new SMSService()

    // Doğrulama kodu oluştur
    const verificationCode = smsService.generateVerificationCode()

    console.log("[v0] Generated verification code:", verificationCode, "for phone:", phone)

    storeVerificationCode(phone, verificationCode)

    // SMS gönder
    const smsResult = await smsService.sendSMS({
      phone,
      message: `WhatsApp AI Automation doğrulama kodunuz: ${verificationCode}. Bu kod 10 dakika geçerlidir.`,
    })

    if (smsResult.success) {
      console.log("[v0] SMS sent successfully")
      return NextResponse.json({
        success: true,
        message: "Doğrulama kodu gönderildi",
      })
    } else {
      console.error("[v0] SMS sending failed:", smsResult.message)
      return NextResponse.json({ error: smsResult.message }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
