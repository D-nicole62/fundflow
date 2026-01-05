-- Ensure profiles table exists and has proper structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  wallet_address TEXT,
  wallet_type TEXT DEFAULT 'coinbase_smart_wallet',
  wallet_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure campaigns table has all required columns
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'x402_usdc';

-- Create unique index on wallet_address to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_wallet_address_unique 
ON profiles(wallet_address) 
WHERE wallet_address IS NOT NULL;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Ensure all authenticated users have a profile
INSERT INTO profiles (id, full_name, created_at, updated_at)
SELECT 
  auth.users.id,
  COALESCE(auth.users.raw_user_meta_data->>'full_name', 'User'),
  NOW(),
  NOW()
FROM auth.users
LEFT JOIN profiles ON profiles.id = auth.users.id
WHERE profiles.id IS NULL
ON CONFLICT (id) DO NOTHING;
