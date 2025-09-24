"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Wand2, Copy, CheckCircle, AlertCircle } from "lucide-react"

interface PromptTemplate {
  id: string
  name: string
  description: string
  category: string
  prompt: string
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

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/ai/prompts")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch templates")
      }

      setTemplates(data.templates)
      setCategories(data.categories)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch templates"
      setError(errorMessage)
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
        throw new Error(data.error || "Failed to apply template")
      }

      setCustomPrompt(data.prompt)
      onPromptChange?.(data.prompt)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to apply template"
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
      console.error("Failed to copy prompt:", err)
    }
  }

  const savePromptToWorkflow = async () => {
    if (!customPrompt.trim()) {
      setError("Please enter a custom prompt before saving")
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
        throw new Error(data.error || "Failed to save prompt")
      }

      console.log("[v0] Prompt saved successfully:", data)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

      // Also call the parent callback
      onPromptChange?.(customPrompt)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save prompt"
      console.error("[v0] Error saving prompt:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      applyTemplate(selectedTemplate)
    }
  }, [selectedTemplate])

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          AI Prompt Customizer
        </CardTitle>
        <CardDescription>Customize the AI personality and behavior for "{instanceName}"</CardDescription>
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
              AI prompt saved successfully! Your WhatsApp bot will now use the new personality.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Choose a Template</label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select a prompt template..." />
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
            <label className="text-sm font-medium">Custom Prompt</label>
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
                Clear
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Enter your custom AI prompt here... This will define how your AI assistant behaves and responds to messages."
            value={customPrompt}
            onChange={(e) => {
              setCustomPrompt(e.target.value)
            }}
            className="min-h-[200px] font-mono text-sm"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Customize the AI's personality, tone, and behavior</span>
            <span>{customPrompt.length} characters</span>
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
            Apply Template
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
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Save Prompt
              </>
            )}
          </Button>
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <h4 className="text-sm font-medium text-foreground mb-2">Prompt Tips</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Be specific about the AI's role and responsibilities</li>
            <li>• Include guidelines for tone and communication style</li>
            <li>• Specify how to handle different types of inquiries</li>
            <li>• Add instructions for escalation when needed</li>
            <li>• Test your prompt thoroughly before deploying</li>
            <li>• Click "Save Prompt" to apply changes to your active WhatsApp bot</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
