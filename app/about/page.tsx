import { NavigationHeader } from "@/components/navigation-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Users, Award, Target, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background digital-grid flex flex-col">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <NavigationHeader />

      <div className="container mx-auto px-6 py-12 flex-1 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tech-gradient">Hakkımızda</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              WhatsApp AI Automation Platform olarak, işletmelerin dijital dönüşüm yolculuğunda
              <span className="text-neon-cyan font-semibold"> güvenilir teknoloji ortağı</span> olmayı hedefliyoruz.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hologram-card">
              <CardHeader>
                <CardTitle className="text-neon-blue flex items-center">
                  <Target className="w-6 h-6 mr-3" />
                  Misyonumuz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Yapay zeka teknolojisini WhatsApp otomasyonu ile birleştirerek, işletmelerin müşteri iletişimini
                  devrimsel bir şekilde dönüştürmek ve operasyonel verimliliği maksimize etmek.
                </p>
              </CardContent>
            </Card>

            <Card className="hologram-card">
              <CardHeader>
                <CardTitle className="text-neon-purple flex items-center">
                  <Heart className="w-6 h-6 mr-3" />
                  Vizyonumuz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Türkiye'nin ve bölgenin en güvenilir WhatsApp AI otomasyon platformu olarak, her büyüklükteki
                  işletmenin dijital dönüşümüne öncülük etmek.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Our Values */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center neon-text">Değerlerimiz</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hologram-card text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">Güvenlik</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Müşteri verilerinin güvenliği bizim için önceliktir. 256-bit SSL şifreleme ve KVKK uyumluluğu ile
                    koruma sağlıyoruz.
                  </p>
                </CardContent>
              </Card>

              <Card className="hologram-card text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-tech-orange rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">İnovasyon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sürekli gelişen AI teknolojileri ile platformumuzu güncel tutarak, müşterilerimize en iyi deneyimi
                    sunuyoruz.
                  </p>
                </CardContent>
              </Card>

              <Card className="hologram-card text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">Müşteri Odaklılık</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Her müşterimizin benzersiz ihtiyaçlarını anlayarak, özelleştirilmiş çözümler geliştiriyoruz.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Company Info */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-cyan flex items-center">
                <Award className="w-6 h-6 mr-3" />
                Şirket Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Kuruluş</h4>
                  <p className="text-muted-foreground">2024 yılında İstanbul'da kurulmuştur.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Ekip</h4>
                  <p className="text-muted-foreground">
                    AI uzmanları ve yazılım geliştiricilerinden oluşan deneyimli ekip.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Teknoloji</h4>
                  <p className="text-muted-foreground">
                    En güncel AI modelleri ve bulut teknolojileri kullanılmaktadır.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Sertifikalar</h4>
                  <p className="text-muted-foreground">ISO 27001, KVKK uyumluluğu ve güvenlik sertifikaları.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <div className="text-center space-y-6 py-12">
            <h2 className="text-3xl font-bold neon-text">Bizimle İletişime Geçin</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              WhatsApp AI otomasyon çözümlerimiz hakkında daha fazla bilgi almak için uzman ekibimizle iletişime
              geçebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="tech-button inline-flex items-center justify-center px-8 py-3 text-white font-semibold rounded-xl"
              >
                İletişime Geç
              </a>
              <a
                href="/test"
                className="hologram-card inline-flex items-center justify-center px-8 py-3 text-foreground font-semibold rounded-xl hover:bg-secondary/30 transition-all duration-300"
              >
                Ücretsiz Test Et
              </a>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
