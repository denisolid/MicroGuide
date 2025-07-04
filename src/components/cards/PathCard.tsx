import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, Star, BookOpen, ArrowRight, Trash2, MoreVertical, Siren as Fire, Zap, Trophy, TrendingUp, X } from 'lucide-react'
import { LearningPath } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'

interface PathCardProps {
  path: LearningPath
  onStartLearning?: (pathId: string) => void
  onDelete?: (pathId: string) => void
}

export const PathCard: React.FC<PathCardProps> = ({ path, onStartLearning, onDelete }) => {
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
      case 'intermediate': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
      case 'advanced': return 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    }
  }

  const getTopicColor = (topic: string) => {
    const colors = {
      'web-development': 'from-blue-500 via-purple-500 to-pink-500',
      'data-science': 'from-purple-500 via-pink-500 to-red-500',
      'design': 'from-green-400 via-blue-500 to-purple-600',
      'business': 'from-orange-400 via-red-500 to-pink-500',
      'web3': 'from-indigo-500 via-purple-500 to-pink-500',
      'ai-ml': 'from-pink-500 via-purple-500 to-indigo-500',
    }
    return colors[topic as keyof typeof colors] || 'from-gray-500 to-gray-600'
  }

  const canDelete = user && path.created_by === user.id
  const isHot = Math.random() > 0.6 // Random hot indicator for viral effect
  const isNew = new Date(path.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000

  const handleDelete = () => {
    console.log('Delete button clicked for path:', path.id)
    if (onDelete) {
      onDelete(path.id)
    }
    setShowDeleteConfirm(false)
    setShowMenu(false)
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer relative border border-gray-100"
      >
        {/* Trending/Hot Badges */}
        <div className="absolute top-4 left-4 z-20 flex space-x-2">
          {isHot && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg"
            >
              <Fire className="w-3 h-3" />
              <span>HOT</span>
            </motion.div>
          )}
          {isNew && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
              <Zap className="w-3 h-3" />
              <span>NEW</span>
            </div>
          )}
        </div>
        {/* Header with Gradient */}
        <div className={`h-36 bg-gradient-to-br ${getTopicColor(path.topic)} p-6 relative overflow-hidden`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg ${getDifficultyColor(path.difficulty_level)}`}
              >
                {path.difficulty_level.toUpperCase()}
              </motion.span>
              <div className="flex items-center space-x-3">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex items-center space-x-1 text-white/90 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
                >
                  <Star className="w-4 h-4 fill-current text-yellow-300" />
                  <span className="text-sm font-bold">4.8</span>
                </motion.div>
                {canDelete && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(!showMenu)
                      }}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                    >
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>
                    {showMenu && (
                      <div
                        className="absolute right-0 top-10 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-30 min-w-[120px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDeleteConfirm(true)
                            setShowMenu(false)
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-2xl font-black text-white group-hover:text-yellow-200 transition-colors leading-tight">
              {path.title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{path.description}</p>

          {/* Tags */}
          {path.tags && path.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {path.tags.slice(0, 3).map((tag, index) => (
                <motion.span
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200"
                >
                  #{tag}
                </motion.span>
              ))}
              {path.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{path.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">{path.estimated_duration}h</span>
              </div>
              <span className="text-xs text-gray-500">Duration</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-bold">{path.total_nodes}</span>
              </div>
              <span className="text-xs text-gray-500">Modules</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-bold">1.2k</span>
              </div>
              <span className="text-xs text-gray-500">Learners</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Completion Rate</span>
              <span className="text-sm font-bold text-green-600">94%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '94%' }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Action Button */}
          <motion.button 
            onClick={() => onStartLearning?.(path.id)}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-4 rounded-2xl hover:from-purple-700 hover:via-pink-700 hover:to-red-700 transition-all duration-300 font-bold text-lg flex items-center justify-center space-x-3 group shadow-xl"
          >
            <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Start Learning</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: 10 }}
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50"></div>
            
            <div className="relative z-10">
              {/* Close button */}
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Trash2 className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">Delete Learning Path?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-red-600">"{path.title}"</span>? 
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-colors font-bold"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}