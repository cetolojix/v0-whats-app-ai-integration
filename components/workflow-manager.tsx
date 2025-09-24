"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Workflow,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
  ExternalLink,
} from "lucide-react"

interface WorkflowData {
  id: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  nodes: number
}

interface WorkflowManagerProps {
  instanceName: string
}

export function WorkflowManager({ instanceName }: WorkflowManagerProps) {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchWorkflows = async () => {
    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Fetching workflows for instance:", instanceName)
      const response = await fetch(`/api/n8n/workflow-status?instance=${encodeURIComponent(instanceName)}`)

      console.log("[v0] Workflow API response status:", response.status)
      console.log("[v0] Workflow API response headers:", Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log("[v0] Workflow API response data:", data)

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error(`Automation service is currently unavailable: ${data.details || data.error}`)
        }
        throw new Error(data.error || "Failed to fetch automations")
      }

      setWorkflows(data.workflows || [])
      console.log("[v0] Workflows loaded:", data.workflows?.length || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch automations"
      console.error("[v0] Workflow fetch error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch("/api/n8n/delete-workflow", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workflowId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete automation")
      }

      // Refresh workflows list
      await fetchWorkflows()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete automation"
      setError(errorMessage)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [instanceName])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Loading workflows...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Smart Automations
            </CardTitle>
            <CardDescription>Automation workflows for "{instanceName}"</CardDescription>
          </div>
          <Button onClick={fetchWorkflows} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {workflows.length === 0 ? (
          <div className="text-center py-8">
            <Workflow className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Automations Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No smart automations have been created for this bot yet.
            </p>
            <Button
              onClick={() => {
                // Trigger workflow creation
                fetch("/api/n8n/create-workflow", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ instanceName }),
                }).then(() => fetchWorkflows())
              }}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Create Automation
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-foreground">{workflow.name}</h4>
                      <Badge variant={workflow.active ? "default" : "secondary"} className="gap-1">
                        {workflow.active ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <Pause className="h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{workflow.nodes} steps</span>
                      <span>Created {new Date(workflow.createdAt).toLocaleDateString()}</span>
                      <span>Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => window.open(`https://n8nx.cetoloji.com/workflow/${workflow.id}`, "_blank")}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteWorkflow(workflow.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="rounded-lg bg-muted/50 p-3">
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Settings className="h-4 w-4" />
            Automation Features
          </h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Automatic AI response generation</li>
            <li>• Message filtering and categorization</li>
            <li>• Real-time WhatsApp integration</li>
            <li>• Custom business logic support</li>
            <li>• Error handling and retry mechanisms</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
