-- Admin yetkisi verme script'i
-- info@cetinyesilyurt.com mail adresli kullanıcıya admin rolü atanıyor

UPDATE profiles 
SET role = 'admin', 
    updated_at = NOW()
WHERE email = 'info@cetinyesilyurt.com';

-- Eğer kullanıcı mevcut değilse, kontrol için sorgu
SELECT 
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'info@cetinyesilyurt.com';

-- Tüm admin kullanıcıları listele (doğrulama için)
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM profiles 
WHERE role = 'admin'
ORDER BY created_at DESC;
