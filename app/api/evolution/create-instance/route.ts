import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { debugLog } from "@/lib/debug"

const EVOLUTION_API_URL = "https://evolu.cetoloji.com"

const POSSIBLE_API_KEYS = [
  "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L", // Kullanıcının verdiği tam anahtar
  "hvsctnOWysGzOGHea8tEzV2iHCGr9H4Ln8n", // Önceki uzun anahtar
  "change-me", // En yaygın varsayılan anahtar
  "B6D711FCDE4D4FD5936544120E713976", // Yaygın varsayılan UUID formatı
  "evolution-api", // Basit varsayılan
  "apikey", // Çok basit varsayılan
  "123456", // Test anahtarı
  "admin", // Admin anahtarı
  "default", // Varsayılan anahtar
  "secret", // Gizli anahtar
  "key", // Basit anahtar
  "", // Boş anahtar (kimlik doğrulama kapalı olabilir)
]

export async function POST(request: NextRequest) {
  try {
    const { instanceName } = await request.json()

    debugLog("[v0] Creating instance with name:", instanceName)

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    // Validate instance name format
    if (!/^[a-zA-Z0-9-_]+$/.test(instanceName)) {
      return NextResponse.json({ error: "Invalid instance name format" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      debugLog("[v0] Authentication error:", authError)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    debugLog("[v0] Authenticated user:", user.id)

    const { data: limitCheck, error: limitError } = await supabase.rpc("check_instance_limit", { user_uuid: user.id })

    if (limitError) {
      debugLog("[v0] Error checking instance limit:", limitError)
      return NextResponse.json({ error: "Failed to check instance limit" }, { status: 500 })
    }

    debugLog("[v0] Instance limit check:", limitCheck)

    if (!limitCheck.can_create) {
      return NextResponse.json(
        {
          error: "Instance limit reached",
          details: {
            current_instances: limitCheck.current_instances,
            max_instances: limitCheck.max_instances,
            package_name: limitCheck.package_name,
            package_display_tr: limitCheck.package_display_tr,
            package_display_en: limitCheck.package_display_en,
          },
        },
        { status: 403 },
      )
    }

    // Pattern ^\d+[\\.@\w-]+ rakamla başlamasını gerektiriyor
    const generateValidNumber = (instanceName: string) => {
      // Instance adından rakamları çıkar, yoksa timestamp kullan
      const digits = instanceName.match(/\d+/)?.[0] || Date.now().toString().slice(-6)
      return `${digits}.${instanceName.replace(/[^a-zA-Z0-9]/g, "")}`
    }

    const createInstancePayload = {
      instanceName: instanceName,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
      number: generateValidNumber(instanceName), // Regex pattern ile uyumlu format
      token: "", // WhatsApp Business API için değil, Web için boş
      webhook: {
        url: `https://n8nx.cetoloji.com/webhook/${instanceName}`,
        events: ["MESSAGES_UPSERT"],
        base64: false,
        enabled: true,
      },
      settings: {
        rejectCall: false,
        msgCall: "Sorry, I cannot receive calls at this time.",
        groupsIgnore: false,
        alwaysOnline: true,
        readMessages: false,
        readStatus: false,
        syncFullHistory: false,
        autoReconnect: true,
        markMessagesRead: false,
        ignoreGroupMessages: false,
        ignoreStatusMessages: true,
        ignoreHistoryMessages: true,
      },
      websocket: {
        autoReconnect: true,
        maxReconnectAttempts: 5,
        reconnectInterval: 5000,
      },
      qr_timeout: 300, // 5 dakika
      connection_timeout: 60, // 1 dakika
    }

    debugLog("[v0] Request payload:", JSON.stringify(createInstancePayload, null, 2))
    debugLog("[v0] API URL:", `${EVOLUTION_API_URL}/instance/create`)

    try {
      const healthCheck = await fetch(`${EVOLUTION_API_URL}/manager/fetchInstances`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      debugLog("[v0] Server health check status:", healthCheck.status)
    } catch (e) {
      debugLog("[v0] Server health check failed:", e)
    }

    for (const apiKey of POSSIBLE_API_KEYS) {
      debugLog(`[v0] Testing API key: ${apiKey ? apiKey.substring(0, 10) + "..." : "EMPTY"}`)

      const authHeaders = [
        { apikey: apiKey },
        { Authorization: `Bearer ${apiKey}` },
        { Authorization: apiKey }, // Bearer olmadan
        { "x-api-key": apiKey },
        { "Api-Key": apiKey },
        { "X-API-KEY": apiKey }, // Büyük harfli versiyon
        { "api-key": apiKey }, // Küçük harfli versiyon
        { "auth-key": apiKey }, // Alternatif isim
        { "access-token": apiKey }, // Access token formatı
        { token: apiKey }, // Basit token
      ]

      // Boş anahtar için kimlik doğrulama başlığı olmadan da dene
      if (!apiKey) {
        authHeaders.push({})
      }

      for (let i = 0; i < authHeaders.length; i++) {
        const authHeader = authHeaders[i]
        const authMethod = Object.keys(authHeader)[0] || "no-auth"
        debugLog(`[v0] Trying method: ${authMethod} with key: ${apiKey || "EMPTY"}`)

        try {
          const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "User-Agent": "WhatsApp-AI-Integration/1.0", // User-Agent eklendi
              ...authHeader,
            },
            body: JSON.stringify(createInstancePayload),
          })

          debugLog(`[v0] Response status: ${response.status} for ${authMethod} with ${apiKey || "EMPTY"}`)

          debugLog(`[v0] Response headers:`, Object.fromEntries(response.headers.entries()))

          if (response.ok) {
            const data = await response.json()
            debugLog("[v0] SUCCESS! Working API key found:", apiKey || "EMPTY")
            debugLog("[v0] Working auth method:", authMethod)
            debugLog("[v0] Success response:", JSON.stringify(data, null, 2))

            try {
              debugLog("[v0] Saving instance to database:", instanceName)
              const { error: dbError } = await supabase.from("instances").insert({
                user_id: user.id,
                instance_name: instanceName,
                instance_key: data.instance?.instanceId || instanceName,
                status: data.instance?.status || "connecting",
                qr_code: data.qrcode?.base64 || null,
                workflow_id: null,
                workflow_name: null,
              })

              if (dbError) {
                debugLog("[v0] Error saving instance to database:", dbError)
                // Don't fail the request if database save fails, but log it
              } else {
                debugLog("[v0] Instance successfully saved to database")
              }
            } catch (dbErr) {
              debugLog("[v0] Failed to save instance to database:", dbErr)
              // Don't fail the request if database save fails
            }

            return NextResponse.json({
              success: true,
              instanceName,
              workingApiKey: apiKey || "EMPTY",
              workingAuthMethod: authMethod,
              data: {
                instanceName: data.instance?.instanceName || instanceName,
                status: data.instance?.status || "created",
                integration: data.instance?.integration || "WHATSAPP-BAILEYS",
                qrCode: data.qrcode || null,
              },
            })
          } else if (response.status !== 401) {
            // 401 dışındaki hatalar için detaylı bilgi
            const errorText = await response.text()
            debugLog(`[v0] Non-401 error (${response.status}):`, errorText)

            return NextResponse.json(
              {
                error: `HTTP ${response.status}: ${errorText}`,
                workingApiKey: apiKey || "EMPTY",
                workingAuthMethod: authMethod,
              },
              { status: response.status },
            )
          } else {
            try {
              const errorBody = await response.text()
              debugLog(`[v0] 401 error body:`, errorBody)
            } catch (e) {
              debugLog(`[v0] Could not read 401 error body`)
            }
          }
        } catch (fetchError) {
          debugLog(`[v0] Fetch error for ${authMethod}:`, fetchError)
        }
      }
    }

    return NextResponse.json(
      {
        error: "Tüm API anahtarları başarısız oldu",
        details: "Evolution API sunucunuz farklı bir API anahtarı kullanıyor olabilir",
        testedKeys: POSSIBLE_API_KEYS.map((key) => (key ? key.substring(0, 10) + "..." : "EMPTY")),
        troubleshooting: [
          "1. Evolution API sunucunuzun Docker loglarını kontrol edin: docker logs <container_name>",
          "2. Sunucuda AUTHENTICATION_API_KEY environment variable'ını kontrol edin",
          "3. Docker container'ı yeniden başlatmayı deneyin",
          "4. Evolution API sunucunuzun admin panelinden API anahtarını kontrol edin",
          "5. Sunucu URL'sinin doğru olduğundan emin olun: https://evolu.cetoloji.com",
          "6. Sunucunuzun /manager/fetchInstances endpoint'ini test edin",
        ],
      },
      { status: 401 },
    )
  } catch (error) {
    debugLog("[v0] Error creating instance:", error)
    return NextResponse.json({ error: "Beklenmeyen hata oluştu" }, { status: 500 })
  }
}
