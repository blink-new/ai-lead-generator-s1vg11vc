import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  Plus, 
  Search, 
  Users,
  UserPlus,
  Settings,
  Shield,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Crown,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react'
import blink from '../blink/client'
import { User, UserRecord, Goal, GoalRecord } from '../types'
import { useToast } from '../hooks/use-toast'

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  member: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800'
}

const roleIcons = {
  admin: Crown,
  manager: Star,
  member: Users,
  viewer: Eye
}

export function Team() {
  const [users, setUsers] = useState<User[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [activeTab, setActiveTab] = useState('members')
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'member' as User['role'],
    department: ''
  })
  const [newGoal, setNewGoal] = useState({
    type: 'revenue' as Goal['type'],
    title: '',
    targetValue: 0,
    period: 'monthly' as Goal['period'],
    startDate: '',
    endDate: '',
    assignedTo: ''
  })
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      
      const [usersData, goalsData] = await Promise.all([
        blink.db.users.list({ where: { is_active: "1" } }).catch(() => []) as Promise<UserRecord[]>,
        blink.db.goals.list({ where: { user_id: user.id } }).catch(() => []) as Promise<GoalRecord[]>
      ])

      // Transform users
      const transformedUsers: User[] = usersData.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatar_url || undefined,
        department: user.department || undefined,
        permissions: user.permissions ? JSON.parse(user.permissions) : [],
        isActive: Number(user.is_active) > 0,
        lastLogin: user.last_login || undefined,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }))

      // Transform goals
      const transformedGoals: Goal[] = goalsData.map(goal => ({
        id: goal.id,
        userId: goal.user_id,
        assignedTo: goal.assigned_to || undefined,
        type: goal.type,
        title: goal.title,
        targetValue: goal.target_value,
        currentValue: goal.current_value,
        period: goal.period,
        startDate: goal.start_date,
        endDate: goal.end_date,
        status: goal.status,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at
      }))

      setUsers(transformedUsers)
      setGoals(transformedGoals)
    } catch (error) {
      console.error('Error loading team data:', error)
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) return

    try {
      const userId = `user_${Date.now()}`
      
      await blink.db.users.create({
        id: userId,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department || null,
        permissions: JSON.stringify([]),
        is_active: 1
      })

      await loadData()
      setIsAddingUser(false)
      setNewUser({
        name: '',
        email: '',
        role: 'member',
        department: ''
      })

      toast({
        title: "Success",
        description: "Team member added successfully"
      })
    } catch (error) {
      console.error('Error adding user:', error)
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive"
      })
    }
  }

  const handleAddGoal = async () => {
    if (!newGoal.title.trim() || !newGoal.startDate || !newGoal.endDate) return

    try {
      const user = await blink.auth.me()
      const goalId = `goal_${Date.now()}`
      
      await blink.db.goals.create({
        id: goalId,
        user_id: user.id,
        assigned_to: newGoal.assignedTo || null,
        type: newGoal.type,
        title: newGoal.title,
        target_value: newGoal.targetValue,
        current_value: 0,
        period: newGoal.period,
        start_date: newGoal.startDate,
        end_date: newGoal.endDate,
        status: 'active'
      })

      await loadData()
      setIsAddingGoal(false)
      setNewGoal({
        type: 'revenue',
        title: '',
        targetValue: 0,
        period: 'monthly',
        startDate: '',
        endDate: '',
        assignedTo: ''
      })

      toast({
        title: "Success",
        description: "Goal added successfully"
      })
    } catch (error) {
      console.error('Error adding goal:', error)
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive"
      })
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const getTeamStats = () => {
    const total = users.length
    const active = users.filter(u => u.isActive).length
    const admins = users.filter(u => u.role === 'admin').length
    const managers = users.filter(u => u.role === 'manager').length

    return { total, active, admins, managers }
  }

  const getGoalStats = () => {
    const total = goals.length
    const active = goals.filter(g => g.status === 'active').length
    const completed = goals.filter(g => g.status === 'completed').length
    const avgProgress = goals.length > 0 
      ? Math.round(goals.reduce((sum, goal) => sum + (goal.currentValue / goal.targetValue * 100), 0) / goals.length)
      : 0

    return { total, active, completed, avgProgress }
  }

  const stats = getTeamStats()
  const goalStats = getGoalStats()

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
          <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground">Manage team members, roles, and goals</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goalType">Goal Type</Label>
                  <Select value={newGoal.type} onValueChange={(value: Goal['type']) => setNewGoal(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="deals">Deals</SelectItem>
                      <SelectItem value="activities">Activities</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="goalTitle">Goal Title</Label>
                  <Input
                    id="goalTitle"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter goal title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetValue">Target Value</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      value={newGoal.targetValue}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="period">Period</Label>
                    <Select value={newGoal.period} onValueChange={(value: Goal['period']) => setNewGoal(prev => ({ ...prev, period: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newGoal.startDate}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newGoal.endDate}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Select value={newGoal.assignedTo} onValueChange={(value) => setNewGoal(prev => ({ ...prev, assignedTo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddGoal} className="gradient-bg text-white">
                    Add Goal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
            <DialogTrigger asChild>
              <Button className="gradient-bg text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value: User['role']) => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser} className="gradient-bg text-white">
                    Add Member
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.active} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goalStats.active}</div>
            <p className="text-xs text-muted-foreground">{goalStats.completed} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goalStats.avgProgress}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.managers}</div>
            <p className="text-xs text-muted-foreground">{stats.admins} admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="goals">Goals & Targets</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => {
              const RoleIcon = roleIcons[user.role]
              
              return (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Role</span>
                        <Badge className={`text-xs ${roleColors[user.role]}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {user.role}
                        </Badge>
                      </div>
                      
                      {user.department && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Department</span>
                          <span className="text-sm">{user.department}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      {user.lastLogin && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Login</span>
                          <span className="text-sm">{new Date(user.lastLogin).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <div className="space-y-4">
            {goals.length > 0 ? (
              goals.map(goal => {
                const progress = Math.round((goal.currentValue / goal.targetValue) * 100)
                const isCompleted = goal.status === 'completed'
                const assignedUser = users.find(u => u.id === goal.assignedTo)
                
                return (
                  <Card key={goal.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{goal.title}</h3>
                            <Badge className={`text-xs ${
                              goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                              goal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {goal.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {goal.type}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Target</span>
                              <p className="font-medium">{goal.targetValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current</span>
                              <p className="font-medium">{goal.currentValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Progress</span>
                              <p className="font-medium">{progress}%</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Period</span>
                              <p className="font-medium capitalize">{goal.period}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  isCompleted ? 'bg-green-500' : 
                                  progress >= 75 ? 'bg-blue-500' :
                                  progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                            <span>{new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}</span>
                            {assignedUser && (
                              <div className="flex items-center space-x-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-xs">
                                    {assignedUser.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{assignedUser.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No goals set</h3>
                  <p className="text-muted-foreground mb-4">Start by creating team goals and targets</p>
                  <Button onClick={() => setIsAddingGoal(true)} className="gradient-bg text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(roleColors).map(([role, colorClass]) => {
                  const RoleIcon = roleIcons[role as keyof typeof roleIcons]
                  
                  return (
                    <div key={role} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <RoleIcon className="w-5 h-5" />
                        <h3 className="font-semibold capitalize">{role}</h3>
                        <Badge className={`text-xs ${colorClass}`}>
                          {users.filter(u => u.role === role).length} members
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {role === 'admin' && (
                          <>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Full system access</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Manage team members</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>System settings</span>
                            </div>
                          </>
                        )}
                        {role === 'manager' && (
                          <>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Manage team data</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>View all reports</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Assign tasks</span>
                            </div>
                          </>
                        )}
                        {role === 'member' && (
                          <>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Manage own data</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Create activities</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span>System settings</span>
                            </div>
                          </>
                        )}
                        {role === 'viewer' && (
                          <>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>View data only</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span>Create/edit data</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span>System settings</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}