import Link from "next/link"
import { Shield, Lock, FileText, Mail, Phone, MapPin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/95 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold neon-text">WhatsApp AI</span>
                <div className="text-xs text-muted-foreground">Automation Platform</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Gelecek nesil yapay zeka teknolojisi ile WhatsApp otomasyonunu yeniden tanımlıyoruz.
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 text-tech-green" />
              <span>SSL Sertifikalı Güvenli Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Hızlı Erişim</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/test" className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors">
                  AI Test Et
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors">
                  Üyelik Paketleri
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
                >
                  Giriş Yap
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
                >
                  Üye Ol
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Yasal Bilgiler</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors flex items-center"
                >
                  <FileText className="w-3 h-3 mr-2" />
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors flex items-center"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  Gizlilik Sözleşmesi
                </Link>
              </li>
              <li>
                <Link
                  href="/kvkk"
                  className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors flex items-center"
                >
                  <Shield className="w-3 h-3 mr-2" />
                  KVKK Politikası
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors flex items-center"
                >
                  <FileText className="w-3 h-3 mr-2" />
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors flex items-center"
                >
                  <Mail className="w-3 h-3 mr-2" />
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Security */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">İletişim & Güvenlik</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-muted-foreground">
                <Mail className="w-3 h-3 mr-2 text-neon-cyan" />
                <span>destek@whatsappai.com</span>
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Phone className="w-3 h-3 mr-2 text-neon-cyan" />
                <span>+90 (212) 555 0123</span>
              </li>
              <li className="flex items-start text-sm text-muted-foreground">
                <MapPin className="w-3 h-3 mr-2 mt-0.5 text-neon-cyan flex-shrink-0" />
                <span>İstanbul, Türkiye</span>
              </li>
            </ul>

            {/* Security Badges */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-tech-green rounded-full animate-pulse" />
                <span>256-bit SSL Şifreleme</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-tech-green rounded-full animate-pulse" />
                <span>İyzico Güvenli Ödeme</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-tech-green rounded-full animate-pulse" />
                <span>KVKK Uyumlu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 WhatsApp AI Automation Platform. Tüm hakları saklıdır.
            </div>
            <div className="flex items-center space-x-6 text-xs text-muted-foreground">
              <span className="flex items-center">
                <Shield className="w-3 h-3 mr-1 text-tech-green" />
                Güvenli Platform
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-tech-green rounded-full mr-2 animate-pulse" />
                Sistem Aktif
              </span>
              <span>v2.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
