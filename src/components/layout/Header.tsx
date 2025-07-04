import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, User, LogOut, Settings, Trophy, Menu, X, Zap, Siren as Fire, Star, Sparkles } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { AuthForm } from '../auth/AuthForm'
import { openaiService } from '../../lib/openaiService'
import toast from 'react-hot-toast'

interface HeaderProps {
  onNavigate: (page: string) => void
  currentPage: string
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully! Come back soon! 👋', {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
        }
      })
      setShowUserMenu(false)
      onNavigate('home')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  const navigation = [
    { name: 'Home', id: 'home', icon: '🏠' },
    { name: 'Learning Paths', id: 'paths', icon: '🚀' },
    { name: 'Challenges', id: 'challenges', icon: '⚡' },
    { name: 'Resources', id: 'resources', icon: '📚' },
  ]

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/95 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  MicroGuide
                </h1>
                <p className="text-xs text-purple-500 font-medium">✨ AI Learning Paths</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navigation.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </motion.button>
              ))}
            </nav>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <motion.button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-purple-50 transition-colors group"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{profile?.current_streak || 0}</span>
                      </div>
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                        {profile?.full_name || profile?.username || 'Superstar'}
                      </div>
                      <div className="text-xs text-purple-500 flex items-center font-medium">
                        <Trophy className="w-3 h-3 mr-1 text-yellow-500" />
                        {profile?.total_points || 0} points 🔥
                      </div>
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="text-sm font-medium text-gray-900">
                            {profile?.full_name || profile?.username || 'Superstar'}
                          </div>
                          <div className="text-xs text-purple-500 flex items-center">
                            <Trophy className="w-3 h-3 mr-1 text-yellow-500" />
                            {profile?.total_points || 0} points • {profile?.current_streak || 0} day streak 🔥
                          </div>
                        </div>
                          <motion.button
                            onClick={() => {
                              onNavigate('profile')
                              setShowUserMenu(false)
                            }}
                            whileHover={{ x: 5 }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                          >
                            <User className="w-4 h-4 text-purple-500" />
                            <span>Profile</span>
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              onNavigate('settings')
                              setShowUserMenu(false)
                            }}
                            whileHover={{ x: 5 }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-purple-500" />
                            <span>Settings</span>
                          </motion.button>
                          <hr className="my-1 border-gray-200" />
                          <motion.button
                            onClick={handleSignOut}
                            whileHover={{ x: 5 }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  onClick={() => setShowAuthForm(true)}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started ✨</span>
                </motion.button>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden p-2 rounded-xl hover:bg-purple-50 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-purple-600" />
                ) : (
                  <Menu className="w-5 h-5 text-purple-600" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50"
            >
              <div className="px-4 py-4 space-y-2">
                {navigation.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id)
                      setMobileMenuOpen(false)
                    }}
                    whileHover={{ x: 5 }}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center space-x-3 ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-purple-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAuthForm(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <AuthForm onClose={() => setShowAuthForm(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}