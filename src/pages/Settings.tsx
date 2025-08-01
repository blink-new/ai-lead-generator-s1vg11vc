import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Zap, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import blink from '../blink/client'

export function Settings() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async () => {
    try {
      const userData = await blink.auth.me()
      setUser(userData)
    } catch (error) {
      console.error('Failed to load user:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const exportAllData = async () => {
    try {
      const lists = await blink.db.leadLists.list({
        where: { userId: user.id }
      })

      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName
        },
        lists: lists.map(list => ({
          ...list,
          leads: JSON.parse(list.leads)
        })),
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-lead-generator-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={user?.displayName || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Profile information is managed through your authentication provider.
            </p>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default Model</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Currently using GPT-4o Mini for optimal speed and quality
              </p>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">GPT-4o Mini</span>
                  <span className="text-sm text-primary">Active</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Fast, cost-effective model perfect for lead generation
                </p>
              </div>
            </div>
            <div>
              <Label>Generation Settings</Label>
              <div className="grid gap-3 mt-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <span className="font-medium">Leads per generation</span>
                    <p className="text-xs text-muted-foreground">Default number of leads to generate</p>
                  </div>
                  <span className="text-sm">10</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <span className="font-medium">Personalization level</span>
                    <p className="text-xs text-muted-foreground">Depth of personalized intros</p>
                  </div>
                  <span className="text-sm">High</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Export Data</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Download all your lead lists and data in JSON format
              </p>
              <Button onClick={exportAllData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              About AI Lead Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Built with</span>
                <span className="text-sm">React + Blink SDK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">AI Model</span>
                <span className="text-sm">GPT-4o Mini</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}