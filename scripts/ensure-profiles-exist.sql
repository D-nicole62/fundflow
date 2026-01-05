-- Ensure all auth users have corresponding profiles
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

-- Update profiles table structure if needed
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS wallet_type TEXT DEFAULT 'coinbase_smart_wallet',
ADD COLUMN IF NOT EXISTS wallet_verified BOOLEAN DEFAULT FALSE;

-- Create unique index on wallet_address to prevent duplicates
DROP INDEX IF EXISTS idx_profiles_wallet_address_unique;
CREATE UNIQUE INDEX idx_profiles_wallet_address_unique 
ON profiles(wallet_address) 
WHERE wallet_address IS NOT NULL;

-- Ensure RLS policies are correct
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
