-- Profiles tablosuna telefon numarası alanı ekleme
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Telefon numarası için unique constraint ekleme
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);

-- Telefon numarası doğrulama durumu için alan ekleme
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Telefon numarası doğrulama kodu için alan ekleme
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_verification_code TEXT;

-- Doğrulama kodu son kullanma tarihi
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_verification_expires_at TIMESTAMP WITH TIME ZONE;

-- Index ekleme performans için
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verification_code ON public.profiles(phone_verification_code);
