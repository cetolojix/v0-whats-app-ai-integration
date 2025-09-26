import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background digital-grid relative">
        <div className="circuit-pattern absolute inset-0 pointer-events-none" />

        {/* Navigation */}
        <nav className="border-b border-border/50 backdrop-blur-sm bg-background/90 sticky top-0 z-50 relative">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/30">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-bold neon-text">WhatsApp AI</span>
                  <div className="text-xs text-muted-foreground font-medium">Automation Platform</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/auth/login"
                  className="text-muted-foreground hover:text-neon-cyan transition-colors duration-300 font-medium"
                >
                  Giriş Yap
                </a>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="absolute top-20 left-10 w-4 h-4 bg-neon-cyan rounded-full floating-element opacity-80 shadow-lg shadow-neon-cyan/50"></div>
          <div className="absolute top-40 right-20 w-6 h-6 border-2 border-neon-purple rounded-full floating-element opacity-70 shadow-lg shadow-neon-purple/30"></div>
          <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-tech-orange rounded-full floating-element opacity-80 shadow-lg shadow-tech-orange/50"></div>

          <div className="text-center space-y-12 max-w-5xl mx-auto">
            <div className="space-y-8">
              <div className="relative">
                <h1 className="text-6xl md:text-8xl font-bold tech-gradient text-balance leading-tight">
                  WhatsApp AI
                  <br />
                  <span className="neon-text">Otomasyonu</span>
                </h1>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-64 h-px data-stream"></div>
              </div>

              <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed">
                Gelecek nesil yapay zeka teknolojisi ile WhatsApp otomasyonunu yeniden tanımlıyoruz.
                <span className="text-neon-cyan font-semibold"> Sınırsız potansiyel, sıfır sınır.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/auth/register"
                className="tech-button inline-flex items-center justify-center px-10 py-5 text-white font-bold rounded-2xl text-lg relative z-10 shadow-2xl shadow-neon-blue/30"
              >
                <span className="relative z-10">Başlayın</span>
                <svg className="w-6 h-6 ml-3 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="/chat-test"
                className="hologram-card inline-flex items-center justify-center px-10 py-5 text-foreground font-bold rounded-2xl text-lg hover:bg-secondary/30 transition-all duration-300 shadow-lg"
              >
                Sohbet Testi
                <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24 max-w-5xl mx-auto">
            <div className="hologram-card p-8 rounded-2xl text-center relative shadow-lg">
              <div className="text-4xl font-bold neon-text mb-3">99.9%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Uptime</div>
            </div>
            <div className="hologram-card p-8 rounded-2xl text-center relative shadow-lg">
              <div className="text-4xl font-bold text-neon-purple mb-3">∞</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Sınırsız Bot</div>
            </div>
            <div className="hologram-card p-8 rounded-2xl text-center relative shadow-lg">
              <div className="text-4xl font-bold text-tech-orange mb-3">24/7</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Aktif Sistem</div>
            </div>
            <div className="hologram-card p-8 rounded-2xl text-center relative shadow-lg">
              <div className="text-4xl font-bold text-neon-cyan mb-3">AI</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Powered</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-7xl mx-auto">
            <div className="hologram-card p-10 rounded-3xl text-center space-y-6 relative group shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-neon-blue/40">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground">Multi-Instance Matrix</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Paralel evrenler gibi çalışan çoklu WhatsApp instance'ları ile sınırsız otomasyon gücü.
              </p>
            </div>

            <div className="hologram-card p-10 rounded-3xl text-center space-y-6 relative group shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-neon-purple to-tech-orange rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-neon-purple/40">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground">Neural AI Engine</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Gelişmiş sinir ağları ile öğrenen ve adapte olan akıllı otomasyon sistemleri.
              </p>
            </div>

            <div className="hologram-card p-10 rounded-3xl text-center space-y-6 relative group shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-neon-cyan/40">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground">Quantum Access Control</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Kuantum seviyesinde güvenlik ile rol tabanlı erişim kontrolü ve admin yönetimi.
              </p>
            </div>
          </div>

          <div className="text-center mt-32 space-y-8 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-neon-cyan opacity-80"></div>
            <h2 className="text-4xl md:text-6xl font-bold neon-text text-balance">Geleceğe Bağlan</h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed">
              Yapay zeka destekli WhatsApp otomasyonunun sınırlarını keşfet.
              <span className="text-neon-cyan font-semibold"> Dijital dönüşümün öncüsü ol.</span>
            </p>
            <a
              href="/auth/register"
              className="tech-button inline-flex items-center justify-center px-12 py-6 text-white font-bold rounded-2xl text-xl relative z-10 group shadow-2xl shadow-neon-blue/40"
            >
              <span className="relative z-10">Başlayın</span>
              <svg
                className="w-7 h-7 ml-4 relative z-10 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Let middleware handle the role-based redirects to avoid loops

  // Get user profile to determine redirect
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Redirect based on role
  if (profile?.role === "admin") {
    redirect("/admin")
  } else {
    redirect("/dashboard")
  }
}
