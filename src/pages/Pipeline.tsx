import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  DollarSign,
  Calendar,
  User,
  Target,
  TrendingUp,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import blink from '../blink/client'
import { Deal, PipelineStage, DealRecord, PipelineStageRecord } from '../types'
import { useToast } from '../hooks/use-toast'

export function Pipeline() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [isAddingDeal, setIsAddingDeal] = useState(false)
  const [newDeal, setNewDeal] = useState({
    title: '',
    description: '',
    value: 0,
    probability: 50,
    expectedCloseDate: '',
    source: '',
    stageId: ''
  })
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      
      const [dealsData, stagesData] = await Promise.all([
        blink.db.deals.list({ where: { user_id: user.id } }) as Promise<DealRecord[]>,
        blink.db.pipeline_stages.list({ 
          where: { 
            OR: [
              { user_id: user.id },
              { user_id: 'system' }
            ]
          },
          orderBy: { position: 'asc' }
        }) as Promise<PipelineStageRecord[]>
      ])

      // Transform deals
      const transformedDeals: Deal[] = dealsData.map(deal => ({
        id: deal.id,
        userId: deal.user_id,
        clientId: deal.client_id || undefined,
        title: deal.title,
        description: deal.description || undefined,
        value: deal.value,
        currency: deal.currency,
        stageId: deal.stage_id || undefined,
        probability: deal.probability,
        expectedCloseDate: deal.expected_close_date || undefined,
        actualCloseDate: deal.actual_close_date || undefined,
        source: deal.source || undefined,
        assignedTo: deal.assigned_to || undefined,
        tags: deal.tags ? JSON.parse(deal.tags) : [],
        customFields: deal.custom_fields ? JSON.parse(deal.custom_fields) : {},
        createdAt: deal.created_at,
        updatedAt: deal.updated_at
      }))

      // Transform stages
      const transformedStages: PipelineStage[] = stagesData.map(stage => ({
        id: stage.id,
        userId: stage.user_id,
        name: stage.name,
        position: stage.position,
        color: stage.color,
        isActive: Number(stage.is_active) > 0,
        createdAt: stage.created_at,
        updatedAt: stage.updated_at
      }))

      setDeals(transformedDeals)
      setStages(transformedStages)
      
      if (transformedStages.length > 0 && !newDeal.stageId) {
        setNewDeal(prev => ({ ...prev, stageId: transformedStages[0].id }))
      }
    } catch (error) {
      console.error('Error loading pipeline data:', error)
      toast({
        title: "Error",
        description: "Failed to load pipeline data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddDeal = async () => {
    if (!newDeal.title.trim()) return

    try {
      const user = await blink.auth.me()
      const dealId = `deal_${Date.now()}`
      
      await blink.db.deals.create({
        id: dealId,
        user_id: user.id,
        title: newDeal.title,
        description: newDeal.description || null,
        value: newDeal.value,
        currency: 'USD',
        stage_id: newDeal.stageId || null,
        probability: newDeal.probability,
        expected_close_date: newDeal.expectedCloseDate || null,
        source: newDeal.source || null,
        tags: JSON.stringify([]),
        custom_fields: JSON.stringify({})
      })

      await loadData()
      setIsAddingDeal(false)
      setNewDeal({
        title: '',
        description: '',
        value: 0,
        probability: 50,
        expectedCloseDate: '',
        source: '',
        stageId: stages[0]?.id || ''
      })

      toast({
        title: "Success",
        description: "Deal added successfully"
      })
    } catch (error) {
      console.error('Error adding deal:', error)
      toast({
        title: "Error",
        description: "Failed to add deal",
        variant: "destructive"
      })
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    
    if (source.droppableId === destination.droppableId) return

    try {
      await blink.db.deals.update(draggableId, {
        stage_id: destination.droppableId
      })

      // Update local state
      setDeals(prev => prev.map(deal => 
        deal.id === draggableId 
          ? { ...deal, stageId: destination.droppableId }
          : deal
      ))

      toast({
        title: "Success",
        description: "Deal moved successfully"
      })
    } catch (error) {
      console.error('Error moving deal:', error)
      toast({
        title: "Error",
        description: "Failed to move deal",
        variant: "destructive"
      })
    }
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = selectedStage === 'all' || deal.stageId === selectedStage
    return matchesSearch && matchesStage
  })

  const getDealsForStage = (stageId: string) => {
    return filteredDeals.filter(deal => deal.stageId === stageId)
  }

  const getTotalValue = () => {
    return filteredDeals.reduce((sum, deal) => sum + deal.value, 0)
  }

  const getWeightedValue = () => {
    return filteredDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-foreground">Sales Pipeline</h1>
          <p className="text-muted-foreground">Manage your deals and track progress</p>
        </div>
        <Dialog open={isAddingDeal} onOpenChange={setIsAddingDeal}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Deal Title</Label>
                <Input
                  id="title"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter deal title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDeal.description}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deal description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Deal Value ($)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={newDeal.value}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, value: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={newDeal.probability}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, probability: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="stage">Pipeline Stage</Label>
                <Select value={newDeal.stageId} onValueChange={(value) => setNewDeal(prev => ({ ...prev, stageId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="closeDate">Expected Close Date</Label>
                <Input
                  id="closeDate"
                  type="date"
                  value={newDeal.expectedCloseDate}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingDeal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDeal} className="gradient-bg text-white">
                  Add Deal
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
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDeals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalValue().toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weighted Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getWeightedValue().toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredDeals.length > 0 ? Math.round(getTotalValue() / filteredDeals.length).toLocaleString() : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map(stage => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-h-[600px]">
          {stages.map(stage => {
            const stageDeals = getDealsForStage(stage.id)
            const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
            
            return (
              <div key={stage.id} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-semibold">{stage.name}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stageDeals.length}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  ${stageValue.toLocaleString()}
                </div>
                
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[400px] ${
                        snapshot.isDraggingOver ? 'bg-muted/50 rounded-lg' : ''
                      }`}
                    >
                      {stageDeals.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-move hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-sm line-clamp-2">{deal.title}</h4>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="w-3 h-3" />
                                  </Button>
                                </div>
                                {deal.description && (
                                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                    {deal.description}
                                  </p>
                                )}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-green-600">
                                      ${deal.value.toLocaleString()}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {deal.probability}%
                                    </Badge>
                                  </div>
                                  {deal.expectedCloseDate && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}