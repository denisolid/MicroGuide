import { supabase } from './supabase'
import { LearningPath, LearningNode } from './supabase'
import { openaiService } from './openaiService'

export interface SearchFilters {
  topic?: string
  difficulty?: string
  duration?: { min: number; max: number }
  tags?: string[]
  isPublic?: boolean
}

export interface AISearchResult {
  paths: LearningPath[]
  suggestedTopics: string[]
  estimatedDuration: number
  difficulty: string
  confidence: number
}

export interface QueryIntent {
  topic: string
  difficulty: string
  keywords: string[]
  estimatedDuration: number
  confidence: number
  learningType: 'practical' | 'theoretical' | 'mixed'
}

export class AISearchEngine {
  private static instance: AISearchEngine
  private searchCache = new Map<string, AISearchResult>()
  private topicMappings = new Map<string, string>()

  static getInstance(): AISearchEngine {
    if (!AISearchEngine.instance) {
      AISearchEngine.instance = new AISearchEngine()
    }
    return AISearchEngine.instance
  }

  constructor() {
    this.initializeTopicMappings()
  }

  private initializeTopicMappings() {
    // Map common search terms to our topic categories
    this.topicMappings.set('web development', 'web-development')
    this.topicMappings.set('frontend', 'web-development')
    this.topicMappings.set('backend', 'web-development')
    this.topicMappings.set('react', 'web-development')
    this.topicMappings.set('javascript', 'web-development')
    this.topicMappings.set('python', 'data-science')
    this.topicMappings.set('machine learning', 'ai-ml')
    this.topicMappings.set('ai', 'ai-ml')
    this.topicMappings.set('blockchain', 'web3')
    this.topicMappings.set('crypto', 'web3')
    this.topicMappings.set('ui/ux', 'design')
    this.topicMappings.set('design', 'design')
    this.topicMappings.set('marketing', 'business')
    this.topicMappings.set('entrepreneurship', 'business')
  }

  // Parse user query to understand intent
  parseQueryIntent(query: string): QueryIntent {
    const lowerQuery = query.toLowerCase()
    const words = lowerQuery.split(/\s+/)
    
    // Detect topic
    let topic = ''
    let confidence = 0.5
    
    for (const [key, value] of this.topicMappings) {
      if (lowerQuery.includes(key)) {
        topic = value
        confidence = 0.8
        break
      }
    }

    // Detect difficulty
    let difficulty = 'beginner'
    if (lowerQuery.includes('advanced') || lowerQuery.includes('expert')) {
      difficulty = 'advanced'
      confidence += 0.1
    } else if (lowerQuery.includes('intermediate') || lowerQuery.includes('medium')) {
      difficulty = 'intermediate'
      confidence += 0.1
    } else if (lowerQuery.includes('beginner') || lowerQuery.includes('basic') || lowerQuery.includes('intro')) {
      difficulty = 'beginner'
      confidence += 0.1
    }

    // Estimate duration based on query complexity
    let estimatedDuration = 10
    if (lowerQuery.includes('quick') || lowerQuery.includes('crash course')) {
      estimatedDuration = 5
    } else if (lowerQuery.includes('comprehensive') || lowerQuery.includes('complete')) {
      estimatedDuration = 30
    } else if (lowerQuery.includes('deep') || lowerQuery.includes('master')) {
      estimatedDuration = 50
    }

    // Detect learning type
    let learningType: 'practical' | 'theoretical' | 'mixed' = 'mixed'
    if (lowerQuery.includes('hands-on') || lowerQuery.includes('project') || lowerQuery.includes('build')) {
      learningType = 'practical'
    } else if (lowerQuery.includes('theory') || lowerQuery.includes('concept') || lowerQuery.includes('understand')) {
      learningType = 'theoretical'
    }

    // Extract keywords
    const stopWords = ['learn', 'how', 'to', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'for', 'with']
    const keywords = words.filter(word => !stopWords.includes(word) && word.length > 2)

    return {
      topic,
      difficulty,
      keywords,
      estimatedDuration,
      confidence: Math.min(confidence, 1),
      learningType
    }
  }

  // Intelligent search with AI-powered query understanding
  async intelligentSearch(query: string, filters?: SearchFilters): Promise<AISearchResult> {
    const cacheKey = `${query}-${JSON.stringify(filters)}`
    
    // Check cache first
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!
    }

    try {
      // Enhance query with OpenAI if available
      let intent = this.parseQueryIntent(query)
      
      if (openaiService.isConfigured()) {
        try {
          const enhanced = await openaiService.enhanceSearchQuery(query)
          intent = {
            ...intent,
            topic: this.mapTopicFromAI(enhanced.suggestedTopics[0]) || intent.topic,
            difficulty: enhanced.difficulty as any,
            estimatedDuration: enhanced.estimatedDuration,
            confidence: Math.max(intent.confidence, 0.8)
          }
        } catch (error) {
          console.error('Error enhancing query with AI:', error)
        }
      }
      
      // Build optimized search query
      let searchQuery = supabase
        .from('learning_paths')
        .select(`
          *,
          learning_nodes!inner(count)
        `)
        .eq('is_public', true)

      // Apply AI-enhanced filters
      if (intent.topic) {
        searchQuery = searchQuery.or(`topic.eq.${intent.topic},tags.cs.{${intent.topic}}`)
      }

      if (intent.difficulty) {
        searchQuery = searchQuery.eq('difficulty_level', intent.difficulty)
      }

      if (filters?.duration) {
        searchQuery = searchQuery
          .gte('estimated_duration', filters.duration.min)
          .lte('estimated_duration', filters.duration.max)
      }

      // Text search across multiple fields with ranking
      if (intent.keywords.length > 0) {
        const searchTerms = intent.keywords.join(' | ')
        searchQuery = searchQuery.textSearch('title,description', searchTerms)
      }

      // Execute search with intelligent ordering
      const { data: paths, error } = await searchQuery
        .order('completion_rate', { ascending: false })
        .order('total_nodes', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      // Calculate relevance scores and sort
      const rankedPaths = this.rankSearchResults(paths || [], intent, query)

      // Generate AI suggestions
      const suggestedTopics = await this.generateTopicSuggestions(query, intent)

      const result: AISearchResult = {
        paths: rankedPaths,
        suggestedTopics,
        estimatedDuration: intent.estimatedDuration,
        difficulty: intent.difficulty || 'beginner',
        confidence: intent.confidence
      }

      // Cache result for 5 minutes
      this.searchCache.set(cacheKey, result)
      setTimeout(() => this.searchCache.delete(cacheKey), 5 * 60 * 1000)
      
      return result
    } catch (error) {
      console.error('Search error:', error)
      return {
        paths: [],
        suggestedTopics: [],
        estimatedDuration: 10,
        difficulty: 'beginner',
        confidence: 0
      }
    }
  }

  // Map AI topic suggestions to our categories
  private mapTopicFromAI(aiTopic: string): string {
    if (!aiTopic) return ''
    
    const mapping: { [key: string]: string } = {
      'web development': 'web-development',
      'frontend': 'web-development',
      'backend': 'web-development',
      'data science': 'data-science',
      'machine learning': 'ai-ml',
      'artificial intelligence': 'ai-ml',
      'blockchain': 'web3',
      'cryptocurrency': 'web3',
      'design': 'design',
      'ui/ux': 'design',
      'business': 'business',
      'marketing': 'business'
    }
    
    const lowerTopic = aiTopic.toLowerCase()
    for (const [key, value] of Object.entries(mapping)) {
      if (lowerTopic.includes(key)) {
        return value
      }
    }
    
    return ''
  }

  // Rank search results based on relevance
  private rankSearchResults(paths: LearningPath[], intent: QueryIntent, originalQuery: string): LearningPath[] {
    return paths
      .map(path => ({
        ...path,
        relevanceScore: this.calculateRelevanceScore(path, intent, originalQuery)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  // Calculate relevance score for ranking
  private calculateRelevanceScore(path: LearningPath, intent: QueryIntent, query: string): number {
    let score = 0
    const lowerQuery = query.toLowerCase()
    const lowerTitle = path.title.toLowerCase()
    const lowerDescription = path.description.toLowerCase()

    // Title match (highest weight)
    if (lowerTitle.includes(lowerQuery)) score += 10
    intent.keywords.forEach(keyword => {
      if (lowerTitle.includes(keyword)) score += 5
    })

    // Description match
    if (lowerDescription.includes(lowerQuery)) score += 5
    intent.keywords.forEach(keyword => {
      if (lowerDescription.includes(keyword)) score += 2
    })

    // Topic match
    if (path.topic === intent.topic) score += 8

    // Difficulty match
    if (path.difficulty_level === intent.difficulty) score += 3

    // Duration preference
    const durationDiff = Math.abs(path.estimated_duration - intent.estimatedDuration)
    score += Math.max(0, 5 - durationDiff / 10)

    // Quality indicators
    score += path.completion_rate * 2
    score += Math.min(path.total_nodes / 10, 3)

    // Tags match
    if (path.tags) {
      intent.keywords.forEach(keyword => {
        if (path.tags.some(tag => tag.toLowerCase().includes(keyword))) {
          score += 1
        }
      })
    }

    return score
  }

  // Generate topic suggestions based on query
  private async generateTopicSuggestions(query: string, intent: QueryIntent): Promise<string[]> {
    const suggestions = new Set<string>()

    // Add related topics based on intent
    if (intent.topic) {
      suggestions.add(intent.topic)
    }

    // Add suggestions based on keywords
    intent.keywords.forEach(keyword => {
      for (const [key, value] of this.topicMappings) {
        if (key.includes(keyword) || keyword.includes(key.split(' ')[0])) {
          suggestions.add(value)
        }
      }
    })

    // Get popular topics from database
    try {
      const { data: popularTopics } = await supabase
        .from('learning_paths')
        .select('topic')
        .eq('is_public', true)
        .order('completion_rate', { ascending: false })
        .limit(5)

      popularTopics?.forEach(path => suggestions.add(path.topic))
    } catch (error) {
      console.error('Error fetching popular topics:', error)
    }

    return Array.from(suggestions).slice(0, 6)
  }

  // Clear cache
  clearCache() {
    this.searchCache.clear()
  }
}

// Export singleton instance
export const aiSearch = AISearchEngine.getInstance()