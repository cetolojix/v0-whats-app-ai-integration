"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { QrCode, Smartphone, RefreshCw, AlertCircle, CheckCircle, Clock, Trash2 } from "lucide-react"
import { getTranslation } from "@/lib/i18n"

interface QRCodeDisplayProps {
  instanceName: string
  onConnected: (connectedInstanceName: string) => void
  language?: string
}

interface ConnectionStatus {
  status: "disconnected" | "connecting" | "connected" | "close"
  lastSeen?: string
}

export function QRCodeDisplay({ instanceName, onConnected, language = "tr" }: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: "disconnected" })
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(60)
  const [retryCount, setRetryCount] = useState(0)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const t = getTranslation(language)
  const maxRetries = 3

  const cleanupOldInstances = useCallback(async () => {
    setIsCleaningUp(true)
    try {
      console.log("[v0] Cleaning up old instances...")
      const response = await fetch("/api/evolution/cleanup-instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentInstance: instanceName }),
      })

      if (response.ok) {
        console.log("[v0] Old instances cleaned up successfully")
      }
    } catch (err) {
      console.error("[v0] Failed to cleanup old instances:", err)
    } finally {
      setIsCleaningUp(false)
    }
  }, [instanceName])

  const generateQRCode = useCallback(async () => {
    setIsLoading(true)
    setError("")
    setCountdown(60)

    await cleanupOldInstances()

    try {
      console.log(`[v0] Generating QR code for instance: ${instanceName}`)
      const response = await fetch(`/api/evolution/qr-code?instance=${encodeURIComponent(instanceName)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate QR code")
      }

      if (data.qrCode) {
        setQrCode(data.qrCode)
        setRetryCount(0)
        startConnectionMonitoring()
      } else {
        throw new Error("No QR code received from server")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate QR code"
      setError(errorMessage)
      console.error(`[v0] QR code generation failed:`, errorMessage)

      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1)
          generateQRCode()
        }, 5000)
      }
    } finally {
      setIsLoading(false)
    }
  }, [instanceName, retryCount, cleanupOldInstances])

  const checkExistingConnections = useCallback(async () => {
    try {
      console.log(`[v0] Checking if user's instance "${instanceName}" is already connected...`)
      const response = await fetch(`/api/evolution/status?instance=${encodeURIComponent(instanceName)}`)
      const data = await response.json()

      console.log(`[v0] checkExistingConnections response:`, data)

      if (response.ok && data.instance) {
        const state = data.instance.state
        console.log(`[v0] User's instance "${instanceName}" state: ${state}`)

        if (state === "open" || state === "connected") {
          console.log(`[v0] User's instance "${instanceName}" is already connected!`)
          setConnectionStatus({ status: "connected", lastSeen: new Date().toISOString() })

          console.log(`[v0] Calling onConnected for user's instance: ${instanceName}`)
          onConnected(instanceName)
          return true
        }
      }

      console.log(`[v0] User's instance "${instanceName}" is not connected, will generate QR code`)
      return false
    } catch (err) {
      console.error(`[v0] Failed to check user's instance "${instanceName}":`, err)
      return false
    }
  }, [onConnected, instanceName])

  const startConnectionMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current)
      monitoringIntervalRef.current = null
    }

    setConnectionStatus({ status: "connecting" })
    let consecutiveCloseCount = 0
    let checkCount = 0

    const checkConnection = async () => {
      try {
        checkCount++
        console.log(`[v0] Checking connection status for: ${instanceName} (attempt ${checkCount})`)
        const response = await fetch(`/api/evolution/status?instance=${encodeURIComponent(instanceName)}`)
        const data = await response.json()

        console.log(`[v0] Status response:`, data)

        if (response.ok && data.success && data.status === "connected") {
          console.log(`[v0] Instance ${instanceName} is connected! Calling onConnected...`)
          setConnectionStatus({ status: "connected", lastSeen: new Date().toISOString() })
          consecutiveCloseCount = 0

          if (monitoringIntervalRef.current) {
            clearInterval(monitoringIntervalRef.current)
            monitoringIntervalRef.current = null
          }

          console.log(`[v0] Calling onConnected callback for ${instanceName}`)
          onConnected(instanceName)

          setTimeout(() => {
            createAutomationWorkflow()
              .then(() => {
                console.log("[v0] Workflow created successfully")
              })
              .catch((err) => {
                console.error("[v0] Workflow creation failed:", err)
                // Don't fail the connection if workflow creation fails
                // The user can still use the instance manually
              })
          }, 2000) // Increased delay to ensure instance is fully ready

          return true
        } else if (response.ok && data.instance) {
          const state = data.instance.state
          console.log(`[v0] Instance ${instanceName} state: ${state}`)

          if (state === "open" || state === "connected") {
            console.log(`[v0] Instance ${instanceName} is connected via state! Calling onConnected...`)
            setConnectionStatus({ status: "connected", lastSeen: new Date().toISOString() })
            consecutiveCloseCount = 0

            if (monitoringIntervalRef.current) {
              clearInterval(monitoringIntervalRef.current)
              monitoringIntervalRef.current = null
            }

            console.log(`[v0] Calling onConnected callback for ${instanceName}`)
            onConnected(instanceName)

            setTimeout(() => {
              createAutomationWorkflow()
                .then(() => {
                  console.log("[v0] Workflow created successfully")
                })
                .catch((err) => {
                  console.error("[v0] Workflow creation failed:", err)
                  // Don't fail the connection if workflow creation fails
                })
            }, 2000) // Increased delay

            return true
          } else if (state === "close") {
            consecutiveCloseCount++
            console.log(`[v0] Instance closed, count: ${consecutiveCloseCount}`)

            if (consecutiveCloseCount >= 3) {
              setError("Connection lost multiple times. Generating new QR code...")
              if (monitoringIntervalRef.current) {
                clearInterval(monitoringIntervalRef.current)
                monitoringIntervalRef.current = null
              }
              setTimeout(() => {
                generateQRCode()
              }, 3000)
              return true
            }
          } else if (state === "connecting") {
            consecutiveCloseCount = 0
            setConnectionStatus({ status: "connecting" })
          }
        } else if (response.status === 404) {
          console.log(`[v0] Instance not found, creating new QR code`)
          setError("Instance not found. Creating new QR code...")
          if (monitoringIntervalRef.current) {
            clearInterval(monitoringIntervalRef.current)
            monitoringIntervalRef.current = null
          }
          setTimeout(() => {
            generateQRCode()
          }, 2000)
          return true
        }

        return false
      } catch (err) {
        console.error("[v0] Connection check failed:", err)
        return false
      }
    }

    checkConnection().then((isConnected) => {
      if (isConnected) {
        return // Exit early if already connected
      }

      monitoringIntervalRef.current = setInterval(async () => {
        const isConnected = await checkConnection()
        if (isConnected && monitoringIntervalRef.current) {
          clearInterval(monitoringIntervalRef.current)
          monitoringIntervalRef.current = null
        }
      }, 5000)

      setTimeout(() => {
        if (monitoringIntervalRef.current) {
          clearInterval(monitoringIntervalRef.current)
          monitoringIntervalRef.current = null
        }
        if (connectionStatus.status === "connecting") {
          setConnectionStatus({ status: "disconnected" })
          setError("Connection timeout after 3 minutes. Please try generating a new QR code.")
        }
      }, 180000)
    })
  }, [instanceName, connectionStatus.status, onConnected, generateQRCode])

  const createAutomationWorkflow = async () => {
    try {
      console.log("[v0] Creating automation workflow for:", instanceName)

      const response = await fetch("/api/n8n/create-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName: instanceName,
          workflowType: "advanced-ai",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create workflow`)
      }

      const data = await response.json()
      console.log("[v0] Workflow created successfully:", data)

      return data
    } catch (err) {
      console.error("[v0] Error creating workflow:", err)
      return null
    }
  }

  useEffect(() => {
    const initializeConnection = async () => {
      const hasExistingConnection = await checkExistingConnections()
      if (!hasExistingConnection) {
        generateQRCode()
      }
    }

    initializeConnection()
  }, [checkExistingConnections, generateQRCode])

  useEffect(() => {
    if (countdown > 0 && connectionStatus.status !== "connected") {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && connectionStatus.status === "disconnected") {
      generateQRCode()
    }
  }, [countdown, connectionStatus.status, generateQRCode])

  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current)
        monitoringIntervalRef.current = null
      }
    }
  }, [instanceName])

  const getStatusBadge = () => {
    switch (connectionStatus.status) {
      case "connecting":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {language === "tr" ? "Bağlanıyor..." : "Connecting..."}
          </Badge>
        )
      case "connected":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            {t.connected}
          </Badge>
        )
      case "close":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {language === "tr" ? "Bağlantı Kesildi" : "Disconnected"}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <QrCode className="h-3 w-3" />
            {language === "tr" ? "Taramaya Hazır" : "Ready to scan"}
          </Badge>
        )
    }
  }

  return (
    <Card className="mx-auto max-w-md animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
          <QrCode className="h-6 w-6 text-accent" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <CardTitle className="text-balance">{t.qrCodeTitle}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription className="text-pretty">
          {language === "tr"
            ? `Telefonunuzla bu QR kodu tarayarak "${instanceName}" botunu WhatsApp'a bağlayın`
            : `Open WhatsApp on your phone and scan this QR code to connect "${instanceName}"`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {isLoading || isCleaningUp ? (
            <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-muted">
              <div className="text-center">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {isCleaningUp
                    ? language === "tr"
                      ? "Eski bağlantılar temizleniyor..."
                      : "Cleaning up old instances..."
                    : retryCount > 0
                      ? `${language === "tr" ? "Yeniden deneniyor" : "Retrying"}... (${retryCount}/${maxRetries})`
                      : language === "tr"
                        ? "QR kod oluşturuluyor..."
                        : "Generating QR code..."}
                </p>
              </div>
            </div>
          ) : qrCode ? (
            <div className="space-y-3">
              <div className="rounded-lg border-2 border-accent/20 p-2">
                <img
                  src={qrCode || "/placeholder.svg?height=200&width=200&query=WhatsApp QR Code"}
                  alt="WhatsApp QR Code"
                  className="h-44 w-44 rounded"
                />
              </div>

              {connectionStatus.status === "connecting" && (
                <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">
                      {language === "tr" ? "Bağlanıyor..." : "Connecting..."}
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {language === "tr"
                      ? "WhatsApp'ı açık tutun ve bağlantıyı bekleyin"
                      : "Keep WhatsApp open and wait for connection"}
                  </p>
                </div>
              )}

              {connectionStatus.status === "connected" && (
                <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800">
                      {language === "tr" ? "Bağlandı!" : "Connected!"}
                    </p>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {language === "tr" ? "AI otomasyonu kuruluyor..." : "Setting up AI automation..."}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {connectionStatus.status === "disconnected" && countdown > 0 && !error && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {language === "tr" ? (
                <>
                  QR kod <span className="font-medium text-foreground">{countdown}</span> saniye içinde sona erecek
                </>
              ) : (
                <>
                  QR code expires in <span className="font-medium text-foreground">{countdown}</span> seconds
                </>
              )}
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {retryCount < maxRetries && (
                <span className="block mt-1 text-xs">
                  {language === "tr"
                    ? `Otomatik yeniden deneniyor... (${retryCount}/${maxRetries})`
                    : `Retrying automatically... (${retryCount}/${maxRetries})`}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={generateQRCode}
            variant="outline"
            disabled={isLoading || connectionStatus.status === "connected" || isCleaningUp}
            className="flex-1 bg-transparent"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {language === "tr" ? "Yeni QR Kod" : "New QR Code"}
          </Button>

          <Button
            onClick={cleanupOldInstances}
            variant="ghost"
            size="sm"
            disabled={isCleaningUp}
            title={language === "tr" ? "Eski bağlantıları temizle" : "Clean up old instances"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Smartphone className="h-4 w-4" />
            {language === "tr" ? "Nasıl taranır:" : "How to scan:"}
          </h4>
          <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
            {language === "tr" ? (
              <>
                <li>1. Telefonunuzda WhatsApp'ı açın</li>
                <li>2. Menü (⋮) → Bağlı cihazlar'a dokunun</li>
                <li>3. "Cihaz bağla"ya dokunun</li>
                <li>4. Kameranızı bu QR koda doğrultun</li>
                <li>5. Bağlantı onayını bekleyin</li>
              </>
            ) : (
              <>
                <li>1. Open WhatsApp on your phone</li>
                <li>2. Tap Menu (⋮) → Linked devices</li>
                <li>3. Tap "Link a device"</li>
                <li>4. Point your camera at this QR code</li>
                <li>5. Wait for connection confirmation</li>
              </>
            )}
          </ol>
        </div>

        {connectionStatus.status === "connected" && connectionStatus.lastSeen && (
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="text-sm font-medium text-green-800">
              {language === "tr" ? "WhatsApp Başarıyla Bağlandı!" : "WhatsApp Connected Successfully!"}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {language === "tr" ? "AI otomasyonu yapılandırılıyor..." : "AI automation is being configured..."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
