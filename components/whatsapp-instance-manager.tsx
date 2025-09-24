"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, TestTube, Workflow, Bot, Plus, MessageSquare, CheckCircle, LogOut } from "lucide-react"
import { InstanceSetup } from "@/components/instance-setup"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { WorkflowManager } from "@/components/workflow-manager"
import { AIChatTester } from "@/components/ai-chat-tester"
import { PromptCustomizer } from "@/components/prompt-customizer"
import { InstanceDashboard } from "@/components/instance-dashboard"
import { InstanceManagement } from "@/components/instance-management"
import { FeatureShowcase } from "@/components/feature-showcase"
import { ProgressSteps } from "@/components/progress-steps"
import { getTranslation, type Translations } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { updateInstanceStatus } from "@/app/actions/update-instance-status"
import { deleteInstance } from "@/app/actions/delete-instance"

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
      setCurrentStep("connected")
    }, 1000)
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
                  <Tabs defaultValue="dashboard" className="space-y-8">
                    <div className="flex items-center justify-between">
                      <TabsList className="grid w-full max-w-3xl grid-cols-5 h-12 bg-muted/50 backdrop-blur-sm">
                        <TabsTrigger value="dashboard" className="gap-2 font-medium">
                          <Settings className="h-4 w-4" />
                          <span className="hidden sm:inline">{t.dashboard}</span>
                        </TabsTrigger>
                        <TabsTrigger value="workflows" className="gap-2 font-medium">
                          <Workflow className="h-4 w-4" />
                          <span className="hidden sm:inline">{t.automations}</span>
                        </TabsTrigger>
                        <TabsTrigger value="ai-config" className="gap-2 font-medium">
                          <Bot className="h-4 w-4" />
                          <span className="hidden sm:inline">{t.aiSettings}</span>
                        </TabsTrigger>
                        <TabsTrigger value="test-chat" className="gap-2 font-medium">
                          <TestTube className="h-4 w-4" />
                          <span className="hidden sm:inline">{t.testChat}</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2 font-medium">
                          <Settings className="h-4 w-4" />
                          <span className="hidden sm:inline">{t.settings}</span>
                        </TabsTrigger>
                      </TabsList>
                      <Badge variant="outline" className="gap-2 px-4 py-2 font-medium border-primary/20 text-primary">
                        <MessageSquare className="h-4 w-4" />
                        {selectedInstance}
                      </Badge>
                    </div>

                    <TabsContent value="dashboard" className="space-y-6">
                      <InstanceDashboard instanceName={selectedInstance} />
                    </TabsContent>

                    <TabsContent value="workflows" className="space-y-6">
                      <WorkflowManager instanceName={selectedInstance} />
                    </TabsContent>

                    <TabsContent value="ai-config" className="space-y-6">
                      <PromptCustomizer instanceName={selectedInstance} onPromptChange={setCustomPrompt} />
                    </TabsContent>

                    <TabsContent value="test-chat" className="space-y-6">
                      <AIChatTester instanceName={selectedInstance} />
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                      <div className="grid gap-8 md:grid-cols-2">
                        <Card className="border-0 bg-card/50 backdrop-blur-sm card-hover">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold">{t.instanceSettings}</CardTitle>
                            <CardDescription>{t.instanceSettingsDesc}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="space-y-3">
                              <label className="text-sm font-semibold text-foreground">{t.instanceName}</label>
                              <div className="p-3 bg-muted/50 rounded-lg border font-mono text-sm">
                                {selectedInstance}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-sm font-semibold text-foreground">{t.status}</label>
                              <Badge variant="default" className="gap-2 px-3 py-1.5">
                                <CheckCircle className="h-4 w-4" />
                                {t.connected}
                              </Badge>
                            </div>
                            <Button
                              onClick={handleCreateNewInstance}
                              variant="outline"
                              className="w-full gap-2 h-11 font-medium bg-transparent"
                            >
                              <Plus className="h-4 w-4" />
                              {t.addNewBot}
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="border-0 bg-card/50 backdrop-blur-sm card-hover">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold">{t.apiConfiguration}</CardTitle>
                            <CardDescription>{t.apiConfigurationDesc}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="space-y-3">
                              <label className="text-sm font-semibold text-foreground">{t.messagingService}</label>
                              <div className="p-3 bg-muted/50 rounded-lg border text-sm font-mono break-all">
                                https://evolu.cetoloji.com
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-sm font-semibold text-foreground">{t.automationPlatform}</label>
                              <div className="p-3 bg-muted/50 rounded-lg border text-sm font-mono break-all">
                                https://n8nx.cetoloji.com
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-sm font-semibold text-foreground">{t.webhookUrl}</label>
                              <div className="p-3 bg-muted/50 rounded-lg border text-sm font-mono break-all">
                                /api/webhooks/whatsapp/{selectedInstance}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
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
