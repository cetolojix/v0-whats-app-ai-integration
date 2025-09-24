"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Bot, Zap } from "lucide-react"
import { getTranslation } from "@/lib/i18n"

interface FeatureShowcaseProps {
  language: string
}

export function FeatureShowcase({ language }: FeatureShowcaseProps) {
  const t = getTranslation(language)

  const features = [
    {
      icon: MessageSquare,
      title: t.whatsappIntegration,
      description: t.whatsappIntegrationDesc,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Bot,
      title: t.aiResponses,
      description: t.aiResponsesDesc,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: t.automatedWorkflows,
      description: t.automatedWorkflowsDesc,
      gradient: "from-orange-500 to-red-500",
    },
  ]

  return (
    <div className="grid gap-8 md:grid-cols-3 animate-fade-in">
      {features.map((feature, index) => (
        <Card
          key={index}
          className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm card-hover"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-semibold text-balance">{feature.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
