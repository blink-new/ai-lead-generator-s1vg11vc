import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import blink from './blink/client'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Pipeline } from './pages/Pipeline'
import { Activities } from './pages/Activities'
import { Clients } from './pages/Clients'
import { Team } from './pages/Team'
import { SocialMedia } from './pages/SocialMedia'
import { UpworkProjects } from './pages/UpworkProjects'
import { LinkedInOutreach } from './pages/LinkedInOutreach'
import { Analytics } from './pages/Analytics'
import { AdvancedAnalytics } from './pages/AdvancedAnalytics'
import { Automation } from './pages/Automation'
import { Settings } from './pages/Settings'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { Toaster } from './components/ui/toaster'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">TechCRM Pro</h1>
          <p className="text-xl mb-8">Please sign in to continue</p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/team" element={<Team />} />
            <Route path="/social-media" element={<SocialMedia />} />
            <Route path="/upwork" element={<UpworkProjects />} />
            <Route path="/linkedin" element={<LinkedInOutreach />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </Router>
  )
}

export default App