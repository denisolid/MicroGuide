import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Play, Clock, BookOpen, CheckCircle, Circle, ExternalLink, FileText, Video, Book, Dumbbell } from 'lucide-react'
import { LearningPath, LearningNode, UserProgress } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { dbManager } from '../../lib/database'
import toast from 'react-hot-toast'

interface PathViewerModalProps {
  path: LearningPath
  onClose: () => void
}

export const PathViewerModal: React.FC<PathViewerModalProps> = ({ path, onClose }) => {
  const { user } = useAuth()
  const [nodes, setNodes] = useState<LearningNode[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [activeNode, setActiveNode] = useState<LearningNode | null>(null)

  useEffect(() => {
    fetchPathData()
  }, [path.id])

  const fetchPathData = async () => {
    try {
      const pathWithNodes = await dbManager.fetchPathWithNodes(path.id)
      if (pathWithNodes) {
        setNodes(pathWithNodes.nodes)
      }

      if (user) {
        const progress = await dbManager.getUserProgress(user.id, path.id)
        setUserProgress(progress)
      }
    } catch (error) {
      console.error('Error fetching path data:', error)
      toast.error('Failed to load path details')
    } finally {
      setLoading(false)
    }
  }

  const getNodeProgress = (nodeId: string) => {
    return userProgress.find(p => p.node_id === nodeId)
  }

  const getNodeIcon = (contentType: string) => {
    switch (contentType) {
      case 'video': return Video
      case 'article': return FileText
      case 'course': return Book
      case 'exercise': return Dumbbell
      default: return BookOpen
    }
  }

  const handleStartNode = async (node: LearningNode) => {
    if (!user) {
      toast.error('Please sign in to track your progress')
      return
    }

    try {
      await dbManager.updateUserProgress(user.id, path.id, {
        nodeId: node.id,
        status: 'in_progress',
        progressPercentage: 0,
        timeSpent: 0
      })

      // Refresh progress
      const progress = await dbManager.getUserProgress(user.id, path.id)
      setUserProgress(progress)
      
      // Open resource if available
      if (node.resource_url) {
        window.open(node.resource_url, '_blank')
      }
      
      toast.success('Started learning module!')
    } catch (error) {
      console.error('Error starting node:', error)
      toast.error('Failed to start module')
    }
  }

  const handleCompleteNode = async (node: LearningNode) => {
    if (!user) return

    try {
      await dbManager.updateUserProgress(user.id, path.id, {
        nodeId: node.id,
        status: 'completed',
        progressPercentage: 100,
        timeSpent: node.estimated_duration * 60 // Convert to minutes
      })

      // Refresh progress
      const progress = await dbManager.getUserProgress(user.id, path.id)
      setUserProgress(progress)
      
      toast.success('Module completed! 🎉')
    } catch (error) {
      console.error('Error completing node:', error)
      toast.error('Failed to mark as completed')
    }
  }

  const calculateOverallProgress = () => {
    if (nodes.length === 0) return 0
    const completedNodes = userProgress.filter(p => p.status === 'completed').length
    return Math.round((completedNodes / nodes.length) * 100)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading path details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{path.title}</h2>
              <p className="text-blue-100 mb-4">{path.description}</p>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty_level)}`}>
                  {path.difficulty_level}
                </span>
                <div className="flex items-center space-x-1 text-blue-100">
                  <Clock className="w-4 h-4" />
                  <span>{path.estimated_duration}h</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-100">
                  <BookOpen className="w-4 h-4" />
                  <span>{nodes.length} modules</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          {user && (
            <div className="bg-white/20 rounded-full h-2 mb-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${calculateOverallProgress()}%` }}
              />
            </div>
          )}
          {user && (
            <p className="text-sm text-blue-100">
              Progress: {calculateOverallProgress()}% complete
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {nodes.length > 0 ? (
            <div className="space-y-4">
              {nodes.map((node, index) => {
                const progress = getNodeProgress(node.id)
                const isCompleted = progress?.status === 'completed'
                const isInProgress = progress?.status === 'in_progress'
                const IconComponent = getNodeIcon(node.content_type)

                return (
                  <div
                    key={node.id}
                    className={`border rounded-xl p-4 transition-all duration-200 ${
                      isCompleted 
                        ? 'border-green-200 bg-green-50' 
                        : isInProgress 
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isInProgress
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <IconComponent className="w-5 h-5" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{node.title}</h3>
                            <p className="text-gray-600 text-sm">{node.description}</p>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{node.estimated_duration}h</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {!isCompleted && (
                            <button
                              onClick={() => handleStartNode(node)}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                            >
                              <Play className="w-4 h-4" />
                              <span>{isInProgress ? 'Continue' : 'Start'}</span>
                            </button>
                          )}

                          {node.resource_url && (
                            <button
                              onClick={() => window.open(node.resource_url, '_blank')}
                              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Open Resource</span>
                            </button>
                          )}

                          {isInProgress && !isCompleted && (
                            <button
                              onClick={() => handleCompleteNode(node)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Mark Complete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No modules yet</h3>
              <p className="text-gray-600">This learning path doesn't have any modules yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {nodes.length} modules • {path.estimated_duration} hours total
            </div>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}