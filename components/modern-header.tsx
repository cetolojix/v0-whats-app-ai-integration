"use client"

import { Badge } from "@/components/ui/badge"
import { MessageSquare, Bot, Zap } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { getTranslation } from "@/lib/i18n"

interface ModernHeaderProps {
  language: string
  onLanguageChange: (language: string) => void
  connectedInstancesCount: number
}

export function ModernHeader({ language, onLanguageChange, connectedInstancesCount }: ModernHeaderProps) {
  const t = getTranslation(language)

  return (
    <header className="border-b bg-card/30 backdrop-blur-xl sticky top-0 z-50 animate-fade-in">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{t.appTitle}</h1>
              <p className="text-sm text-muted-foreground font-medium">{t.appSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector currentLanguage={language} onLanguageChange={onLanguageChange} />
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-2 px-3 py-1.5 font-medium">
                <Bot className="h-4 w-4" />
                {t.aiReady}
              </Badge>
              {connectedInstancesCount > 0 && (
                <Badge variant="outline" className="gap-2 px-3 py-1.5 font-medium border-primary/20 text-primary">
                  <Zap className="h-4 w-4" />
                  {connectedInstancesCount} {t.instances}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
