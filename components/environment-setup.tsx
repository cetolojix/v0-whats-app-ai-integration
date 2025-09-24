"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Copy, Eye, EyeOff } from "lucide-react"

interface EnvironmentSetupProps {
  onComplete?: () => void
}

export function EnvironmentSetup({ onComplete }: EnvironmentSetupProps) {
  const [showKeys, setShowKeys] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const envVars = [
    {
      key: "NEXT_PUBLIC_APP_URL",
      value: "http://localhost:3000",
      description: "Your application URL for message notifications",
      required: true,
    },
    {
      key: "OPENAI_API_KEY",
      value:
        "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",
      description: "OpenAI API key for AI chat responses",
      required: true,
    },
  ]

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Environment Configuration Required
        </CardTitle>
        <CardDescription>
          Please add these environment variables to your Vercel project settings to enable full functionality.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Go to your Vercel project dashboard → Settings → Environment Variables to add these values.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {envVars.map((envVar) => (
            <div key={envVar.key} className="space-y-2">
              <Label htmlFor={envVar.key} className="text-sm font-medium">
                {envVar.key}
                {envVar.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <div className="flex gap-2">
                <Input
                  id={envVar.key}
                  value={envVar.value}
                  type={showKeys ? "text" : "password"}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(envVar.value, envVar.key)}
                  className="shrink-0"
                >
                  {copied === envVar.key ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{envVar.description}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setShowKeys(!showKeys)} className="flex items-center gap-2">
            {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showKeys ? "Hide" : "Show"} Values
          </Button>

          {onComplete && (
            <Button onClick={onComplete} className="bg-cyan-600 hover:bg-cyan-700">
              Continue Setup
            </Button>
          )}
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            After adding these environment variables, redeploy your application for the changes to take effect.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
