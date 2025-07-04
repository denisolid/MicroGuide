import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Loader, Sparkles, Zap, Star } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

interface AuthFormProps {
  onClose: () => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
        toast.success('🎉 Welcome back, superstar!', {
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        })
      } else {
        await signUp(email, password)
        toast.success('🚀 Account created! Check your email and join the revolution!', {
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        })
      }
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      toast.success('🔥 Signed in with Google! Let\'s go viral!', {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      })
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotateY: 15 }}
      className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500 rounded-full"
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
        <div className="text-center mb-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-black text-gray-900 mb-2"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isLogin ? '🔥 Welcome Back!' : '🚀 Join the Revolution!'}
          </motion.h2>
          
          <p className="text-gray-600 font-medium">
            {isLogin ? 'Continue your viral learning journey' : 'Start your transformation today'}
          </p>
          
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold text-purple-600">Join 45,000+ learners</span>
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 group-focus-within:text-purple-600 transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full pl-12 pr-4 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 group-focus-within:text-purple-600 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full pl-12 pr-12 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
              required
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </motion.button>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white font-black py-4 rounded-2xl hover:from-purple-700 hover:via-pink-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Magic...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>{isLogin ? 'Sign In & Go Viral' : 'Create Account & Start'}</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-purple-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-purple-600 font-bold">Or continue with</span>
            </div>
          </div>

          <motion.button
            onClick={handleGoogleSignIn}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 w-full flex items-center justify-center space-x-3 py-4 px-4 border-2 border-purple-200 rounded-2xl hover:bg-purple-50 transition-all duration-300 group"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700 font-bold group-hover:text-purple-600 transition-colors">Google</span>
          </motion.button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 font-medium">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <motion.button
              onClick={() => setIsLogin(!isLogin)}
              whileHover={{ scale: 1.05 }}
              className="ml-2 text-purple-600 hover:text-purple-700 font-bold transition-colors"
            >
              {isLogin ? 'Join the revolution' : 'Sign in here'}
            </motion.button>
          </p>
          
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-purple-600 font-bold">Free forever • No credit card required</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}