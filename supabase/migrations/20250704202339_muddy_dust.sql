/*
  # Ensure Proper Cascade Deletion for Learning Paths

  1. Database Changes
    - Verify foreign key constraints have proper CASCADE deletion
    - Ensure learning_nodes are deleted when path is deleted
    - Ensure user_progress is deleted when path is deleted
    - Ensure comments are deleted when path is deleted

  2. Security
    - Maintain RLS policies
    - Ensure only path creators can delete their paths
*/

-- Ensure learning_nodes cascade deletion
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'learning_nodes_path_id_fkey'
  ) THEN
    ALTER TABLE learning_nodes DROP CONSTRAINT learning_nodes_path_id_fkey;
  END IF;
  
  -- Add constraint with CASCADE
  ALTER TABLE learning_nodes 
  ADD CONSTRAINT learning_nodes_path_id_fkey 
  FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE;
END $$;

-- Ensure user_progress cascade deletion
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_progress_path_id_fkey'
  ) THEN
    ALTER TABLE user_progress DROP CONSTRAINT user_progress_path_id_fkey;
  END IF;
  
  -- Add constraint with CASCADE
  ALTER TABLE user_progress 
  ADD CONSTRAINT user_progress_path_id_fkey 
  FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE;
END $$;

-- Ensure comments cascade deletion
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_path_id_fkey'
  ) THEN
    ALTER TABLE comments DROP CONSTRAINT comments_path_id_fkey;
  END IF;
  
  -- Add constraint with CASCADE
  ALTER TABLE comments 
  ADD CONSTRAINT comments_path_id_fkey 
  FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE;
END $$;

-- Ensure social_shares cascade deletion
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'social_shares_path_id_fkey'
  ) THEN
    ALTER TABLE social_shares DROP CONSTRAINT social_shares_path_id_fkey;
  END IF;
  
  -- Add constraint with CASCADE
  ALTER TABLE social_shares 
  ADD CONSTRAINT social_shares_path_id_fkey 
  FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE;
END $$;

-- Ensure challenges cascade deletion
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'challenges_path_id_fkey'
  ) THEN
    ALTER TABLE challenges DROP CONSTRAINT challenges_path_id_fkey;
  END IF;
  
  -- Add constraint with CASCADE
  ALTER TABLE challenges 
  ADD CONSTRAINT challenges_path_id_fkey 
  FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE;
END $$;