export function LoadingScreen() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
        <h1 className="text-2xl font-semibold">TechCRM Pro</h1>
        <p className="text-lg opacity-90">Loading your workspace...</p>
      </div>
    </div>
  )
}