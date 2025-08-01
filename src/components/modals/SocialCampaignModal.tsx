import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { SocialCampaign } from '../../types'

interface SocialCampaignModalProps {
  campaign?: SocialCampaign
  isOpen: boolean
  onClose: () => void
  onSave: (campaign: Partial<SocialCampaign>) => Promise<void>
}

export function SocialCampaignModal({ campaign, isOpen, onClose, onSave }: SocialCampaignModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    platform: 'instagram' as const,
    status: 'draft' as const,
    startDate: '',
    endDate: '',
    budget: 0,
    reach: 0,
    engagement: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title,
        clientId: campaign.clientId,
        platform: campaign.platform,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        budget: campaign.budget,
        reach: campaign.reach,
        engagement: campaign.engagement
      })
    } else {
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const endDate = nextMonth.toISOString().split('T')[0]
      
      setFormData({
        title: '',
        clientId: '',
        platform: 'instagram',
        status: 'draft',
        startDate: today,
        endDate: endDate,
        budget: 0,
        reach: 0,
        engagement: 0
      })
    }
  }, [campaign, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({
        ...formData,
        id: campaign?.id
      })
      onClose()
    } catch (error) {
      console.error('Error saving campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Campaign Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="clientId">Client</Label>
            <Input
              id="clientId"
              placeholder="Client name or ID"
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={formData.platform} onValueChange={(value: any) => setFormData(prev => ({ ...prev, platform: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="budget">Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reach">Expected Reach</Label>
              <Input
                id="reach"
                type="number"
                value={formData.reach}
                onChange={(e) => setFormData(prev => ({ ...prev, reach: Number(e.target.value) }))}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="engagement">Expected Engagement</Label>
              <Input
                id="engagement"
                type="number"
                value={formData.engagement}
                onChange={(e) => setFormData(prev => ({ ...prev, engagement: Number(e.target.value) }))}
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gradient-bg text-white">
              {loading ? 'Saving...' : 'Save Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}