import { supabase } from './supabase'
import { LearningPath, LearningNode, UserProgress, Profile } from './supabase'

export interface DatabaseFilters {
  topic?: string
  difficulty?: string
  isPublic?: boolean
  createdBy?: string
  limit?: number
  offset?: number
}

export interface ProgressUpdate {
  nodeId: string
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  progressPercentage: number
  timeSpent: number
  notes?: string
}

export class DatabaseManager {
  private static instance: DatabaseManager
  private queryCache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  // Optimized path fetching with caching
  async fetchPaths(filters: DatabaseFilters = {}): Promise<LearningPath[]> {
    const cacheKey = `paths-${JSON.stringify(filters)}`
    
    // Skip cache for fresh data to ensure deletions are reflected
    console.log('📡 Fetching fresh paths from database (cache bypassed for deletion consistency)')

    try {
      let query = supabase
        .from('learning_paths')
        .select(`
          *,
          learning_nodes(count)
        `)

      // Apply filters
      if (filters.topic) {
        query = query.eq('topic', filters.topic)
      }
      
      if (filters.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty)
      }
      
      if (filters.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic)
      }
      
      if (filters.createdBy) {
        query = query.eq('created_by', filters.createdBy)
      }

      // Apply pagination
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1)
      } else if (filters.limit) {
        query = query.limit(filters.limit)
      }

      // Optimize ordering
      query = query.order('completion_rate', { ascending: false })
                   .order('total_nodes', { ascending: false })
                   .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      console.log('✅ Successfully fetched', data?.length || 0, 'paths from database')

      // Don't cache immediately after deletion operations to ensure consistency
      const result = data || []
      
      // Cache the result immediately to ensure consistency
      this.queryCache.set(cacheKey, { data: result, timestamp: Date.now() })
      
      return result
    } catch (error) {
      console.error('Error fetching paths:', error)
      return []
    }
  }

  // Fetch path with nodes (optimized)
  async fetchPathWithNodes(pathId: string): Promise<LearningPath & { nodes: LearningNode[] } | null> {
    const cacheKey = `path-nodes-${pathId}`
    const cached = this.queryCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const { data: path, error: pathError } = await supabase
        .from('learning_paths')
        .select(`
          *,
          learning_nodes(*)
        `)
        .eq('id', pathId)
        .single()

      if (pathError) throw pathError

      // Sort nodes by order_index
      if (path.learning_nodes) {
        path.learning_nodes.sort((a: LearningNode, b: LearningNode) => a.order_index - b.order_index)
      }

      const result = {
        ...path,
        nodes: path.learning_nodes || []
      }

      // Cache the result
      this.queryCache.set(cacheKey, { data: result, timestamp: Date.now() })
      
      return result
    } catch (error) {
      console.error('Error fetching path with nodes:', error)
      return null
    }
  }

  // Optimized user progress tracking
  async updateUserProgress(userId: string, pathId: string, update: ProgressUpdate): Promise<UserProgress | null> {
    try {
      // Check if progress record exists
      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('node_id', update.nodeId)
        .maybeSingle()

      let result
      if (existing) {
        // Update existing progress
        const { data, error } = await supabase
          .from('user_progress')
          .update({
            status: update.status,
            progress_percentage: update.progressPercentage,
            time_spent: update.timeSpent,
            notes: update.notes,
            completed_at: update.status === 'completed' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Create new progress record
        const { data, error } = await supabase
          .from('user_progress')
          .insert([{
            user_id: userId,
            path_id: pathId,
            node_id: update.nodeId,
            status: update.status,
            progress_percentage: update.progressPercentage,
            time_spent: update.timeSpent,
            notes: update.notes,
            started_at: new Date().toISOString(),
            completed_at: update.status === 'completed' ? new Date().toISOString() : null
          }])
          .select()
          .single()

        if (error) throw error
        result = data
      }

      // Update user profile points and streaks
      await this.updateUserStats(userId, update.status === 'completed')

      // Clear related cache
      this.clearCacheByPattern(`progress-${userId}`)
      
      return result
    } catch (error) {
      console.error('Error updating user progress:', error)
      return null
    }
  }

  // Get user progress for a path
  async getUserProgress(userId: string, pathId: string): Promise<UserProgress[]> {
    const cacheKey = `progress-${userId}-${pathId}`
    const cached = this.queryCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select(`
          *,
          learning_nodes(title, order_index)
        `)
        .eq('user_id', userId)
        .eq('path_id', pathId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Cache the result
      this.queryCache.set(cacheKey, { data: data || [], timestamp: Date.now() })
      
      return data || []
    } catch (error) {
      console.error('Error fetching user progress:', error)
      return []
    }
  }

  // Update user statistics (points, streaks)
  private async updateUserStats(userId: string, completed: boolean): Promise<void> {
    if (!completed) return

    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('total_points, current_streak, longest_streak')
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError

      const pointsToAdd = 10 // Points per completed node
      const newStreak = profile.current_streak + 1
      const newLongestStreak = Math.max(profile.longest_streak, newStreak)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          total_points: profile.total_points + pointsToAdd,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) throw updateError

      // Clear profile cache
      this.clearCacheByPattern(`profile-${userId}`)
    } catch (error) {
      console.error('Error updating user stats:', error)
    }
  }

  // Batch operations for better performance
  async batchCreateNodes(pathId: string, nodes: Omit<LearningNode, 'id' | 'path_id' | 'created_at' | 'updated_at'>[]): Promise<LearningNode[]> {
    try {
      const nodesWithPathId = nodes.map(node => ({
        ...node,
        path_id: pathId
      }))

      const { data, error } = await supabase
        .from('learning_nodes')
        .insert(nodesWithPathId)
        .select()

      if (error) throw error

      // Clear related cache
      this.clearCacheByPattern(`path-nodes-${pathId}`)
      
      return data || []
    } catch (error) {
      console.error('Error batch creating nodes:', error)
      throw error
    }
  }

  // Analytics queries
  async getPathAnalytics(pathId: string): Promise<{
    totalUsers: number
    completionRate: number
    averageTimeSpent: number
    popularNodes: LearningNode[]
  }> {
    try {
      // Get total users who started the path
      const { count: totalUsers } = await supabase
        .from('user_progress')
        .select('user_id', { count: 'exact', head: true })
        .eq('path_id', pathId)

      // Get completion statistics
      const { data: completionData } = await supabase
        .from('user_progress')
        .select('status, time_spent, node_id')
        .eq('path_id', pathId)

      const completedUsers = new Set()
      let totalTimeSpent = 0
      const nodePopularity = new Map<string, number>()

      completionData?.forEach(progress => {
        if (progress.status === 'completed') {
          completedUsers.add(progress.user_id)
        }
        totalTimeSpent += progress.time_spent || 0
        
        const count = nodePopularity.get(progress.node_id) || 0
        nodePopularity.set(progress.node_id, count + 1)
      })

      const completionRate = totalUsers ? (completedUsers.size / totalUsers) * 100 : 0
      const averageTimeSpent = completionData?.length ? totalTimeSpent / completionData.length : 0

      // Get popular nodes
      const { data: nodes } = await supabase
        .from('learning_nodes')
        .select('*')
        .eq('path_id', pathId)
        .order('order_index', { ascending: true })

      const popularNodes = (nodes || [])
        .map(node => ({
          ...node,
          popularity: nodePopularity.get(node.id) || 0
        }))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5)

      return {
        totalUsers: totalUsers || 0,
        completionRate,
        averageTimeSpent,
        popularNodes
      }
    } catch (error) {
      console.error('Error fetching path analytics:', error)
      return {
        totalUsers: 0,
        completionRate: 0,
        averageTimeSpent: 0,
        popularNodes: []
      }
    }
  }

  // Cache management
  private clearCacheByPattern(pattern: string): void {
    for (const key of this.queryCache.keys()) {
      if (key.includes(pattern)) {
        this.queryCache.delete(key)
      }
    }
  }

  clearAllCache(): void {
    this.queryCache.clear()
  }

  // Create a new learning path
  async createPath(pathData: Omit<LearningPath, 'id' | 'created_at' | 'updated_at'>): Promise<LearningPath> {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .insert([pathData])
        .select()
        .single()

      if (error) throw error

      // Clear cache
      this.clearAllCache()
      
      return data
    } catch (error) {
      console.error('Error creating path:', error)
      throw error
    }
  }

  // Delete a learning path (only by creator)
  async deletePath(pathId: string, userId: string): Promise<void> {
    try {
      console.log('🗑️ DATABASE: Starting deletion process for path:', pathId, 'by user:', userId)
      
      // First verify the user owns this path
      const { data: path, error: fetchError } = await supabase
        .from('learning_paths')
        .select('id, created_by, title')
        .eq('id', pathId)
        .maybeSingle()

      if (fetchError) {
        console.error('❌ DATABASE: Error fetching path for deletion:', fetchError)
        throw fetchError
      }
      
      if (!path) {
        console.log('⚠️ DATABASE: Path not found or already deleted:', pathId)
        throw new Error('Learning path not found or already deleted')
      }
      
      console.log('✅ DATABASE: Path found:', path.title, 'creator:', path.created_by, 'vs user:', userId)

      if (path.created_by !== userId) {
        console.error('❌ DATABASE: User does not own this path')
        throw new Error('You can only delete paths you created')
      }

      // Delete the path - the database CASCADE will handle related records
      console.log('🗑️ DATABASE: Executing deletion from database...')
      const { error: deleteError } = await supabase
        .from('learning_paths')
        .delete()
        .eq('id', pathId)

      if (deleteError) {
        console.error('❌ DATABASE: Database deletion error:', deleteError)
        throw deleteError
      }
      
      console.log('✅ DATABASE: Database deletion completed successfully')

      // CRITICAL: Clear all caches immediately and completely
      console.log('🧹 DATABASE: Clearing all caches...')
      this.clearAllCache()
      
      // Force a complete cache invalidation
      this.queryCache.clear()
      
      // Add delay to ensure database consistency across all connections
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('✅ DATABASE: Deletion process completed successfully')
      
    } catch (error) {
      console.error('❌ DATABASE: Complete deletion process failed:', error)
      // Re-throw with more context
      const errorMessage = error instanceof Error ? error.message : 'Unknown deletion error'
      throw new Error(`Failed to delete learning path: ${errorMessage}`)
    }
  }

  // Force refresh - clears cache and ensures fresh data
  async forceRefresh(): Promise<void> {
    console.log('🔄 DATABASE: Force refresh - clearing all caches')
    this.clearAllCache()
    this.queryCache.clear()
    // Extended delay to ensure all database operations complete
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('✅ DATABASE: Force refresh completed')
  }

  // Database health check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('learning_paths')
        .select('id')
        .limit(1)

      return !error
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance()