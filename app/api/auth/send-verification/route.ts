import { type NextRequest, NextResponse } from "next/server"
import { SMSService } from "@/lib/sms-service"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: "Telefon numarası gerekli" }, { status: 400 })
    }

    const normalizedPhone = phone.startsWith("0") ? phone.substring(1) : phone
    const formattedPhone = normalizedPhone.startsWith("90") ? normalizedPhone : `90${normalizedPhone}`

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const smsService = new SMSService()
    const verificationCode = smsService.generateVerificationCode()

    // SMS gönder
    console.log("[v0] Sending SMS to:", phone)
    const smsResult = await smsService.sendSMS({
      phone: formattedPhone, // Use formatted phone for SMS
      message: `WhatsApp AI doğrulama kodunuz: ${verificationCode}. Bu kodu kimseyle paylaşmayın.`,
    })

    if (!smsResult.success) {
      console.error("[v0] SMS sending failed:", smsResult.message)
      return NextResponse.json({ error: "SMS gönderilemedi" }, { status: 500 })
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 dakika

    // Delete any existing verification code for this phone
    await supabase.from("verification_codes").delete().eq("phone", phone)

    // Insert new verification code
    const { error: dbError } = await supabase.from("verification_codes").insert({
      phone, // Store original phone format in database
      code: verificationCode,
      expires_at: expiresAt.toISOString(),
    })

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json({ error: "Veritabanı hatası" }, { status: 500 })
    }

    console.log("[v0] Verification code sent to:", phone, "Code:", verificationCode)

    return NextResponse.json({
      success: true,
      message: "Doğrulama kodu gönderildi",
    })
  } catch (error) {
    console.error("[v0] Send verification error:", error)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
