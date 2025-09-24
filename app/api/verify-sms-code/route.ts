export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStoredVerificationCode, deleteVerificationCode } from "@/lib/verification-store"

export async function POST(request: NextRequest) {
  try {
    const { phone, code, fullName, email, password } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: "Telefon numarası ve kod gerekli" }, { status: 400 })
    }

    console.log("[v0] Verifying SMS code:", code, "for phone:", phone, "with email:", email)

    const storedData = getStoredVerificationCode(phone)

    if (!storedData) {
      console.log("[v0] No verification code found for phone:", phone)
      return NextResponse.json({ error: "Doğrulama kodu bulunamadı" }, { status: 400 })
    }

    // Kod süresi kontrolü (10 dakika)
    const now = Date.now()
    const codeAge = now - storedData.timestamp
    const maxAge = 10 * 60 * 1000 // 10 dakika

    if (codeAge > maxAge) {
      console.log("[v0] Verification code expired for phone:", phone)
      deleteVerificationCode(phone)
      return NextResponse.json({ error: "Doğrulama kodu süresi dolmuş" }, { status: 400 })
    }

    // Kod kontrolü
    if (storedData.code !== code) {
      console.log("[v0] Invalid verification code for phone:", phone)
      return NextResponse.json({ error: "Geçersiz doğrulama kodu" }, { status: 400 })
    }

    if (fullName && password && email) {
      try {
        const adminSupabase = createAdminClient()

        // 1. Önce mevcut kullanıcıyı kontrol et
        const { data: existingUser } = await adminSupabase.auth.admin.listUsers()
        const userExists = existingUser.users.find((user) => user.email === email)

        let authData
        if (userExists) {
          console.log("[v0] User already exists:", userExists.id)
          authData = { user: userExists }
        } else {
          // 2. Yeni kullanıcı oluştur
          const { data: newUserData, error: authError } = await adminSupabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              phone: phone,
            },
          })

          if (authError) {
            console.error("[v0] Auth user creation error:", authError)
            return NextResponse.json({ error: "Kullanıcı oluşturulamadı: " + authError.message }, { status: 500 })
          }

          console.log("[v0] Auth user created successfully:", newUserData.user?.id)
          authData = newUserData
        }

        // 3. Profile oluştur veya güncelle
        if (authData.user) {
          const { data: existingProfile } = await adminSupabase
            .from("profiles")
            .select("id")
            .eq("id", authData.user.id)
            .single()

          if (!existingProfile) {
            const { data: profileData, error: profileError } = await adminSupabase
              .from("profiles")
              .insert([
                {
                  id: authData.user.id,
                  email: email,
                  full_name: fullName,
                  role: "user",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ])
              .select()

            if (profileError) {
              console.error("[v0] Profile creation error:", profileError)
              console.log("[v0] Profile creation failed but auth user exists, continuing...")
            } else {
              console.log("[v0] Profile created successfully:", profileData)
            }
          } else {
            console.log("[v0] Profile already exists for user:", authData.user.id)
          }

          console.log("[v0] User created successfully, returning login credentials")

          // Login bilgilerini döndür ki client-side'da otomatik login yapabilsin
          return NextResponse.json({
            success: true,
            message: "Telefon numarası doğrulandı ve hesap oluşturuldu",
            loginCredentials: {
              email: email,
              password: password,
            },
          })
        }
      } catch (dbError) {
        console.error("[v0] Database error:", dbError)
        return NextResponse.json({ error: "Veritabanı hatası" }, { status: 500 })
      }
    }

    // Doğrulama başarılı
    console.log("[v0] SMS verification successful for phone:", phone)
    deleteVerificationCode(phone)

    return NextResponse.json({
      success: true,
      message: "Telefon numarası doğrulandı ve hesap oluşturuldu",
    })
  } catch (error) {
    console.error("[v0] Verification API error:", error)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
