-- Add boost tracking table
CREATE TABLE IF NOT EXISTS campaign_boosts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  boost_type TEXT NOT NULL CHECK (boost_type IN ('visibility', 'featured', 'premium')),
  duration_hours INTEGER DEFAULT 24,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Add boost fields to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS boost_type TEXT,
ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for boost queries
CREATE INDEX IF NOT EXISTS idx_campaigns_boosted ON campaigns(is_boosted, boost_expires_at) WHERE is_boosted = true;
CREATE INDEX IF NOT EXISTS idx_campaign_boosts_active ON campaign_boosts(campaign_id, status, expires_at) WHERE status = 'active';

-- Enable RLS for campaign_boosts
ALTER TABLE campaign_boosts ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign_boosts
CREATE POLICY "Users can view campaign boosts" ON campaign_boosts FOR SELECT USING (true);
CREATE POLICY "Campaign creators can create boosts" ON campaign_boosts FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT creator_id FROM campaigns WHERE id = campaign_id)
);

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

-- Create a scheduled job to run the expiration function (if using pg_cron)
-- SELECT cron.schedule('expire-boosts', '*/5 * * * *', 'SELECT expire_campaign_boosts();');
