# Deployment Guide

## Environment Variables Required

Kendi sunucunuzda deploy etmek için aşağıdaki environment variable'ları ayarlamanız gerekiyor:

### Supabase (Required)
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### Evolution API (Required)
\`\`\`bash
EVOLUTION_API_URL=http://your-evolution-api:8080
EVOLUTION_API_KEY=your_api_key
\`\`\`

### n8n (Optional - for automation)
\`\`\`bash
N8N_API_URL=http://your-n8n:5678
N8N_API_KEY=your_api_key
\`\`\`

## Common Issues

### 1. "Supabase credentials not available in middleware"
- Environment variable'lar eksik veya yanlış
- `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` mutlaka gerekli

### 2. "Email veya şifre hatalı" 
- Middleware auth çalışmıyor
- Supabase bağlantısını kontrol edin

### 3. QR kod tarandıktan sonra ekranda kalıyor
- Network timeout sorunları
- Evolution API bağlantısını kontrol edin

### 4. "Failed to list n8n workflows: 401"
- n8n API key yanlış veya eksik
- n8n servisine erişim sorunu

## Troubleshooting

1. Browser console'da debug loglarını kontrol edin
2. Network tab'ında API çağrılarını kontrol edin  
3. Environment variable'ların doğru set edildiğini kontrol edin
4. Supabase ve Evolution API servislerinin çalıştığını kontrol edin
