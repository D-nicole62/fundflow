export interface Profile {
  id: string
  full_name: string
  avatar_url?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  title: string
  description: string
  goal_amount: number
  current_amount: number
  image_url?: string
  category: string
  status: 'active' | 'completed' | 'cancelled'
  creator_id: string
  end_date?: string
  created_at: string
  updated_at: string
  wallet_address?: string
  profiles?: Profile // Creator profile
  contributions?: Contribution[]
  campaign_updates?: CampaignUpdate[]
}

export interface Contribution {
  id: string
  campaign_id: string
  contributor_id?: string
  amount: number
  message?: string
  anonymous: boolean
  transaction_hash?: string
  created_at: string
  profiles?: Profile // Contributor profile
}

export interface CampaignUpdate {
  id: string
  campaign_id: string
  title: string
  content: string
  created_at: string
}

export interface CampaignDetailViewProps {
  campaign: Campaign
  contributions: Contribution[]
  updates: CampaignUpdate[]
  currentUser: Profile | null
}

export interface CampaignHeaderProps {
  campaign: {
    title: string
    description: string
    image_url?: string
    category: string
    created_at: string
    profiles?: Profile
  }
}

export interface CampaignProgressProps {
  campaign: {
    current_amount: number
    goal_amount: number
    contributions?: Contribution[]
    created_at: string
  }
  onContributeAction: () => void
}

export interface CampaignCreatorProps {
  creator: Profile
}

export interface CampaignPaymentInfoProps {
  walletAddress?: string
}

export interface CampaignUpdatesProps {
  updates: CampaignUpdate[]
}

export interface RecentContributionsProps {
  contributions: Contribution[]
}

export interface ContributionFormProps {
  campaign: {
    id: string
    title: string
    goal_amount: number
    current_amount: number
    wallet_address?: string
  }
  currentUser: Profile | null
  onCloseAction: () => void
} 