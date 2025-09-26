"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Settings, Wand2, Copy, CheckCircle, AlertCircle, Play, Pause } from "lucide-react"

interface PromptTemplate {
  id: string
  name: string
  description: string
  category: string
  prompt: string
}

interface WorkflowData {
  id: string
  name: string
  active: boolean
  prompt?: string
}

interface PromptCustomizerProps {
  instanceName: string
  onPromptChange?: (prompt: string) => void
}

export function PromptCustomizer({ instanceName, onPromptChange }: PromptCustomizerProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [workflowEnabled, setWorkflowEnabled] = useState(false)
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null)
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false)
  const [workflowError, setWorkflowError] = useState("")

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/ai/prompts")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Şablonlar yüklenemedi")
      }

      setTemplates(data.templates)
      setCategories(data.categories)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Şablonlar yüklenemedi"
      setError(errorMessage)
    }
  }

  const checkWorkflowStatus = async () => {
    setIsLoadingWorkflow(true)
    setWorkflowError("")

    try {
      console.log("[v0] Checking workflow status for instance:", instanceName)

      const response = await fetch(`/api/n8n/workflow-status?instance=${encodeURIComponent(instanceName)}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 503) {
          setWorkflowError("Workflow servisi şu anda kullanılamıyor")
          return
        }
        throw new Error(data.error || "Workflow durumu kontrol edilemedi")
      }

      if (data.workflows && data.workflows.length > 0) {
        const workflow = data.workflows[0]
        setWorkflowData(workflow)
        setWorkflowEnabled(workflow.active)

        if (workflow.prompt && workflow.prompt.trim()) {
          console.log("[v0] Loading prompt from workflow:", workflow.prompt.substring(0, 100) + "...")
          setCustomPrompt(workflow.prompt)
          onPromptChange?.(workflow.prompt)
        } else {
          console.log("[v0] No prompt found in workflow")
        }
      } else {
        console.log("[v0] No workflows found for instance")
        setWorkflowData(null)
        setWorkflowEnabled(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Workflow durumu kontrol edilemedi"
      console.error("[v0] Error checking workflow status:", errorMessage)
      setWorkflowError(errorMessage)
    } finally {
      setIsLoadingWorkflow(false)
    }
  }

  const toggleWorkflow = async () => {
    if (!workflowData) {
      console.log("[v0] No workflow found, creating new workflow for instance:", instanceName)
      setIsLoadingWorkflow(true)
      try {
        const response = await fetch("/api/n8n/create-workflow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instanceName }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Otomatik yanıt sistemi oluşturulamadı")
        }

        console.log("[v0] Workflow created successfully:", data)
        await checkWorkflowStatus()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Otomatik yanıt sistemi oluşturulamadı"
        setWorkflowError(errorMessage)
      } finally {
        setIsLoadingWorkflow(false)
      }
    } else {
      console.log("[v0] Workflow exists, toggling state for:", workflowData.name)
      setIsLoadingWorkflow(true)
      const newActiveState = !workflowEnabled

      try {
        console.log("[v0] Toggling workflow:", { workflowId: workflowData.id, active: newActiveState })

        const response = await fetch("/api/n8n/toggle-workflow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflowId: workflowData.id,
            active: newActiveState,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Otomatik yanıt durumu değiştirilemedi")
        }

        console.log("[v0] Workflow toggle successful:", data)

        // Update local state immediately
        setWorkflowEnabled(newActiveState)
        setWorkflowData({ ...workflowData, active: newActiveState })

        // Also refresh status to be sure
        setTimeout(() => checkWorkflowStatus(), 1000)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Otomatik yanıt durumu değiştirilemedi"
        console.error("[v0] Error toggling workflow:", errorMessage)
        setWorkflowError(errorMessage)
      } finally {
        setIsLoadingWorkflow(false)
      }
    }
  }

  const applyTemplate = async (templateId: string) => {
    if (!templateId) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/ai/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId,
          instanceName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Şablon uygulanamadı")
      }

      setCustomPrompt(data.prompt)
      onPromptChange?.(data.prompt)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Şablon uygulanamadı"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(customPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Prompt kopyalanamadı:", err)
    }
  }

  const savePromptToWorkflow = async () => {
    if (!customPrompt.trim()) {
      setError("Kaydetmeden önce lütfen özel bir prompt girin")
      return
    }

    setIsSaving(true)
    setError("")
    setSaveSuccess(false)

    try {
      console.log("[v0] Saving prompt to workflow for instance:", instanceName)

      const response = await fetch("/api/n8n/update-workflow-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName,
          customPrompt,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Prompt kaydedilemedi")
      }

      console.log("[v0] Prompt saved successfully:", data)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

      // Also call the parent callback
      onPromptChange?.(customPrompt)

      // Refresh workflow status
      await checkWorkflowStatus()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Prompt kaydedilemedi"
      console.error("[v0] Error saving prompt:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
    checkWorkflowStatus()
  }, [instanceName])

  useEffect(() => {
    if (selectedTemplate) {
      applyTemplate(selectedTemplate)
    }
  }, [selectedTemplate])

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Otomatik Yanıt Kontrolü
          </CardTitle>
          <CardDescription>"{instanceName}" için otomatik Yapay Zeka yanıtlarını aktif/deaktif edin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workflowError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{workflowError}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Otomatik Yapay Zeka Yanıtları</span>
                {workflowData && (
                  <Badge variant={workflowEnabled ? "default" : "secondary"} className="gap-1">
                    {workflowEnabled ? (
                      <>
                        <Play className="h-3 w-3" />
                        Aktif
                      </>
                    ) : (
                      <>
                        <Pause className="h-3 w-3" />
                        Deaktif
                      </>
                    )}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {workflowData
                  ? "WhatsApp mesajlarına otomatik Yapay Zeka yanıtları"
                  : "Henüz otomatik yanıt sistemi oluşturulmamış"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={workflowEnabled} onCheckedChange={toggleWorkflow} disabled={isLoadingWorkflow} />
              {isLoadingWorkflow && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </div>
          </div>

          {workflowData && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Sistem ID: {workflowData.id}</p>
              <p>• Sistem Adı: {workflowData.name}</p>
              <p>
                • Durum: {workflowEnabled ? "Aktif - Mesajlara otomatik yanıt veriyor" : "Deaktif - Manuel kontrol"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Yapay Zeka Prompt Özelleştirici
          </CardTitle>
          <CardDescription>"{instanceName}" için Yapay Zeka kişiliği ve davranışını özelleştirin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {saveSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Yapay Zeka prompt başarıyla kaydedildi! WhatsApp bot'unuz artık yeni kişiliği kullanacak.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Şablon Seçin</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Bir prompt şablonu seçin..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <div key={category}>
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">{category}</div>
                    {templates
                      .filter((t) => t.category === category)
                      .map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex flex-col">
                            <span>{template.name}</span>
                            <span className="text-xs text-muted-foreground">{template.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    <Separator className="my-1" />
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplateData && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{selectedTemplateData.category}</Badge>
                <span className="text-sm font-medium">{selectedTemplateData.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{selectedTemplateData.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Özel Prompt
                {workflowData && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Otomatik Sistemden
                  </Badge>
                )}
              </label>
              <div className="flex gap-2">
                <Button onClick={copyPrompt} variant="outline" size="sm" disabled={!customPrompt}>
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={() => {
                    setCustomPrompt("")
                    setSelectedTemplate("")
                    onPromptChange?.("")
                  }}
                  variant="outline"
                  size="sm"
                  disabled={!customPrompt}
                >
                  Temizle
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Özel Yapay Zeka prompt'unuzu buraya girin... Bu, Yapay Zeka asistanınızın nasıl davranacağını ve mesajlara nasıl yanıt vereceğini tanımlar."
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value)
              }}
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Yapay Zeka'nın kişiliğini, tonunu ve davranışını özelleştirin</span>
              <span>{customPrompt.length} karakter</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => applyTemplate(selectedTemplate)}
              disabled={!selectedTemplate || isLoading}
              variant="outline"
              size="sm"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Şablonu Uygula
            </Button>
            <Button
              onClick={savePromptToWorkflow}
              disabled={!customPrompt.trim() || isSaving}
              className="bg-primary hover:bg-primary/90"
              size="sm"
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Otomatik Sisteme Kaydet
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <h4 className="text-sm font-medium text-foreground mb-2">Prompt İpuçları</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Yapay Zeka'nın rolü ve sorumlulukları hakkında spesifik olun</li>
              <li>• Ton ve iletişim tarzı için yönergeler ekleyin</li>
              <li>• Farklı türdeki sorguları nasıl ele alacağını belirtin</li>
              <li>• Gerektiğinde yönlendirme talimatları ekleyin</li>
              <li>• Dağıtmadan önce prompt'unuzu iyice test edin</li>
              <li>• Değişiklikleri aktif WhatsApp bot'unuza uygulamak için "Otomatik Sisteme Kaydet"e tıklayın</li>
              <li>• Otomatik yanıt aktifken Yapay Zeka otomatik yanıt verir, deaktifken manuel kontrol sağlar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
