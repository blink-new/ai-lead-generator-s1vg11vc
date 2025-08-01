import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Plus, 
  Linkedin,
  Users,
  MessageSquare,
  TrendingUp,
  MoreHorizontal,
  Send,
  UserPlus,
  Edit,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { LinkedInContactModal } from '../components/modals/LinkedInContactModal'
import blink from '../blink/client'
import { LinkedInContact, LinkedInContactRecord } from '../types'
import { transformLinkedInContact, linkedInContactToRecord } from '../utils/dataTransforms'

export function LinkedInOutreach() {
  const [contacts, setContacts] = useState<LinkedInContact[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<LinkedInContact | undefined>()

  const loadContacts = async () => {
    try {
      const user = await blink.auth.me()
      const contactsData = await blink.db.linkedin_contacts.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      }).catch(() => []) as LinkedInContactRecord[]
      
      setContacts(contactsData.map(transformLinkedInContact))
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  const handleSaveContact = async (contactData: Partial<LinkedInContact>) => {
    try {
      const user = await blink.auth.me()
      const record = linkedInContactToRecord(contactData, user.id)
      
      if (contactData.id) {
        // Update existing contact
        await blink.db.linkedin_contacts.update(contactData.id, record)
      } else {
        // Create new contact
        await blink.db.linkedin_contacts.create(record)
      }
      
      await loadContacts()
      setEditingContact(undefined)
    } catch (error) {
      console.error('Error saving contact:', error)
      throw error
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await blink.db.linkedin_contacts.delete(contactId)
        await loadContacts()
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }

  const handleEditContact = (contact: LinkedInContact) => {
    setEditingContact(contact)
    setIsModalOpen(true)
  }

  const handleAddContact = () => {
    setEditingContact(undefined)
    setIsModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-blue-100 text-blue-800'
      case 'messaged': return 'bg-yellow-100 text-yellow-800'
      case 'responded': return 'bg-green-100 text-green-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalConnections = contacts.length || 0
  const responseRate = totalConnections > 0 ? Math.round((contacts.filter(c => c.status === 'responded').length / totalConnections) * 100) : 0
  const conversions = contacts.filter(c => c.status === 'converted').length || 0

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
          <h1 className="text-3xl font-bold text-foreground">LinkedIn Outreach</h1>
          <p className="text-muted-foreground">Manage your LinkedIn connections and outreach campaigns</p>
        </div>
        <Button onClick={handleAddContact} className="gradient-bg text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConnections}</div>
            <p className="text-xs text-muted-foreground">Active prospects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate}%</div>
            <p className="text-xs text-muted-foreground">Of outreach messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversions}</div>
            <p className="text-xs text-muted-foreground">Leads converted</p>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contacts</h2>
        <div className="space-y-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Linkedin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{contact.title} at {contact.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.lastMessage && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Last Message:</p>
                    <p className="text-sm text-muted-foreground">{contact.lastMessage}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium mb-1">Notes:</p>
                  <p className="text-sm text-muted-foreground">{contact.notes || 'No notes added'}</p>
                </div>

                {contact.connectionDate && (
                  <div className="text-sm text-muted-foreground">
                    Connected on {new Date(contact.connectionDate).toLocaleDateString()}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex space-x-2">
                    {contact.status === 'connected' && (
                      <Button size="sm" variant="outline">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    )}
                    {contact.status === 'pending' && (
                      <Button size="sm" variant="outline">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow Up
                      </Button>
                    )}
                  </div>
                  {contact.status === 'responded' && (
                    <Button size="sm" className="gradient-bg text-white">
                      Convert to Client
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {contacts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Linkedin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No contacts yet</h3>
          <p className="text-muted-foreground mb-4">
            Start building your LinkedIn network by adding contacts
          </p>
          <Button onClick={handleAddContact} className="gradient-bg text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      )}

      {/* Contact Modal */}
      <LinkedInContactModal
        contact={editingContact}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
      />
    </div>
  )
}