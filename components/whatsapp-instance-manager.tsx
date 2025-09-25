"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, MessageSquare, LogOut, Bot, Loader2 } from "lucide-react"
import { InstanceSetup } from "@/components/instance-setup"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { AIChatTester } from "@/components/ai-chat-tester"
import { InstanceManagement } from "@/components/instance-management"
import { FeatureShowcase } from "@/components/feature-showcase"
import { ProgressSteps } from "@/components/progress-steps"
import { getTranslation, type Translations } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { updateInstanceStatus } from "@/app/actions/update-instance-status"
import { deleteInstance } from "@/app/actions/delete-instance"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Instance {
  id: string
  instance_name: string
  instance_key: string
  status: string
  workflow_id: string | null
  workflow_name: string | null
  created_at: string
}

interface ConnectedInstance {
  name: string
  connectedAt: Date
  status: "connected" | "disconnected"
}

interface WhatsAppInstanceManagerProps {
  user: any
  profile: any
  instances: Instance[]
}

export function WhatsAppInstanceManager({ user, profile, instances }: WhatsAppInstanceManagerProps) {
  const [currentStep, setCurrentStep] = useState<"setup" | "qr" | "connected">("setup")
  const [instanceName, setInstanceName] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [activeInstanceName, setActiveInstanceName] = useState("")
  const [connectedInstances, setConnectedInstances] = useState<ConnectedInstance[]>([])
  const [selectedInstance, setSelectedInstance] = useState<string>("")
  const [language, setLanguage] = useState("tr")
  const [t, setT] = useState<Translations>(getTranslation("tr"))
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false)
  const [isSavingPrompt, setIsSavingPrompt] = useState(false)
  const [promptError, setPromptError] = useState("")
  const [promptSuccess, setPromptSuccess] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") || "tr"
    setLanguage(savedLanguage)
    setT(getTranslation(savedLanguage))
  }, [])

  useEffect(() => {
    setT(getTranslation(language))
  }, [language])

  useEffect(() => {
    const loadInstancesFromDatabase = () => {
      if (instances && instances.length > 0) {
        const connectedInstancesList: ConnectedInstance[] = instances.map((inst) => ({
          name: inst.instance_name,
          connectedAt: new Date(inst.created_at),
          status: inst.status === "open" ? "connected" : "disconnected",
        }))

        setConnectedInstances(connectedInstancesList)

        // If we have connected instances, set the first one as selected
        const connectedInstance = connectedInstancesList.find((inst) => inst.status === "connected")
        if (connectedInstance) {
          setSelectedInstance(connectedInstance.name)
          setActiveInstanceName(connectedInstance.name)
          setCurrentStep("connected")
        }
      }
    }

    loadInstancesFromDatabase()
  }, [instances])

  useEffect(() => {
    if (selectedInstance) {
      loadCurrentPrompt(selectedInstance)
    }
  }, [selectedInstance])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleInstanceConnected = async (connectedInstanceName: string) => {
    console.log("[v0] handleInstanceConnected called with:", connectedInstanceName)

    try {
      await updateInstanceStatus(connectedInstanceName, "open")
    } catch (err) {
      console.error("[v0] Failed to update instance status:", err)
    }

    const newInstance: ConnectedInstance = {
      name: connectedInstanceName,
      connectedAt: new Date(),
      status: "connected",
    }

    setConnectedInstances((prev) => {
      const exists = prev.find((inst) => inst.name === connectedInstanceName)
      if (exists) {
        return prev.map((inst) =>
          inst.name === connectedInstanceName
            ? { ...inst, status: "connected" as const, connectedAt: new Date() }
            : inst,
        )
      } else {
        return [...prev, newInstance]
      }
    })

    setActiveInstanceName(connectedInstanceName)
    setSelectedInstance(connectedInstanceName)

    setTimeout(() => {
      console.log("[v0] Transitioning to connected state for:", connectedInstanceName)
      setCurrentStep("connected")
    }, 2000) // Reduced from 5000ms to 2000ms
  }

  const handleCreateNewInstance = () => {
    setCurrentStep("setup")
    setInstanceName("")
    setActiveInstanceName("")
  }

  const handleSelectInstance = (instanceName: string) => {
    setSelectedInstance(instanceName)
    setActiveInstanceName(instanceName)
  }

  const handleDeleteInstance = async (instanceName: string) => {
    try {
      await deleteInstance(instanceName)
    } catch (err) {
      console.error("[v0] Failed to delete instance:", err)
      return
    }

    setConnectedInstances((prev) => prev.filter((inst) => inst.name !== instanceName))
    if (selectedInstance === instanceName) {
      const remaining = connectedInstances.filter((inst) => inst.name !== instanceName)
      if (remaining.length > 0) {
        setSelectedInstance(remaining[0].name)
        setActiveInstanceName(remaining[0].name)
      } else {
        setSelectedInstance("")
        setActiveInstanceName("")
        setCurrentStep("setup")
      }
    }
  }

  const handleReconnectInstance = (instanceName: string) => {
    setInstanceName(instanceName)
    setCurrentStep("qr")
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    localStorage.setItem("preferred-language", newLanguage)
  }

  const loadCurrentPrompt = async (instanceName: string) => {
    setIsLoadingPrompt(true)
    setPromptError("")

    try {
      const response = await fetch("/api/n8n/get-workflow-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ instanceName }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentPrompt(data.prompt || "")
      } else {
        // Prompt bulunamazsa varsayılan prompt kullan
        setCurrentPrompt(`Sen ${instanceName} için akıllı bir WhatsApp asistanısın. 

Görevin:
- Kullanıcılara yardımcı olmak
- Sorularını yanıtlamak
- Profesyonel ve dostane bir dil kullanmak
- Türkçe konuşmak

Her zaman nazik ve yardımsever ol.`)
      }
    } catch (error) {
      console.error("Prompt yüklenirken hata:", error)
      setPromptError("Prompt yüklenemedi")
    } finally {
      setIsLoadingPrompt(false)
    }
  }

  const savePrompt = async () => {
    if (!selectedInstance || !currentPrompt.trim()) return

    setIsSavingPrompt(true)
    setPromptError("")
    setPromptSuccess("")

    try {
      const response = await fetch("/api/n8n/update-workflow-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName: selectedInstance,
          customPrompt: currentPrompt,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPromptSuccess("AI prompt başarıyla kaydedildi!")
        setTimeout(() => setPromptSuccess(""), 3000)
      } else {
        setPromptError(data.error || "Prompt kaydedilemedi")
      }
    } catch (error) {
      console.error("Prompt kaydedilirken hata:", error)
      setPromptError("Prompt kaydedilemedi")
    } finally {
      setIsSavingPrompt(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp AI Kontrol Paneli</h1>
                <p className="text-sm text-gray-500">WhatsApp bot instance'larınızı yönetin</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Hoş geldiniz, {profile?.full_name || user.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-10">
          {connectedInstances.length > 0 && currentStep !== "qr" && (
            <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg animate-fade-in">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-green-800 text-balance">{t.connectedBots}</CardTitle>
                    <CardDescription className="text-green-600 font-medium">
                      {connectedInstances.length} WhatsApp {t.instances} {t.connected}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleCreateNewInstance}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    {t.addBot}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <InstanceManagement
                  instances={connectedInstances}
                  selectedInstance={selectedInstance}
                  language={language}
                  onSelectInstance={handleSelectInstance}
                  onDeleteInstance={handleDeleteInstance}
                  onReconnectInstance={handleReconnectInstance}
                />
              </CardContent>
            </Card>
          )}

          {(currentStep === "setup" || currentStep === "qr") && (
            <ProgressSteps currentStep={currentStep} language={language} />
          )}

          {connectedInstances.length === 0 && currentStep !== "qr" && <FeatureShowcase language={language} />}

          {/* Main Setup/Management Area */}
          <div className="space-y-8">
            {currentStep === "setup" && (
              <div className="space-y-8 animate-fade-in">
                <InstanceSetup
                  instanceName={instanceName}
                  setInstanceName={setInstanceName}
                  onNext={() => setCurrentStep("qr")}
                />
              </div>
            )}

            {currentStep === "qr" && (
              <div className="animate-fade-in">
                <QRCodeDisplay instanceName={instanceName} onConnected={handleInstanceConnected} language={language} />
              </div>
            )}

            {connectedInstances.length > 0 && currentStep !== "setup" && currentStep !== "qr" && (
              <div className="space-y-8 animate-fade-in">
                {selectedInstance && (
                  <Tabs defaultValue="ai-prompt" className="space-y-8">
                    <div className="flex items-center justify-between">
                      <TabsList className="grid w-full max-w-lg grid-cols-2 h-12 bg-muted/50 backdrop-blur-sm">
                        <TabsTrigger value="ai-prompt" className="gap-2 font-medium">
                          <Bot className="h-4 w-4" />
                          <span>AI Prompt</span>
                        </TabsTrigger>
                        <TabsTrigger value="test-chat" className="gap-2 font-medium">
                          <MessageSquare className="h-4 w-4" />
                          <span>Test Sohbet</span>
                        </TabsTrigger>
                      </TabsList>
                      <Badge variant="outline" className="gap-2 px-4 py-2 font-medium border-primary/20 text-primary">
                        <MessageSquare className="h-4 w-4" />
                        {selectedInstance}
                      </Badge>
                    </div>

                    <TabsContent value="ai-prompt" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            AI Agent Prompt Ayarları
                          </CardTitle>
                          <CardDescription>
                            AI asistanınızın nasıl davranacağını ve hangi görevleri yerine getireceğini belirleyin. Bu
                            prompt hem WhatsApp mesajları hem de test sohbeti için kullanılacak.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {isLoadingPrompt ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              <span>Mevcut prompt yükleniyor...</span>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">AI Agent Prompt</label>
                                <Textarea
                                  placeholder="AI asistanınızın rolünü ve görevlerini tanımlayın..."
                                  value={currentPrompt}
                                  onChange={(e) => setCurrentPrompt(e.target.value)}
                                  className="min-h-[200px] resize-none"
                                  disabled={isSavingPrompt}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Örnek: "Sen müşteri hizmetleri asistanısın. Ürünlerimiz hakkında bilgi ver,
                                  siparişleri takip et ve müşterilere yardım et."
                                </p>
                              </div>

                              {promptError && (
                                <Alert variant="destructive">
                                  <AlertDescription>{promptError}</AlertDescription>
                                </Alert>
                              )}

                              {promptSuccess && (
                                <Alert className="border-green-200 bg-green-50">
                                  <AlertDescription className="text-green-800">{promptSuccess}</AlertDescription>
                                </Alert>
                              )}

                              <div className="flex justify-end">
                                <Button
                                  onClick={savePrompt}
                                  disabled={!currentPrompt.trim() || isSavingPrompt}
                                  className="gap-2"
                                >
                                  {isSavingPrompt ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Kaydediliyor...
                                    </>
                                  ) : (
                                    <>
                                      <Bot className="h-4 w-4" />
                                      Prompt'u Kaydet
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="test-chat" className="space-y-6">
                      <AIChatTester instanceName={selectedInstance} />
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
