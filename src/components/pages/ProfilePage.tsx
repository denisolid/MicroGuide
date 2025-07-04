import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Trophy, Calendar, Target, Edit3, Save, X, Upload } from 'lucide-react'
import { useProfile } from '../../hooks/useProfile'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useProfile()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    learning_goals: [] as string[],
    preferred_topics: [] as string[],
    experience_level: 'beginner',
  })

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        learning_goals: profile.learning_goals || [],
        preferred_topics: profile.preferred_topics || [],
        experience_level: profile.experience_level || 'beginner',
      })
    }
  }, [profile])

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        learning_goals: profile.learning_goals || [],
        preferred_topics: profile.preferred_topics || [],
        experience_level: profile.experience_level || 'beginner',
      })
    }
    setIsEditing(false)
  }

  const addGoal = (goal: string) => {
    if (goal.trim() && !formData.learning_goals.includes(goal.trim())) {
      setFormData(prev => ({
        ...prev,
        learning_goals: [...prev.learning_goals, goal.trim()]
      }))
    }
  }

  const removeGoal = (goalToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      learning_goals: prev.learning_goals.filter(goal => goal !== goalToRemove)
    }))
  }

  const addTopic = (topic: string) => {
    if (topic.trim() && !formData.preferred_topics.includes(topic.trim())) {
      setFormData(prev => ({
        ...prev,
        preferred_topics: [...prev.preferred_topics, topic.trim()]
      }))
    }
  }

  const removeTopic = (topicToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_topics: prev.preferred_topics.filter(topic => topic !== topicToRemove)
    }))
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-4 right-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-4 ring-white">
                <User className="w-16 h-16 text-white" />
              </div>
              {isEditing && (
                <button className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
                  <Upload className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                    />
                  ) : (
                    profile.full_name || profile.username
                  )}
                </h2>
                <p className="text-gray-600">@{profile.username}</p>
                <p className="text-gray-600 mt-1">{user?.email}</p>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.total_points}</div>
                  <div className="text-sm text-gray-600">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.current_streak}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.longest_streak}</div>
                  <div className="text-sm text-gray-600">Best Streak</div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-600">
                  {profile.bio || "No bio added yet. Click edit to add one!"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Learning Goals */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Learning Goals</h3>
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a learning goal..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addGoal(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.learning_goals.map(goal => (
                  <span
                    key={goal}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <span>{goal}</span>
                    <button
                      onClick={() => removeGoal(goal)}
                      className="hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.learning_goals && profile.learning_goals.length > 0 ? (
                profile.learning_goals.map(goal => (
                  <span
                    key={goal}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {goal}
                  </span>
                ))
              ) : (
                <p className="text-gray-600">No learning goals set yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Preferred Topics */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Preferred Topics</h3>
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a topic..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTopic(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.preferred_topics.map(topic => (
                  <span
                    key={topic}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    <span>{topic}</span>
                    <button
                      onClick={() => removeTopic(topic)}
                      className="hover:text-purple-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.preferred_topics && profile.preferred_topics.length > 0 ? (
                profile.preferred_topics.map(topic => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <p className="text-gray-600">No preferred topics set yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Experience Level */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Experience Level</h3>
          </div>
          
          {isEditing ? (
            <select
              value={formData.experience_level}
              onChange={(e) => setFormData(prev => ({ ...prev, experience_level: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize">
                {profile.experience_level}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}