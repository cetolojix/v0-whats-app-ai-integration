"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bot,
  Settings,
  Brain,
  Clock,
  MessageSquare,
  TrendingUp,
  Shield,
  Zap,
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
  Target,
  Filter,
} from "lucide-react"

interface AIConfig {
  model: string
  temperature: number
  maxTokens: number
  responseDelay: number
  autoReply: boolean
  smartFiltering: boolean
  contextMemory: boolean
  multiLanguage: boolean
  customInstructions: string
  triggerKeywords: string[]
  blacklistKeywords: string[]
  businessHours: {
    enabled: boolean
    timezone: string
    schedule: Record<string, { start: string; end: string; enabled: boolean }>
  }
  fallbackMessage: string
  escalationTriggers: string[]
  analytics: {
    trackConversations: boolean
    trackResponseTime: boolean
    trackUserSatisfaction: boolean
    generateReports: boolean
  }
}

interface AIAnalytics {
  summary: {
    totalMessages: number
    aiMessages: number
    userMessages: number
    avgResponseTime: number
    responseRate: number
  }
  modelUsage: Record<string, number>
  dailyStats: Array<{
    date: string
    totalMessages: number
    aiMessages: number
    userMessages: number
    avgResponseTime: number
  }>
  timeframe: string
}

interface AIConfigurationDashboardProps {
  instanceName: string
}

export function AIConfigurationDashboard({ instanceName }: AIConfigurationDashboardProps) {
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("7d")

  const fetchConfig = async () => {
    try {
      const response = await fetch(`/api/ai/config?instance=${encodeURIComponent(instanceName)}`)
      const data = await response.json()

      if (response.ok) {
        setConfig(data.config)
      } else {
        setError(data.error || "Failed to fetch configuration")
      }
    } catch (err) {
      setError("Failed to fetch AI configuration")
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/ai/analytics?instance=${encodeURIComponent(instanceName)}&timeframe=${analyticsTimeframe}`,
      )
      const data = await response.json()

      if (response.ok) {
        setAnalytics(data.analytics)
      } else {
        console.error("Failed to fetch analytics:", data.error)
      }
    } catch (err) {
      console.error("Failed to fetch AI analytics:", err)
    }
  }

  const saveConfig = async () => {
    if (!config) return

    setSaving(true)
    setError("")
    setSaveSuccess(false)

    try {
      const response = await fetch("/api/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceName,
          config,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setError(data.error || "Failed to save configuration")
      }
    } catch (err) {
      setError("Failed to save AI configuration")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchConfig(), fetchAnalytics()])
      setIsLoading(false)
    }
    loadData()
  }, [instanceName, analyticsTimeframe])

  const updateConfig = (updates: Partial<AIConfig>) => {
    if (config) {
      setConfig({ ...config, ...updates })
    }
  }

  const updateKeywords = (type: "triggerKeywords" | "blacklistKeywords" | "escalationTriggers", value: string) => {
    if (config) {
      const keywords = value
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0)
      setConfig({ ...config, [type]: keywords })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading AI configuration...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load AI configuration. Please try again.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Configuration
          </h2>
          <p className="text-muted-foreground">Configure AI behavior and settings for "{instanceName}"</p>
        </div>
        <Button onClick={saveConfig} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            AI configuration saved successfully! Changes will take effect immediately.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="model" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="model" className="gap-2">
            <Bot className="h-4 w-4" />
            Model
          </TabsTrigger>
          <TabsTrigger value="behavior" className="gap-2">
            <Settings className="h-4 w-4" />
            Behavior
          </TabsTrigger>
          <TabsTrigger value="triggers" className="gap-2">
            <Filter className="h-4 w-4" />
            Triggers
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Model Configuration */}
        <TabsContent value="model" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Model Settings
                </CardTitle>
                <CardDescription>Configure the AI model and its parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>AI Model</Label>
                  <Select value={config.model} onValueChange={(value) => updateConfig({ model: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Temperature: {config.temperature}</Label>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={([value]) => updateConfig({ temperature: value })}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower values make responses more focused, higher values more creative
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Max Tokens: {config.maxTokens}</Label>
                  <Slider
                    value={[config.maxTokens]}
                    onValueChange={([value]) => updateConfig({ maxTokens: value })}
                    max={2000}
                    min={100}
                    step={50}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Maximum length of AI responses</p>
                </div>

                <div className="space-y-2">
                  <Label>Response Delay: {config.responseDelay}ms</Label>
                  <Slider
                    value={[config.responseDelay]}
                    onValueChange={([value]) => updateConfig({ responseDelay: value })}
                    max={10000}
                    min={0}
                    step={500}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Artificial delay before sending responses (makes it feel more human)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Custom Instructions
                </CardTitle>
                <CardDescription>Define the AI's personality and behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={config.customInstructions}
                  onChange={(e) => updateConfig({ customInstructions: e.target.value })}
                  placeholder="Enter custom instructions for the AI assistant..."
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">{config.customInstructions.length} characters</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavior Configuration */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Response Behavior
                </CardTitle>
                <CardDescription>Configure how the AI responds to messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Reply</Label>
                    <p className="text-xs text-muted-foreground">Automatically respond to all messages</p>
                  </div>
                  <Switch
                    checked={config.autoReply}
                    onCheckedChange={(checked) => updateConfig({ autoReply: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Smart Filtering</Label>
                    <p className="text-xs text-muted-foreground">Filter spam and irrelevant messages</p>
                  </div>
                  <Switch
                    checked={config.smartFiltering}
                    onCheckedChange={(checked) => updateConfig({ smartFiltering: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Context Memory</Label>
                    <p className="text-xs text-muted-foreground">Remember conversation history</p>
                  </div>
                  <Switch
                    checked={config.contextMemory}
                    onCheckedChange={(checked) => updateConfig({ contextMemory: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Multi-Language Support</Label>
                    <p className="text-xs text-muted-foreground">Detect and respond in user's language</p>
                  </div>
                  <Switch
                    checked={config.multiLanguage}
                    onCheckedChange={(checked) => updateConfig({ multiLanguage: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Fallback & Escalation
                </CardTitle>
                <CardDescription>Handle edge cases and escalations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Fallback Message</Label>
                  <Textarea
                    value={config.fallbackMessage}
                    onChange={(e) => updateConfig({ fallbackMessage: e.target.value })}
                    placeholder="Message to send when AI cannot respond..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Escalation Triggers</Label>
                  <Input
                    value={config.escalationTriggers.join(", ")}
                    onChange={(e) => updateKeywords("escalationTriggers", e.target.value)}
                    placeholder="human, manager, complaint, escalate"
                  />
                  <p className="text-xs text-muted-foreground">Keywords that trigger human handoff (comma-separated)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Triggers Configuration */}
        <TabsContent value="triggers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Trigger Keywords
                </CardTitle>
                <CardDescription>Keywords that activate AI responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Activation Keywords</Label>
                  <Input
                    value={config.triggerKeywords.join(", ")}
                    onChange={(e) => updateKeywords("triggerKeywords", e.target.value)}
                    placeholder="help, support, info, question"
                  />
                  <p className="text-xs text-muted-foreground">
                    Messages containing these keywords will trigger AI responses
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Current Triggers</Label>
                  <div className="flex flex-wrap gap-2">
                    {config.triggerKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Blacklist Keywords
                </CardTitle>
                <CardDescription>Keywords that prevent AI responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Blocked Keywords</Label>
                  <Input
                    value={config.blacklistKeywords.join(", ")}
                    onChange={(e) => updateKeywords("blacklistKeywords", e.target.value)}
                    placeholder="spam, advertisement, promotion"
                  />
                  <p className="text-xs text-muted-foreground">Messages containing these keywords will be ignored</p>
                </div>

                <div className="space-y-2">
                  <Label>Current Blacklist</Label>
                  <div className="flex flex-wrap gap-2">
                    {config.blacklistKeywords.map((keyword, index) => (
                      <Badge key={index} variant="destructive">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule Configuration */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Business Hours
              </CardTitle>
              <CardDescription>Configure when the AI should be active</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Business Hours</Label>
                  <p className="text-xs text-muted-foreground">Only respond during business hours</p>
                </div>
                <Switch
                  checked={config.businessHours.enabled}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      businessHours: { ...config.businessHours, enabled: checked },
                    })
                  }
                />
              </div>

              {config.businessHours.enabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={config.businessHours.timezone}
                      onValueChange={(value) =>
                        updateConfig({
                          businessHours: { ...config.businessHours, timezone: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Weekly Schedule</Label>
                    {Object.entries(config.businessHours.schedule).map(([day, schedule]) => (
                      <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-20 font-medium capitalize">{day}</div>
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={(checked) => {
                            const newSchedule = {
                              ...config.businessHours.schedule,
                              [day]: { ...schedule, enabled: checked },
                            }
                            updateConfig({
                              businessHours: { ...config.businessHours, schedule: newSchedule },
                            })
                          }}
                        />
                        {schedule.enabled && (
                          <>
                            <Input
                              type="time"
                              value={schedule.start}
                              onChange={(e) => {
                                const newSchedule = {
                                  ...config.businessHours.schedule,
                                  [day]: { ...schedule, start: e.target.value },
                                }
                                updateConfig({
                                  businessHours: { ...config.businessHours, schedule: newSchedule },
                                })
                              }}
                              className="w-32"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={schedule.end}
                              onChange={(e) => {
                                const newSchedule = {
                                  ...config.businessHours.schedule,
                                  [day]: { ...schedule, end: e.target.value },
                                }
                                updateConfig({
                                  businessHours: { ...config.businessHours, schedule: newSchedule },
                                })
                              }}
                              className="w-32"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">AI Performance Analytics</h3>
              <p className="text-muted-foreground">Monitor AI response patterns and performance</p>
            </div>
            <Select value={analyticsTimeframe} onValueChange={setAnalyticsTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {analytics && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Messages</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">{analytics.summary.totalMessages}</div>
                  <p className="text-xs text-muted-foreground">All conversations</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">AI Responses</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">{analytics.summary.aiMessages}</div>
                  <p className="text-xs text-muted-foreground">{analytics.summary.responseRate}% response rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Avg Response Time</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">{analytics.summary.avgResponseTime}ms</div>
                  <p className="text-xs text-muted-foreground">Processing time</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">User Messages</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">{analytics.summary.userMessages}</div>
                  <p className="text-xs text-muted-foreground">Incoming messages</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Analytics Settings
              </CardTitle>
              <CardDescription>Configure what data to track and analyze</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Track Conversations</Label>
                  <p className="text-xs text-muted-foreground">Monitor conversation patterns and topics</p>
                </div>
                <Switch
                  checked={config.analytics.trackConversations}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      analytics: { ...config.analytics, trackConversations: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Track Response Time</Label>
                  <p className="text-xs text-muted-foreground">Measure AI processing and response times</p>
                </div>
                <Switch
                  checked={config.analytics.trackResponseTime}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      analytics: { ...config.analytics, trackResponseTime: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Track User Satisfaction</Label>
                  <p className="text-xs text-muted-foreground">Collect feedback on AI responses</p>
                </div>
                <Switch
                  checked={config.analytics.trackUserSatisfaction}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      analytics: { ...config.analytics, trackUserSatisfaction: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Generate Reports</Label>
                  <p className="text-xs text-muted-foreground">Create automated performance reports</p>
                </div>
                <Switch
                  checked={config.analytics.generateReports}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      analytics: { ...config.analytics, generateReports: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
