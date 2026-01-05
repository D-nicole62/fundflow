// Script to check campaigns and identify invalid wallet addresses
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkCampaigns() {
  try {
    console.log('Checking campaigns...')
    
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('id, title, wallet_address, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
      return
    }

    console.log(`\nFound ${campaigns.length} campaigns:`)
    console.log('='.repeat(80))

    let validCount = 0
    let invalidCount = 0

    campaigns.forEach((campaign, index) => {
      const isValid = campaign.wallet_address && 
                     campaign.wallet_address.startsWith('0x') && 
                     campaign.wallet_address.length === 42
      
      console.log(`${index + 1}. ${campaign.title}`)
      console.log(`   ID: ${campaign.id}`)
      console.log(`   Status: ${campaign.status}`)
      console.log(`   Wallet: ${campaign.wallet_address || 'NOT SET'}`)
      console.log(`   Valid: ${isValid ? '✅' : '❌'}`)
      console.log('')

      if (isValid) {
        validCount++
      } else {
        invalidCount++
      }
    })

    console.log('='.repeat(80))
    console.log(`Summary:`)
    console.log(`- Valid campaigns: ${validCount}`)
    console.log(`- Invalid campaigns: ${invalidCount}`)
    console.log(`- Total: ${campaigns.length}`)

    if (invalidCount > 0) {
      console.log('\n⚠️  Campaigns with invalid wallet addresses:')
      campaigns.forEach(campaign => {
        const isValid = campaign.wallet_address && 
                       campaign.wallet_address.startsWith('0x') && 
                       campaign.wallet_address.length === 42
        
        if (!isValid) {
          console.log(`- ${campaign.title} (${campaign.id})`)
        }
      })
    }

  } catch (error) {
    console.error('Script error:', error)
  }
}

checkCampaigns() 