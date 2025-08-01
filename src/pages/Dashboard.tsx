import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Share2,
  Briefcase,
  Linkedin,
  Plus,
  ArrowUpRight,
  Activity,
  Target,
  Zap,
  UserCheck
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import blink from '../blink/client'
import { DashboardStats, RecentActivity, ClientRecord, SocialCampaignRecord, UpworkProjectRecord, LinkedInContactRecord } from '../types'

export function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    monthlyRevenue: 0,
    activeProjects: 0,
    upcomingTasks: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      const user = await blink.auth.me()
      
      // Load all data in parallel
      const [clients, campaigns, upworkProjects, linkedinContacts] = await Promise.all([
        blink.db.clients.list({ where: { user_id: user.id } }).catch(() => []) as Promise<ClientRecord[]>,
        blink.db.social_campaigns.list({ where: { user_id: user.id } }).catch(() => []) as Promise<SocialCampaignRecord[]>,
        blink.db.upwork_projects.list({ where: { user_id: user.id } }).catch(() => []) as Promise<UpworkProjectRecord[]>,
        blink.db.linkedin_contacts.list({ where: { user_id: user.id } }).catch(() => []) as Promise<LinkedInContactRecord[]>
      ])

      // Calculate stats with safe defaults
      const monthlyRevenue = clients.reduce((sum, client) => sum + (client.monthly_value || 0), 0) || 0
      const activeProjects = upworkProjects.filter(p => p.status === 'active').length || 0
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length || 0
      
      setStats({
        totalClients: clients.length || 0,
        monthlyRevenue: monthlyRevenue,
        activeProjects: activeProjects + activeCampaigns,
        upcomingTasks: upworkProjects.filter(p => p.status === 'proposal').length || 0
      })

      // Generate recent activity from actual data
      const activities: RecentActivity[] = []
      
      // Recent clients
      clients.slice(0, 2).forEach(client => {
        activities.push({
          id: `client_${client.id}`,
          type: 'client',
          title: 'New client added',
          description: `${client.name} - ${client.company}`,
          timestamp: new Date(client.created_at).toLocaleDateString(),
          status: 'completed'
        })
      })

      // Recent campaigns
      campaigns.slice(0, 2).forEach(campaign => {
        activities.push({
          id: `campaign_${campaign.id}`,
          type: 'social',
          title: 'Campaign created',
          description: `${campaign.title} on ${campaign.platform}`,
          timestamp: new Date(campaign.created_at).toLocaleDateString(),
          status: campaign.status === 'active' ? 'completed' : 'pending'
        })
      })

      // Recent Upwork projects
      upworkProjects.slice(0, 2).forEach(project => {
        activities.push({
          id: `project_${project.id}`,
          type: 'project',
          title: 'Upwork proposal submitted',
          description: project.title,
          timestamp: new Date(project.created_at).toLocaleDateString(),
          status: project.status === 'active' ? 'completed' : 'pending'
        })
      })

      // Recent LinkedIn contacts
      linkedinContacts.slice(0, 1).forEach(contact => {
        activities.push({
          id: `linkedin_${contact.id}`,
          type: 'linkedin',
          title: 'LinkedIn contact added',
          description: `${contact.name} at ${contact.company}`,
          timestamp: new Date(contact.created_at).toLocaleDateString(),
          status: contact.status === 'connected' ? 'completed' : 'pending'
        })
      })

      // Sort by most recent and take top 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activities.slice(0, 5))

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: TrendingUp,
      change: '+3',
      changeType: 'positive' as const
    },
    {
      title: 'Pending Tasks',
      value: stats.upcomingTasks,
      icon: Calendar,
      change: '5 due today',
      changeType: 'neutral' as const
    }
  ]

  const quickActions = [
    { title: 'Add New Deal', icon: Target, href: '/pipeline' },
    { title: 'Create Activity', icon: Activity, href: '/activities' },
    { title: 'Add New Client', icon: Users, href: '/clients' },
    { title: 'Manage Team', icon: UserCheck, href: '/team' },
    { title: 'Create Automation', icon: Zap, href: '/automation' },
    { title: 'LinkedIn Outreach', icon: Linkedin, href: '/linkedin' }
  ]

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your agency.</p>
        </div>
        <Button className="gradient-bg text-white" onClick={() => navigate('/clients')}>
          <Plus className="w-4 h-4 mr-2" />
          Quick Add
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                <Badge 
                  variant={stat.changeType === 'positive' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-auto p-3"
                onClick={() => navigate(action.href)}
              >
                <action.icon className="w-4 h-4 mr-3" />
                <span>{action.title}</span>
                <ArrowUpRight className="w-4 h-4 ml-auto" />
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'pending' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                    <Badge 
                      variant={activity.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground">Start by adding clients or creating campaigns</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}