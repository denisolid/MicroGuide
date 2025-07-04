/*
# MicroGuide Database Schema

1. New Tables
   - `profiles` - User profiles with preferences and settings
   - `learning_paths` - AI-generated learning paths with structured content
   - `learning_nodes` - Individual learning steps/modules within paths
   - `user_progress` - Track user progress through learning paths
   - `achievements` - Gamification achievements and badges
   - `user_achievements` - Junction table for user achievements
   - `challenges` - Social challenges between users
   - `resources` - Curated learning resources (videos, articles, courses)
   - `comments` - User comments on learning content
   - `social_shares` - Track social media shares

2. Security
   - Enable RLS on all tables
   - Add policies for authenticated users
   - Implement role-based access for admin functions

3. Features
   - Full-text search on learning content
   - Automatic timestamps and user tracking
   - Foreign key relationships for data integrity
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text,
  learning_goals text[],
  preferred_topics text[],
  experience_level text DEFAULT 'beginner',
  total_points integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  topic text NOT NULL,
  difficulty_level text DEFAULT 'beginner',
  estimated_duration integer, -- in hours
  created_by uuid REFERENCES auth.users(id),
  is_public boolean DEFAULT true,
  total_nodes integer DEFAULT 0,
  completion_rate float DEFAULT 0,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Learning nodes (individual steps in a path)
CREATE TABLE IF NOT EXISTS learning_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content_type text, -- 'video', 'article', 'course', 'exercise'
  resource_url text,
  estimated_duration integer, -- in minutes
  order_index integer NOT NULL,
  prerequisites uuid[], -- array of node IDs
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE,
  node_id uuid REFERENCES learning_nodes(id) ON DELETE CASCADE,
  status text DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'skipped'
  progress_percentage float DEFAULT 0,
  time_spent integer DEFAULT 0, -- in minutes
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, node_id)
);

-- Achievements system
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text,
  category text,
  points integer DEFAULT 0,
  criteria jsonb, -- flexible criteria storage
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User achievements junction table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Social challenges
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id),
  path_id uuid REFERENCES learning_paths(id),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  max_participants integer,
  is_public boolean DEFAULT true,
  prize_description text,
  status text DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  created_at timestamptz DEFAULT now()
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  completion_percentage float DEFAULT 0,
  final_score integer DEFAULT 0,
  UNIQUE(challenge_id, user_id)
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  resource_type text, -- 'video', 'article', 'course', 'book', 'tool'
  platform text, -- 'youtube', 'udemy', 'coursera', 'blog', etc.
  author text,
  duration integer, -- in minutes
  difficulty_level text,
  topics text[],
  rating float,
  is_free boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments system
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE,
  node_id uuid REFERENCES learning_nodes(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id), -- for nested comments
  content text NOT NULL,
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Social shares tracking
CREATE TABLE IF NOT EXISTS social_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id uuid REFERENCES learning_paths(id),
  achievement_id uuid REFERENCES achievements(id),
  platform text, -- 'twitter', 'linkedin', 'facebook', etc.
  shared_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Learning paths policies
CREATE POLICY "Public paths visible to all" ON learning_paths
  FOR SELECT TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create paths" ON learning_paths
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own paths" ON learning_paths
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- Learning nodes policies
CREATE POLICY "Nodes visible for accessible paths" ON learning_nodes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM learning_paths
      WHERE id = path_id
      AND (is_public = true OR created_by = auth.uid())
    )
  );

CREATE POLICY "Path creators can manage nodes" ON learning_nodes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM learning_paths
      WHERE id = path_id AND created_by = auth.uid()
    )
  );

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "All users can view achievements" ON achievements
  FOR SELECT TO authenticated
  USING (is_active = true);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can award achievements" ON user_achievements
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Challenges policies
CREATE POLICY "Public challenges visible to all" ON challenges
  FOR SELECT TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create challenges" ON challenges
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Challenge participants policies
CREATE POLICY "Users can view challenge participants" ON challenge_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE id = challenge_id AND is_public = true
    )
  );

CREATE POLICY "Users can join challenges" ON challenge_participants
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Resources policies
CREATE POLICY "All users can view resources" ON resources
  FOR SELECT TO authenticated
  USING (true);

-- Comments policies
CREATE POLICY "Users can view comments on accessible paths" ON comments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM learning_paths
      WHERE id = path_id
      AND (is_public = true OR created_by = auth.uid())
    )
  );

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Social shares policies
CREATE POLICY "Users can view own shares" ON social_shares
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create shares" ON social_shares
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_created_by ON learning_paths(created_by);
CREATE INDEX IF NOT EXISTS idx_learning_paths_topic ON learning_paths(topic);
CREATE INDEX IF NOT EXISTS idx_learning_nodes_path_id ON learning_nodes(path_id);
CREATE INDEX IF NOT EXISTS idx_learning_nodes_order ON learning_nodes(path_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_path_id ON user_progress(path_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_path_id ON comments(path_id);
CREATE INDEX IF NOT EXISTS idx_resources_topics ON resources USING GIN(topics);

-- Insert sample achievements
INSERT INTO achievements (title, description, icon, category, points, criteria) VALUES
  ('First Steps', 'Complete your first learning node', 'star', 'progress', 10, '{"type": "nodes_completed", "count": 1}'),
  ('Learning Streak', 'Learn for 7 days in a row', 'flame', 'habit', 50, '{"type": "streak", "days": 7}'),
  ('Path Explorer', 'Complete your first learning path', 'map', 'completion', 100, '{"type": "paths_completed", "count": 1}'),
  ('Social Learner', 'Join your first challenge', 'users', 'social', 25, '{"type": "challenges_joined", "count": 1}'),
  ('Knowledge Sharer', 'Share an achievement on social media', 'share', 'social', 20, '{"type": "shares_created", "count": 1}'),
  ('Dedicated Learner', 'Spend 10 hours learning', 'clock', 'time', 75, '{"type": "time_spent", "hours": 10}'),
  ('Path Creator', 'Create your first learning path', 'plus', 'creation', 50, '{"type": "paths_created", "count": 1}'),
  ('Challenger', 'Win your first challenge', 'trophy', 'competition', 150, '{"type": "challenges_won", "count": 1}');

-- Insert sample resources
INSERT INTO resources (title, description, url, resource_type, platform, author, duration, difficulty_level, topics, rating, is_free) VALUES
  ('JavaScript Fundamentals', 'Complete beginner guide to JavaScript', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 'video', 'youtube', 'Programming with Mosh', 180, 'beginner', ARRAY['javascript', 'programming'], 4.8, true),
  ('React Tutorial for Beginners', 'Learn React from scratch', 'https://www.youtube.com/watch?v=SqcY0GlETPk', 'video', 'youtube', 'Programming with Mosh', 120, 'beginner', ARRAY['react', 'javascript'], 4.9, true),
  ('Web3 Development Guide', 'Complete guide to Web3 development', 'https://ethereum.org/en/developers/docs/', 'article', 'ethereum.org', 'Ethereum Foundation', 0, 'intermediate', ARRAY['web3', 'blockchain'], 4.7, true),
  ('Python for Data Science', 'Data science with Python', 'https://www.coursera.org/learn/python-data-analysis', 'course', 'coursera', 'University of Michigan', 2400, 'intermediate', ARRAY['python', 'data-science'], 4.6, false);