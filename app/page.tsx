import { NavigationHeader } from "@/components/navigation-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Zap, Users, Star, CheckCircle, ArrowRight } from "lucide-react"

export default async function HomePage() {
  // Show landing page for all users
  return (
    <div className="min-h-screen bg-background digital-grid relative flex flex-col">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      {/* Navigation */}
      <NavigationHeader />

      <div className="container mx-auto px-6 py-20 relative z-10 flex-1">
        <div className="absolute top-20 left-10 w-4 h-4 bg-neon-cyan rounded-full floating-element opacity-80 shadow-lg shadow-neon-cyan/50"></div>
        <div className="absolute top-40 right-20 w-6 h-6 border-2 border-neon-purple rounded-full floating-element opacity-70 shadow-lg shadow-neon-purple/30"></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-tech-orange rounded-full floating-element opacity-80 shadow-lg shadow-tech-orange/50"></div>

        {/* Hero Section */}
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
              href="/instances"
              className="tech-button inline-flex items-center justify-center px-10 py-5 text-white font-bold rounded-2xl text-lg relative z-10 shadow-2xl shadow-neon-blue/30 group"
            >
              <span className="relative z-10">Hemen Başlayın</span>
              <ArrowRight className="w-6 h-6 ml-3 relative z-10 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/test"
              className="hologram-card inline-flex items-center justify-center px-10 py-5 text-foreground font-bold rounded-2xl text-lg hover:bg-secondary/30 transition-all duration-300 shadow-lg"
            >
              <Zap className="w-6 h-6 mr-3" />
              Ücretsiz Test Et
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24 max-w-5xl mx-auto">
          <div className="hologram-card p-8 rounded-2xl text-center relative shadow-lg">
            <div className="text-4xl font-bold neon-text mb-3">99.9%</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Uptime Garantisi</div>
          </div>
          <div className="hologram-card p-8 rounded-2xl text-center relative shadow-lg">
            <div className="text-4xl font-bold text-neon-purple mb-3">∞</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Sınırsız Bot</div>
          </div>
          <div className="hologram-card p-8 rounded-2xl text-center relative shadow-lg">
            <div className="text-4xl font-bold text-tech-orange mb-3">24/7</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Teknik Destek</div>
          </div>
          <div className="hologram-card p-8 rounded-2xl text-center relative shadow-lg">
            <div className="text-4xl font-bold text-neon-cyan mb-3">AI</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Powered</div>
          </div>
        </div>

        {/* Features Section */}
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
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
            <h3 className="text-2xl font-bold text-foreground">Quantum Security</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Kuantum seviyesinde güvenlik ile rol tabanlı erişim kontrolü ve admin yönetimi.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-32 max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold neon-text">Neden WhatsApp AI?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              İşletmenizi dijital çağa taşıyacak güçlü özellikler
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hologram-card">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-tech-green" />
                  <h3 className="text-xl font-bold text-foreground">Kolay Kurulum</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  5 dakikada kurulum, anında kullanıma hazır. Teknik bilgi gerektirmez.
                </p>
              </CardContent>
            </Card>

            <Card className="hologram-card">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-neon-blue" />
                  <h3 className="text-xl font-bold text-foreground">Güvenli Altyapı</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  256-bit SSL şifreleme, KVKK uyumlu, ISO 27001 sertifikalı güvenlik.
                </p>
              </CardContent>
            </Card>

            <Card className="hologram-card">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-neon-purple" />
                  <h3 className="text-xl font-bold text-foreground">7/24 Destek</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Uzman ekibimiz her zaman yanınızda. Türkçe destek, hızlı çözüm.
                </p>
              </CardContent>
            </Card>

            <Card className="hologram-card">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center space-x-3">
                  <Star className="w-6 h-6 text-tech-orange" />
                  <h3 className="text-xl font-bold text-foreground">Ölçeklenebilir</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Startup'tan enterprise'a kadar her büyüklükte işletme için uygun.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Security & Payment Info */}
        <div className="mt-32 max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <h2 className="text-3xl font-bold neon-text">Güvenli ve Kolay Ödeme</h2>
            <p className="text-muted-foreground">İyzico güvenli ödeme altyapısı ile tüm kredi kartları kabul edilir</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hologram-card text-center">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-tech-green to-neon-cyan rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-foreground">SSL Sertifikalı</h4>
                <p className="text-sm text-muted-foreground">256-bit şifreleme ile korumalı</p>
              </CardContent>
            </Card>

            <Card className="hologram-card text-center">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm4.64-1.96l3.54 3.54 7.07-7.07 1.41 1.41-8.48 8.48-4.95-4.95 1.41-1.41z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-foreground">İyzico Güvencesi</h4>
                <p className="text-sm text-muted-foreground">Güvenli ödeme altyapısı</p>
              </CardContent>
            </Card>

            <Card className="hologram-card text-center">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-tech-orange to-neon-cyan rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-foreground">KVKK Uyumlu</h4>
                <p className="text-sm text-muted-foreground">Veri güvenliği garantili</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-32 space-y-8 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-neon-cyan opacity-80"></div>
          <h2 className="text-4xl md:text-6xl font-bold neon-text text-balance">Geleceğe Bağlan</h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed">
            Yapay zeka destekli WhatsApp otomasyonunun sınırlarını keşfet.
            <span className="text-neon-cyan font-semibold"> Dijital dönüşümün öncüsü ol.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="/instances"
              className="tech-button inline-flex items-center justify-center px-12 py-6 text-white font-bold rounded-2xl text-xl relative z-10 group shadow-2xl shadow-neon-blue/40"
            >
              <span className="relative z-10">Ücretsiz Başlayın</span>
              <ArrowRight className="w-7 h-7 ml-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/pricing"
              className="hologram-card inline-flex items-center justify-center px-12 py-6 text-foreground font-bold rounded-2xl text-xl hover:bg-secondary/30 transition-all duration-300 shadow-lg"
            >
              Paketleri İncele
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
