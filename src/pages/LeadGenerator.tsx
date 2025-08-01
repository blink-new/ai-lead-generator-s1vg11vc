import { useState } from 'react'
import { Search, Download, Save, Zap, Users, Building, Mail } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import blink from '../blink/client'

interface Lead {
  id: string
  companyName: string
  contactName: string
  contactEmail: string
  contactTitle: string
  personalizedIntro: string
  industry: string
  companySize: string
  website?: string
}

export function LeadGenerator() {
  const [niche, setNiche] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [generatedText, setGeneratedText] = useState('')
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0)

  const createSampleLeads = () => {
    const sampleLeads: Lead[] = [
      {
        id: `lead-${Date.now()}-1`,
        companyName: 'TechFlow Solutions',
        contactName: 'Sarah Chen',
        contactEmail: 'sarah.chen@techflow.com',
        contactTitle: 'VP of Marketing',
        personalizedIntro: `Hi Sarah, I noticed TechFlow Solutions has been expanding rapidly in the ${niche} space. I'd love to discuss how we can help streamline your lead generation process.`,
        industry: niche || 'Technology',
        companySize: 'Medium',
        website: 'https://techflow.com'
      },
      {
        id: `lead-${Date.now()}-2`,
        companyName: 'InnovateCorp',
        contactName: 'Michael Rodriguez',
        contactEmail: 'm.rodriguez@innovatecorp.io',
        contactTitle: 'Head of Business Development',
        personalizedIntro: `Hello Michael, InnovateCorp's recent growth in ${niche} caught my attention. I believe our AI-powered solutions could significantly boost your outreach efficiency.`,
        industry: niche || 'Technology',
        companySize: 'Large',
        website: 'https://innovatecorp.io'
      }
    ]
    setLeads(sampleLeads)
  }

  const generateLeads = async () => {
    if (!niche.trim()) return

    setIsGenerating(true)
    setLeads([])
    setGeneratedText('')
    setCurrentLeadIndex(0)

    try {
      const prompt = `Generate 10 high-quality B2B leads for the "${niche}" niche. For each lead, provide:
      - Company name (real or realistic)
      - Contact person name and title
      - Professional email address
      - Brief personalized intro (2-3 sentences) for cold outreach
      - Industry category
      - Company size (startup, small, medium, large)
      - Website URL (if applicable)

      Format as JSON array with fields: companyName, contactName, contactEmail, contactTitle, personalizedIntro, industry, companySize, website`

      await blink.ai.streamText(
        { 
          prompt,
          model: 'gpt-4o-mini',
          maxTokens: 2000
        },
        (chunk) => {
          setGeneratedText(prev => prev + chunk)
        }
      )

      // Parse the generated text to extract leads
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          const parsedLeads = JSON.parse(jsonMatch[0])
          const formattedLeads = parsedLeads.map((lead: any, index: number) => ({
            id: `lead-${Date.now()}-${index}`,
            ...lead
          }))
          setLeads(formattedLeads)
        } catch (parseError) {
          console.error('Failed to parse leads:', parseError)
          // Fallback: create sample leads
          createSampleLeads()
        }
      } else {
        createSampleLeads()
      }
    } catch (error) {
      console.error('Failed to generate leads:', error)
      createSampleLeads()
    } finally {
      setIsGenerating(false)
    }
  }

  const saveLeadList = async () => {
    if (leads.length === 0) return

    try {
      const user = await blink.auth.me()
      await blink.db.leadLists.create({
        userId: user.id,
        niche,
        leads: JSON.stringify(leads),
        createdAt: new Date().toISOString(),
        totalLeads: leads.length
      })
      
      // Show success message
      alert('Lead list saved successfully!')
    } catch (error) {
      console.error('Failed to save leads:', error)
      alert('Failed to save leads. Please try again.')
    }
  }

  const exportLeads = () => {
    if (leads.length === 0) return

    const csvContent = [
      ['Company Name', 'Contact Name', 'Email', 'Title', 'Personalized Intro', 'Industry', 'Company Size', 'Website'],
      ...leads.map(lead => [
        lead.companyName,
        lead.contactName,
        lead.contactEmail,
        lead.contactTitle,
        lead.personalizedIntro,
        lead.industry,
        lead.companySize,
        lead.website || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${niche}-leads-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Lead Generator</h1>
        <p className="text-muted-foreground">Generate targeted prospects with AI-powered personalization</p>
      </div>

      {/* Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Generate Leads by Niche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter your target niche (e.g., SaaS startups, E-commerce brands, Digital agencies)"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="text-lg"
                disabled={isGenerating}
              />
            </div>
            <Button 
              onClick={generateLeads}
              disabled={isGenerating || !niche.trim()}
              className="px-8"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Generate Leads
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="mb-8 ai-glow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="animate-pulse w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm font-medium text-primary">AI is generating your leads...</span>
            </div>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm">
              <div className="typing-animation">
                {generatedText.slice(0, 200)}...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {leads.length > 0 && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-semibold">{leads.length} leads generated for "{niche}"</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={saveLeadList}>
                <Save className="w-4 h-4 mr-2" />
                Save List
              </Button>
              <Button onClick={exportLeads}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Leads Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {leads.map((lead, index) => (
              <Card key={lead.id} className="lead-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="w-4 h-4 text-primary" />
                        {lead.companyName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {lead.industry} • {lead.companySize}
                      </p>
                    </div>
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {lead.contactName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{lead.contactName}</p>
                        <p className="text-xs text-muted-foreground">{lead.contactTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{lead.contactEmail}</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">Personalized Intro:</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {lead.personalizedIntro}
                    </p>
                  </div>

                  {lead.website && (
                    <a 
                      href={lead.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Visit Website →
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isGenerating && leads.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Generate Leads?</h3>
            <p className="text-muted-foreground mb-4">
              Enter your target niche above and let AI create personalized prospects for you
            </p>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <span>• AI-powered personalization</span>
              <span>• Export to CSV</span>
              <span>• Save for later</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}