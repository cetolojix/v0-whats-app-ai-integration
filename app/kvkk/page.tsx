import { NavigationHeader } from "@/components/navigation-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, FileText, Users, Lock, AlertCircle, CheckCircle } from "lucide-react"

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-background digital-grid flex flex-col">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <NavigationHeader />

      <div className="container mx-auto px-6 py-12 flex-1 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tech-gradient">KVKK Aydınlatma Metni</h1>
            <p className="text-muted-foreground">Kişisel Verilerin Korunması Kanunu Kapsamında Bilgilendirme</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-tech-green">
              <CheckCircle className="w-4 h-4" />
              <span>6698 Sayılı KVKK Uyumlu • Güncel Mevzuat</span>
            </div>
          </div>

          {/* Data Controller */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-blue flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Veri Sorumlusu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">WhatsApp AI Automation Platform</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla, kişisel
                  verilerinizin işlenmesine ilişkin bilgilendirme yapmaktayız.
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <strong>Adres:</strong> İstanbul, Türkiye
                  </p>
                  <p>
                    <strong>E-posta:</strong> kvkk@whatsappai.com
                  </p>
                  <p>
                    <strong>Telefon:</strong> +90 (212) 555 0123
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Purposes */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-purple flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Kişisel Verilerin İşlenme Amaçları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Temel Amaçlar:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Platform hizmetlerinin sunulması</li>
                    <li>• Kullanıcı hesap yönetimi</li>
                    <li>• Müşteri destek hizmetleri</li>
                    <li>• Ödeme işlemlerinin gerçekleştirilmesi</li>
                    <li>• Güvenlik önlemlerinin alınması</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">İkincil Amaçlar:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Hizmet kalitesinin artırılması</li>
                    <li>• İstatistiksel analiz yapılması</li>
                    <li>• Yasal yükümlülüklerin yerine getirilmesi</li>
                    <li>• Pazarlama faaliyetleri (onay ile)</li>
                    <li>• Ar-Ge çalışmaları</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Basis */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-cyan flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                İşlemenin Hukuki Sebepleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Kişisel verileriniz KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanılarak
                işlenmektedir:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Genel Hukuki Sebepler:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Açık rıza</li>
                    <li>• Sözleşmenin kurulması veya ifası</li>
                    <li>• Yasal yükümlülüğün yerine getirilmesi</li>
                    <li>• Meşru menfaatler</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Özel Nitelikli Veriler:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Açık rıza (gerekli durumlarda)</li>
                    <li>• Kanunlarda öngörülen haller</li>
                    <li>• Kişisel Verileri Koruma Kurulu izni</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Categories */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-tech-orange flex items-center">
                <Users className="w-5 h-5 mr-2" />
                İşlenen Kişisel Veri Kategorileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Kimlik Verileri:</h4>
                  <p className="text-sm text-muted-foreground">
                    Ad, soyad, T.C. kimlik numarası (gerekli durumlarda), doğum tarihi
                  </p>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">İletişim Verileri:</h4>
                  <p className="text-sm text-muted-foreground">E-posta adresi, telefon numarası, adres bilgileri</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Finansal Veriler:</h4>
                  <p className="text-sm text-muted-foreground">Ödeme bilgileri, fatura adresi, vergi numarası</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Dijital İz Verileri:</h4>
                  <p className="text-sm text-muted-foreground">IP adresi, çerez verileri, platform kullanım logları</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Subject Rights */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-green flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Veri Sahibi Hakları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                KVKK'nın 11. maddesi uyarınca sahip olduğunuz haklar:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Temel Haklar:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Kişisel veri işlenip işlenmediğini öğrenme</li>
                    <li>• İşlenen kişisel veriler hakkında bilgi talep etme</li>
                    <li>• İşleme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                    <li>• Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Düzeltme ve Silme Hakları:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme
                    </li>
                    <li>• KVKK'da öngörülen şartlar çerçevesinde kişisel verilerin silinmesini isteme</li>
                    <li>
                      • Düzeltme ve silme taleplerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini
                      isteme
                    </li>
                    <li>
                      • İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin
                      aleyhine bir sonucun ortaya çıkmasına itiraz etme
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="hologram-card">
            <CardHeader>
              <CardTitle className="text-neon-blue flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Başvuru Yöntemleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
              </p>
              <div className="bg-background/50 rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Yazılı Başvuru:</h4>
                  <p className="text-sm text-muted-foreground">
                    İstanbul, Türkiye adresine elden teslim veya posta yoluyla
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Elektronik Başvuru:</h4>
                  <p className="text-sm text-muted-foreground">
                    kvkk@whatsappai.com e-posta adresine güvenli elektronik imza ile
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Başvuru Süreci:</h4>
                  <p className="text-sm text-muted-foreground">
                    Başvurular 30 gün içinde değerlendirilir ve sonuçlandırılır
                  </p>
                </div>
              </div>
              <div className="bg-tech-orange/10 border border-tech-orange/30 rounded-lg p-4">
                <p className="text-sm text-tech-orange">
                  <strong>Önemli:</strong> Başvurularınızda kimlik tespiti için gerekli belgeler talep edilebilir.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
