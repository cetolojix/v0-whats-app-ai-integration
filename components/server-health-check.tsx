"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Copy, Terminal } from "lucide-react"

interface HealthCheckResult {
  status: string
  serverUrl: string
  providedApiKey: string
  workingAuthentication?: {
    apiKey: string
    method: string
  } | null
  authTests: Array<{
    apiKey: string
    method: string
    status: number | string
    success: boolean
    response?: any
    error?: string
  }>
  recommendations: string[]
  dockerIssue?: string | null
}

export function ServerHealthCheck() {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<HealthCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runHealthCheck = async () => {
    setIsChecking(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/evolution/health")
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || "Sağlık kontrolü başarısız")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sağlık kontrolünü çalıştıramadı")
    } finally {
      setIsChecking(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Mesajlaşma Servisi Sağlık Kontrolü
        </CardTitle>
        <CardDescription>WhatsApp mesajlaşma servisinizle bağlantı ve kimlik doğrulama testini yapın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runHealthCheck} disabled={isChecking} className="w-full">
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sağlık Kontrolü Çalıştırılıyor...
            </>
          ) : (
            "Sağlık Kontrolü Çalıştır"
          )}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Sağlık Kontrolü Başarısız</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div
              className={`p-4 border rounded-lg ${result.workingAuthentication ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.workingAuthentication ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <h4 className={`font-medium ${result.workingAuthentication ? "text-green-900" : "text-red-900"}`}>
                  {result.workingAuthentication ? "Kimlik Doğrulama Çalışıyor!" : "Kimlik Doğrulama Başarısız"}
                </h4>
              </div>
              <div className={`space-y-1 text-sm ${result.workingAuthentication ? "text-green-700" : "text-red-700"}`}>
                <p>
                  <strong>Sunucu URL:</strong> {result.serverUrl}
                </p>
                <p>
                  <strong>API Anahtarınız:</strong> {result.providedApiKey}
                </p>
                {result.workingAuthentication && (
                  <>
                    <p>
                      <strong>Çalışan Yöntem:</strong> {result.workingAuthentication.method}
                    </p>
                    <p>
                      <strong>Çalışan Anahtar:</strong> {result.workingAuthentication.apiKey.substring(0, 10)}...
                    </p>
                  </>
                )}
              </div>
            </div>

            {result.dockerIssue && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700 mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-medium">Docker Yapılandırma Sorunu Tespit Edildi</span>
                </div>
                <p className="text-orange-600 text-sm">{result.dockerIssue}</p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-medium">Kimlik Doğrulama Test Sonuçları</h4>
              {result.authTests.map((test, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{test.method}</span>
                      <span className="text-xs text-gray-500">({test.apiKey})</span>
                    </div>
                    <Badge variant={test.success ? "default" : "destructive"}>
                      {test.success ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Başarılı
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 h-3 w-3" />
                          Başarısız
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Durum:</strong> {test.status}
                    </p>
                    {test.error && (
                      <p>
                        <strong>Hata:</strong> {test.error}
                      </p>
                    )}
                    {test.response && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600">Yanıtı Görüntüle</summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(test.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-3">Sorun Giderme Adımları</h4>
              <div className="space-y-2 text-sm text-amber-700">
                {result.recommendations.map((rec, index) => {
                  // Check if this is a Docker command
                  const isDockerCommand = rec.startsWith("docker") || rec.includes("docker-compose")

                  if (isDockerCommand) {
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 bg-amber-100 rounded">
                        <code className="flex-1 text-xs">{rec}</code>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(rec)} className="h-6 px-2">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  }

                  return (
                    <p key={index} className={rec.startsWith("🔧") || rec === "" ? "font-medium" : ""}>
                      {rec || <br />}
                    </p>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
