// Database types with snake_case fields (as stored in SQLite)
export interface ClientRecord {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'prospect'
  services: string // JSON string array
  monthly_value: number
  joined_date: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface SocialCampaignRecord {
  id: string
  title: string
  client_id: string
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
  status: 'draft' | 'scheduled' | 'active' | 'completed'
  start_date: string
  end_date: string
  budget: number
  reach: number
  engagement: number
  user_id: string
  created_at: string
  updated_at: string
}

export interface UpworkProjectRecord {
  id: string
  title: string
  client: string
  budget: number
  status: 'proposal' | 'interview' | 'active' | 'completed' | 'declined'
  submitted_date: string
  deadline: string | null
  description: string
  skills: string // JSON string array
  user_id: string
  created_at: string
  updated_at: string
}

export interface LinkedInContactRecord {
  id: string
  name: string
  title: string
  company: string
  status: 'pending' | 'connected' | 'messaged' | 'responded' | 'converted'
  connection_date: string | null
  last_message: string | null
  notes: string
  user_id: string
  created_at: string
  updated_at: string
}

// New advanced feature records
export interface UserRecord {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'member' | 'viewer'
  avatar_url: string | null
  department: string | null
  permissions: string // JSON array
  is_active: number
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface PipelineStageRecord {
  id: string
  user_id: string
  name: string
  position: number
  color: string
  is_active: number
  created_at: string
  updated_at: string
}

export interface DealRecord {
  id: string
  user_id: string
  client_id: string | null
  title: string
  description: string | null
  value: number
  currency: string
  stage_id: string | null
  probability: number
  expected_close_date: string | null
  actual_close_date: string | null
  source: string | null
  assigned_to: string | null
  tags: string // JSON array
  custom_fields: string // JSON object
  created_at: string
  updated_at: string
}

export interface ActivityRecord {
  id: string
  user_id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal_update' | 'client_update'
  title: string
  description: string | null
  related_to_type: string | null
  related_to_id: string | null
  assigned_to: string | null
  due_date: string | null
  completed_at: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  metadata: string | null // JSON object
  created_at: string
  updated_at: string
}

export interface EmailSequenceRecord {
  id: string
  user_id: string
  name: string
  description: string | null
  trigger_type: 'manual' | 'new_lead' | 'stage_change' | 'date_based'
  is_active: number
  steps: string // JSON array
  created_at: string
  updated_at: string
}

export interface SequenceEnrollmentRecord {
  id: string
  sequence_id: string
  contact_id: string
  current_step: number
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  enrolled_at: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface ReportRecord {
  id: string
  user_id: string
  name: string
  type: 'sales' | 'activity' | 'pipeline' | 'performance' | 'custom'
  config: string // JSON configuration
  is_shared: number
  created_at: string
  updated_at: string
}

export interface NotificationRecord {
  id: string
  user_id: string
  type: string
  title: string
  message: string | null
  data: string | null // JSON object
  is_read: number
  action_url: string | null
  created_at: string
}

export interface GoalRecord {
  id: string
  user_id: string
  assigned_to: string | null
  type: 'revenue' | 'deals' | 'activities' | 'custom'
  title: string
  target_value: number
  current_value: number
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  created_at: string
  updated_at: string
}

// Frontend types with camelCase (for UI components)
export interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'prospect'
  services: string[]
  monthlyValue: number
  joinedDate: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface SocialCampaign {
  id: string
  title: string
  clientId: string
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
  status: 'draft' | 'scheduled' | 'active' | 'completed'
  startDate: string
  endDate: string
  budget: number
  reach: number
  engagement: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface UpworkProject {
  id: string
  title: string
  client: string
  budget: number
  status: 'proposal' | 'interview' | 'active' | 'completed' | 'declined'
  submittedDate: string
  deadline?: string
  description: string
  skills: string[]
  userId: string
  createdAt: string
  updatedAt: string
}

export interface LinkedInContact {
  id: string
  name: string
  title: string
  company: string
  status: 'pending' | 'connected' | 'messaged' | 'responded' | 'converted'
  connectionDate?: string
  lastMessage?: string
  notes: string
  userId: string
  createdAt: string
  updatedAt: string
}

// New advanced frontend types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'member' | 'viewer'
  avatarUrl?: string
  department?: string
  permissions: string[]
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface PipelineStage {
  id: string
  userId: string
  name: string
  position: number
  color: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  userId: string
  clientId?: string
  title: string
  description?: string
  value: number
  currency: string
  stageId?: string
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  source?: string
  assignedTo?: string
  tags: string[]
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  userId: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal_update' | 'client_update'
  title: string
  description?: string
  relatedToType?: string
  relatedToId?: string
  assignedTo?: string
  dueDate?: string
  completedAt?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface EmailSequence {
  id: string
  userId: string
  name: string
  description?: string
  triggerType: 'manual' | 'new_lead' | 'stage_change' | 'date_based'
  isActive: boolean
  steps: EmailStep[]
  createdAt: string
  updatedAt: string
}

export interface EmailStep {
  id: string
  subject: string
  content: string
  delay: number // hours
  conditions?: Record<string, any>
}

export interface SequenceEnrollment {
  id: string
  sequenceId: string
  contactId: string
  currentStep: number
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  enrolledAt: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Report {
  id: string
  userId: string
  name: string
  type: 'sales' | 'activity' | 'pipeline' | 'performance' | 'custom'
  config: ReportConfig
  isShared: boolean
  createdAt: string
  updatedAt: string
}

export interface ReportConfig {
  dateRange: {
    start: string
    end: string
  }
  filters: Record<string, any>
  metrics: string[]
  groupBy?: string
  chartType?: 'line' | 'bar' | 'pie' | 'table'
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message?: string
  data?: Record<string, any>
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

export interface Goal {
  id: string
  userId: string
  assignedTo?: string
  type: 'revenue' | 'deals' | 'activities' | 'custom'
  title: string
  targetValue: number
  currentValue: number
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalClients: number
  monthlyRevenue: number
  activeProjects: number
  upcomingTasks: number
  // Advanced stats
  totalDeals: number
  pipelineValue: number
  conversionRate: number
  avgDealSize: number
  activitiesThisWeek: number
  goalsProgress: number
}

export interface RecentActivity {
  id: string
  type: 'client' | 'project' | 'social' | 'linkedin' | 'deal' | 'activity'
  title: string
  description: string
  timestamp: string
  status: 'completed' | 'pending' | 'in-progress'
  assignedTo?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

// Advanced analytics types
export interface PipelineAnalytics {
  stageConversion: Array<{
    stage: string
    deals: number
    value: number
    conversionRate: number
  }>
  avgTimeInStage: Array<{
    stage: string
    avgDays: number
  }>
  winRate: number
  avgDealSize: number
  totalPipelineValue: number
}

export interface ActivityAnalytics {
  byType: Array<{
    type: string
    count: number
    completionRate: number
  }>
  byUser: Array<{
    user: string
    activities: number
    completionRate: number
  }>
  trends: Array<{
    date: string
    activities: number
    completed: number
  }>
}

export interface RevenueAnalytics {
  monthly: Array<{
    month: string
    revenue: number
    deals: number
    avgDealSize: number
  }>
  bySource: Array<{
    source: string
    revenue: number
    deals: number
  }>
  forecast: Array<{
    month: string
    projected: number
    actual?: number
  }>
}

// Team collaboration types
export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  isOnline: boolean
  lastActive: string
}

export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  changes: Record<string, any>
  timestamp: string
}