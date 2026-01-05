-- Complete database setup script
-- This script will create all necessary tables and relationships

-- First, ensure profiles table exists with proper structure
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

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount DECIMAL(12,2) NOT NULL CHECK (goal_amount > 0),
  current_amount DECIMAL(12,2) DEFAULT 0 CHECK (current_amount >= 0),
  image_url TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_address TEXT,
  payment_method TEXT DEFAULT 'x402_usdc',
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_boosted BOOLEAN DEFAULT FALSE,
  boost_type TEXT,
  boost_expires_at TIMESTAMP WITH TIME ZONE
);

-- Create contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  contributor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  message TEXT,
  anonymous BOOLEAN DEFAULT FALSE,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_updates table
CREATE TABLE IF NOT EXISTS campaign_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_boosts table
CREATE TABLE IF NOT EXISTS campaign_boosts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  boost_type TEXT NOT NULL CHECK (boost_type IN ('visibility', 'featured', 'premium')),
  duration_hours INTEGER DEFAULT 24,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  payment_session TEXT,
  tx_hash TEXT,
  payment_amount DECIMAL(12,6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  contributor_wallet TEXT NOT NULL,
  recipient_wallet TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USDC',
  transaction_hash TEXT,
  x402_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create payment_sessions table
CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_hash TEXT NOT NULL,
  amount DECIMAL(12,6) NOT NULL,
  from_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'failed'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_creator_id ON campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_boosted ON campaigns(is_boosted, boost_expires_at) WHERE is_boosted = true;
CREATE INDEX IF NOT EXISTS idx_contributions_campaign_id ON contributions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_contributions_contributor_id ON contributions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_contributions_created_at ON contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign_id ON campaign_updates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_boosts_campaign ON campaign_boosts(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_campaign ON wallet_transactions(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_tx_hash ON payment_sessions(tx_hash);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_wallet_address_unique 
ON profiles(wallet_address) WHERE wallet_address IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;

DROP POLICY IF EXISTS "Anyone can view active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete own campaigns" ON campaigns;

DROP POLICY IF EXISTS "Anyone can view contributions" ON contributions;
DROP POLICY IF EXISTS "Users can create contributions" ON contributions;

DROP POLICY IF EXISTS "Anyone can view campaign updates" ON campaign_updates;
DROP POLICY IF EXISTS "Campaign creators can create updates" ON campaign_updates;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Create RLS policies for campaigns
CREATE POLICY "Anyone can view active campaigns" ON campaigns FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own campaigns" ON campaigns FOR DELETE USING (auth.uid() = creator_id);

-- Create RLS policies for contributions
CREATE POLICY "Anyone can view contributions" ON contributions FOR SELECT USING (true);
CREATE POLICY "Users can create contributions" ON contributions FOR INSERT WITH CHECK (
  auth.uid() = contributor_id OR contributor_id IS NULL
);

-- Create RLS policies for campaign_updates
CREATE POLICY "Anyone can view campaign updates" ON campaign_updates FOR SELECT USING (true);
CREATE POLICY "Campaign creators can create updates" ON campaign_updates FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT creator_id FROM campaigns WHERE id = campaign_id)
);

-- Create RLS policies for campaign_boosts
CREATE POLICY "Users can view campaign boosts" ON campaign_boosts FOR SELECT USING (true);
CREATE POLICY "Campaign creators can create boosts" ON campaign_boosts FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT creator_id FROM campaigns WHERE id = campaign_id)
);

-- Create RLS policies for wallet_transactions
CREATE POLICY "Users can view their wallet transactions" ON wallet_transactions FOR SELECT USING (
  auth.uid() IN (
    SELECT creator_id FROM campaigns WHERE id = campaign_id
  ) OR 
  contributor_wallet IN (
    SELECT wallet_address FROM profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "System can insert wallet transactions" ON wallet_transactions FOR INSERT WITH CHECK (true);

-- Create RLS policies for payment_sessions
CREATE POLICY "Users can view their payment sessions" ON payment_sessions FOR SELECT USING (
  from_address = ANY(
    SELECT wallet_address FROM profiles WHERE id = auth.uid()
  )
);
CREATE POLICY "System can create payment sessions" ON payment_sessions FOR INSERT WITH CHECK (true);

-- Create functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update campaign amount
CREATE OR REPLACE FUNCTION update_campaign_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns 
  SET current_amount = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM contributions 
    WHERE campaign_id = NEW.campaign_id
  ),
  updated_at = NOW()
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating campaign amount
DROP TRIGGER IF EXISTS on_contribution_created ON contributions;
CREATE TRIGGER on_contribution_created
  AFTER INSERT ON contributions
  FOR EACH ROW EXECUTE FUNCTION update_campaign_amount();

-- Function to update campaign amount from wallet transactions
CREATE OR REPLACE FUNCTION update_campaign_from_wallet_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE campaigns 
    SET current_amount = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM wallet_transactions 
      WHERE campaign_id = NEW.campaign_id AND status = 'completed'
    ),
    updated_at = NOW()
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for wallet transaction updates
DROP TRIGGER IF EXISTS on_wallet_transaction_completed ON wallet_transactions;
CREATE TRIGGER on_wallet_transaction_completed
  AFTER INSERT OR UPDATE ON wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION update_campaign_from_wallet_transaction();

-- Function to automatically expire boosts
CREATE OR REPLACE FUNCTION expire_campaign_boosts()
RETURNS void AS $$
BEGIN
  -- Update expired boosts
  UPDATE campaign_boosts 
  SET status = 'expired' 
  WHERE status = 'active' AND expires_at < NOW();
  
  -- Update campaigns to remove boost flags
  UPDATE campaigns 
  SET is_boosted = false, boost_type = null, boost_expires_at = null
  WHERE is_boosted = true AND boost_expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all existing auth users have profiles
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
