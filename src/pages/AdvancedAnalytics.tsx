import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Activity,
  Calendar,
  Award,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter
} from 'lucide-react'
import blink from '../blink/client'
import { 
  ClientRecord, 
  DealRecord, 
  ActivityRecord, 
  SocialCampaignRecord,
  UpworkProjectRecord,
  PipelineAnalytics,
  ActivityAnalytics,
  RevenueAnalytics
} from '../types'
import { useToast } from '../hooks/use-toast'

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#84CC16']

export function AdvancedAnalytics() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')
  const [pipelineAnalytics, setPipelineAnalytics] = useState<PipelineAnalytics | null>(null)
  const [activityAnalytics, setActivityAnalytics] = useState<ActivityAnalytics | null>(null)
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null)
  const [overviewStats, setOverviewStats] = useState({
    totalRevenue: 0,
    totalDeals: 0,
    conversionRate: 0,
    avgDealSize: 0,
    totalActivities: 0,
    completionRate: 0,
    activeClients: 0,
    pipelineValue: 0
  })
  const { toast } = useToast()

  const loadAnalytics = async () => {
    try {
      const user = await blink.auth.me()
      
      // Load all data
      const [clients, deals, activities, campaigns, upworkProjects] = await Promise.all([
        blink.db.clients.list({ where: { user_id: user.id } }) as Promise<ClientRecord[]>,
        blink.db.deals.list({ where: { user_id: user.id } }) as Promise<DealRecord[]>,
        blink.db.activities.list({ where: { user_id: user.id } }) as Promise<ActivityRecord[]>,
        blink.db.social_campaigns.list({ where: { user_id: user.id } }) as Promise<SocialCampaignRecord[]>,
        blink.db.upwork_projects.list({ where: { user_id: user.id } }) as Promise<UpworkProjectRecord[]>
      ])

      // Calculate overview stats
      const totalRevenue = clients.reduce((sum, client) => sum + (client.monthly_value || 0), 0) * 12
      const totalDeals = deals.length
      const wonDeals = deals.filter(d => d.stage_id === 'stage_5').length // Closed Won
      const conversionRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0
      const avgDealSize = totalDeals > 0 ? Math.round(deals.reduce((sum, deal) => sum + deal.value, 0) / totalDeals) : 0
      const totalActivities = activities.length
      const completedActivities = activities.filter(a => a.status === 'completed').length
      const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0
      const activeClients = clients.filter(c => c.status === 'active').length
      const pipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0)

      setOverviewStats({
        totalRevenue,
        totalDeals,
        conversionRate,
        avgDealSize,
        totalActivities,
        completionRate,
        activeClients,
        pipelineValue
      })

      // Calculate pipeline analytics
      const stageNames = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
      const stageConversion = stageNames.map((stage, index) => {
        const stageId = `stage_${index + 1}`
        const stageDeals = deals.filter(d => d.stage_id === stageId)
        const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
        const conversionRate = index === 0 ? 100 : Math.round((stageDeals.length / Math.max(deals.length, 1)) * 100)
        
        return {
          stage,
          deals: stageDeals.length,
          value: stageValue,
          conversionRate
        }
      })

      const avgTimeInStage = stageNames.map(stage => ({
        stage,
        avgDays: Math.floor(Math.random() * 30) + 5 // Mock data for now
      }))

      setPipelineAnalytics({
        stageConversion,
        avgTimeInStage,
        winRate: conversionRate,
        avgDealSize,
        totalPipelineValue: pipelineValue
      })

      // Calculate activity analytics
      const activityTypes = ['call', 'email', 'meeting', 'note', 'task']
      const byType = activityTypes.map(type => {
        const typeActivities = activities.filter(a => a.type === type)
        const completed = typeActivities.filter(a => a.status === 'completed').length
        const completionRate = typeActivities.length > 0 ? Math.round((completed / typeActivities.length) * 100) : 0
        
        return {
          type: type.charAt(0).toUpperCase() + type.slice(1),
          count: typeActivities.length,
          completionRate
        }
      })

      // Mock user data for byUser
      const byUser = [
        { user: 'You', activities: activities.length, completionRate }
      ]

      // Generate trends data (last 7 days)
      const trends = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          activities: Math.floor(Math.random() * 10) + 5,
          completed: Math.floor(Math.random() * 8) + 3
        }
      })

      setActivityAnalytics({
        byType,
        byUser,
        trends
      })

      // Calculate revenue analytics
      const monthly = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (5 - i))
        const monthRevenue = Math.floor(Math.random() * 50000) + 20000
        const monthDeals = Math.floor(Math.random() * 10) + 5
        
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthRevenue,
          deals: monthDeals,
          avgDealSize: Math.round(monthRevenue / monthDeals)
        }
      })

      const bySource = [
        { source: 'LinkedIn', revenue: 45000, deals: 12 },
        { source: 'Upwork', revenue: 32000, deals: 8 },
        { source: 'Referral', revenue: 28000, deals: 6 },
        { source: 'Website', revenue: 15000, deals: 4 }
      ]

      const forecast = Array.from({ length: 3 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() + i + 1)
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          projected: Math.floor(Math.random() * 60000) + 40000,
          actual: i === 0 ? Math.floor(Math.random() * 55000) + 35000 : undefined
        }
      })

      setRevenueAnalytics({
        monthly,
        bySource,
        forecast
      })

    } catch (error) {
      console.error('Error loading analytics:', error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [dateRange]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${overviewStats.totalRevenue.toLocaleString()}</div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">+12%</span>
                  <span className="text-muted-foreground">from last period</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${overviewStats.pipelineValue.toLocaleString()}</div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">+8%</span>
                  <span className="text-muted-foreground">from last period</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.conversionRate}%</div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">+3%</span>
                  <span className="text-muted-foreground">from last period</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${overviewStats.avgDealSize.toLocaleString()}</div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingDown className="w-3 h-3 text-red-500" />
                  <span className="text-red-500">-2%</span>
                  <span className="text-muted-foreground">from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueAnalytics?.monthly || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityAnalytics?.byType || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366F1" />
                    <Bar dataKey="completionRate" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6 space-y-6">
          {/* Pipeline Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pipelineAnalytics?.winRate || 0}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${pipelineAnalytics?.totalPipelineValue.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${pipelineAnalytics?.avgDealSize.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Stages</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pipelineAnalytics?.stageConversion.filter(s => s.deals > 0).length || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stage Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pipelineAnalytics?.stageConversion || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="deals" fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Time in Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pipelineAnalytics?.avgTimeInStage || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} days`, 'Avg Time']} />
                    <Line type="monotone" dataKey="avgDays" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="mt-6 space-y-6">
          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.totalActivities}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.completionRate}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityAnalytics?.trends.reduce((sum, day) => sum + day.activities, 0) || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Active Type</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityAnalytics?.byType.reduce((max, type) => 
                    type.count > max.count ? type : max, { type: 'None', count: 0 }
                  ).type || 'None'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activityAnalytics?.byType || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count }) => `${type}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(activityAnalytics?.byType || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityAnalytics?.trends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="activities" stroke="#6366F1" strokeWidth={2} />
                    <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6 space-y-6">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${revenueAnalytics?.monthly.reduce((sum, month) => sum + month.revenue, 0).toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${Math.round((revenueAnalytics?.monthly.reduce((sum, month) => sum + month.revenue, 0) || 0) / 6).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Source</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueAnalytics?.bySource[0]?.source || 'None'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Month Forecast</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${revenueAnalytics?.forecast[0]?.projected.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueAnalytics?.bySource || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueAnalytics?.forecast || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                    <Line type="monotone" dataKey="projected" stroke="#6366F1" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}