-- Ensure profiles table has proper structure and constraints
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS wallet_type TEXT DEFAULT 'coinbase_smart_wallet',
ADD COLUMN IF NOT EXISTS wallet_verified BOOLEAN DEFAULT FALSE;

-- Create unique index on wallet_address to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_wallet_address_unique 
ON profiles(wallet_address) 
WHERE wallet_address IS NOT NULL;

-- Update RLS policies to handle wallet operations
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles 
FOR ALL USING (auth.uid() = id);

-- Ensure all users have a profile record
INSERT INTO profiles (id, full_name, created_at, updated_at)
SELECT 
  auth.users.id,
  COALESCE(auth.users.raw_user_meta_data->>'full_name', 'User'),
  NOW(),
  NOW()
FROM auth.users
LEFT JOIN profiles ON profiles.id = auth.users.id
WHERE profiles.id IS NULL;
