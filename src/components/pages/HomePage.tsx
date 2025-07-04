import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Sparkles, TrendingUp, Users, BookOpen, Trophy, ArrowRight, Play, Zap, Star, Rocket, Siren as Fire, Heart } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { pathGenerator } from '../../lib/pathGenerator'
import { openaiService } from '../../lib/openaiService'
import toast from 'react-hot-toast'

interface HomePageProps {
  onNavigate: (page: string) => void
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const stats = [
    { label: 'Learning Paths', value: '2,500+', icon: BookOpen },
    { label: 'Active Learners', value: '45,000+', icon: Users },
    { label: 'Success Stories', value: '120,000+', icon: Trophy },
    { label: 'Success Rate', value: '94%', icon: TrendingUp },
  ]

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    if (!user) {
      toast.error('Please sign in to generate learning paths')
      return
    }

    setIsGenerating(true)
    try {
      // Validate search query
      if (searchQuery.trim().length < 3) {
        toast.error('Please enter at least 3 characters')
        return
      }

      // Generate new path directly
      const pathStructure = await pathGenerator.generatePath({
        query: searchQuery,
        userId: user.id,
        learningStyle: 'mixed',
        difficulty: 'beginner',
        duration: 20
      })
      
      const savedPath = await pathGenerator.saveGeneratedPath(pathStructure, user.id)
      
      // Show viral success animation
      toast.success(`🎉 Created "${pathStructure.title}" learning path!`, {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      })
      
      // Add a small delay to ensure the path is saved before navigating
      setTimeout(() => {
        onNavigate('paths')
      }, 500)
    } catch (error) {
      console.error('Search/generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate learning path'
      toast.error(`Failed to generate learning path: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2 mb-6 shadow-lg">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                <span className="font-medium">AI-Powered Learning Revolution</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Learn Anything with
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                  AI-Powered Paths ✨
                </span>
              </h1>
              
              <motion.p 
                className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Create personalized learning journeys for any topic. From chess to coding, 
                our AI generates <span className="font-semibold text-purple-600">structured paths tailored to your goals</span>.
              </motion.p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              onSubmit={handleSearch}
              className="max-w-3xl mx-auto mb-16"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative bg-white rounded-xl">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="✨ What do you want to learn? (e.g., 'chess', 'cooking', 'web development')"
                    className="w-full pl-12 pr-32 py-4 text-lg rounded-xl border-0 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-lg placeholder-gray-500"
                  />
                  <motion.button
                    type="submit"
                    disabled={isGenerating}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Magic...</span>
                      </>
                    ) : (
                      <>
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                        <span>Generate</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.form>

            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-center"
              >
                <p className="text-gray-600 mb-6">Start your learning journey today!</p>
                <motion.button
                  onClick={() => onNavigate('auth')}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                >
                  🚀 Get Started Free
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🌟 Trusted by Learners Worldwide</h2>
            <p className="text-lg text-gray-600">Join thousands of successful learners achieving their dreams</p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300">
                  <stat.icon className="w-10 h-10 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Viral Style */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">⚡ How It Works</h2>
            <p className="text-lg text-gray-600">
              Get started in three magical steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '1',
                title: 'Describe Your Goal',
                description: 'Tell us what you want to learn - anything from chess to coding to cooking. Our AI understands it all! 🎯',
                icon: Sparkles,
                color: 'from-purple-500 to-pink-500'
              },
              {
                step: '2',
                title: 'Get Your Custom Path',
                description: 'Our AI creates a structured learning path with modules, resources, and exercises tailored just for you. ✨',
                icon: Play,
                color: 'from-blue-500 to-indigo-500'
              },
              {
                step: '3',
                title: 'Start Learning',
                description: 'Follow your personalized path, track progress, and achieve your learning goals faster than ever! 🏆',
                icon: Trophy,
                color: 'from-green-500 to-teal-500'
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center group"
              >
                <div className="relative mb-8">
                  <div className={`w-24 h-24 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300`}>
                    <item.icon className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg">
                    {item.step}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
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
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Heart className="w-5 h-5 text-pink-300" />
              <span className="text-white font-medium">Join the Learning Revolution</span>
              <Star className="w-5 h-5 text-yellow-300" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Start Your
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Amazing Journey? 🚀
              </span>
            </h2>
            
            <p className="text-xl text-purple-100 mb-10 leading-relaxed">
              Join <span className="font-bold text-yellow-300">45,000+</span> learners who are achieving their goals with 
              <span className="font-bold text-pink-300"> personalized AI-generated learning paths</span>.
            </p>
            
            <motion.button
              onClick={() => onNavigate('paths')}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-purple-600 px-10 py-4 rounded-2xl hover:bg-gray-100 transition-all duration-200 font-bold text-xl shadow-2xl"
            >
              🎯 Explore Learning Paths
            </motion.button>
            
            <p className="text-purple-200 mt-6 text-lg">
              ⚡ No credit card required • 🚀 Start in 30 seconds
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}