import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Clock, Users, Star, BookOpen, Plus, Sparkles } from 'lucide-react'
import { LearningPath } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { CreatePathModal } from '../modals/CreatePathModal'
import { PathViewerModal } from '../modals/PathViewerModal'
import { PathCard } from '../cards/PathCard'
import { dbManager } from '../../lib/database'
import { aiSearch } from '../../lib/aiSearch'
import { pathGenerator } from '../../lib/pathGenerator'
import toast from 'react-hot-toast'

export const LearningPathsPage: React.FC = () => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchResults, setSearchResults] = useState<LearningPath[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)
  const [showPathViewer, setShowPathViewer] = useState(false)

  const categories = [
    { id: 'all', name: 'All Topics', count: 0 },
    { id: 'web-development', name: 'Web Development', count: 0 },
    { id: 'data-science', name: 'Data Science', count: 0 },
    { id: 'design', name: 'Design', count: 0 },
    { id: 'business', name: 'Business', count: 0 },
    { id: 'web3', name: 'Web3 & Blockchain', count: 0 },
    { id: 'ai-ml', name: 'AI & Machine Learning', count: 0 },
  ]

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ]

  useEffect(() => {
    fetchPaths()
  }, [selectedCategory, selectedDifficulty])

  useEffect(() => {
    if (searchQuery.trim()) {
      performIntelligentSearch()
    } else {
      setSearchResults([])
    }
  }, [searchQuery, selectedCategory, selectedDifficulty])
  const fetchPaths = async () => {
    setLoading(true)
    console.log('📡 Fetching paths from database...')
    try {
      const data = await dbManager.fetchPaths({
        isPublic: true,
        topic: selectedCategory !== 'all' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        limit: 50
      })
      console.log('📡 Fetched', data.length, 'paths from database')
      setPaths(data)
    } catch (error) {
      console.error('Error fetching paths:', error)
      toast.error('Failed to load learning paths')
    } finally {
      setLoading(false)
    }
  }

  // Refresh paths list
  const refreshPaths = async () => {
    console.log('🔄 Force refreshing paths list...')
    await dbManager.forceRefresh()
    
    await fetchPaths()
    console.log('✅ Paths refreshed')
  }

  const performIntelligentSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const results = await aiSearch.intelligentSearch(searchQuery, {
        topic: selectedCategory !== 'all' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined
      })
      
      setSearchResults(results.paths)
      
      if (results.confidence < 0.5 && user) {
        toast.info('No perfect matches found. Consider generating a custom path!')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }
  // Use search results if available, otherwise use filtered paths
  const displayPaths = searchQuery.trim() ? searchResults : paths.filter(path => {
    const matchesCategory = selectedCategory === 'all' || path.topic === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || path.difficulty_level === selectedDifficulty
    return matchesCategory && matchesDifficulty
  })

  const handleCreatePath = async (pathData: any) => {
    try {
      if (!user) {
        toast.error('Please sign in to create paths')
        return
      }
      
      // Create path directly from form data
      const savedPath = await dbManager.createPath({
        title: pathData.title,
        description: pathData.description,
        topic: pathData.topic,
        difficulty_level: pathData.difficulty_level,
        estimated_duration: pathData.estimated_duration,
        tags: pathData.tags,
        created_by: user.id,
        is_public: true,
        total_nodes: 0,
        completion_rate: 0
      })
      
      // Refresh the entire paths list to ensure consistency
      await refreshPaths()
      setShowCreateModal(false)
      toast.success('Learning path created! You can now add modules to it.')
    } catch (error) {
      console.error('Error creating path:', error)
      toast.error('Failed to create learning path')
    }
  }

  const handleStartLearning = (pathId: string) => {
    const path = displayPaths.find(p => p.id === pathId)
    if (path) {
      setSelectedPath(path)
      setShowPathViewer(true)
    }
  }

  const handleDeletePath = async (pathId: string) => {
    try {
      if (!user) {
        toast.error('Please sign in to delete paths')
        return
      }

      console.log('🗑️ UI: Starting deletion process for path:', pathId)
      
      // Show loading toast
      const loadingToast = toast.loading('🗑️ Deleting learning path...')

      // Get path info before deletion
      const pathToDelete = displayPaths.find(p => p.id === pathId)
      const pathTitle = pathToDelete?.title || 'Learning path'
      console.log('🗑️ UI: Deleting path:', pathTitle)
      
      // STEP 1: Immediately remove from UI (optimistic update)
      console.log('🔄 UI: Removing from UI immediately (optimistic update)')
      setPaths(prevPaths => {
        const filtered = prevPaths.filter(path => path.id !== pathId)
        console.log('🔄 UI: Paths updated from', prevPaths.length, 'to', filtered.length)
        return filtered
      })
      setSearchResults(prevResults => prevResults.filter(path => path.id !== pathId))
      
      // STEP 2: Perform the actual database deletion
      console.log('🗑️ UI: Calling database deletion...')
      await dbManager.deletePath(pathId, user.id)
      console.log('✅ UI: Database deletion completed')
      
      // STEP 3: Show success message
      toast.dismiss(loadingToast)
      toast.success(`🎉 "${pathTitle}" deleted successfully!`)
      
      // STEP 4: Background verification and cache clearing
      console.log('🔄 UI: Performing background verification...')
      setTimeout(async () => {
        try {
          // Force complete refresh to ensure database consistency
          await dbManager.forceRefresh()
          
          // Verify the path is actually gone from database
          const freshPaths = await dbManager.fetchPaths({
            isPublic: true,
            topic: selectedCategory !== 'all' ? selectedCategory : undefined,
            difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
            limit: 50
          })
          
          // Double-check the deleted path is not in fresh data
          const stillExists = freshPaths.some(p => p.id === pathId)
          if (stillExists) {
            console.error('⚠️ UI: Path still exists in database after deletion!')
            // If path still exists, refresh UI to show correct state
            setPaths(freshPaths)
            toast.error('Deletion may have failed. Please refresh the page.')
          } else {
            console.log('✅ UI: Deletion verified - path no longer in database')
            // Update with fresh data to ensure consistency
            setPaths(freshPaths)
          }
          
        } catch (refreshError) {
          console.error('⚠️ UI: Background verification failed:', refreshError)
        }
      }, 1000) // Longer delay to ensure database operations complete
      
    } catch (error) {
      console.error('❌ UI: Deletion process failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`❌ Failed to delete: ${errorMessage}`)
      
      // On error, restore the correct state from database
      console.log('🔄 UI: Restoring correct state due to error...')
      try {
        await dbManager.forceRefresh()
        const correctPaths = await dbManager.fetchPaths({
          isPublic: true,
          topic: selectedCategory !== 'all' ? selectedCategory : undefined,
          difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
          limit: 50
        })
        setPaths(correctPaths)
        console.log('✅ UI: State restored from database')
      } catch (refreshError) {
        console.error('❌ UI: Failed to restore state:', refreshError)
        // Last resort: force page refresh
        toast.error('Please refresh the page to see the correct state')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading learning paths...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                🚀 Learning Paths
              </h1>
              <p className="text-gray-600">
                Discover structured learning journeys crafted by AI and experts
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Create Path</span>
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur opacity-20"></div>
              <div className="relative bg-white rounded-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="✨ Search learning paths or describe what you want to learn..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-lg"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white shadow-lg"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white shadow-lg"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          {searchQuery.trim() && (
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-purple-600 font-medium">
                AI-powered search results
              </span>
            </div>
          )}
          <p className="text-gray-600">
            Showing <span className="font-semibold text-purple-600">{displayPaths.length}</span> learning paths
            {searchQuery.trim() && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Paths Grid */}
        {displayPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <PathCard 
                  path={path} 
                  onStartLearning={handleStartLearning}
                  onDelete={handleDeletePath}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No paths found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search terms or generate a custom path' : 'Be the first to create a learning path!'}
            </p>
            {user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Custom Path</span>
                </button>
                {searchQuery && (
                  <button
                    onClick={async () => {
                      try {
                        const pathStructure = await pathGenerator.generatePath({
                          query: searchQuery,
                          userId: user.id,
                          learningStyle: 'mixed'
                        })
                        const savedPath = await pathGenerator.saveGeneratedPath(pathStructure, user.id)
                        setPaths([savedPath, ...paths])
                        toast.success('AI-generated path created!')
                      } catch (error) {
                        toast.error('Failed to generate path')
                      }
                    }}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate AI Path</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Path Modal */}
      {showCreateModal && (
        <CreatePathModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePath}
        />
      )}

      {/* Path Viewer Modal */}
      {showPathViewer && selectedPath && (
        <PathViewerModal
          path={selectedPath}
          onClose={() => {
            setShowPathViewer(false)
            setSelectedPath(null)
          }}
        />
      )}
    </div>
  )
}