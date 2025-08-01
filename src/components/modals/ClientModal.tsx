import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { X, Plus } from 'lucide-react'
import { Client } from '../../types'

interface ClientModalProps {
  client?: Client
  isOpen: boolean
  onClose: () => void
  onSave: (client: Partial<Client>) => Promise<void>
  trigger?: React.ReactNode
}

export function ClientModal({ client, isOpen, onClose, onSave, trigger }: ClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'prospect' as const,
    monthlyValue: 0,
    services: [] as string[]
  })
  const [newService, setNewService] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone,
        status: client.status,
        monthlyValue: client.monthlyValue,
        services: client.services
      })
    } else {
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'prospect',
        monthlyValue: 0,
        services: []
      })
    }
  }, [client, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({
        ...formData,
        id: client?.id
      })
      onClose()
    } catch (error) {
      console.error('Error saving client:', error)
    } finally {
      setLoading(false)
    }
  }

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }))
      setNewService('')
    }
  }

  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }))
  }

  const content = (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="monthlyValue">Monthly Value ($)</Label>
          <Input
            id="monthlyValue"
            type="number"
            value={formData.monthlyValue}
            onChange={(e) => setFormData(prev => ({ ...prev, monthlyValue: Number(e.target.value) }))}
            min="0"
          />
        </div>

        <div>
          <Label>Services</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add service..."
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
            />
            <Button type="button" onClick={addService} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {formData.services.map((service, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {service}
                <button
                  type="button"
                  onClick={() => removeService(service)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gradient-bg text-white">
            {loading ? 'Saving...' : 'Save Client'}
          </Button>
        </div>
      </form>
    </DialogContent>
  )

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {content}
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {content}
    </Dialog>
  )
}