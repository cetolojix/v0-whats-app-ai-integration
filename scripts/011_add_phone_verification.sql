-- Telefon doğrulama alanlarını profiles tablosuna ekle
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verification_code TEXT,
ADD COLUMN IF NOT EXISTS phone_verification_expires_at TIMESTAMP WITH TIME ZONE;

-- Telefon numarası için unique constraint ekle
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique 
ON profiles(phone) 
WHERE phone IS NOT NULL;

-- RLS politikalarını güncelle
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Admin kullanıcıları tüm profilleri görebilir
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin kullanıcıları tüm profilleri güncelleyebilir
CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
