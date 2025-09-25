import { NavigationHeader } from "@/components/navigation-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, Database, UserCheck, AlertTriangle } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background digital-grid flex flex-col">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <NavigationHeader />

      <div className="container mx-auto px-6 py-12 flex-1 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tech-gradient">Gizlilik Sözleşmesi</h1>
            <p className="text-muted-foreground">Son güncelleme: 25 Aralık 2024</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-tech-green">
              <Shield className="w-4 h-4" />
              <span>KVKK Uyumlu • SSL Korumalı • Güvenli Platform</span>
            </div>
          </div>

          {/* Introduction */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-blue flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Giriş
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                WhatsApp AI Automation Platform olarak, kullanıcılarımızın gizliliğini korumak bizim için en önemli
                önceliktir. Bu gizlilik sözleşmesi, kişisel verilerinizin nasıl toplandığını, kullanıldığını,
                saklandığını ve korunduğunu açıklamaktadır.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Platformumuzu kullanarak, bu gizlilik sözleşmesinde belirtilen uygulamaları kabul etmiş olursunuz.
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-purple flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Toplanan Veriler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Kişisel Bilgiler:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Ad, soyad ve e-posta adresi</li>
                  <li>Telefon numarası (WhatsApp entegrasyonu için)</li>
                  <li>Şirket bilgileri (iş kullanımı için)</li>
                  <li>Ödeme bilgileri (güvenli ödeme sağlayıcıları aracılığıyla)</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Teknik Veriler:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>IP adresi ve konum bilgileri</li>
                  <li>Tarayıcı türü ve sürümü</li>
                  <li>Cihaz bilgileri ve işletim sistemi</li>
                  <li>Platform kullanım istatistikleri</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-cyan flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Verilerin Kullanımı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Toplanan veriler aşağıdaki amaçlarla kullanılmaktadır:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Platform hizmetlerinin sağlanması ve iyileştirilmesi</li>
                <li>Kullanıcı hesaplarının yönetimi ve güvenliği</li>
                <li>Müşteri destek hizmetlerinin sunulması</li>
                <li>Ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Platform performansının analiz edilmesi</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-tech-orange flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Veri Güvenliği
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Teknik Güvenlik:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 256-bit SSL şifreleme</li>
                    <li>• Güvenli veri merkezleri</li>
                    <li>• Düzenli güvenlik denetimleri</li>
                    <li>• Çok faktörlü kimlik doğrulama</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Operasyonel Güvenlik:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Sınırlı erişim kontrolü</li>
                    <li>• Personel güvenlik eğitimleri</li>
                    <li>• Veri yedekleme sistemleri</li>
                    <li>• Olay müdahale prosedürleri</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-green flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                Kullanıcı Hakları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">KVKK kapsamında sahip olduğunuz haklar:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>İşlenen veriler hakkında bilgi talep etme</li>
                  <li>Verilerin düzeltilmesini isteme</li>
                  <li>Verilerin silinmesini talep etme</li>
                </ul>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Veri işlemeye itiraz etme</li>
                  <li>Verilerin aktarıldığı üçüncü kişileri öğrenme</li>
                  <li>Otomatik işleme karşı koruma</li>
                  <li>Zararın giderilmesini talep etme</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-blue flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                İletişim ve Şikayetler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Gizlilik ile ilgili sorularınız veya haklarınızı kullanmak için:
              </p>
              <div className="bg-background/50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <strong>E-posta:</strong> gizlilik@whatsappai.com
                </p>
                <p className="text-sm">
                  <strong>Telefon:</strong> +90 (212) 555 0123
                </p>
                <p className="text-sm">
                  <strong>Adres:</strong> İstanbul, Türkiye
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Başvurularınız 30 gün içinde değerlendirilir ve yanıtlanır.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
