import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    const supabase = await createClient()

    console.log("[v0] Signup request received:", { ...formData, password: "[HIDDEN]" })

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: undefined, // E-posta doğrulaması yok
        data: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          company: formData.company,
        },
      },
    })

    if (authError) {
      console.error("[v0] Auth signup error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Kullanıcı oluşturulamadı" }, { status: 500 })
    }

    console.log("[v0] User created successfully:", authData.user.id)

    try {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id, // Added id field to match profiles table schema
        email: formData.email,
        full_name: `${formData.firstName} ${formData.lastName}`, // Changed to full_name to match schema
        role: "user", // Added role field as required by profiles table
      })

      if (profileError) {
        console.error("[v0] Profile creation error:", profileError)
        // Kullanıcı oluşturuldu ama profil kaydedilemedi, yine de başarılı say
      } else {
        console.log("[v0] User profile created successfully")
      }
    } catch (profileError) {
      console.error("[v0] Profile creation error:", profileError)
    }

    return NextResponse.json({
      success: true,
      message: "Üyelik başarıyla oluşturuldu. Giriş yapabilirsiniz.",
      userId: authData.user.id,
    })
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
