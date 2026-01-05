-- Simplified payment tracking without external API dependencies
ALTER TABLE campaign_boosts 
ADD COLUMN IF NOT EXISTS payment_session TEXT,
ADD COLUMN IF NOT EXISTS tx_hash TEXT,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(12,6);

-- Simple payment log table
CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_hash TEXT NOT NULL,
  amount DECIMAL(12,6) NOT NULL,
  from_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'failed'))
);

-- Enable RLS
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for payment sessions
CREATE POLICY "Users can view their payment sessions" ON payment_sessions 
FOR SELECT USING (from_address = ANY(
  SELECT wallet_address FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "System can create payment sessions" ON payment_sessions 
FOR INSERT WITH CHECK (true);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_payment_sessions_tx_hash ON payment_sessions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_endpoint ON payment_sessions(endpoint, created_at);
