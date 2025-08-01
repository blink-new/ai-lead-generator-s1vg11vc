import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { LinkedInContact } from '../../types'

interface LinkedInContactModalProps {
  contact?: LinkedInContact
  isOpen: boolean
  onClose: () => void
  onSave: (contact: Partial<LinkedInContact>) => Promise<void>
}

export function LinkedInContactModal({ contact, isOpen, onClose, onSave }: LinkedInContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    status: 'pending' as const,
    connectionDate: '',
    lastMessage: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        title: contact.title,
        company: contact.company,
        status: contact.status,
        connectionDate: contact.connectionDate || '',
        lastMessage: contact.lastMessage || '',
        notes: contact.notes
      })
    } else {
      setFormData({
        name: '',
        title: '',
        company: '',
        status: 'pending',
        connectionDate: '',
        lastMessage: '',
        notes: ''
      })
    }
  }, [contact, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({
        ...formData,
        connectionDate: formData.connectionDate || undefined,
        lastMessage: formData.lastMessage || undefined,
        id: contact?.id
      })
      onClose()
    } catch (error) {
      console.error('Error saving contact:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="connected">Connected</SelectItem>
                  <SelectItem value="messaged">Messaged</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="connectionDate">Connection Date (Optional)</Label>
              <Input
                id="connectionDate"
                type="date"
                value={formData.connectionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, connectionDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lastMessage">Last Message (Optional)</Label>
            <Textarea
              id="lastMessage"
              value={formData.lastMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, lastMessage: e.target.value }))}
              rows={2}
              placeholder="Last message sent or received..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Notes about this contact..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gradient-bg text-white">
              {loading ? 'Saving...' : 'Save Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}