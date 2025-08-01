import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Plus, 
  Calendar,
  TrendingUp,
  Users,
  Share2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { SocialCampaignModal } from '../components/modals/SocialCampaignModal'
import blink from '../blink/client'
import { SocialCampaign, SocialCampaignRecord } from '../types'
import { transformSocialCampaign, socialCampaignToRecord } from '../utils/dataTransforms'

export function SocialMedia() {
  const [campaigns, setCampaigns] = useState<SocialCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<SocialCampaign | undefined>()

  const loadCampaigns = async () => {
    try {
      const user = await blink.auth.me()
      const campaignsData = await blink.db.social_campaigns.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      }).catch(() => []) as SocialCampaignRecord[]
      
      setCampaigns(campaignsData.map(transformSocialCampaign))
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  const handleSaveCampaign = async (campaignData: Partial<SocialCampaign>) => {
    try {
      const user = await blink.auth.me()
      const record = socialCampaignToRecord(campaignData, user.id)
      
      if (campaignData.id) {
        // Update existing campaign
        await blink.db.social_campaigns.update(campaignData.id, record)
      } else {
        // Create new campaign
        await blink.db.social_campaigns.create(record)
      }
      
      await loadCampaigns()
      setEditingCampaign(undefined)
    } catch (error) {
      console.error('Error saving campaign:', error)
      throw error
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await blink.db.social_campaigns.delete(campaignId)
        await loadCampaigns()
      } catch (error) {
        console.error('Error deleting campaign:', error)
      }
    }
  }

  const handleEditCampaign = (campaign: SocialCampaign) => {
    setEditingCampaign(campaign)
    setIsModalOpen(true)
  }

  const handleAddCampaign = () => {
    setEditingCampaign(undefined)
    setIsModalOpen(true)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return Instagram
      case 'facebook': return Facebook
      case 'twitter': return Twitter
      case 'linkedin': return Linkedin
      default: return Share2
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0) || 0
  const totalReach = campaigns.reduce((sum, campaign) => sum + (campaign.reach || 0), 0) || 0
  const totalEngagement = campaigns.reduce((sum, campaign) => sum + (campaign.engagement || 0), 0) || 0

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Social Media</h1>
          <p className="text-muted-foreground">Manage your social media campaigns and content</p>
        </div>
        <Button onClick={handleAddCampaign} className="gradient-bg text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">People reached</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Campaigns</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => {
            const PlatformIcon = getPlatformIcon(campaign.platform)
            return (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <PlatformIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{campaign.clientId}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditCampaign(campaign)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <div className="text-sm font-medium">
                      ${(campaign.budget || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Reach</p>
                      <p className="font-medium">{(campaign.reach || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Engagement</p>
                      <p className="font-medium">{(campaign.engagement || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {campaigns.length === 0 && !loading && (
        <div className="text-center py-12">
          <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first social media campaign to get started
          </p>
          <Button onClick={handleAddCampaign} className="gradient-bg text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      )}

      {/* Campaign Modal */}
      <SocialCampaignModal
        campaign={editingCampaign}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCampaign}
      />
    </div>
  )
}