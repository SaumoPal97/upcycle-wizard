/*
  # Create feedback table for project comments

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `project_id` (uuid, foreign key to projects)
      - `rating` (integer, 1-5 stars)
      - `feedback_text` (text, optional feedback message)
      - `completed_image_url` (text, optional image of completed project)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `feedback` table
    - Add policies for authenticated users to manage their own feedback
    - Add policy for users to read feedback on accessible projects
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  completed_image_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, project_id)
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can create feedback for projects they have access to
CREATE POLICY "Users can create feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = feedback.project_id 
      AND (projects.public = true OR projects.user_id = auth.uid())
    )
  );

-- Users can read their own feedback
CREATE POLICY "Users can read their own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can read feedback on accessible projects
CREATE POLICY "Users can read feedback on accessible projects"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = feedback.project_id 
      AND (projects.public = true OR projects.user_id = auth.uid())
    )
  );

-- Users can update their own feedback
CREATE POLICY "Users can update their own feedback"
  ON feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own feedback
CREATE POLICY "Users can delete their own feedback"
  ON feedback
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_project_id ON feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);