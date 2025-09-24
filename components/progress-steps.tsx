"use client"

import { Separator } from "@/components/ui/separator"
import { CheckCircle, QrCode, Zap } from "lucide-react"
import { getTranslation } from "@/lib/i18n"

interface ProgressStepsProps {
  currentStep: "setup" | "qr" | "connected"
  language: string
}

export function ProgressSteps({ currentStep, language }: ProgressStepsProps) {
  const t = getTranslation(language)

  const steps = [
    {
      key: "setup",
      label: t.setupBot,
      icon: "1",
    },
    {
      key: "qr",
      label: t.scanQrCode,
      icon: QrCode,
    },
    {
      key: "connected",
      label: t.botActivated,
      icon: Zap,
    },
  ]

  const getStepStatus = (stepKey: string) => {
    const stepIndex = steps.findIndex((s) => s.key === stepKey)
    const currentIndex = steps.findIndex((s) => s.key === currentStep)

    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "active"
    return "pending"
  }

  return (
    <div className="flex items-center justify-center gap-6 py-8 animate-fade-in">
      {steps.map((step, index) => {
        const status = getStepStatus(step.key)
        const isCompleted = status === "completed"
        const isActive = status === "active"

        return (
          <div key={step.key} className="flex items-center gap-6">
            <div
              className={`flex items-center gap-3 transition-all duration-300 ${
                isActive ? "text-primary scale-105" : isCompleted ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted || isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-muted bg-background"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : typeof step.icon === "string" ? (
                  step.icon
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className="text-sm font-semibold">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <Separator
                className={`w-16 transition-colors duration-300 ${
                  getStepStatus(steps[index + 1].key) !== "pending" ? "bg-primary/30" : ""
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
