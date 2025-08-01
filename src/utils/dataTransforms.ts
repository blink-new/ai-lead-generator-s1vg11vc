import { 
  Client, 
  ClientRecord, 
  SocialCampaign, 
  SocialCampaignRecord,
  UpworkProject,
  UpworkProjectRecord,
  LinkedInContact,
  LinkedInContactRecord
} from '../types'

// Transform database records to frontend objects
export function transformClient(record: ClientRecord): Client {
  return {
    id: record.id,
    name: record.name || '',
    company: record.company || '',
    email: record.email || '',
    phone: record.phone || '',
    status: record.status,
    services: JSON.parse(record.services || '[]'),
    monthlyValue: record.monthly_value || 0,
    joinedDate: record.joined_date,
    userId: record.user_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }
}

export function transformSocialCampaign(record: SocialCampaignRecord): SocialCampaign {
  return {
    id: record.id,
    title: record.title || '',
    clientId: record.client_id || '',
    platform: record.platform,
    status: record.status,
    startDate: record.start_date,
    endDate: record.end_date,
    budget: record.budget || 0,
    reach: record.reach || 0,
    engagement: record.engagement || 0,
    userId: record.user_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }
}

export function transformUpworkProject(record: UpworkProjectRecord): UpworkProject {
  return {
    id: record.id,
    title: record.title || '',
    client: record.client || '',
    budget: record.budget || 0,
    status: record.status,
    submittedDate: record.submitted_date,
    deadline: record.deadline || undefined,
    description: record.description || '',
    skills: JSON.parse(record.skills || '[]'),
    userId: record.user_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }
}

export function transformLinkedInContact(record: LinkedInContactRecord): LinkedInContact {
  return {
    id: record.id,
    name: record.name || '',
    title: record.title || '',
    company: record.company || '',
    status: record.status,
    connectionDate: record.connection_date || undefined,
    lastMessage: record.last_message || undefined,
    notes: record.notes || '',
    userId: record.user_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }
}

// Transform frontend objects to database records
export function clientToRecord(client: Partial<Client>, userId: string): Partial<ClientRecord> {
  const now = new Date().toISOString()
  return {
    id: client.id || `client_${Date.now()}`,
    name: client.name || '',
    company: client.company || '',
    email: client.email || '',
    phone: client.phone || '',
    status: client.status || 'prospect',
    services: JSON.stringify(client.services || []),
    monthly_value: client.monthlyValue || 0,
    joined_date: client.joinedDate || now.split('T')[0],
    user_id: userId,
    created_at: client.createdAt || now,
    updated_at: now
  }
}

export function socialCampaignToRecord(campaign: Partial<SocialCampaign>, userId: string): Partial<SocialCampaignRecord> {
  const now = new Date().toISOString()
  return {
    id: campaign.id || `campaign_${Date.now()}`,
    title: campaign.title || '',
    client_id: campaign.clientId || '',
    platform: campaign.platform || 'instagram',
    status: campaign.status || 'draft',
    start_date: campaign.startDate || now.split('T')[0],
    end_date: campaign.endDate || now.split('T')[0],
    budget: campaign.budget || 0,
    reach: campaign.reach || 0,
    engagement: campaign.engagement || 0,
    user_id: userId,
    created_at: campaign.createdAt || now,
    updated_at: now
  }
}

export function upworkProjectToRecord(project: Partial<UpworkProject>, userId: string): Partial<UpworkProjectRecord> {
  const now = new Date().toISOString()
  return {
    id: project.id || `project_${Date.now()}`,
    title: project.title || '',
    client: project.client || '',
    budget: project.budget || 0,
    status: project.status || 'proposal',
    submitted_date: project.submittedDate || now.split('T')[0],
    deadline: project.deadline || null,
    description: project.description || '',
    skills: JSON.stringify(project.skills || []),
    user_id: userId,
    created_at: project.createdAt || now,
    updated_at: now
  }
}

export function linkedInContactToRecord(contact: Partial<LinkedInContact>, userId: string): Partial<LinkedInContactRecord> {
  const now = new Date().toISOString()
  return {
    id: contact.id || `contact_${Date.now()}`,
    name: contact.name || '',
    title: contact.title || '',
    company: contact.company || '',
    status: contact.status || 'pending',
    connection_date: contact.connectionDate || null,
    last_message: contact.lastMessage || null,
    notes: contact.notes || '',
    user_id: userId,
    created_at: contact.createdAt || now,
    updated_at: now
  }
}