import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Plus, 
  Briefcase,
  DollarSign,
  Clock,
  TrendingUp,
  MoreHorizontal,
  ExternalLink,
  Edit,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { UpworkProjectModal } from '../components/modals/UpworkProjectModal'
import blink from '../blink/client'
import { UpworkProject, UpworkProjectRecord } from '../types'
import { transformUpworkProject, upworkProjectToRecord } from '../utils/dataTransforms'

export function UpworkProjects() {
  const [projects, setProjects] = useState<UpworkProject[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<UpworkProject | undefined>()

  const loadProjects = async () => {
    try {
      const user = await blink.auth.me()
      const projectsData = await blink.db.upwork_projects.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      }).catch(() => []) as UpworkProjectRecord[]
      
      setProjects(projectsData.map(transformUpworkProject))
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleSaveProject = async (projectData: Partial<UpworkProject>) => {
    try {
      const user = await blink.auth.me()
      const record = upworkProjectToRecord(projectData, user.id)
      
      if (projectData.id) {
        // Update existing project
        await blink.db.upwork_projects.update(projectData.id, record)
      } else {
        // Create new project
        await blink.db.upwork_projects.create(record)
      }
      
      await loadProjects()
      setEditingProject(undefined)
    } catch (error) {
      console.error('Error saving project:', error)
      throw error
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await blink.db.upwork_projects.delete(projectId)
        await loadProjects()
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  const handleEditProject = (project: UpworkProject) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleAddProject = () => {
    setEditingProject(undefined)
    setIsModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'interview': return 'bg-blue-100 text-blue-800'
      case 'proposal': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'declined': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalValue = projects.reduce((sum, project) => sum + (project.budget || 0), 0) || 0
  const activeProjects = projects.filter(p => p.status === 'active').length || 0
  const pendingProposals = projects.filter(p => p.status === 'proposal').length || 0

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
          <h1 className="text-3xl font-bold text-foreground">Upwork Projects</h1>
          <p className="text-muted-foreground">Track your Upwork proposals and active projects</p>
        </div>
        <Button onClick={handleAddProject} className="gradient-bg text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Proposal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All projects combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Proposals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingProposals}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProject(project)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProject(project.id)}
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
                <p className="text-sm text-muted-foreground">{project.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ${(project.budget || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Submitted {new Date(project.submittedDate).toLocaleDateString()}
                  </div>
                </div>

                {project.deadline && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-2">Skills Required</p>
                  <div className="flex flex-wrap gap-1">
                    {project.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Upwork
                  </Button>
                  {project.status === 'proposal' && (
                    <Button size="sm" className="gradient-bg text-white">
                      Follow Up
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {projects.length === 0 && !loading && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first Upwork proposal
          </p>
          <Button onClick={handleAddProject} className="gradient-bg text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Proposal
          </Button>
        </div>
      )}

      {/* Project Modal */}
      <UpworkProjectModal
        project={editingProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
      />
    </div>
  )
}