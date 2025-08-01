import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Switch } from '../components/ui/switch'
import { 
  Plus, 
  Search, 
  Zap,
  Mail,
  Clock,
  Users,
  Play,
  Pause,
  Settings,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Target,
  Activity
} from 'lucide-react'
import blink from '../blink/client'
import { EmailSequence, EmailSequenceRecord, SequenceEnrollment, SequenceEnrollmentRecord, EmailStep } from '../types'
import { useToast } from '../hooks/use-toast'

const triggerTypes = {
  manual: { label: 'Manual', icon: Play, color: 'bg-blue-100 text-blue-800' },
  new_lead: { label: 'New Lead', icon: Users, color: 'bg-green-100 text-green-800' },
  stage_change: { label: 'Stage Change', icon: Target, color: 'bg-purple-100 text-purple-800' },
  date_based: { label: 'Date Based', icon: Calendar, color: 'bg-orange-100 text-orange-800' }
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
}

export function Automation() {
  const [sequences, setSequences] = useState<EmailSequence[]>([])
  const [enrollments, setEnrollments] = useState<SequenceEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTrigger, setSelectedTrigger] = useState<string>('all')
  const [isAddingSequence, setIsAddingSequence] = useState(false)
  const [activeTab, setActiveTab] = useState('sequences')
  const [newSequence, setNewSequence] = useState({
    name: '',
    description: '',
    triggerType: 'manual' as EmailSequence['triggerType'],
    steps: [
      {
        id: '1',
        subject: '',
        content: '',
        delay: 0
      }
    ] as EmailStep[]
  })
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      
      const [sequencesData, enrollmentsData] = await Promise.all([
        blink.db.email_sequences.list({ where: { user_id: user.id } }).catch(() => []) as Promise<EmailSequenceRecord[]>,
        blink.db.sequence_enrollments.list({}).catch(() => []) as Promise<SequenceEnrollmentRecord[]>
      ])

      // Transform sequences
      const transformedSequences: EmailSequence[] = sequencesData.map(seq => ({
        id: seq.id,
        userId: seq.user_id,
        name: seq.name,
        description: seq.description || undefined,
        triggerType: seq.trigger_type,
        isActive: Number(seq.is_active) > 0,
        steps: seq.steps ? JSON.parse(seq.steps) : [],
        createdAt: seq.created_at,
        updatedAt: seq.updated_at
      }))

      // Transform enrollments
      const transformedEnrollments: SequenceEnrollment[] = enrollmentsData.map(enrollment => ({
        id: enrollment.id,
        sequenceId: enrollment.sequence_id,
        contactId: enrollment.contact_id,
        currentStep: enrollment.current_step,
        status: enrollment.status,
        enrolledAt: enrollment.enrolled_at,
        completedAt: enrollment.completed_at || undefined,
        createdAt: enrollment.created_at,
        updatedAt: enrollment.updated_at
      }))

      setSequences(transformedSequences)
      setEnrollments(transformedEnrollments)
    } catch (error) {
      console.error('Error loading automation data:', error)
      toast({
        title: "Error",
        description: "Failed to load automation data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddSequence = async () => {
    if (!newSequence.name.trim() || newSequence.steps.some(step => !step.subject.trim())) return

    try {
      const user = await blink.auth.me()
      const sequenceId = `seq_${Date.now()}`
      
      await blink.db.email_sequences.create({
        id: sequenceId,
        user_id: user.id,
        name: newSequence.name,
        description: newSequence.description || null,
        trigger_type: newSequence.triggerType,
        is_active: 1,
        steps: JSON.stringify(newSequence.steps)
      })

      await loadData()
      setIsAddingSequence(false)
      setNewSequence({
        name: '',
        description: '',
        triggerType: 'manual',
        steps: [{ id: '1', subject: '', content: '', delay: 0 }]
      })

      toast({
        title: "Success",
        description: "Email sequence created successfully"
      })
    } catch (error) {
      console.error('Error adding sequence:', error)
      toast({
        title: "Error",
        description: "Failed to create email sequence",
        variant: "destructive"
      })
    }
  }

  const handleToggleSequence = async (sequenceId: string, isActive: boolean) => {
    try {
      await blink.db.email_sequences.update(sequenceId, {
        is_active: isActive ? 1 : 0
      })

      setSequences(prev => prev.map(seq => 
        seq.id === sequenceId ? { ...seq, isActive } : seq
      ))

      toast({
        title: "Success",
        description: `Sequence ${isActive ? 'activated' : 'paused'} successfully`
      })
    } catch (error) {
      console.error('Error toggling sequence:', error)
      toast({
        title: "Error",
        description: "Failed to update sequence",
        variant: "destructive"
      })
    }
  }

  const addStep = () => {
    const newStep: EmailStep = {
      id: (newSequence.steps.length + 1).toString(),
      subject: '',
      content: '',
      delay: 24 // Default 24 hours
    }
    setNewSequence(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }

  const updateStep = (stepIndex: number, field: keyof EmailStep, value: string | number) => {
    setNewSequence(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }))
  }

  const removeStep = (stepIndex: number) => {
    if (newSequence.steps.length > 1) {
      setNewSequence(prev => ({
        ...prev,
        steps: prev.steps.filter((_, index) => index !== stepIndex)
      }))
    }
  }

  const filteredSequences = sequences.filter(sequence => {
    const matchesSearch = sequence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sequence.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTrigger = selectedTrigger === 'all' || sequence.triggerType === selectedTrigger
    return matchesSearch && matchesTrigger
  })

  const getSequenceStats = () => {
    const total = sequences.length
    const active = sequences.filter(s => s.isActive).length
    const totalEnrollments = enrollments.length
    const activeEnrollments = enrollments.filter(e => e.status === 'active').length

    return { total, active, totalEnrollments, activeEnrollments }
  }

  const stats = getSequenceStats()

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <h1 className="text-3xl font-bold text-foreground">Automation</h1>
          <p className="text-muted-foreground">Automate your workflows and email sequences</p>
        </div>
        <Dialog open={isAddingSequence} onOpenChange={setIsAddingSequence}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Sequence
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Email Sequence</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Sequence Name</Label>
                  <Input
                    id="name"
                    value={newSequence.name}
                    onChange={(e) => setNewSequence(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter sequence name"
                  />
                </div>
                <div>
                  <Label htmlFor="trigger">Trigger Type</Label>
                  <Select value={newSequence.triggerType} onValueChange={(value: EmailSequence['triggerType']) => setNewSequence(prev => ({ ...prev, triggerType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="new_lead">New Lead</SelectItem>
                      <SelectItem value="stage_change">Stage Change</SelectItem>
                      <SelectItem value="date_based">Date Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSequence.description}
                  onChange={(e) => setNewSequence(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this sequence"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Email Steps</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStep}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {newSequence.steps.map((step, index) => (
                    <Card key={step.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Step {index + 1}</Badge>
                          {index > 0 && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>Wait {step.delay}h</span>
                            </div>
                          )}
                        </div>
                        {newSequence.steps.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {index > 0 && (
                          <div>
                            <Label>Delay (hours)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={step.delay}
                              onChange={(e) => updateStep(index, 'delay', Number(e.target.value))}
                              placeholder="24"
                            />
                          </div>
                        )}
                        
                        <div>
                          <Label>Subject Line</Label>
                          <Input
                            value={step.subject}
                            onChange={(e) => updateStep(index, 'subject', e.target.value)}
                            placeholder="Enter email subject"
                          />
                        </div>
                        
                        <div>
                          <Label>Email Content</Label>
                          <Textarea
                            value={step.content}
                            onChange={(e) => updateStep(index, 'content', e.target.value)}
                            placeholder="Enter email content"
                            rows={4}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingSequence(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSequence} className="gradient-bg text-white">
                  Create Sequence
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sequences</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.active} active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEnrollments}</div>
            <p className="text-xs text-muted-foreground">{stats.totalEnrollments} total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+23% this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Automation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sequences">Email Sequences</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="sequences" className="mt-6">
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search sequences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Triggers</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="new_lead">New Lead</SelectItem>
                <SelectItem value="stage_change">Stage Change</SelectItem>
                <SelectItem value="date_based">Date Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sequences Grid */}
          <div className="space-y-4">
            {filteredSequences.length > 0 ? (
              filteredSequences.map(sequence => {
                const triggerInfo = triggerTypes[sequence.triggerType]
                const TriggerIcon = triggerInfo.icon
                const sequenceEnrollments = enrollments.filter(e => e.sequenceId === sequence.id)
                
                return (
                  <Card key={sequence.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{sequence.name}</h3>
                            <Badge className={`text-xs ${triggerInfo.color}`}>
                              <TriggerIcon className="w-3 h-3 mr-1" />
                              {triggerInfo.label}
                            </Badge>
                            <Badge variant={sequence.isActive ? 'default' : 'secondary'} className="text-xs">
                              {sequence.isActive ? 'Active' : 'Paused'}
                            </Badge>
                          </div>
                          
                          {sequence.description && (
                            <p className="text-muted-foreground mb-4">{sequence.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{sequence.steps.length} steps</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{sequenceEnrollments.length} enrolled</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Created {new Date(sequence.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {/* Steps Preview */}
                          <div className="mt-4 flex items-center space-x-2">
                            {sequence.steps.slice(0, 3).map((step, index) => (
                              <div key={step.id} className="flex items-center space-x-1">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                {index < 2 && index < sequence.steps.length - 1 && (
                                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                )}
                              </div>
                            ))}
                            {sequence.steps.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{sequence.steps.length - 3} more</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={sequence.isActive}
                              onCheckedChange={(checked) => handleToggleSequence(sequence.id, checked)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {sequence.isActive ? 'Active' : 'Paused'}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sequences found</h3>
                  <p className="text-muted-foreground mb-4">Create your first email sequence to automate outreach</p>
                  <Button onClick={() => setIsAddingSequence(true)} className="gradient-bg text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Sequence
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="enrollments" className="mt-6">
          <div className="space-y-4">
            {enrollments.length > 0 ? (
              enrollments.map(enrollment => {
                const sequence = sequences.find(s => s.id === enrollment.sequenceId)
                const progress = sequence ? Math.round((enrollment.currentStep / sequence.steps.length) * 100) : 0
                
                return (
                  <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold">{sequence?.name || 'Unknown Sequence'}</h3>
                            <Badge className={`text-xs ${statusColors[enrollment.status]}`}>
                              {enrollment.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                            <span>Contact: {enrollment.contactId}</span>
                            <span>Step {enrollment.currentStep} of {sequence?.steps.length || 0}</span>
                            <span>Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-primary transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Pause className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No enrollments yet</h3>
                  <p className="text-muted-foreground">Contacts will appear here when they're enrolled in sequences</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Advanced Workflows</h3>
              <p className="text-muted-foreground mb-4">
                Create complex automation workflows with conditions, delays, and actions
              </p>
              <Button className="gradient-bg text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}