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
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Phone,
  Mail,
  Users,
  FileText,
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import blink from '../blink/client'
import { Activity, ActivityRecord } from '../types'
import { useToast } from '../hooks/use-toast'

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: FileText,
  task: CheckSquare,
  deal_update: AlertCircle,
  client_update: AlertCircle
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

export function Activities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [newActivity, setNewActivity] = useState({
    type: 'task' as Activity['type'],
    title: '',
    description: '',
    priority: 'medium' as Activity['priority'],
    dueDate: '',
    status: 'pending' as Activity['status']
  })
  const { toast } = useToast()

  const loadActivities = async () => {
    try {
      const user = await blink.auth.me()
      
      const activitiesData = await blink.db.activities.list({ 
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      }) as ActivityRecord[]

      // Transform activities
      const transformedActivities: Activity[] = activitiesData.map(activity => ({
        id: activity.id,
        userId: activity.user_id,
        type: activity.type,
        title: activity.title,
        description: activity.description || undefined,
        relatedToType: activity.related_to_type || undefined,
        relatedToId: activity.related_to_id || undefined,
        assignedTo: activity.assigned_to || undefined,
        dueDate: activity.due_date || undefined,
        completedAt: activity.completed_at || undefined,
        priority: activity.priority,
        status: activity.status,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : undefined,
        createdAt: activity.created_at,
        updatedAt: activity.updated_at
      }))

      setActivities(transformedActivities)
    } catch (error) {
      console.error('Error loading activities:', error)
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddActivity = async () => {
    if (!newActivity.title.trim()) return

    try {
      const user = await blink.auth.me()
      const activityId = `activity_${Date.now()}`
      
      await blink.db.activities.create({
        id: activityId,
        user_id: user.id,
        type: newActivity.type,
        title: newActivity.title,
        description: newActivity.description || null,
        priority: newActivity.priority,
        status: newActivity.status,
        due_date: newActivity.dueDate || null,
        metadata: JSON.stringify({})
      })

      await loadActivities()
      setIsAddingActivity(false)
      setNewActivity({
        type: 'task',
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        status: 'pending'
      })

      toast({
        title: "Success",
        description: "Activity added successfully"
      })
    } catch (error) {
      console.error('Error adding activity:', error)
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive"
      })
    }
  }

  const handleUpdateStatus = async (activityId: string, status: Activity['status']) => {
    try {
      const updateData: any = { status }
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      await blink.db.activities.update(activityId, updateData)

      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { 
              ...activity, 
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : activity.completedAt
            }
          : activity
      ))

      toast({
        title: "Success",
        description: "Activity updated successfully"
      })
    } catch (error) {
      console.error('Error updating activity:', error)
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive"
      })
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || activity.type === selectedType
    const matchesStatus = selectedStatus === 'all' || activity.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || activity.priority === selectedPriority
    
    // Tab filtering
    let matchesTab = true
    if (activeTab === 'pending') {
      matchesTab = activity.status === 'pending'
    } else if (activeTab === 'completed') {
      matchesTab = activity.status === 'completed'
    } else if (activeTab === 'overdue') {
      matchesTab = activity.dueDate && new Date(activity.dueDate) < new Date() && activity.status !== 'completed'
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesTab
  })

  const getActivityStats = () => {
    const total = activities.length
    const pending = activities.filter(a => a.status === 'pending').length
    const completed = activities.filter(a => a.status === 'completed').length
    const overdue = activities.filter(a => 
      a.dueDate && new Date(a.dueDate) < new Date() && a.status !== 'completed'
    ).length

    return { total, pending, completed, overdue }
  }

  const stats = getActivityStats()

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
          <h1 className="text-3xl font-bold text-foreground">Activities</h1>
          <p className="text-muted-foreground">Track tasks, calls, meetings, and more</p>
        </div>
        <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Activity Type</Label>
                <Select value={newActivity.type} onValueChange={(value: Activity['type']) => setNewActivity(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter activity title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Activity description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newActivity.priority} onValueChange={(value: Activity['priority']) => setNewActivity(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newActivity.dueDate}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingActivity(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddActivity} className="gradient-bg text-white">
                  Add Activity
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
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 flex-wrap gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
            <SelectItem value="call">Calls</SelectItem>
            <SelectItem value="email">Emails</SelectItem>
            <SelectItem value="meeting">Meetings</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredActivities.length > 0 ? (
              filteredActivities.map(activity => {
                const IconComponent = activityIcons[activity.type]
                const isOverdue = activity.dueDate && new Date(activity.dueDate) < new Date() && activity.status !== 'completed'
                
                return (
                  <Card key={activity.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            activity.status === 'completed' ? 'bg-green-100' : 
                            isOverdue ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            <IconComponent className={`w-4 h-4 ${
                              activity.status === 'completed' ? 'text-green-600' : 
                              isOverdue ? 'text-red-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-sm">{activity.title}</h3>
                              <Badge className={`text-xs ${priorityColors[activity.priority]}`}>
                                {activity.priority}
                              </Badge>
                              <Badge className={`text-xs ${statusColors[activity.status]}`}>
                                {activity.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Created {new Date(activity.createdAt).toLocaleDateString()}</span>
                              {activity.dueDate && (
                                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                  Due {new Date(activity.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              {activity.completedAt && (
                                <span className="text-green-600">
                                  Completed {new Date(activity.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {activity.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(activity.id, 'completed')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
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
                  <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No activities found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === 'all' ? 'Start by creating your first activity' : `No ${activeTab} activities`}
                  </p>
                  <Button onClick={() => setIsAddingActivity(true)} className="gradient-bg text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Activity
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}