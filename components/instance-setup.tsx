"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Smartphone, AlertCircle, CheckCircle, Zap, Crown } from "lucide-react"
import { InstanceLimitWarning } from "./instance-limit-warning"

interface PackageInfo {
  user_id: string
  package_name: string
  display_name_tr: string
  display_name_en: string
  max_instances: number
  current_instances: number
  remaining_instances: number
  subscription_status: string
}

interface InstanceSetupProps {
  instanceName: string
  setInstanceName: (name: string) => void
  onNext: () => void
}

export function InstanceSetup({ instanceName, setInstanceName, onNext }: InstanceSetupProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const [validationError, setValidationError] = useState("")
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null)

  useEffect(() => {
    fetchPackageInfo()
  }, [])

  const fetchPackageInfo = async () => {
    try {
      const response = await fetch("/api/user/package-info")
      const data = await response.json()

      if (response.ok) {
        setPackageInfo(data.packageInfo)
      }
    } catch (error) {
      console.error("Failed to fetch package info:", error)
    }
  }

  const validateInstanceName = (name: string) => {
    if (!name.trim()) {
      return "Bot adı gereklidir"
    }
    if (name.length < 3) {
      return "Bot adı en az 3 karakter olmalıdır"
    }
    if (name.length > 50) {
      return "Bot adı 50 karakterden az olmalıdır"
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      return "Sadece harfler, rakamlar, tireler ve alt çizgiler kullanılabilir"
    }
    if (name.startsWith("-") || name.endsWith("-")) {
      return "Bot adı tire ile başlayamaz veya bitemez"
    }
    return ""
  }

  const handleInstanceNameChange = (value: string) => {
    setInstanceName(value)
    const validation = validateInstanceName(value)
    setValidationError(validation)
    if (error) setError("") // Clear any previous errors
  }

  const handleCreateInstance = async () => {
    const validation = validateInstanceName(instanceName)
    if (validation) {
      setValidationError(validation)
      return
    }

    if (packageInfo && packageInfo.remaining_instances <= 0) {
      setError("Bot limitinize ulaştınız. Daha fazla bot oluşturmak için paketinizi yükseltin.")
      return
    }

    setIsCreating(true)
    setError("")
    setValidationError("")

    try {
      const response = await fetch("/api/evolution/create-instance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ instanceName: instanceName.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403 && data.error === "Instance limit reached") {
          setError(
            `Bot limiti aşıldı. ${data.details.package_display_en} paketinizde ${data.details.current_instances}/${data.details.max_instances} bot kullanıyorsunuz.`,
          )
        } else {
          throw new Error(data.error || "Bot oluşturulamadı")
        }
        return
      }

      if (data.success) {
        // Small delay for better UX
        setTimeout(() => {
          onNext()
        }, 1000)
      } else {
        throw new Error("Instance creation was not successful")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Bot oluşturulamadı"
      setError(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  const isFormValid = instanceName.trim() && !validationError && !isCreating && packageInfo?.remaining_instances !== 0

  return (
    <div className="space-y-6">
      {packageInfo && (
        <InstanceLimitWarning
          currentInstances={packageInfo.current_instances}
          maxInstances={packageInfo.max_instances}
          packageName={packageInfo.package_name}
          packageDisplayTr={packageInfo.display_name_tr}
          packageDisplayEn={packageInfo.display_name_en}
          language="en"
          onUpgradeClick={() => {
            // Could redirect to upgrade page
            window.location.href = "/dashboard"
          }}
        />
      )}

      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            WhatsApp Bot Oluştur
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              AI Hazır
            </Badge>
          </CardTitle>
          <CardDescription>WhatsApp AI botunuz için benzersiz bir ad girin</CardDescription>
          {packageInfo && (
            <div className="text-sm text-muted-foreground">
              {packageInfo.remaining_instances > 0
                ? `${packageInfo.max_instances} bottan ${packageInfo.remaining_instances} tanesi kaldı`
                : `${packageInfo.current_instances}/${packageInfo.max_instances} bot kullanıldı - Yükseltme gerekli`}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instanceName">Bot Adı</Label>
            <Input
              id="instanceName"
              placeholder="örn: isletme-botum"
              value={instanceName}
              onChange={(e) => handleInstanceNameChange(e.target.value)}
              disabled={isCreating || packageInfo?.remaining_instances === 0}
              className={validationError ? "border-destructive" : ""}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {validationError || "Harfler, rakamlar, tireler ve alt çizgiler kullanın"}
              </span>
              <span className={`${instanceName.length > 40 ? "text-destructive" : "text-muted-foreground"}`}>
                {instanceName.length}/50
              </span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleCreateInstance} disabled={!isFormValid} className="w-full">
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bot Oluşturuluyor...
              </>
            ) : packageInfo?.remaining_instances === 0 ? (
              <>
                <Crown className="mr-2 h-4 w-4" />
                Yükseltme Gerekli
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Bot Oluştur
              </>
            )}
          </Button>

          <div className="rounded-lg bg-muted/50 p-3">
            <h4 className="text-sm font-medium text-foreground">Sonra ne olacak?</h4>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>• WhatsApp botu mesajlaşma servisimiz kullanılarak oluşturulacak</li>
              <li>• Cihaz bağlantısı için QR kod üretilecek</li>
              <li>• Akıllı otomasyon otomatik olarak yapılandırılacak</li>
              <li>• AI destekli yanıtlar etkinleştirilecek</li>
              <li>• Gerçek zamanlı mesaj işleme başlayacak</li>
            </ul>
          </div>

          <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-accent-foreground">
              <Zap className="h-4 w-4" />
              Dahil Edilen AI Özellikleri
            </div>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              <li>• Akıllı konuşma yönetimi</li>
              <li>• Otomatik müşteri destek yanıtları</li>
              <li>• Çoklu dil desteği</li>
              <li>• Özel iş mantığı entegrasyonu</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
