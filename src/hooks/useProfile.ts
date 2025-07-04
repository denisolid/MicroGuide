import { useEffect, useState } from 'react'
import { Profile, supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export const useProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        throw error
      } else if (!data) {
        // Profile doesn't exist, create one
        await createProfile()
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: user.id,
            username: user.email?.split('@')[0] || 'user',
            full_name: user.user_metadata.full_name || '',
            avatar_url: user.user_metadata.avatar_url || '',
            learning_goals: [],
            preferred_topics: [],
            experience_level: 'beginner',
            total_points: 0,
            current_streak: 0,
            longest_streak: 0,
          },
        ])
        .select()
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  }
}