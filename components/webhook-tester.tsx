"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Send, TestTube, CheckCircle, XCircle } from "lucide-react"

interface WebhookTesterProps {
  instanceKey: string
}

export function WebhookTester({ instanceKey }: WebhookTesterProps) {
  const [testMessage, setTestMessage] = useState("")
  const [testPhone, setTestPhone] = useState("+1234567890")
  const [isLoading, setIsLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const handleSendTest = async () => {
    if (!testMessage.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/webhooks/whatsapp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceKey,
          message: testMessage,
          from: testPhone,
        }),
      })

      const result = await response.json()
      setLastResult(result)

      if (result.success) {
        setTestMessage("")
      }
    } catch (error) {
      setLastResult({
        success: false,
        error: "Failed to send test message",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Webhook Tester
        </CardTitle>
        <CardDescription>Test your WhatsApp webhook integration by sending mock messages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="test-phone">Test Phone Number</Label>
            <Input
              id="test-phone"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+1234567890"
            />
          </div>
          <div className="space-y-2">
            <Label>Instance Key</Label>
            <div className="p-2 bg-muted rounded-md text-sm font-mono">{instanceKey}</div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-message">Test Message</Label>
          <Textarea
            id="test-message"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter a test message to send..."
            rows={3}
          />
        </div>

        <Button onClick={handleSendTest} disabled={isLoading || !testMessage.trim()} className="w-full gap-2">
          <Send className="h-4 w-4" />
          {isLoading ? "Sending Test..." : "Send Test Message"}
        </Button>

        {lastResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {lastResult.success ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Success
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Failed
                </Badge>
              )}
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <pre className="text-xs overflow-auto">{JSON.stringify(lastResult, null, 2)}</pre>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Webhook URL:</strong> /api/webhooks/whatsapp/{instanceKey}
          </p>
          <p>
            <strong>Verification Token:</strong> Set WHATSAPP_VERIFY_TOKEN in environment variables
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
