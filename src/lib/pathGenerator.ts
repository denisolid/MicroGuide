import { supabase } from './supabase'
import { LearningPath, LearningNode } from './supabase'
import { openaiService, OpenAIPathRequest } from './openaiService'

export interface GeneratePathRequest {
  query: string
  userId: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  duration?: number
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  goals?: string[]
}

export interface GeneratedPathStructure {
  title: string
  description: string
  topic: string
  difficulty_level: string
  estimated_duration: number
  tags: string[]
  nodes: Omit<LearningNode, 'id' | 'path_id' | 'created_at' | 'updated_at'>[]
}

export interface LearningResource {
  title: string
  description: string
  type: 'video' | 'article' | 'course' | 'exercise' | 'book'
  url: string | null
  duration: number
  platform: string
  difficulty: string
}

export interface TopicStructure {
  category: string
  subcategory: string
  learningType: 'theoretical' | 'practical' | 'mixed'
  estimatedHours: number
  prerequisites: string[]
  outcomes: string[]
  modules: {
    title: string
    description: string
    concepts: string[]
    skills: string[]
    resources: LearningResource[]
    exercises: string[]
    assessments: string[]
  }[]
}

export class PathGenerator {
  private static instance: PathGenerator
  private topicDatabase: Map<string, TopicStructure> = new Map()

  static getInstance(): PathGenerator {
    if (!PathGenerator.instance) {
      PathGenerator.instance = new PathGenerator()
    }
    return PathGenerator.instance
  }

  constructor() {
    this.initializeTopicDatabase()
  }

  private initializeTopicDatabase() {
    // CHESS - Complete structured learning with real resources
    this.topicDatabase.set('chess', {
      category: 'strategy-games',
      subcategory: 'board-games',
      learningType: 'mixed',
      estimatedHours: 30,
      prerequisites: [],
      outcomes: [
        'Understand all chess rules and piece movements',
        'Apply basic tactical patterns in games',
        'Execute fundamental opening principles',
        'Recognize common endgame patterns',
        'Analyze chess positions effectively'
      ],
      modules: [
        {
          title: 'Chess Fundamentals',
          description: 'Master the basic rules, piece movements, and board setup',
          concepts: ['Board setup and orientation', 'Piece values and movements', 'Special moves (castling, en passant)', 'Check, checkmate, and stalemate', 'Basic chess notation'],
          skills: ['Piece movement accuracy', 'Legal move recognition', 'Basic notation reading', 'Game setup'],
          resources: [
            {
              title: 'Chess.com Learn Chess Basics',
              description: 'Interactive lessons covering all basic chess rules and piece movements',
              type: 'course',
              url: 'https://www.chess.com/learn-how-to-play-chess',
              duration: 60,
              platform: 'Chess.com',
              difficulty: 'beginner'
            },
            {
              title: 'Chess Rules and Basics - ChessNetwork',
              description: 'Comprehensive video explaining all chess rules with visual demonstrations',
              type: 'video',
              url: 'https://www.youtube.com/watch?v=OCSbzArwB10',
              duration: 45,
              platform: 'YouTube',
              difficulty: 'beginner'
            },
            {
              title: 'Lichess Learn Chess',
              description: 'Free interactive chess learning platform with practice exercises',
              type: 'course',
              url: 'https://lichess.org/learn',
              duration: 90,
              platform: 'Lichess',
              difficulty: 'beginner'
            }
          ],
          exercises: [
            'Set up the chess board correctly 10 times',
            'Practice moving each piece type on an empty board',
            'Identify legal and illegal moves in given positions',
            'Practice writing moves in algebraic notation'
          ],
          assessments: [
            'Chess rules quiz (20 questions)',
            'Piece movement accuracy test',
            'Notation reading exercise'
          ]
        },
        {
          title: 'Basic Tactics',
          description: 'Learn fundamental tactical patterns and combinations',
          concepts: ['Pin tactics', 'Fork attacks', 'Skewer patterns', 'Discovered attacks', 'Double attacks and combinations'],
          skills: ['Pattern recognition', 'Tactical calculation', 'Threat assessment', 'Combination planning'],
          resources: [
            {
              title: 'Chess Tactics for Beginners',
              description: 'Comprehensive guide to basic chess tactics with examples',
              type: 'article',
              url: 'https://www.chess.com/article/view/chess-tactics',
              duration: 30,
              platform: 'Chess.com',
              difficulty: 'beginner'
            },
            {
              title: 'Chess Tactics Trainer',
              description: 'Interactive tactical puzzle solving with progressive difficulty',
              type: 'course',
              url: 'https://www.chess.com/puzzles',
              duration: 120,
              platform: 'Chess.com',
              difficulty: 'beginner'
            },
            {
              title: 'Lichess Puzzle Rush',
              description: 'Free tactical puzzle training with thousands of positions',
              type: 'course',
              url: 'https://lichess.org/training',
              duration: 90,
              platform: 'Lichess',
              difficulty: 'beginner'
            }
          ],
          exercises: [
            'Solve 50 basic tactical puzzles',
            'Create 5 tactical positions from your games',
            'Practice finding tactics in master games',
            'Time-controlled tactical solving (3 minutes per puzzle)'
          ],
          assessments: [
            'Tactical pattern recognition test',
            'Timed puzzle solving challenge',
            'Position analysis exercise'
          ]
        },
        {
          title: 'Opening Principles',
          description: 'Understand how to start a chess game effectively',
          concepts: ['Center control strategies', 'Piece development order', 'King safety principles', 'Time and tempo management'],
          skills: ['Opening preparation', 'Development planning', 'Pawn structure understanding', 'Opening repertoire building'],
          resources: [
            {
              title: 'Chess Opening Principles',
              description: 'Essential opening principles every chess player should know',
              type: 'article',
              url: 'https://www.chess.com/article/view/chess-opening-principles',
              duration: 25,
              platform: 'Chess.com',
              difficulty: 'beginner'
            },
            {
              title: 'Opening Explorer',
              description: 'Database of chess openings with statistics and master games',
              type: 'course',
              url: 'https://lichess.org/analysis',
              duration: 60,
              platform: 'Lichess',
              difficulty: 'beginner'
            },
            {
              title: 'Basic Chess Openings Explained',
              description: 'Video series covering the most important chess openings',
              type: 'video',
              url: 'https://www.youtube.com/watch?v=21L45Qo6EIY',
              duration: 40,
              platform: 'YouTube',
              difficulty: 'beginner'
            }
          ],
          exercises: [
            'Learn the Italian Game opening completely',
            'Practice the Queen\'s Gambit opening',
            'Analyze 10 master games focusing on opening play',
            'Build a basic opening repertoire for White and Black'
          ],
          assessments: [
            'Opening principles quiz',
            'Opening repertoire presentation',
            'Game analysis focusing on opening phase'
          ]
        }
      ]
    })

    // COOKING - Practical culinary skills with real resources
    this.topicDatabase.set('cooking', {
      category: 'life-skills',
      subcategory: 'culinary',
      learningType: 'practical',
      estimatedHours: 25,
      prerequisites: [],
      outcomes: [
        'Execute basic cooking techniques safely',
        'Prepare balanced, nutritious meals',
        'Understand flavor combinations and seasoning',
        'Plan and organize meal preparation efficiently',
        'Adapt recipes to dietary needs and preferences'
      ],
      modules: [
        {
          title: 'Kitchen Safety & Setup',
          description: 'Essential safety practices and kitchen organization',
          concepts: ['Food safety fundamentals', 'Kitchen hygiene protocols', 'Equipment safety procedures', 'Proper food storage methods'],
          skills: ['Safe food handling', 'Kitchen organization', 'Equipment operation', 'Sanitation practices'],
          resources: [
            {
              title: 'Food Safety Basics',
              description: 'Comprehensive guide to food safety in home kitchens',
              type: 'article',
              url: 'https://www.foodsafety.gov/food-safety-charts/safe-minimum-cooking-temperatures',
              duration: 20,
              platform: 'FoodSafety.gov',
              difficulty: 'beginner'
            },
            {
              title: 'Kitchen Setup and Organization',
              description: 'How to organize your kitchen for efficient cooking',
              type: 'video',
              url: 'https://www.youtube.com/watch?v=4ur5YQIbOSs',
              duration: 15,
              platform: 'YouTube',
              difficulty: 'beginner'
            },
            {
              title: 'Essential Kitchen Tools Guide',
              description: 'Complete guide to must-have kitchen equipment',
              type: 'article',
              url: 'https://www.seriouseats.com/basic-knife-skills',
              duration: 25,
              platform: 'Serious Eats',
              difficulty: 'beginner'
            }
          ],
          exercises: [
            'Organize your kitchen workspace for efficiency',
            'Create a food safety checklist for your kitchen',
            'Practice proper hand washing and sanitization',
            'Set up mise en place for a simple recipe'
          ],
          assessments: [
            'Food safety knowledge quiz',
            'Kitchen organization evaluation',
            'Safety procedure demonstration'
          ]
        },
        {
          title: 'Knife Skills & Food Prep',
          description: 'Master fundamental cutting techniques and food preparation',
          concepts: ['Knife types and uses', 'Basic cutting techniques', 'Food preparation methods', 'Ingredient preparation timing'],
          skills: ['Proper knife handling', 'Uniform cutting', 'Efficient prep work', 'Speed and accuracy'],
          resources: [
            {
              title: 'Basic Knife Skills',
              description: 'Professional knife techniques for home cooks',
              type: 'video',
              url: 'https://www.youtube.com/watch?v=G-Fg7l7G1zw',
              duration: 30,
              platform: 'YouTube',
              difficulty: 'beginner'
            },
            {
              title: 'Knife Skills Guide - Serious Eats',
              description: 'Comprehensive written guide to knife techniques',
              type: 'article',
              url: 'https://www.seriouseats.com/basic-knife-skills',
              duration: 20,
              platform: 'Serious Eats',
              difficulty: 'beginner'
            },
            {
              title: 'Food Prep Techniques',
              description: 'Essential food preparation methods and tips',
              type: 'video',
              url: 'https://www.youtube.com/watch?v=nffGuGwCdZE',
              duration: 25,
              platform: 'YouTube',
              difficulty: 'beginner'
            }
          ],
          exercises: [
            'Practice julienne cuts on carrots',
            'Master dicing onions uniformly',
            'Learn to brunoise vegetables',
            'Prep ingredients for a complete meal efficiently'
          ],
          assessments: [
            'Knife skills demonstration',
            'Cutting accuracy and speed test',
            'Prep efficiency evaluation'
          ]
        }
      ]
    })

    // GUITAR - Musical instrument mastery with real resources
    this.topicDatabase.set('guitar', {
      category: 'music',
      subcategory: 'instruments',
      learningType: 'practical',
      estimatedHours: 40,
      prerequisites: [],
      outcomes: [
        'Play basic chords and progressions fluently',
        'Read guitar tablature and basic notation',
        'Perform simple songs with proper technique',
        'Understand basic music theory for guitar',
        'Develop effective practice routines'
      ],
      modules: [
        {
          title: 'Guitar Basics & Setup',
          description: 'Learn guitar anatomy, proper posture, and instrument care',
          concepts: ['Guitar anatomy and parts', 'Proper sitting and standing posture', 'Tuning methods', 'String names and fret numbering', 'Basic maintenance'],
          skills: ['Proper guitar holding', 'Accurate tuning', 'Basic maintenance', 'Posture awareness'],
          resources: [
            {
              title: 'Guitar Basics for Beginners',
              description: 'Complete introduction to guitar fundamentals',
              type: 'video',
              url: 'https://www.youtube.com/watch?v=F5bqTVNXOLs',
              duration: 45,
              platform: 'YouTube',
              difficulty: 'beginner'
            },
            {
              title: 'JustinGuitar Beginner Course',
              description: 'Structured beginner guitar course with progressive lessons',
              type: 'course',
              url: 'https://www.justinguitar.com/guitar-lessons/beginner-guitar-course-grade-1',
              duration: 120,
              platform: 'JustinGuitar',
              difficulty: 'beginner'
            },
            {
              title: 'Guitar Tuning Guide',
              description: 'Learn different methods to tune your guitar',
              type: 'article',
              url: 'https://www.fender.com/articles/how-to/how-to-tune-a-guitar',
              duration: 15,
              platform: 'Fender',
              difficulty: 'beginner'
            }
          ],
          exercises: [
            'Practice holding the guitar in different positions',
            'Tune your guitar using multiple methods',
            'Learn the names of all strings and frets',
            'Set up a comfortable practice space'
          ],
          assessments: [
            'Guitar anatomy quiz',
            'Tuning accuracy test',
            'Posture evaluation'
          ]
        },
        {
          title: 'First Chords & Strumming',
          description: 'Master basic open chords and strumming patterns',
          concepts: ['Open chord formations', 'Finger placement techniques', 'Basic strumming patterns', 'Rhythm fundamentals', 'Chord transitions'],
          skills: ['Clean chord formation', 'Steady strumming', 'Smooth chord changes', 'Rhythm keeping'],
          resources: [
            {
              title: 'Basic Guitar Chords',
              description: 'Learn the most essential guitar chords',
              type: 'video',
              url: 'https://www.youtube.com/watch?v=NGXSoVRDQTE',
              duration: 30,
              platform: 'YouTube',
              difficulty: 'beginner'
            },
            {
              title: 'Strumming Patterns for Beginners',
              description: 'Essential strumming patterns every guitarist should know',
              type: 'video',
              url: 'https://www.youtube.com/watch?v=oXerhIdTR8Y',
              duration: 25,
              platform: 'YouTube',
              difficulty: 'beginner'
            },
            {
              title: 'Ultimate Guitar Chord Chart',
              description: 'Comprehensive chord diagrams and fingering guide',
              type: 'article',
              url: 'https://www.ultimate-guitar.com/lessons/for_beginners/basic_guitar_chords.html',
              duration: 20,
              platform: 'Ultimate Guitar',
              difficulty: 'beginner'
            }
          ],
          exercises: [
            'Master G, C, D, Em, and Am chords',
            'Practice 1-minute chord changes',
            'Learn basic down-up strumming pattern',
            'Play your first complete song'
          ],
          assessments: [
            'Chord clarity evaluation',
            'Strumming rhythm test',
            'Song performance assessment'
          ]
        }
      ]
    })

    // Add more comprehensive topics
    this.addAdvancedTopics()
  }

  private addAdvancedTopics() {
    // PROGRAMMING - Web Development with real resources
    this.topicDatabase.set('programming', {
      category: 'technology',
      subcategory: 'software-development',
      learningType: 'practical',
      estimatedHours: 50,
      prerequisites: [],
      outcomes: [
        'Build responsive web applications',
        'Understand programming fundamentals',
        'Use version control effectively',
        'Debug and troubleshoot code',
        'Deploy applications to production'
      ],
      modules: [
        {
          title: 'Programming Fundamentals',
          description: 'Core programming concepts and problem-solving',
          concepts: ['Variables and data types', 'Control structures', 'Functions and scope', 'Algorithms and logic', 'Problem decomposition'],
          skills: ['Logical thinking', 'Problem solving', 'Code organization', 'Debugging basics'],
          resources: [
            {
              title: 'freeCodeCamp JavaScript Basics',
              description: 'Comprehensive JavaScript fundamentals course',
              type: 'course',
              url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
              duration: 180,
              platform: 'freeCodeCamp',
              difficulty: 'beginner'
            },
            {
              title: 'MDN JavaScript Guide',
              description: 'Official Mozilla documentation for JavaScript',
              type: 'article',
              url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
              duration: 120,
              platform: 'MDN',
              difficulty: 'beginner'
            },
            {
              title: 'JavaScript Crash Course',
              description: 'Fast-paced introduction to JavaScript programming',
              type: 'video',
              url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
              duration: 90,
              platform: 'YouTube',
              difficulty: 'beginner'
            }
          ],
          exercises: [
            'Build a simple calculator',
            'Create a number guessing game',
            'Implement basic sorting algorithms',
            'Solve coding challenges on HackerRank'
          ],
          assessments: [
            'Programming logic quiz',
            'Code review exercise',
            'Algorithm implementation test'
          ]
        },
        {
          title: 'HTML & CSS Mastery',
          description: 'Structure and style web pages effectively',
          concepts: ['Semantic HTML structure', 'CSS selectors and properties', 'Flexbox and Grid layouts', 'Responsive design principles'],
          skills: ['Clean markup writing', 'Flexible layout creation', 'Cross-browser compatibility', 'Mobile-first design'],
          resources: [
            {
              title: 'freeCodeCamp Responsive Web Design',
              description: 'Complete course on HTML and CSS',
              type: 'course',
              url: 'https://www.freecodecamp.org/learn/responsive-web-design/',
              duration: 150,
              platform: 'freeCodeCamp',
              difficulty: 'beginner'
            },
            {
              title: 'CSS-Tricks Complete Guide to Flexbox',
              description: 'Comprehensive guide to CSS Flexbox',
              type: 'article',
              url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
              duration: 30,
              platform: 'CSS-Tricks',
              difficulty: 'intermediate'
            },
            {
              title: 'HTML & CSS Crash Course',
              description: 'Build a website from scratch',
              type: 'video',
              url: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
              duration: 120,
              platform: 'YouTube',
              difficulty: 'beginner'
            }
          ],
          exercises: [
            'Build a personal portfolio website',
            'Create responsive layouts using Flexbox',
            'Design a mobile-first website',
            'Implement CSS animations and transitions'
          ],
          assessments: [
            'HTML semantic structure review',
            'CSS layout challenge',
            'Responsive design evaluation'
          ]
        }
      ]
    })

    // PHOTOGRAPHY - Visual arts and technical skills
    this.topicDatabase.set('photography', {
      category: 'creative',
      subcategory: 'visual-arts',
      learningType: 'mixed',
      estimatedHours: 35,
      prerequisites: [],
      outcomes: [
        'Understand camera controls and settings',
        'Compose compelling photographs',
        'Control lighting effectively',
        'Edit photos professionally',
        'Develop a personal photographic style'
      ],
      modules: [
        {
          title: 'Camera Fundamentals',
          description: 'Master camera controls and technical basics',
          concepts: ['Exposure triangle (aperture, shutter, ISO)', 'Camera modes and settings', 'Focus systems and techniques', 'Metering and exposure'],
          skills: ['Manual exposure control', 'Focus accuracy', 'Camera operation', 'Technical problem solving'],
          resources: [
            {
              title: 'Photography Basics: The Complete Beginner\'s Guide',
              description: 'Comprehensive introduction to photography fundamentals',
              type: 'article',
              url: 'https://www.photographylife.com/photography-basics',
              duration: 45,
              platform: 'Photography Life',
              difficulty: 'beginner'
            },
            {
              title: 'Understanding Exposure',
              description: 'Master the exposure triangle and camera settings',
              type: 'video',
              url: 'https://www.youtube.com/watch?v=3_79_gdhvZc',
              duration: 30,
              platform: 'YouTube',
              difficulty: 'beginner'
            },
            {
              title: 'Camera Settings Explained',
              description: 'Detailed guide to all camera modes and settings',
              type: 'article',
              url: 'https://digital-photography-school.com/camera-modes/',
              duration: 25,
              platform: 'Digital Photography School',
              difficulty: 'beginner'
            }
          ],
          exercises: [
            'Practice manual exposure in different lighting',
            'Experiment with depth of field control',
            'Master focus techniques for moving subjects',
            'Create exposure comparison series'
          ],
          assessments: [
            'Technical knowledge quiz',
            'Exposure accuracy evaluation',
            'Camera operation test'
          ]
        }
      ]
    })
  }

  // UNIVERSAL TOPIC DETECTION
  private detectTopic(query: string): {
    detectedTopic: TopicStructure | null
    topicKey: string | null
    confidence: number
    category: string
  } {
    const lowerQuery = query.toLowerCase()
    
    // Direct topic matching
    for (const [key, topic] of this.topicDatabase) {
      if (lowerQuery.includes(key)) {
        return {
          detectedTopic: topic,
          topicKey: key,
          confidence: 0.9,
          category: topic.category
        }
      }
    }

    // Keyword-based detection with expanded keywords
    const keywordMap = new Map([
      ['chess', ['chess', 'board game', 'strategy game', 'checkmate', 'tactics']],
      ['cooking', ['cooking', 'cook', 'recipe', 'kitchen', 'food', 'culinary', 'baking', 'chef']],
      ['guitar', ['guitar', 'music', 'instrument', 'strings', 'chord', 'acoustic', 'electric']],
      ['programming', ['programming', 'coding', 'web development', 'javascript', 'html', 'css', 'software', 'developer']],
      ['photography', ['photography', 'photo', 'camera', 'picture', 'image', 'lens', 'exposure']]
    ])

    for (const [topicKey, keywords] of keywordMap) {
      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
          const topic = this.topicDatabase.get(topicKey)
          if (topic) {
            return {
              detectedTopic: topic,
              topicKey,
              confidence: 0.8,
              category: topic.category
            }
          }
        }
      }
    }

    // Category fallback
    return {
      detectedTopic: null,
      topicKey: null,
      confidence: 0.3,
      category: 'general'
    }
  }

  // GENERATE COMPREHENSIVE LEARNING PATH
  async generatePath(request: GeneratePathRequest): Promise<GeneratedPathStructure> {
    try {
      const detection = this.detectTopic(request.query)
      
      if (detection.detectedTopic && detection.confidence > 0.7) {
        return await this.generateStructuredPath(detection.detectedTopic, detection.topicKey!, request)
      } else {
        return await this.generateCustomPath(request, detection.category)
      }
    } catch (error) {
      console.error('Path generation error:', error)
      return await this.generateFallbackPath(request)
    }
  }

  // Generate from structured topic with real resources
  private async generateStructuredPath(
    topic: TopicStructure,
    topicKey: string,
    request: GeneratePathRequest
  ): Promise<GeneratedPathStructure> {
    const difficulty = request.difficulty || 'beginner'
    const duration = request.duration || topic.estimatedHours
    
    const nodes: Omit<LearningNode, 'id' | 'path_id' | 'created_at' | 'updated_at'>[] = []
    let orderIndex = 1

    // Filter modules based on difficulty
    const selectedModules = this.selectModulesByDifficulty(topic.modules, difficulty)
    
    for (const module of selectedModules) {
      const moduleDuration = Math.ceil(duration / selectedModules.length)
      
      // Create resource-based learning nodes
      for (const resource of module.resources) {
        nodes.push({
          title: resource.title,
          description: `${resource.description}\n\n📚 **What you'll learn:**\n${module.concepts.slice(0, 3).map(c => `• ${c}`).join('\n')}\n\n🎯 **Skills you'll develop:**\n${module.skills.slice(0, 3).map(s => `• ${s}`).join('\n')}\n\n⏱️ **Platform:** ${resource.platform}\n📊 **Difficulty:** ${resource.difficulty}`,
          content_type: resource.type,
          resource_url: resource.url,
          estimated_duration: resource.duration,
          order_index: orderIndex++,
          prerequisites: [],
          is_required: true
        })
      }

      // Add practical exercise node
      if (module.exercises.length > 0) {
        nodes.push({
          title: `${module.title} - Hands-On Practice`,
          description: `Apply what you've learned through practical exercises:\n\n🛠️ **Practice Activities:**\n${module.exercises.map(e => `• ${e}`).join('\n')}\n\n💡 **Tips:**\n• Take your time with each exercise\n• Practice regularly for best results\n• Don't hesitate to repeat exercises\n• Track your progress and improvements`,
          content_type: 'exercise',
          resource_url: null,
          estimated_duration: Math.ceil(moduleDuration * 0.3),
          order_index: orderIndex++,
          prerequisites: [],
          is_required: true
        })
      }

      // Add assessment node
      if (module.assessments.length > 0) {
        nodes.push({
          title: `${module.title} - Knowledge Assessment`,
          description: `Test your understanding and track your progress:\n\n📝 **Assessment Methods:**\n${module.assessments.map(a => `• ${a}`).join('\n')}\n\n✅ **Success Criteria:**\n• Demonstrate understanding of key concepts\n• Apply skills in practical scenarios\n• Identify areas for improvement\n• Build confidence in your abilities`,
          content_type: 'exercise',
          resource_url: null,
          estimated_duration: Math.ceil(moduleDuration * 0.2),
          order_index: orderIndex++,
          prerequisites: [],
          is_required: false
        })
      }
    }

    return {
      title: this.generateTitle(request.query, topicKey, difficulty),
      description: this.generateDescription(topic, difficulty, duration),
      topic: this.mapCategoryToTopic(topic.category),
      difficulty_level: difficulty,
      estimated_duration: duration,
      tags: this.generateTags(topicKey, topic, request.query),
      nodes
    }
  }

  // Select modules based on difficulty
  private selectModulesByDifficulty(modules: any[], difficulty: string): any[] {
    if (difficulty === 'beginner') {
      return modules.slice(0, Math.min(3, modules.length))
    } else if (difficulty === 'intermediate') {
      return modules.slice(0, Math.min(5, modules.length))
    } else {
      return modules
    }
  }

  // Generate custom path for unknown topics with curated resources
  private async generateCustomPath(
    request: GeneratePathRequest,
    category: string
  ): Promise<GeneratedPathStructure> {
    const difficulty = request.difficulty || 'beginner'
    const duration = request.duration || 20
    const mainTopic = this.extractMainTopic(request.query)
    
    const modules = this.generateCustomModulesWithResources(mainTopic, difficulty)
    const nodes: Omit<LearningNode, 'id' | 'path_id' | 'created_at' | 'updated_at'>[] = []
    
    modules.forEach((module, index) => {
      const moduleDuration = Math.ceil(duration / modules.length)
      
      nodes.push({
        title: module.title,
        description: module.description,
        content_type: module.type,
        resource_url: module.url,
        estimated_duration: moduleDuration,
        order_index: index + 1,
        prerequisites: [],
        is_required: true
      })
    })

    return {
      title: this.generateCustomTitle(request.query, difficulty),
      description: this.generateCustomDescription(request.query, difficulty, duration),
      topic: this.mapCategoryToTopic(category),
      difficulty_level: difficulty,
      estimated_duration: duration,
      tags: this.generateCustomTags(request.query, category),
      nodes
    }
  }

  // Generate custom modules with actual resources
  private generateCustomModulesWithResources(mainTopic: string, difficulty: string): Array<{
    title: string
    description: string
    type: 'video' | 'article' | 'course' | 'exercise'
    url: string | null
  }> {
    const capitalizedTopic = this.capitalizeWords(mainTopic)
    
    // Create search-friendly URLs for educational content
    const searchTopic = mainTopic.toLowerCase().replace(/\s+/g, '+')
    
    return [
      {
        title: `${capitalizedTopic} Fundamentals`,
        description: `Master the core concepts and principles of ${mainTopic}. This comprehensive introduction covers essential knowledge and foundational skills.\n\n📚 **What you'll learn:**\n• Basic terminology and concepts\n• Fundamental principles\n• Common practices and standards\n• Essential tools and resources\n\n🎯 **Learning approach:**\n• Start with theory and concepts\n• Build understanding gradually\n• Focus on practical applications\n• Prepare for hands-on practice`,
        type: 'article',
        url: `https://www.google.com/search?q=${searchTopic}+fundamentals+guide+tutorial`
      },
      {
        title: `${capitalizedTopic} Video Tutorial`,
        description: `Learn ${mainTopic} through comprehensive video instruction. Visual learning helps you understand complex concepts and see practical demonstrations.\n\n🎥 **Video learning benefits:**\n• Visual demonstrations\n• Step-by-step guidance\n• Expert instruction\n• Pause and replay as needed\n\n💡 **Study tips:**\n• Take notes while watching\n• Practice along with the video\n• Rewatch difficult sections\n• Apply what you learn immediately`,
        type: 'video',
        url: `https://www.youtube.com/results?search_query=${searchTopic}+tutorial+${difficulty}`
      },
      {
        title: `${capitalizedTopic} Hands-On Practice`,
        description: `Apply your knowledge through practical exercises and real-world projects. Hands-on practice is essential for mastering any skill.\n\n🛠️ **Practice activities:**\n• Guided exercises\n• Mini-projects\n• Skill-building challenges\n• Real-world applications\n\n✅ **Practice guidelines:**\n• Start with simple exercises\n• Gradually increase complexity\n• Focus on quality over speed\n• Learn from mistakes and iterate`,
        type: 'exercise',
        url: null
      },
      {
        title: `${capitalizedTopic} Advanced Resources`,
        description: `Explore advanced concepts and deepen your understanding with curated resources. Take your skills to the next level.\n\n📖 **Advanced topics:**\n• Industry best practices\n• Advanced techniques\n• Professional workflows\n• Specialized applications\n\n🚀 **Next steps:**\n• Join communities and forums\n• Find mentors and experts\n• Work on challenging projects\n• Share your knowledge with others`,
        type: 'course',
        url: `https://www.coursera.org/search?query=${searchTopic}&`
      }
    ]
  }

  // Utility methods
  private extractMainTopic(query: string): string {
    return query
      .replace(/^(learn|how to|guide to|tutorial|course|master|study)\s*/i, '')
      .replace(/\s+(basics?|fundamentals?|introduction|beginner|advanced)$/i, '')
      .trim() || 'Topic'
  }

  private capitalizeWords(text: string): string {
    return text.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  private generateTitle(query: string, topicKey: string, difficulty: string): string {
    const capitalizedTopic = this.capitalizeWords(topicKey)
    const prefixes = {
      beginner: 'Complete Beginner\'s Guide to',
      intermediate: 'Intermediate',
      advanced: 'Advanced Mastery of'
    }
    return `${prefixes[difficulty as keyof typeof prefixes]} ${capitalizedTopic}`
  }

  private generateCustomTitle(query: string, difficulty: string): string {
    const mainTopic = this.extractMainTopic(query)
    const capitalizedTopic = this.capitalizeWords(mainTopic)
    const prefixes = {
      beginner: 'Learn',
      intermediate: 'Master',
      advanced: 'Advanced'
    }
    return `${prefixes[difficulty as keyof typeof prefixes]} ${capitalizedTopic}`
  }

  private generateDescription(topic: TopicStructure, difficulty: string, duration: number): string {
    const outcomes = topic.outcomes.slice(0, 3).map(o => `• ${o}`).join('\n')
    return `A comprehensive ${duration}-hour ${difficulty}-level course with real resources and practical exercises.\n\n🎯 **What you'll achieve:**\n${outcomes}\n\n📚 **Learning approach:**\n• Structured modules with real resources\n• Hands-on practice and exercises\n• Progress tracking and assessments\n• ${topic.learningType} learning methodology\n\n✨ **Why this path works:**\n• Curated, high-quality resources\n• Progressive skill building\n• Practical application focus\n• Expert-designed curriculum`
  }

  private generateCustomDescription(query: string, difficulty: string, duration: number): string {
    const mainTopic = this.extractMainTopic(query)
    return `A structured ${duration}-hour ${difficulty}-level learning path for ${mainTopic}.\n\n🎯 **What you'll get:**\n• Curated learning resources\n• Hands-on practice exercises\n• Progressive skill development\n• Real-world applications\n\n📚 **Learning approach:**\n• Start with fundamentals\n• Build through practice\n• Apply in real scenarios\n• Advance to expert level\n\n✨ **Success guaranteed:**\n• Quality resources from trusted sources\n• Practical, applicable skills\n• Clear learning progression\n• Measurable outcomes`
  }

  private generateTags(topicKey: string, topic: TopicStructure, query: string): string[] {
    const tags = new Set<string>()
    tags.add(topicKey)
    tags.add(topic.category)
    tags.add(topic.subcategory)
    tags.add(topic.learningType)
    tags.add('structured')
    tags.add('resources')
    tags.add('practical')
    
    const queryWords = query.toLowerCase().split(' ')
    queryWords.forEach(word => {
      if (word.length > 3 && !['learn', 'how', 'guide', 'tutorial'].includes(word)) {
        tags.add(word)
      }
    })
    
    return Array.from(tags).slice(0, 8)
  }

  private generateCustomTags(query: string, category: string): string[] {
    const tags = new Set<string>()
    tags.add(category)
    tags.add('custom')
    tags.add('structured')
    tags.add('resources')
    
    const mainTopic = this.extractMainTopic(query)
    tags.add(mainTopic.toLowerCase())
    
    const queryWords = query.toLowerCase().split(' ')
    queryWords.forEach(word => {
      if (word.length > 3 && !['learn', 'how', 'guide', 'tutorial'].includes(word)) {
        tags.add(word)
      }
    })
    
    return Array.from(tags).slice(0, 8)
  }

  private mapCategoryToTopic(category: string): string {
    const mapping = {
      'strategy-games': 'design',
      'life-skills': 'business',
      'music': 'design',
      'creative': 'design',
      'technology': 'web-development',
      'science': 'data-science',
      'business': 'business',
      'general': 'business'
    }
    return mapping[category as keyof typeof mapping] || 'business'
  }

  // Fallback path generation with basic resources
  private async generateFallbackPath(request: GeneratePathRequest): Promise<GeneratedPathStructure> {
    const difficulty = request.difficulty || 'beginner'
    const duration = request.duration || 15
    const mainTopic = this.extractMainTopic(request.query)
    const searchTopic = mainTopic.toLowerCase().replace(/\s+/g, '+')
    
    return {
      title: `Learn ${this.capitalizeWords(mainTopic)}`,
      description: `A comprehensive ${duration}-hour course to master ${mainTopic} through structured learning and practical application.\n\n🎯 **Learning objectives:**\n• Understand core concepts\n• Develop practical skills\n• Apply knowledge effectively\n• Build confidence and expertise\n\n📚 **What's included:**\n• Curated learning resources\n• Hands-on exercises\n• Progress tracking\n• Real-world applications`,
      topic: 'business',
      difficulty_level: difficulty,
      estimated_duration: duration,
      tags: [mainTopic.toLowerCase(), 'custom', difficulty, 'resources'],
      nodes: [
        {
          title: `${this.capitalizeWords(mainTopic)} Fundamentals`,
          description: `Master the core concepts and principles of ${mainTopic}.\n\n📚 **Learning focus:**\n• Essential concepts and terminology\n• Fundamental principles and methods\n• Best practices and standards\n• Foundation for advanced learning\n\n🎯 **Study approach:**\n• Read thoroughly and take notes\n• Look up unfamiliar terms\n• Connect concepts to real examples\n• Prepare for practical application`,
          content_type: 'article',
          resource_url: `https://www.google.com/search?q=${searchTopic}+fundamentals+guide+tutorial`,
          estimated_duration: Math.ceil(duration * 0.4),
          order_index: 1,
          prerequisites: [],
          is_required: true
        },
        {
          title: `${this.capitalizeWords(mainTopic)} Video Learning`,
          description: `Learn through comprehensive video instruction and demonstrations.\n\n🎥 **Video benefits:**\n• Visual learning and demonstrations\n• Expert instruction and tips\n• Step-by-step guidance\n• Ability to pause and replay\n\n💡 **Viewing tips:**\n• Take notes while watching\n• Practice along with examples\n• Rewatch complex sections\n• Apply lessons immediately`,
          content_type: 'video',
          resource_url: `https://www.youtube.com/results?search_query=${searchTopic}+tutorial+${difficulty}`,
          estimated_duration: Math.ceil(duration * 0.4),
          order_index: 2,
          prerequisites: [],
          is_required: true
        },
        {
          title: `${this.capitalizeWords(mainTopic)} Practical Application`,
          description: `Apply your knowledge through hands-on exercises and real-world projects.\n\n🛠️ **Practice activities:**\n• Guided exercises and tutorials\n• Mini-projects and challenges\n• Real-world application scenarios\n• Skill-building progressions\n\n✅ **Success strategies:**\n• Start with simple exercises\n• Build complexity gradually\n• Focus on understanding over speed\n• Learn from mistakes and iterate\n• Seek feedback and improvement`,
          content_type: 'exercise',
          resource_url: null,
          estimated_duration: Math.floor(duration * 0.2),
          order_index: 3,
          prerequisites: [],
          is_required: true
        }
      ]
    }
  }

  // Save generated path to database
  async saveGeneratedPath(pathStructure: GeneratedPathStructure, userId: string): Promise<LearningPath> {
    try {
      if (pathStructure.nodes.length === 0) {
        throw new Error('Cannot create path without learning modules')
      }

      const { data: path, error: pathError } = await supabase
        .from('learning_paths')
        .insert([{
          title: pathStructure.title,
          description: pathStructure.description,
          topic: pathStructure.topic,
          difficulty_level: pathStructure.difficulty_level,
          estimated_duration: pathStructure.estimated_duration,
          created_by: userId,
          is_public: true,
          total_nodes: pathStructure.nodes.length,
          completion_rate: 0,
          tags: pathStructure.tags
        }])
        .select()
        .single()

      if (pathError) throw pathError

      const nodesWithPathId = pathStructure.nodes.map((node, index) => ({
        ...node,
        path_id: path.id,
        order_index: node.order_index || index + 1
      }))

      const { error: nodesError } = await supabase
        .from('learning_nodes')
        .insert(nodesWithPathId)

      if (nodesError) throw nodesError

      await supabase
        .from('learning_paths')
        .update({ total_nodes: pathStructure.nodes.length })
        .eq('id', path.id)

      const { dbManager } = await import('./database')
      dbManager.clearAllCache()
      return path
    } catch (error) {
      console.error('Error saving generated path:', error)
      throw new Error(`Failed to save learning path: ${error.message}`)
    }
  }

  async findSimilarPaths(query: string, topic: string): Promise<LearningPath[]> {
    try {
      const { data: paths, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('topic', topic)
        .eq('is_public', true)
        .textSearch('title,description', query)
        .limit(5)

      if (error) throw error
      return paths || []
    } catch (error) {
      console.error('Error finding similar paths:', error)
      return []
    }
  }
}

export const pathGenerator = PathGenerator.getInstance()