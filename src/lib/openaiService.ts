import OpenAI from 'openai'

export interface OpenAIPathRequest {
  query: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  userGoals?: string[]
}

export interface OpenAIPathResponse {
  title: string
  description: string
  topic: string
  estimatedDuration: number
  tags: string[]
  modules: {
    title: string
    description: string
    duration: number
    resources: {
      title: string
      type: 'video' | 'article' | 'course' | 'exercise'
      url?: string
      description: string
    }[]
  }[]
}

class OpenAIService {
  private static instance: OpenAIService
  private openai: OpenAI | null = null

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService()
    }
    return OpenAIService.instance
  }

  constructor() {
    this.initializeOpenAI()
  }

  private initializeOpenAI() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
      })
    }
  }

  async generateLearningPath(request: OpenAIPathRequest): Promise<OpenAIPathResponse> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const prompt = this.buildPrompt(request)
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert learning path designer and educational content curator. Create comprehensive, structured learning paths that are practical and engaging."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      return this.parseOpenAIResponse(response)
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate learning path with AI')
    }
  }

  private buildPrompt(request: OpenAIPathRequest): string {
    return `
Create a comprehensive learning path for: "${request.query}"

Requirements:
- Difficulty Level: ${request.difficulty}
- Target Duration: ${request.duration} hours
- Learning Style: ${request.learningStyle}
${request.userGoals ? `- User Goals: ${request.userGoals.join(', ')}` : ''}

Please provide a structured learning path in the following JSON format:
{
  "title": "Engaging title for the learning path",
  "description": "Comprehensive description of what learners will achieve",
  "topic": "main topic category (web-development, data-science, design, business, web3, ai-ml)",
  "estimatedDuration": ${request.duration},
  "tags": ["relevant", "tags", "for", "the", "path"],
  "modules": [
    {
      "title": "Module title",
      "description": "What this module covers",
      "duration": "estimated hours for this module",
      "resources": [
        {
          "title": "Resource title",
          "type": "video|article|course|exercise",
          "url": "actual URL to free resource (YouTube, articles, etc.) or null if exercise",
          "description": "What this resource teaches"
        }
      ]
    }
  ]
}

Guidelines:
1. Create 4-8 modules that build progressively
2. Include a mix of theoretical and practical content
3. Provide real, accessible URLs to free resources (YouTube videos, articles, documentation)
4. Ensure the path is ${request.difficulty}-friendly
5. Include hands-on projects or exercises
6. Make it engaging and practical
7. Focus on ${request.learningStyle} learning when possible

Return only valid JSON without any additional text or formatting.
    `
  }

  private parseOpenAIResponse(response: string): OpenAIPathResponse {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate the structure
      if (!parsed.title || !parsed.description || !parsed.modules) {
        throw new Error('Invalid response structure')
      }

      return parsed
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
      // Fallback to a basic structure
      return this.createFallbackResponse()
    }
  }

  private createFallbackResponse(): OpenAIPathResponse {
    return {
      title: "Custom Learning Path",
      description: "A personalized learning journey created just for you.",
      topic: "web-development",
      estimatedDuration: 20,
      tags: ["custom", "ai-generated"],
      modules: [
        {
          title: "Getting Started",
          description: "Introduction and fundamentals",
          duration: 5,
          resources: [
            {
              title: "Introduction Video",
              type: "video",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              description: "Basic introduction to the topic"
            }
          ]
        }
      ]
    }
  }

  async enhanceSearchQuery(query: string): Promise<{
    enhancedQuery: string
    suggestedTopics: string[]
    difficulty: string
    estimatedDuration: number
  }> {
    if (!this.openai) {
      return {
        enhancedQuery: query,
        suggestedTopics: [],
        difficulty: 'beginner',
        estimatedDuration: 10
      }
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert at understanding learning queries and providing educational guidance."
          },
          {
            role: "user",
            content: `
Analyze this learning query: "${query}"

Provide a JSON response with:
{
  "enhancedQuery": "improved version of the query",
  "suggestedTopics": ["topic1", "topic2", "topic3"],
  "difficulty": "beginner|intermediate|advanced",
  "estimatedDuration": "number of hours"
}

Return only valid JSON.
            `
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      })

      const response = completion.choices[0]?.message?.content
      if (response) {
        const parsed = JSON.parse(response)
        return parsed
      }
    } catch (error) {
      console.error('Error enhancing search query:', error)
    }

    // Fallback
    return {
      enhancedQuery: query,
      suggestedTopics: [],
      difficulty: 'beginner',
      estimatedDuration: 10
    }
  }

  async generateResourceSuggestions(topic: string, difficulty: string): Promise<{
    title: string
    url: string
    type: string
    description: string
  }[]> {
    if (!this.openai) {
      return []
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert at finding and recommending educational resources."
          },
          {
            role: "user",
            content: `
Find 5 high-quality, free learning resources for "${topic}" at ${difficulty} level.

Provide a JSON array with:
[
  {
    "title": "Resource title",
    "url": "actual URL to the resource",
    "type": "video|article|course|tutorial",
    "description": "Brief description of what this resource teaches"
  }
]

Focus on:
- YouTube videos
- Free online articles
- Documentation
- Interactive tutorials
- Open courseware

Return only valid JSON array.
            `
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      })

      const response = completion.choices[0]?.message?.content
      if (response) {
        return JSON.parse(response)
      }
    } catch (error) {
      console.error('Error generating resource suggestions:', error)
    }

    return []
  }

  isConfigured(): boolean {
    return this.openai !== null
  }
}

export const openaiService = OpenAIService.getInstance()