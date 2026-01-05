-- Drop and recreate campaigns table with proper structure
DROP TABLE IF EXISTS campaign_boosts CASCADE;
DROP TABLE IF EXISTS campaign_updates CASCADE;
DROP TABLE IF EXISTS contributions CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;

-- Recreate campaigns table with all required columns
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount DECIMAL(12,2) NOT NULL CHECK (goal_amount > 0),
  current_amount DECIMAL(12,2) DEFAULT 0 CHECK (current_amount >= 0),
  image_url TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  creator_id UUID NOT NULL,
  wallet_address TEXT,
  payment_method TEXT DEFAULT 'x402_usdc',
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_boosted BOOLEAN DEFAULT FALSE,
  boost_type TEXT,
  boost_expires_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key constraint to profiles (not auth.users directly)
ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_campaigns_creator_id ON campaigns(creator_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_category ON campaigns(category);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active campaigns" ON campaigns 
FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create campaigns" ON campaigns 
FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own campaigns" ON campaigns 
FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own campaigns" ON campaigns 
FOR DELETE USING (auth.uid() = creator_id);

-- Recreate contributions table
CREATE TABLE contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  contributor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  message TEXT,
  anonymous BOOLEAN DEFAULT FALSE,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for contributions
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Create policies for contributions
CREATE POLICY "Anyone can view contributions" ON contributions FOR SELECT USING (true);
CREATE POLICY "Users can create contributions" ON contributions FOR INSERT WITH CHECK (
  auth.uid() = contributor_id OR contributor_id IS NULL
);

-- Recreate campaign_updates table
CREATE TABLE campaign_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for campaign_updates
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign_updates
CREATE POLICY "Anyone can view campaign updates" ON campaign_updates FOR SELECT USING (true);
CREATE POLICY "Campaign creators can create updates" ON campaign_updates FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT creator_id FROM campaigns WHERE id = campaign_id)
);

-- Function to update campaign amount when contributions are added
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
