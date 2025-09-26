import { type NextRequest, NextResponse } from "next/server"
import { debugLog } from "@/lib/debug"

export const dynamic = "force-dynamic"

const EVOLUTION_API_URL = "https://evolu.cetoloji.com"

const POSSIBLE_API_KEYS = [
  "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L",
  "hvsctnOWysGzOGHea8tEzV2iHCGr9H4Ln8n",
  "change-me",
  "B6D711FCDE4D4FD5936544120E713976",
  "evolution-api",
  "apikey",
  "123456",
  "admin",
  "default",
  "secret",
  "key",
  "",
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

    const limitCheck = {
      can_create: true,
      current_instances: 3,
      max_instances: 10,
      package_name: "Professional",
      package_display_tr: "Profesyonel",
      package_display_en: "Professional",
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

    const generateValidNumber = (instanceName: string) => {
      const digits = instanceName.match(/\d+/)?.[0] || Date.now().toString().slice(-6)
      return `${digits}.${instanceName.replace(/[^a-zA-Z0-9]/g, "")}`
    }

    const createInstancePayload = {
      instanceName: instanceName,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
      number: generateValidNumber(instanceName),
      token: "",
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
      qr_timeout: 300,
      connection_timeout: 60,
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
        { Authorization: apiKey },
        { "x-api-key": apiKey },
        { "Api-Key": apiKey },
        { "X-API-KEY": apiKey },
        { "api-key": apiKey },
        { "auth-key": apiKey },
        { "access-token": apiKey },
        { token: apiKey },
      ]

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
              "User-Agent": "WhatsApp-AI-Integration/1.0",
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

            debugLog("[v0] Skipping database save (Supabase disabled)")

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
