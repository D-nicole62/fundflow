-- Add wallet fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS wallet_type TEXT DEFAULT 'coinbase_smart_wallet',
ADD COLUMN IF NOT EXISTS wallet_verified BOOLEAN DEFAULT FALSE;

-- Add wallet address to campaigns table for direct payments
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'x402_usdc';

-- Create wallet_transactions table for tracking x402 payments
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

-- Create indexes for wallet queries
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_wallet_address ON campaigns(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_campaign ON wallet_transactions(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_hash ON wallet_transactions(transaction_hash) WHERE transaction_hash IS NOT NULL;

-- Enable RLS for wallet_transactions
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for wallet_transactions
CREATE POLICY "Users can view their wallet transactions" ON wallet_transactions FOR SELECT USING (
  auth.uid() IN (
    SELECT creator_id FROM campaigns WHERE id = campaign_id
  ) OR 
  contributor_wallet IN (
    SELECT wallet_address FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "System can insert wallet transactions" ON wallet_transactions FOR INSERT WITH CHECK (true);

-- Function to update campaign amount from wallet transactions
CREATE OR REPLACE FUNCTION update_campaign_from_wallet_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE campaigns 
    SET current_amount = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM wallet_transactions 
      WHERE campaign_id = NEW.campaign_id AND status = 'completed'
    )
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for wallet transaction updates
CREATE OR REPLACE TRIGGER on_wallet_transaction_completed
  AFTER UPDATE ON wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION update_campaign_from_wallet_transaction();
