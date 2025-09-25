import { NavigationHeader } from "@/components/navigation-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Zap, Star, Crown, Building, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Başlangıç",
      price: "999",
      period: "aylık",
      description: "Küçük işletmeler için ideal",
      icon: Zap,
      color: "neon-green",
      features: [
        "1.000 kişi / ay limit",
        "Sınırsız mesaj (aynı kişilerle)",
        "1 WhatsApp hattı",
        "Temel otomasyon (karşılama + hazır yanıt)",
        "E-posta desteği",
        "Temel raporlama",
      ],
      popular: false,
    },
    {
      name: "Standart",
      price: "1.999",
      period: "aylık",
      description: "Büyüyen işletmeler için",
      icon: Star,
      color: "neon-blue",
      features: [
        "2.000 kişi / ay limit",
        "Sınırsız mesaj",
        "3 WhatsApp hattı",
        "AI destekli cevaplar",
        "Raporlama (Excel / PDF)",
        "Öncelikli destek",
        "API erişimi",
      ],
      popular: true,
    },
    {
      name: "Profesyonel",
      price: "4.999",
      period: "aylık",
      description: "Profesyonel işletmeler için",
      icon: Crown,
      color: "neon-purple",
      features: [
        "5.000 kişi / ay limit",
        "Sınırsız mesaj",
        "5 WhatsApp hattı",
        "Gelişmiş AI (bilgi tabanı)",
        "API & CRM entegrasyonu",
        "Detaylı analitik",
        "Öncelikli destek",
        "Özel eğitim",
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background digital-grid flex flex-col">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <NavigationHeader />

      <div className="container mx-auto px-6 py-12 flex-1 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tech-gradient">Üyelik Paketleri</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              İşletmenizin büyüklüğüne uygun paketi seçin ve WhatsApp AI otomasyonunun gücünü keşfedin.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-tech-green">
              <Shield className="w-4 h-4" />
              <span>Tüm paketlerde • İyzico Güvenli Ödeme • 14 Gün Para İade Garantisi</span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`hologram-card relative ${
                  plan.popular ? "ring-2 ring-neon-blue shadow-2xl shadow-neon-blue/20 scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-neon-blue to-neon-purple text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      En Popüler
                    </div>
                  </div>
                )}

                <CardHeader className="text-center space-y-4 pb-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br from-${plan.color} to-neon-cyan rounded-full flex items-center justify-center mx-auto shadow-xl`}
                  >
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                    <p className="text-muted-foreground mt-2">{plan.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center space-x-2">
                      <span className="text-4xl font-bold neon-text">₺{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">KDV dahil</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-tech-green flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/signup">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "tech-button text-white"
                          : "hologram-card hover:bg-secondary/30 text-foreground border-border/50"
                      } py-6 text-lg font-semibold rounded-xl group`}
                    >
                      Paketi Seç
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enterprise Section */}
          <div className="text-center space-y-8">
            <Card className="hologram-card max-w-4xl mx-auto">
              <CardContent className="p-12 space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-tech-orange to-neon-purple rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Building className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold neon-text">Kurumsal</h3>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Büyük organizasyonlar için özelleştirilmiş çözümler ve premium destek.
                </p>
                <div className="grid md:grid-cols-4 gap-6 mt-8">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-neon-blue">10.000+</div>
                    <p className="text-sm text-muted-foreground">Kişi / Ay</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-neon-purple">10+</div>
                    <p className="text-sm text-muted-foreground">WhatsApp Hattı</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-tech-orange">Özel</div>
                    <p className="text-sm text-muted-foreground">Sunucu</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-tech-green">VIP</div>
                    <p className="text-sm text-muted-foreground">Destek</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-tech-orange to-neon-purple text-white px-6 py-3 rounded-full text-2xl font-bold inline-block">
                  Fiyat: Görüşmeli
                </div>
                <Link href="/contact">
                  <Button className="tech-button px-8 py-4 text-lg font-semibold rounded-xl group mt-4">
                    Teklif Al
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center neon-text">Sık Sorulan Sorular</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hologram-card">
                <CardContent className="p-6 space-y-3">
                  <h4 className="font-semibold text-foreground">Ücretsiz deneme var mı?</h4>
                  <p className="text-sm text-muted-foreground">
                    Evet, tüm paketlerde 14 gün ücretsiz deneme sunuyoruz. Kredi kartı bilgisi gerekli değil.
                  </p>
                </CardContent>
              </Card>

              <Card className="hologram-card">
                <CardContent className="p-6 space-y-3">
                  <h4 className="font-semibold text-foreground">İptal etmek istediğimde ne olur?</h4>
                  <p className="text-sm text-muted-foreground">
                    İstediğiniz zaman iptal edebilirsiniz. Kullanılmayan süre için orantılı iade yapılır.
                  </p>
                </CardContent>
              </Card>

              <Card className="hologram-card">
                <CardContent className="p-6 space-y-3">
                  <h4 className="font-semibold text-foreground">Hangi ödeme yöntemleri kabul ediliyor?</h4>
                  <p className="text-sm text-muted-foreground">
                    Tüm kredi kartları, banka kartı ve havale/EFT. İyzico güvenli ödeme altyapısı kullanılıyor.
                  </p>
                </CardContent>
              </Card>

              <Card className="hologram-card">
                <CardContent className="p-6 space-y-3">
                  <h4 className="font-semibold text-foreground">Teknik destek nasıl alırım?</h4>
                  <p className="text-sm text-muted-foreground">
                    E-posta, telefon ve canlı chat ile 7/24 Türkçe destek. Premium paketlerde öncelikli destek.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-8 py-12">
            <h2 className="text-4xl font-bold neon-text">Hemen Başlayın</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              WhatsApp AI otomasyonunun gücünü keşfedin ve müşteri deneyiminizi geliştirin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button className="tech-button px-8 py-4 text-lg font-semibold rounded-xl group">
                  Hemen Başla
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/test">
                <Button
                  variant="outline"
                  className="border-border/50 hover:border-neon-cyan hover:bg-neon-cyan/10 px-8 py-4 text-lg font-semibold rounded-xl bg-transparent"
                >
                  Ücretsiz Test Et
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
