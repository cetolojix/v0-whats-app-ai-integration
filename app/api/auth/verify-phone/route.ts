import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: "Telefon numarası ve kod gerekli" }, { status: 400 })
    }

    console.log("[v0] Verifying phone:", phone, "with code:", code) // Add debug log

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: verificationData, error: fetchError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("phone", phone)
      .single()

    if (fetchError || !verificationData) {
      console.log("[v0] No verification code found for phone:", phone)
      console.log("[v0] Fetch error:", fetchError) // Add more debug info
      return NextResponse.json({ error: "Doğrulama kodu bulunamadı" }, { status: 400 })
    }

    console.log("[v0] Found verification data:", verificationData) // Add debug log

    // Check if code has expired
    if (new Date() > new Date(verificationData.expires_at)) {
      // Delete expired code
      await supabase.from("verification_codes").delete().eq("phone", phone)

      return NextResponse.json({ error: "Doğrulama kodu süresi dolmuş" }, { status: 400 })
    }

    // Check if code matches
    if (verificationData.code !== code) {
      console.log("[v0] Code mismatch. Expected:", verificationData.code, "Got:", code) // Add debug log
      return NextResponse.json({ error: "Geçersiz doğrulama kodu" }, { status: 400 })
    }

    await supabase.from("verification_codes").delete().eq("phone", phone)

    console.log("[v0] Phone verification successful for:", phone)

    return NextResponse.json({
      success: true,
      message: "Telefon doğrulandı",
    })
  } catch (error) {
    console.error("[v0] Verify phone error:", error)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
