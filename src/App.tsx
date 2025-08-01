import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import blink from './blink/client'
import { Sidebar } from './components/layout/Sidebar'
import { LeadGenerator } from './pages/LeadGenerator'
import { SavedLists } from './pages/SavedLists'
import { Analytics } from './pages/Analytics'
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
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              AI Lead Generator
            </h1>
            <p className="text-xl mb-8 text-purple-100">
              Generate targeted prospects with AI-powered personalization
            </p>
          </div>
          <button
            onClick={() => blink.auth.login()}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started Free
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
            <Route path="/" element={<Navigate to="/generator" replace />} />
            <Route path="/generator" element={<LeadGenerator />} />
            <Route path="/saved-lists" element={<SavedLists />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </Router>
  )
}

export default App