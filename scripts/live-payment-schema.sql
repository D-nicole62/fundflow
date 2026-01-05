-- Add payment proof tracking to campaign_boosts
ALTER TABLE campaign_boosts 
ADD COLUMN IF NOT EXISTS payment_proof TEXT,
ADD COLUMN IF NOT EXISTS tx_hash TEXT,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(12,6);

-- Create index for payment tracking
CREATE INDEX IF NOT EXISTS idx_campaign_boosts_payment 
ON campaign_boosts(tx_hash) 
WHERE tx_hash IS NOT NULL;

-- Add payment verification log table
CREATE TABLE IF NOT EXISTS payment_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_hash TEXT NOT NULL,
  amount DECIMAL(12,6) NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  api_endpoint TEXT NOT NULL,
  verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('verified', 'failed', 'pending'))
);

-- Enable RLS
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for payment verifications
CREATE POLICY "System can manage payment verifications" ON payment_verifications FOR ALL USING (true);

-- Create unique index to prevent duplicate verifications
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_verifications_tx_hash 
ON payment_verifications(tx_hash);
