"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  Bot,
} from "lucide-react"

interface InstanceStats {
  messagesReceived: number
  messagesReplied: number
  activeConversations: number
  responseTime: string
  uptime: string
  lastActivity: string
}

interface InstanceDashboardProps {
  instanceName: string
}

export function InstanceDashboard({ instanceName }: InstanceDashboardProps) {
  const [stats, setStats] = useState<InstanceStats>({
    messagesReceived: 0,
    messagesReplied: 0,
    activeConversations: 0,
    responseTime: "0s",
    uptime: "0m",
    lastActivity: "Never",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [instanceStatus, setInstanceStatus] = useState<"connected" | "disconnected" | "connecting">("connecting")

  const fetchInstanceStatus = async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch(`/api/evolution/status?instance=${encodeURIComponent(instanceName)}`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (response.ok) {
        setInstanceStatus(data.status)
        setError("")
        console.log("[v0] Instance status updated:", data.status)
      } else {
        throw new Error(data.error || "Failed to fetch status")
      }
    } catch (err) {
      console.error("[v0] Error checking instance status:", err)

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Request timeout - please try again")
        } else if (err.message.includes("fetch")) {
          setError("Network error - retrying...")
        } else {
          setError(err.message)
          setInstanceStatus("disconnected")
        }
      } else {
        setError("Failed to fetch instance status")
        setInstanceStatus("disconnected")
      }
    }
  }

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      // Simulate fetching stats (in production, this would come from your analytics/logging system)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data - replace with actual API calls
      setStats({
        messagesReceived: Math.floor(Math.random() * 100) + 50,
        messagesReplied: Math.floor(Math.random() * 80) + 40,
        activeConversations: Math.floor(Math.random() * 20) + 5,
        responseTime: `${Math.floor(Math.random() * 3) + 1}s`,
        uptime: `${Math.floor(Math.random() * 24) + 1}h ${Math.floor(Math.random() * 60)}m`,
        lastActivity: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
      })
    } catch (err) {
      console.error("Error fetching stats:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInstanceStatus()
    fetchStats()

    const statusInterval = setInterval(fetchInstanceStatus, 10000) // Every 10 seconds instead of 30
    const statsInterval = setInterval(fetchStats, 60000) // Every minute

    return () => {
      clearInterval(statusInterval)
      clearInterval(statsInterval)
    }
  }, [instanceName])

  const getStatusBadge = () => {
    switch (instanceStatus) {
      case "connected":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
        )
      case "connecting":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Connecting...
          </Badge>
        )
      default:
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Disconnected
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Instance Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Bot Overview
              </CardTitle>
              <CardDescription>Real-time status and performance metrics for "{instanceName}"</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button
                onClick={() => {
                  fetchInstanceStatus()
                  fetchStats()
                }}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Messages Received</span>
              </div>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.messagesReceived}</div>
              <p className="text-xs text-muted-foreground">Total incoming messages</p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">AI Replies</span>
              </div>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.messagesReplied}</div>
              <p className="text-xs text-muted-foreground">Automated responses sent</p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Active Chats</span>
              </div>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.activeConversations}</div>
              <p className="text-xs text-muted-foreground">Ongoing conversations</p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.responseTime}</div>
              <p className="text-xs text-muted-foreground">Average AI response time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Response Rate</span>
              <span className="text-sm text-muted-foreground">
                {stats.messagesReceived > 0 ? Math.round((stats.messagesReplied / stats.messagesReceived) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${stats.messagesReceived > 0 ? (stats.messagesReplied / stats.messagesReceived) * 100 : 0}%`,
                }}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-medium">{stats.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Last Activity</span>
                <span className="text-sm font-medium">{stats.lastActivity}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">WhatsApp Connection</span>
                <Badge variant={instanceStatus === "connected" ? "default" : "destructive"} className="text-xs">
                  {instanceStatus === "connected" ? "Healthy" : "Issues"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Smart Automation</span>
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Service</span>
                <Badge variant="default" className="text-xs">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Message Receiver</span>
                <Badge variant="default" className="text-xs">
                  Receiving
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="rounded-lg bg-muted/50 p-3">
              <h4 className="text-sm font-medium text-foreground mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Message Logs
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Activity className="mr-2 h-4 w-4" />
                  Performance Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
