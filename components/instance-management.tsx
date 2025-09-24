"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, RefreshCw, QrCode } from "lucide-react"
import { getTranslation } from "@/lib/i18n"

interface ConnectedInstance {
  name: string
  connectedAt: Date
  status: "connected" | "disconnected"
}

interface InstanceManagementProps {
  instances: ConnectedInstance[]
  selectedInstance: string
  language: string
  onSelectInstance: (instanceName: string) => void
  onDeleteInstance: (instanceName: string) => void
  onReconnectInstance: (instanceName: string) => void
}

export function InstanceManagement({
  instances,
  selectedInstance,
  language,
  onSelectInstance,
  onDeleteInstance,
  onReconnectInstance,
}: InstanceManagementProps) {
  const t = getTranslation(language)
  const [deletingInstance, setDeletingInstance] = useState<string | null>(null)
  const [reconnectingInstance, setReconnectingInstance] = useState<string | null>(null)

  const handleDeleteInstance = async (instanceName: string) => {
    setDeletingInstance(instanceName)
    try {
      const response = await fetch(`/api/evolution/delete-instance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName }),
      })

      if (response.ok) {
        onDeleteInstance(instanceName)
      } else {
        const errorData = await response.json()
        console.error("Failed to delete instance:", errorData.error)
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Failed to delete instance:", error)
    } finally {
      setDeletingInstance(null)
    }
  }

  const handleReconnectInstance = async (instanceName: string) => {
    setReconnectingInstance(instanceName)
    try {
      const response = await fetch(`/api/evolution/reconnect-instance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.status === "already_connected") {
          // Instance is already connected, just update the UI
          console.log("Instance is already connected")
        } else if (data.requiresQRScan) {
          // Instance needs QR code scan, redirect to QR flow
          onReconnectInstance(instanceName)
        }
      } else {
        console.error("Failed to reconnect instance:", data.error)
        // Fallback: still try to show QR code for manual reconnection
        onReconnectInstance(instanceName)
      }
    } catch (error) {
      console.error("Failed to reconnect instance:", error)
      // Fallback: still try to show QR code for manual reconnection
      onReconnectInstance(instanceName)
    } finally {
      setReconnectingInstance(null)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {instances.map((instance) => (
        <Card
          key={instance.name}
          className={`cursor-pointer transition-all duration-200 hover:shadow-md card-hover ${
            selectedInstance === instance.name
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-background hover:bg-muted/50"
          }`}
          onClick={() => onSelectInstance(instance.name)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground text-balance">{instance.name}</CardTitle>
              <Badge
                variant={instance.status === "connected" ? "default" : "secondary"}
                className="text-xs font-medium"
              >
                {instance.status === "connected" ? t.connected : "disconnected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {t.connected}: {instance.connectedAt.toLocaleString(language === "tr" ? "tr-TR" : "en-US")}
                </p>
                {instance.status === "disconnected" && (
                  <p className="text-xs text-destructive mt-1 font-medium">
                    {language === "tr" ? "Yeniden bağlanma gerekli" : "Reconnection required"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {instance.status === "disconnected" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReconnectInstance(instance.name)
                    }}
                    disabled={reconnectingInstance === instance.name}
                    className="h-9 w-9 p-0 hover:bg-primary/10"
                    title={t.reconnectBot}
                  >
                    {reconnectingInstance === instance.name ? (
                      <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                    ) : (
                      <QrCode className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="h-9 w-9 p-0 hover:bg-destructive/10"
                      disabled={deletingInstance === instance.name}
                      title={t.deleteBot}
                    >
                      {deletingInstance === instance.name ? (
                        <RefreshCw className="h-4 w-4 text-destructive animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-balance">{t.deleteBot}</AlertDialogTitle>
                      <AlertDialogDescription className="text-pretty">
                        {language === "tr"
                          ? `Bu işlem geri alınamaz. "${instance.name}" botunu kalıcı olarak silmek istediğinizden emin misiniz?`
                          : `This action cannot be undone. Are you sure you want to permanently delete the "${instance.name}" bot?`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteInstance(instance.name)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletingInstance === instance.name ? t.loading : t.delete}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
