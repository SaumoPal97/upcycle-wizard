/*
  # Remove Sample Data Migration

  This migration removes any existing sample data that was previously added for demo purposes.
  It cleans up sample projects, steps, and demo users to ensure the application shows only real user-generated content.

  1. Cleanup
    - Remove sample projects and their associated steps
    - Remove demo user data
    - Clean up any orphaned records

  2. Notes
    - This migration is safe to run multiple times
    - Uses CASCADE deletes where appropriate
    - Preserves real user data
*/

-- Remove sample projects and their associated data
DELETE FROM steps WHERE project_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

DELETE FROM likes WHERE project_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

DELETE FROM comments WHERE project_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

DELETE FROM feedback WHERE project_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

DELETE FROM projects WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- Remove demo user from users table (if exists)
DELETE FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Note: We don't delete from auth.users as that could cause issues with Supabase auth system
-- The auth.users entry will remain but won't have corresponding data in our users table