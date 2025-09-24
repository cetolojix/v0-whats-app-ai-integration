"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PackageSelector } from "./package-selector"
import { Crown, Settings } from "lucide-react"
import { getTranslation } from "@/lib/i18n"

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

interface PackageManagementProps {
  language: string
  packageInfo?: PackageInfo
  onPackageChange?: (packageInfo: PackageInfo) => void
}

export function PackageManagement({ language, packageInfo, onPackageChange }: PackageManagementProps) {
  const t = getTranslation(language)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handlePackageChange = (newPackageInfo: PackageInfo) => {
    onPackageChange?.(newPackageInfo)
    setIsDialogOpen(false)
  }

  if (!packageInfo) return null

  const displayName = language === "tr" ? packageInfo.display_name_tr : packageInfo.display_name_en
  const usagePercentage = (packageInfo.current_instances / packageInfo.max_instances) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              {language === "tr" ? "Paket Bilgileri" : "Package Information"}
            </CardTitle>
            <CardDescription>
              {language === "tr" ? "Mevcut paketiniz ve kullanım durumunuz" : "Your current package and usage status"}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                {language === "tr" ? "Paketi Değiştir" : "Change Package"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{language === "tr" ? "Paket Seçimi" : "Package Selection"}</DialogTitle>
                <DialogDescription>
                  {language === "tr"
                    ? "İhtiyaçlarınıza en uygun paketi seçin"
                    : "Choose the package that best fits your needs"}
                </DialogDescription>
              </DialogHeader>
              <PackageSelector language={language} onPackageChange={handlePackageChange} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{displayName}</div>
            <div className="text-sm text-muted-foreground">{language === "tr" ? "Aktif paket" : "Active package"}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {packageInfo.current_instances}/{packageInfo.max_instances}
            </div>
            <div className="text-sm text-muted-foreground">{language === "tr" ? "bot kullanımı" : "bots used"}</div>
          </div>
        </div>

        {/* Usage Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{language === "tr" ? "Kullanım Oranı" : "Usage Rate"}</span>
            <span>{Math.round(usagePercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                usagePercentage >= 100 ? "bg-red-500" : usagePercentage >= 80 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {packageInfo.remaining_instances <= 0 && (
          <div className="text-sm text-red-600 font-medium">
            {language === "tr"
              ? "Bot limitiniz doldu. Yeni bot oluşturmak için paketinizi yükseltin."
              : "Your bot limit is full. Upgrade your package to create new bots."}
          </div>
        )}

        {packageInfo.remaining_instances > 0 && (
          <div className="text-sm text-green-600">
            {language === "tr"
              ? `${packageInfo.remaining_instances} bot daha oluşturabilirsiniz.`
              : `You can create ${packageInfo.remaining_instances} more bots.`}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
