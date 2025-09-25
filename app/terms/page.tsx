import { NavigationHeader } from "@/components/navigation-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertTriangle, Shield, CreditCard, Users, Gavel } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background digital-grid flex flex-col">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <NavigationHeader />

      <div className="container mx-auto px-6 py-12 flex-1 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tech-gradient">Kullanım Şartları</h1>
            <p className="text-muted-foreground">Son güncelleme: 25 Aralık 2024</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-tech-green">
              <Shield className="w-4 h-4" />
              <span>Yasal Uyumluluk • Güncel Mevzuat • Kullanıcı Hakları</span>
            </div>
          </div>

          {/* Introduction */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-blue flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Giriş ve Kabul
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Bu kullanım şartları ("Şartlar"), WhatsApp AI Automation Platform ("Platform", "Hizmet", "Biz")
                tarafından sunulan hizmetlerin kullanımını düzenler. Platformu kullanarak bu şartları kabul etmiş
                sayılırsınız.
              </p>
              <div className="bg-tech-orange/10 border border-tech-orange/30 rounded-lg p-4">
                <p className="text-sm text-tech-orange">
                  <strong>Önemli:</strong> Bu şartları kabul etmiyorsanız, lütfen platformu kullanmayınız.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-purple flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Hizmet Tanımı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                WhatsApp AI Automation Platform, yapay zeka destekli WhatsApp otomasyon çözümleri sunan bir SaaS
                platformudur.
              </p>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Sunulan Hizmetler:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>AI destekli WhatsApp bot oluşturma ve yönetimi</li>
                  <li>Otomatik mesaj gönderimi ve yanıtlama</li>
                  <li>Müşteri iletişim yönetimi</li>
                  <li>Analitik ve raporlama araçları</li>
                  <li>API entegrasyonları</li>
                  <li>Teknik destek hizmetleri</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Obligations */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-cyan flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Kullanıcı Yükümlülükleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">İzin Verilen Kullanımlar:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Yasal ticari faaliyetler</li>
                    <li>• Müşteri hizmetleri otomasyonu</li>
                    <li>• Pazarlama (izin dahilinde)</li>
                    <li>• Bilgilendirme mesajları</li>
                    <li>• Destek hizmetleri</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-red-400">Yasak Kullanımlar:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Spam mesaj gönderimi</li>
                    <li>• Yanıltıcı veya sahte içerik</li>
                    <li>• Telif hakkı ihlali</li>
                    <li>• Kötü amaçlı yazılım dağıtımı</li>
                    <li>• Yasal olmayan faaliyetler</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-tech-orange flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Ödeme Şartları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Ödeme Yöntemleri:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Kredi kartı (Visa, Mastercard, American Express)</li>
                    <li>• Banka kartı</li>
                    <li>• Havale/EFT (kurumsal müşteriler için)</li>
                    <li>• İyzico güvenli ödeme altyapısı</li>
                  </ul>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Faturalama:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Aylık veya yıllık abonelik seçenekleri</li>
                    <li>• Otomatik yenileme (iptal edilebilir)</li>
                    <li>• KDV dahil fiyatlandırma</li>
                    <li>• E-fatura gönderimi</li>
                  </ul>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">İptal ve İade:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 14 gün içinde koşulsuz iade hakkı</li>
                    <li>• Abonelik istediğiniz zaman iptal edilebilir</li>
                    <li>• Kullanılmayan süre için orantılı iade</li>
                    <li>• İade işlemleri 5-10 iş günü içinde</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-green flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Fikri Mülkiyet Hakları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Platform Hakları:</h4>
                  <p className="text-sm text-muted-foreground">
                    Platform, yazılım, tasarım, içerik ve tüm fikri mülkiyet hakları WhatsApp AI Automation Platform'a
                    aittir. Kullanıcılar sadece kullanım hakkına sahiptir.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Kullanıcı İçeriği:</h4>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcılar tarafından oluşturulan içerik (mesajlar, bot konfigürasyonları) kullanıcıya aittir.
                    Platform, hizmet sunumu için gerekli lisanslara sahiptir.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Üçüncü Taraf Hakları:</h4>
                  <p className="text-sm text-muted-foreground">
                    WhatsApp, Meta Platforms Inc.'in ticari markasıdır. Platform, WhatsApp Business API'sini lisanslı
                    olarak kullanmaktadır.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-blue flex items-center">
                <Gavel className="w-5 h-5 mr-2" />
                Sorumluluk Sınırlaması
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Hizmet Garantisi:</h4>
                  <p className="text-sm text-muted-foreground">
                    %99.9 uptime garantisi sunuyoruz. Planlı bakımlar önceden duyurulur. Hizmet kesintileri için
                    orantılı tazminat sağlanır.
                  </p>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Sorumluluk Sınırları:</h4>
                  <p className="text-sm text-muted-foreground">
                    Platform, kullanıcının hatalı kullanımından, üçüncü taraf hizmetlerden veya mücbir sebeplerden
                    kaynaklanan zararlardan sorumlu değildir.
                  </p>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Veri Güvenliği:</h4>
                  <p className="text-sm text-muted-foreground">
                    Endüstri standardı güvenlik önlemleri alınmıştır. Ancak %100 güvenlik garantisi verilemez.
                    Kullanıcılar da güvenlik önlemlerini almalıdır.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-tech-orange flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Sözleşme Sona Ermesi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Kullanıcı Tarafından:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• İstediğiniz zaman iptal edebilirsiniz</li>
                    <li>• 30 gün önceden bildirim önerilir</li>
                    <li>• Verilerinizi dışa aktarabilirsiniz</li>
                    <li>• Kullanılmayan süre iade edilir</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Platform Tarafından:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Şartların ihlali durumunda</li>
                    <li>• Yasal olmayan kullanım</li>
                    <li>• 30 gün önceden bildirim</li>
                    <li>• Veri yedekleme süresi tanınır</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-cyan flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                İletişim ve Uyuşmazlık Çözümü
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background/50 rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Hukuki İletişim:</h4>
                  <p className="text-sm text-muted-foreground">hukuk@whatsappai.com</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Müşteri Hizmetleri:</h4>
                  <p className="text-sm text-muted-foreground">destek@whatsappai.com | +90 (212) 555 0123</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Yetkili Mahkeme:</h4>
                  <p className="text-sm text-muted-foreground">İstanbul Mahkemeleri ve İcra Müdürlükleri yetkilidir</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Uygulanacak Hukuk:</h4>
                  <p className="text-sm text-muted-foreground">Türkiye Cumhuriyeti hukuku uygulanır</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
