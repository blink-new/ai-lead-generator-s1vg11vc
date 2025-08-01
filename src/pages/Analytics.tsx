import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { 
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Target
} from 'lucide-react'
import blink from '../blink/client'
import { ClientRecord, SocialCampaignRecord, UpworkProjectRecord, LinkedInContactRecord } from '../types'

export function Analytics() {
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    activeClients: 0,
    successRate: 0,
    avgProjectValue: 0
  })
  const [loading, setLoading] = useState(true)

  const loadAnalytics = async () => {
    try {
      const user = await blink.auth.me()
      
      // Load all data
      const [clients, campaigns, upworkProjects, linkedinContacts] = await Promise.all([
        blink.db.clients.list({ where: { user_id: user.id } }).catch(() => []) as Promise<ClientRecord[]>,
        blink.db.social_campaigns.list({ where: { user_id: user.id } }).catch(() => []) as Promise<SocialCampaignRecord[]>,
        blink.db.upwork_projects.list({ where: { user_id: user.id } }).catch(() => []) as Promise<UpworkProjectRecord[]>,
        blink.db.linkedin_contacts.list({ where: { user_id: user.id } }).catch(() => []) as Promise<LinkedInContactRecord[]>
      ])

      // Calculate real stats
      const monthlyRevenue = clients.reduce((sum, client) => sum + (client.monthly_value || 0), 0)
      const activeClients = clients.filter(c => c.status === 'active').length
      const completedProjects = upworkProjects.filter(p => p.status === 'completed').length
      const totalProjects = upworkProjects.length
      const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
      const avgProjectValue = totalProjects > 0 ? Math.round(upworkProjects.reduce((sum, p) => sum + (p.budget || 0), 0) / totalProjects) : 0

      setStats({
        monthlyRevenue,
        activeClients,
        successRate,
        avgProjectValue
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Track your agency's performance and growth metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${stats.monthlyRevenue.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">From active clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.activeClients}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${stats.successRate}%`}
            </div>
            <p className="text-xs text-muted-foreground">Completed projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Project Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${stats.avgProjectValue.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">Per project</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Revenue chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Project Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Project timeline will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Service Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <h3 className="font-medium">Social Media Marketing</h3>
                <p className="text-sm text-muted-foreground">12 active campaigns</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$8,500</p>
                <p className="text-sm text-green-600">+15% growth</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <h3 className="font-medium">Upwork Projects</h3>
                <p className="text-sm text-muted-foreground">8 active projects</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$5,200</p>
                <p className="text-sm text-green-600">+8% growth</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <h3 className="font-medium">LinkedIn Outreach</h3>
                <p className="text-sm text-muted-foreground">45 active connections</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$2,050</p>
                <p className="text-sm text-green-600">+22% growth</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}