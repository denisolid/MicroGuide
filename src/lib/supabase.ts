import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Profile {
  id: string
  user_id: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  learning_goals: string[]
  preferred_topics: string[]
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  total_points: number
  current_streak: number
  longest_streak: number
  created_at: string
  updated_at: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  topic: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration: number
  created_by: string
  is_public: boolean
  total_nodes: number
  completion_rate: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface LearningNode {
  id: string
  path_id: string
  title: string
  description: string
  content_type: 'video' | 'article' | 'course' | 'exercise'
  resource_url?: string
  estimated_duration: number
  order_index: number
  prerequisites: string[]
  is_required: boolean
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  path_id: string
  node_id: string
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  progress_percentage: number
  time_spent: number
  notes?: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: string
  points: number
  criteria: any
  is_active: boolean
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement: Achievement
}

export interface Challenge {
  id: string
  title: string
  description: string
  created_by: string
  path_id: string
  start_date: string
  end_date?: string
  max_participants?: number
  is_public: boolean
  prize_description?: string
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
}

export interface Resource {
  id: string
  title: string
  description: string
  url: string
  resource_type: 'video' | 'article' | 'course' | 'book' | 'tool'
  platform: string
  author: string
  duration: number
  difficulty_level: string
  topics: string[]
  rating: number
  is_free: boolean
  created_at: string
  updated_at: string
}