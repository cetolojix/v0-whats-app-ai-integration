import { type NextRequest, NextResponse } from "next/server"
import { debugLog } from "@/lib/debug"

const EVOLUTION_API_URL = "https://evolu.cetoloji.com"
const EVOLUTION_API_KEY = "hvsctnOWysGzOGHea8tEzV2iHCGr9H4Ln8n"

const COMMON_DEFAULT_KEYS = [
  "change-me", // Default from documentation
  "B6D711FCDE4D4FD5936544120E713976", // Common default
  "evolution-api", // Simple default
  "default", // Generic default
  "test", // Test key
]

export async function GET(request: NextRequest) {
  try {
    debugLog("[v0] Testing Evolution API server health...")
    debugLog("[v0] Server URL:", EVOLUTION_API_URL)
    debugLog("[v0] API Key:", EVOLUTION_API_KEY.substring(0, 10) + "...")

    // Test basic connectivity first
    try {
      const basicResponse = await fetch(EVOLUTION_API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      debugLog("[v0] Basic connectivity test status:", basicResponse.status)
      debugLog("[v0] Basic connectivity headers:", Object.fromEntries(basicResponse.headers.entries()))

      if (!basicResponse.ok) {
        const basicText = await basicResponse.text()
        debugLog("[v0] Basic connectivity response:", basicText)
      }
    } catch (basicError) {
      debugLog("[v0] Basic connectivity failed:", basicError)
      return NextResponse.json(
        {
          status: "error",
          message: "Cannot connect to Evolution API server",
          details: basicError instanceof Error ? basicError.message : "Unknown connection error",
          serverUrl: EVOLUTION_API_URL,
        },
        { status: 500 },
      )
    }

    const keysToTest = [EVOLUTION_API_KEY, ...COMMON_DEFAULT_KEYS]
    const authMethods = ["apikey", "Authorization", "x-api-key", "Api-Key"]

    const results = []
    let workingAuth = null

    for (const apiKey of keysToTest) {
      debugLog(`[v0] Testing API key: ${apiKey.substring(0, 10)}...`)

      for (const methodName of authMethods) {
        try {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Accept: "application/json",
          }

          // Set the appropriate header based on method
          switch (methodName) {
            case "apikey":
              headers.apikey = apiKey
              break
            case "Authorization":
              headers.Authorization = `Bearer ${apiKey}`
              break
            case "x-api-key":
              headers["x-api-key"] = apiKey
              break
            case "Api-Key":
              headers["Api-Key"] = apiKey
              break
          }

          debugLog(`[v0] Testing ${methodName} with key ${apiKey.substring(0, 10)}...`)

          const testResponse = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
            method: "GET",
            headers,
          })

          debugLog(`[v0] ${methodName} (${apiKey.substring(0, 10)}...) status:`, testResponse.status)

          const responseText = await testResponse.text()
          debugLog(`[v0] ${methodName} (${apiKey.substring(0, 10)}...) response:`, responseText.substring(0, 200))

          let responseData
          try {
            responseData = JSON.parse(responseText)
          } catch {
            responseData = { raw: responseText.substring(0, 200) }
          }

          const result = {
            apiKey: apiKey.substring(0, 10) + "...",
            method: methodName,
            status: testResponse.status,
            success: testResponse.ok,
            response: responseData,
            headers: Object.fromEntries(testResponse.headers.entries()),
          }

          results.push(result)

          // If we found a working method, save it
          if (testResponse.ok && !workingAuth) {
            workingAuth = { apiKey, method: methodName }
            debugLog(`[v0] Found working auth: ${methodName} with key ${apiKey.substring(0, 10)}...`)
          }
        } catch (error) {
          debugLog(`[v0] ${methodName} (${apiKey.substring(0, 10)}...) error:`, error)
          results.push({
            apiKey: apiKey.substring(0, 10) + "...",
            method: methodName,
            status: "error",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      // If we found working auth, no need to test more keys
      if (workingAuth) break
    }

    const recommendations = [
      "🔧 DOCKER CONFIGURATION ISSUE DETECTED:",
      "The Evolution API Docker image may be ignoring your AUTHENTICATION_API_KEY environment variable.",
      "",
      "SOLUTIONS:",
      "1. Check if server is using default key 'change-me' (test results above will show)",
      "2. Restart Evolution API container with: docker restart <container-name>",
      "3. Verify environment variables: docker exec <container> env | grep AUTH",
      "4. Use docker logs <container> to check for authentication setup messages",
      "5. Try mounting a custom .env file directly into the container",
      "",
      "DOCKER COMMANDS TO TRY:",
      "docker run -e AUTHENTICATION_TYPE=apikey -e AUTHENTICATION_API_KEY=your-key evolution-api",
      "docker-compose down && docker-compose up -d (to reload environment)",
    ]

    return NextResponse.json({
      status: workingAuth ? "success" : "failed",
      serverUrl: EVOLUTION_API_URL,
      providedApiKey: EVOLUTION_API_KEY.substring(0, 10) + "...",
      workingAuthentication: workingAuth,
      authTests: results,
      recommendations,
      dockerIssue: !workingAuth ? "Likely Docker environment variable issue - see recommendations" : null,
    })
  } catch (error) {
    debugLog("[v0] Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
