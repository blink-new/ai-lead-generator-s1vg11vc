import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import blink from '../blink/client'

interface AnalyticsData {
  totalLists: number
  totalLeads: number
  averageLeadsPerList: number
  topNiches: { niche: string; count: number }[]
}

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalLists: 0,
    totalLeads: 0,
    averageLeadsPerList: 0,
    topNiches: []
  })
  const [loading, setLoading] = useState(true)

  const loadAnalytics = async () => {
    try {
      const user = await blink.auth.me()
      const lists = await blink.db.leadLists.list({
        where: { userId: user.id }
      })

      const totalLists = lists.length
      const totalLeads = lists.reduce((sum, list) => sum + (list.totalLeads || 0), 0)
      const averageLeadsPerList = totalLists > 0 ? Math.round(totalLeads / totalLists) : 0

      // Count niches
      const nicheCount: { [key: string]: number } = {}
      lists.forEach(list => {
        nicheCount[list.niche] = (nicheCount[list.niche] || 0) + 1
      })

      const topNiches = Object.entries(nicheCount)
        .map(([niche, count]) => ({ niche, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setAnalytics({
        totalLists,
        totalLeads,
        averageLeadsPerList,
        topNiches
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track your lead generation performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lists</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLists}</div>
            <p className="text-xs text-muted-foreground">
              Lead lists generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Prospects generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per List</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageLeadsPerList}</div>
            <p className="text-xs text-muted-foreground">
              Leads per generation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLists}</div>
            <p className="text-xs text-muted-foreground">
              AI requests made
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Niches */}
      {analytics.topNiches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Niches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topNiches.map((item, index) => (
                <div key={item.niche} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                    </div>
                    <span className="font-medium">{item.niche}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(item.count / Math.max(...analytics.topNiches.map(n => n.count))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {analytics.totalLists === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate some leads to see your analytics here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}