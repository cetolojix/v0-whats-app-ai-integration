"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, TestTube, Bot, Plus, MessageSquare, LogOut } from "lucide-react"
import { InstanceSetup } from "@/components/instance-setup"
import { QRCodeDisplay } from "@/components/qr-code-display"
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
    setCurrentStep("connected")
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
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/90 sticky top-0 z-50 relative">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/30">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold neon-text">WhatsApp Yapay Zeka</span>
                <div className="text-xs text-muted-foreground font-medium">Otomasyon Platformu</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground font-medium">
                Hoş geldiniz, <span className="text-neon-cyan">{profile?.full_name || user.email}</span>
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="hologram-card hover:bg-secondary/30 transition-all duration-300 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-10 relative z-10">
        {/* Floating elements for visual appeal */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-neon-cyan rounded-full floating-element opacity-80 shadow-lg shadow-neon-cyan/50"></div>
        <div className="absolute top-40 right-20 w-6 h-6 border-2 border-neon-purple rounded-full floating-element opacity-70 shadow-lg shadow-neon-purple/30"></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-tech-orange rounded-full floating-element opacity-80 shadow-lg shadow-tech-orange/50"></div>

        <div className="mx-auto max-w-7xl space-y-10">
          {connectedInstances.length > 0 && currentStep !== "qr" && (
            <Card className="hologram-card border-0 bg-gradient-to-r from-green-50/10 to-emerald-50/10 backdrop-blur-sm shadow-2xl animate-fade-in">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold neon-text text-balance">Bağlı Bot'larınız</CardTitle>
                    <CardDescription className="text-neon-cyan font-medium text-lg">
                      {connectedInstances.length} WhatsApp bot'u aktif
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleCreateNewInstance}
                    className="tech-button gap-2 px-6 py-3 text-white font-bold shadow-2xl shadow-neon-blue/30"
                  >
                    <Plus className="h-5 w-5" />
                    Yeni Bot Ekle
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
                      <TabsList className="hologram-card grid w-full max-w-2xl grid-cols-3 h-14 bg-background/50 backdrop-blur-sm border-0 shadow-lg">
                        <TabsTrigger
                          value="dashboard"
                          className="gap-2 font-medium text-sm data-[state=active]:bg-neon-blue/20 data-[state=active]:text-neon-cyan"
                        >
                          <Settings className="h-4 w-4" />
                          <span className="hidden sm:inline">Kontrol Paneli</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="ai-config"
                          className="gap-2 font-medium text-sm data-[state=active]:bg-neon-blue/20 data-[state=active]:text-neon-cyan"
                        >
                          <Bot className="h-4 w-4" />
                          <span className="hidden sm:inline">Yapay Zeka Ayarları</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="test-chat"
                          className="gap-2 font-medium text-sm data-[state=active]:bg-neon-blue/20 data-[state=active]:text-neon-cyan"
                        >
                          <TestTube className="h-4 w-4" />
                          <span className="hidden sm:inline">Sohbet Testi</span>
                        </TabsTrigger>
                      </TabsList>
                      <Badge
                        variant="outline"
                        className="hologram-card gap-2 px-4 py-2 font-medium border-neon-cyan/30 text-neon-cyan bg-background/50 backdrop-blur-sm"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {selectedInstance}
                      </Badge>
                    </div>

                    <TabsContent value="dashboard" className="space-y-6">
                      <InstanceDashboard instanceName={selectedInstance} />
                    </TabsContent>

                    <TabsContent value="ai-config" className="space-y-6">
                      <PromptCustomizer instanceName={selectedInstance} onPromptChange={setCustomPrompt} />
                    </TabsContent>

                    <TabsContent value="test-chat" className="space-y-6">
                      <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8 space-y-4">
                          <div className="relative">
                            <h3 className="text-4xl font-bold tech-gradient text-balance">Yapay Zeka Sohbet Testi</h3>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-px data-stream"></div>
                          </div>
                          <p className="text-xl text-foreground/80 text-balance leading-relaxed">
                            Yapay Zeka bot'unuzun yanıtlarını WhatsApp'a göndermeden önce test edin.
                            <span className="text-neon-cyan font-semibold">
                              {" "}
                              Mükemmel performans için optimize edin.
                            </span>
                          </p>
                        </div>
                        <AIChatTester instanceName={selectedInstance} customPrompt={customPrompt} />
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
