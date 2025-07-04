import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Header } from './components/layout/Header'
import { HomePage } from './components/pages/HomePage'
import { LearningPathsPage } from './components/pages/LearningPathsPage'
import { ProfilePage } from './components/pages/ProfilePage'
import { useAuth } from './hooks/useAuth'

function App() {
  const { loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')
  const [pathsKey, setPathsKey] = useState(0) // Force re-render of paths page

  const handleNavigate = (page: string) => {
    if (page === 'paths') {
      setPathsKey(prev => prev + 1) // Force complete refresh of paths page
    }
    setCurrentPage(page)
  }
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />
      case 'paths':
        return <LearningPathsPage key={pathsKey} />
      case 'profile':
        return <ProfilePage />
      case 'challenges':
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Challenges Coming Soon</h2>
            <p className="text-gray-600">We're working on exciting challenge features!</p>
          </div>
        </div>
      case 'resources':
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Resources Coming Soon</h2>
            <p className="text-gray-600">Curated learning resources will be available soon!</p>
          </div>
        </div>
      case 'settings':
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings Coming Soon</h2>
            <p className="text-gray-600">Advanced settings and preferences coming soon!</p>
          </div>
        </div>
      default:
        return <HomePage onNavigate={setCurrentPage} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading MicroGuide...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      {renderPage()}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}

export default App