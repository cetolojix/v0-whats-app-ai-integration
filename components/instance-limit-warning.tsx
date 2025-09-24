"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Crown } from "lucide-react"
import { getTranslation } from "@/lib/i18n"

interface InstanceLimitWarningProps {
  currentInstances: number
  maxInstances: number
  packageName: string
  packageDisplayTr: string
  packageDisplayEn: string
  language: string
  onUpgradeClick?: () => void
}

export function InstanceLimitWarning({
  currentInstances,
  maxInstances,
  packageName,
  packageDisplayTr,
  packageDisplayEn,
  language,
  onUpgradeClick,
}: InstanceLimitWarningProps) {
  const t = getTranslation(language)
  const displayName = language === "tr" ? packageDisplayTr : packageDisplayEn
  const isAtLimit = currentInstances >= maxInstances
  const isNearLimit = currentInstances >= maxInstances - 1

  if (!isNearLimit) return null

  return (
    <Alert variant={isAtLimit ? "destructive" : "default"} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          {isAtLimit ? (
            language === "tr" ? (
              <>
                <strong>Bot limiti doldu!</strong> {displayName} paketinizde {maxInstances} bot limitine ulaştınız. Yeni
                bot oluşturmak için paketinizi yükseltmeniz gerekiyor.
              </>
            ) : (
              <>
                <strong>Bot limit reached!</strong> You've reached the {maxInstances} bot limit for your {displayName}{" "}
                package. You need to upgrade your package to create new bots.
              </>
            )
          ) : language === "tr" ? (
            <>
              <strong>Bot limitine yaklaşıyorsunuz!</strong> {displayName} paketinizde {currentInstances}/{maxInstances}{" "}
              bot kullanıyorsunuz.
            </>
          ) : (
            <>
              <strong>Approaching bot limit!</strong> You're using {currentInstances}/{maxInstances} bots in your{" "}
              {displayName} package.
            </>
          )}
        </div>
        {packageName !== "pro" && onUpgradeClick && (
          <Button onClick={onUpgradeClick} size="sm" className="ml-4">
            <Crown className="h-4 w-4 mr-2" />
            {language === "tr" ? "Yükselt" : "Upgrade"}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
