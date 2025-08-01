import { useState, useEffect } from 'react'
import { BookmarkCheck, Download, Trash2, Eye, Calendar, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import blink from '../blink/client'

interface SavedList {
  id: string
  niche: string
  leads: string
  createdAt: string
  totalLeads: number
  userId: string
}

interface Lead {
  id: string
  companyName: string
  contactName: string
  contactEmail: string
  contactTitle: string
  personalizedIntro: string
  industry: string
  companySize: string
  website?: string
}

export function SavedLists() {
  const [savedLists, setSavedLists] = useState<SavedList[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedList, setSelectedList] = useState<SavedList | null>(null)
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([])

  const loadSavedLists = async () => {
    try {
      const user = await blink.auth.me()
      const lists = await blink.db.leadLists.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setSavedLists(lists)
    } catch (error) {
      console.error('Failed to load saved lists:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSavedLists()
  }, [])

  const deleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this lead list?')) return

    try {
      await blink.db.leadLists.delete(listId)
      setSavedLists(prev => prev.filter(list => list.id !== listId))
      if (selectedList?.id === listId) {
        setSelectedList(null)
        setSelectedLeads([])
      }
    } catch (error) {
      console.error('Failed to delete list:', error)
      alert('Failed to delete list. Please try again.')
    }
  }

  const viewList = (list: SavedList) => {
    setSelectedList(list)
    try {
      const leads = JSON.parse(list.leads)
      setSelectedLeads(leads)
    } catch (error) {
      console.error('Failed to parse leads:', error)
      setSelectedLeads([])
    }
  }

  const exportList = (list: SavedList) => {
    try {
      const leads = JSON.parse(list.leads)
      const csvContent = [
        ['Company Name', 'Contact Name', 'Email', 'Title', 'Personalized Intro', 'Industry', 'Company Size', 'Website'],
        ...leads.map((lead: Lead) => [
          lead.companyName,
          lead.contactName,
          lead.contactEmail,
          lead.contactTitle,
          lead.personalizedIntro,
          lead.industry,
          lead.companySize,
          lead.website || ''
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${list.niche}-leads-${new Date(list.createdAt).toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export list:', error)
      alert('Failed to export list. Please try again.')
    }
  }

  const filteredLists = savedLists.filter(list =>
    list.niche.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Saved Lead Lists</h1>
        <p className="text-muted-foreground">Manage and export your generated lead lists</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search by niche..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Lists Grid */}
      {filteredLists.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLists.map((list) => (
            <Card key={list.id} className="lead-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookmarkCheck className="w-4 h-4 text-primary" />
                      {list.niche}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {list.totalLeads} leads
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(list.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{list.totalLeads}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewList(list)}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportList(list)}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteList(list.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <BookmarkCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Saved Lists Yet</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No lists match your search.' : 'Generate some leads first to see them here.'}
            </p>
            <Button onClick={() => window.location.href = '/generator'}>
              Generate Your First List
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Selected List Modal/Details */}
      {selectedList && selectedLeads.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedList.niche}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedLeads.length} leads • Created {new Date(selectedList.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportList(selectedList)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedList(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-4 md:grid-cols-2">
                {selectedLeads.map((lead, index) => (
                  <Card key={lead.id} className="lead-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{lead.companyName}</h3>
                          <p className="text-sm text-muted-foreground">{lead.industry}</p>
                        </div>
                        <Badge variant="secondary">#{index + 1}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-sm">{lead.contactName}</p>
                          <p className="text-xs text-muted-foreground">{lead.contactTitle}</p>
                          <p className="text-xs text-muted-foreground">{lead.contactEmail}</p>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <p className="text-xs leading-relaxed">{lead.personalizedIntro}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}