# Thula Funds Setup Guide

## Overview
Thula Funds is a crowdfunding platform with Web3 integration using Onchain Kit for USDC payments on Base network.

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# WalletConnect (Optional but recommended)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Onchain Kit Configuration
NEXT_PUBLIC_APP_NAME=Thula Funds
NEXT_PUBLIC_APP_DESCRIPTION=Crowdfunding platform with USDC payments
NEXT_PUBLIC_APP_URL=https://thulafunds.app
NEXT_PUBLIC_APP_ICON=https://thulafunds.app/logo.png
```

## WalletConnect Project ID Setup

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up/Login and create a new project
3. Copy your Project ID
4. Add it to your `.env.local` file

**Note**: WalletConnect Project ID is optional but recommended for better wallet connection reliability.

## Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema scripts in the `scripts/` folder:
   - `database-schema.sql` - Main schema
   - `wallet-integration-schema.sql` - Wallet integration tables
   - `x402-schema.sql` - Payment verification tables

3. Update your environment variables with Supabase credentials

## Development Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables (see above)

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Onchain Kit Integration

Thula Funds uses Onchain Kit for Web3 integration:

### Features
- **Wallet Connection**: Supports Coinbase Wallet, MetaMask, WalletConnect, and other Web3 wallets
- **USDC Payments**: Direct USDC transfers on Base network
- **Network Management**: Automatic Base network detection and switching
- **Balance Checking**: Real-time USDC balance verification
- **Transaction Tracking**: Payment status and confirmation handling

### Configuration
- **Network**: Base Mainnet
- **Currency**: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Provider**: Onchain Kit with ConnectKit

### Components
- `OnchainProvider` - Main provider for Web3 functionality
- `OnchainWalletConnect` - Wallet connection component
- `ContributionForm` - Payment form with Onchain Kit integration

## Common Issues & Solutions

### 1. Wallet Connection Issues
**Problem**: "Failed to connect wallet" or "Wallet not properly initialized"
**Solutions**:
- Ensure WalletConnect Project ID is set (optional but recommended)
- Check if wallet extension is installed and unlocked
- Try refreshing the page and reconnecting
- Clear browser cache and try again

### 2. Network Issues
**Problem**: "Please switch to Base network" or "Wrong network"
**Solutions**:
- The app will automatically prompt to switch to Base network
- Manually add Base network to your wallet if needed:
  - Network Name: Base
  - RPC URL: https://mainnet.base.org
  - Chain ID: 8453
  - Currency Symbol: ETH
  - Block Explorer: https://basescan.org

### 3. USDC Balance Issues
**Problem**: "Insufficient USDC balance" or "Balance not showing"
**Solutions**:
- Ensure you have USDC tokens on Base network
- Get USDC from Coinbase or other exchanges
- Bridge USDC from other networks using Base Bridge
- Check if the USDC contract address is correct

### 4. Transaction Failures
**Problem**: "Transaction failed" or "User rejected transaction"
**Solutions**:
- Check if you have enough ETH for gas fees
- Ensure sufficient USDC balance
- Try increasing gas limit if transaction is pending
- Check network congestion on Base

### 5. Payment Verification Issues
**Problem**: "Payment verification failed" or "Transaction not found"
**Solutions**:
- Wait a few minutes for transaction confirmation
- Check transaction on BaseScan: https://basescan.org
- Ensure transaction hash is correct
- Contact support if issue persists

### 6. Build Errors
**Problem**: TypeScript errors or build failures
**Solutions**:
- Run `pnpm install` to ensure all dependencies are installed
- Check for missing environment variables
- Clear `.next` folder and rebuild: `rm -rf .next && pnpm build`
- Update TypeScript types if needed

## Testing

### Test USDC on Base
1. Get test USDC from Base faucet or Coinbase
2. Ensure you have some ETH for gas fees
3. Test small contributions first

### Test Wallet Connections
1. Try different wallets (Coinbase Wallet, MetaMask, etc.)
2. Test network switching
3. Verify balance display

## Production Deployment

1. Set up production environment variables
2. Configure proper domain and SSL
3. Update app URLs in Onchain Kit config
4. Test all payment flows thoroughly
5. Monitor transaction success rates

## Support

For issues related to:
- **Onchain Kit**: Check [Onchain Kit documentation](https://onchainkit.com/)
- **Base Network**: Visit [Base documentation](https://docs.base.org/)
- **USDC**: Check [Circle's documentation](https://developers.circle.com/)

## Troubleshooting Checklist

- [ ] Environment variables set correctly
- [ ] WalletConnect Project ID configured (optional)
- [ ] Database schema applied
- [ ] Base network added to wallet
- [ ] USDC balance available
- [ ] ETH for gas fees
- [ ] Wallet extension installed and unlocked
- [ ] Browser cache cleared
- [ ] Network connection stable 