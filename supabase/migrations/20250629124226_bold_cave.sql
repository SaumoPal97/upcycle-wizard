/*
  # Add sample data for demo purposes

  1. Demo Data
    - Creates a demo user in the users table
    - Adds sample projects with complete guide data
    - Includes step-by-step instructions for each project
    - Sets up realistic project data for testing

  2. Projects
    - Vintage Dresser (public, completed)
    - Coffee Table Restoration (private, completed) 
    - Bookshelf Makeover (private, completed)

  3. Steps
    - Detailed step-by-step instructions for each project
    - Includes tools, materials, and time estimates
*/

-- Insert demo user into users table only (avoid auth.users to prevent trigger conflicts)
INSERT INTO users (id, email, full_name, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'demo@upcyclewizard.com',
  'Demo User',
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- Insert sample projects
INSERT INTO projects (
  id,
  user_id,
  title,
  quiz_data,
  guide_json,
  public,
  cover_image_url,
  style,
  room,
  difficulty,
  estimated_time,
  budget,
  likes_count,
  environmental_score,
  created_at
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '550e8400-e29b-41d4-a716-446655440000',
  'My Vintage Dresser',
  '{"furnitureType": "dresser", "style": "bohemian", "room": "bedroom", "condition": "good", "materials": ["wood"], "budget": 150}',
  '{
    "title": "Vintage Dresser Bohemian Makeover",
    "overview": "Transform your dresser into a stunning bohemian piece with earthy tones, decorative hardware, and artistic details.",
    "difficulty": "Intermediate",
    "estimated_time": "2-3 days",
    "environmental_score": 85,
    "materials_list": ["Chalk paint (sage green, cream)", "Decorative knobs", "Sandpaper (120, 220 grit)", "Wood stain", "Protective finish"]
  }',
  true,
  'https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg',
  'Bohemian',
  'Bedroom',
  'Intermediate',
  '2-3 days',
  150,
  24,
  85,
  '2024-01-15T10:00:00Z'
),
(
  '22222222-2222-2222-2222-222222222222',
  '550e8400-e29b-41d4-a716-446655440000',
  'Coffee Table Restoration',
  '{"furnitureType": "table", "style": "industrial", "room": "living-room", "condition": "worn", "materials": ["wood", "metal"], "budget": 200}',
  '{
    "title": "Industrial Coffee Table Restoration",
    "overview": "Restore your coffee table with an industrial aesthetic using metal accents and weathered wood finish.",
    "difficulty": "Advanced",
    "estimated_time": "3-4 days",
    "environmental_score": 90,
    "materials_list": ["Metal pipe legs", "Wood stain (dark walnut)", "Steel wool", "Metal primer", "Polyurethane finish"]
  }',
  false,
  'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
  'Industrial',
  'Living Room',
  'Advanced',
  '3-4 days',
  200,
  0,
  90,
  '2024-01-20T10:00:00Z'
),
(
  '33333333-3333-3333-3333-333333333333',
  '550e8400-e29b-41d4-a716-446655440000',
  'Bookshelf Makeover',
  '{"furnitureType": "bookshelf", "style": "modern", "room": "office", "condition": "good", "materials": ["wood"], "budget": 100}',
  '{
    "title": "Modern Bookshelf Transformation",
    "overview": "Give your bookshelf a sleek modern look with clean lines and contemporary finishes.",
    "difficulty": "Beginner",
    "estimated_time": "1-2 days",
    "environmental_score": 80,
    "materials_list": ["White paint", "Primer", "Modern handles", "Sandpaper", "Paint brushes"]
  }',
  false,
  'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg',
  'Modern',
  'Office',
  'Beginner',
  '1-2 days',
  100,
  0,
  80,
  '2024-01-22T10:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  quiz_data = EXCLUDED.quiz_data,
  guide_json = EXCLUDED.guide_json,
  public = EXCLUDED.public,
  cover_image_url = EXCLUDED.cover_image_url,
  style = EXCLUDED.style,
  room = EXCLUDED.room,
  difficulty = EXCLUDED.difficulty,
  estimated_time = EXCLUDED.estimated_time,
  budget = EXCLUDED.budget,
  likes_count = EXCLUDED.likes_count,
  environmental_score = EXCLUDED.environmental_score;

-- Insert steps for Vintage Dresser project
INSERT INTO steps (
  id,
  project_id,
  step_number,
  title,
  description,
  image_url,
  tools_needed,
  materials_needed,
  estimated_time,
  created_at
) VALUES 
(
  '11111111-1111-1111-1111-111111111101',
  '11111111-1111-1111-1111-111111111111',
  1,
  'Preparation & Cleaning',
  'Remove all hardware and clean the dresser thoroughly. Sand any rough areas and wipe down with a damp cloth.',
  null,
  ARRAY['Screwdriver', 'Sandpaper', 'Cleaning cloth'],
  ARRAY['Wood cleaner', 'Sandpaper'],
  '2 hours',
  now()
),
(
  '11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111111',
  2,
  'Prime and Base Coat',
  'Apply primer to ensure good paint adhesion, then apply the base coat in sage green. Allow to dry completely between coats.',
  null,
  ARRAY['Paint brushes', 'Roller', 'Paint tray'],
  ARRAY['Primer', 'Sage green chalk paint'],
  '4 hours',
  now()
),
(
  '11111111-1111-1111-1111-111111111103',
  '11111111-1111-1111-1111-111111111111',
  3,
  'Decorative Details',
  'Add cream-colored accents and decorative patterns. Use stencils or freehand painting for bohemian designs.',
  null,
  ARRAY['Fine brushes', 'Stencils'],
  ARRAY['Cream chalk paint', 'Stencils'],
  '3 hours',
  now()
),
(
  '11111111-1111-1111-1111-111111111104',
  '11111111-1111-1111-1111-111111111111',
  4,
  'Hardware Installation',
  'Install new decorative knobs and handles that complement the bohemian style.',
  null,
  ARRAY['Drill', 'Screwdriver'],
  ARRAY['Decorative knobs', 'Screws'],
  '1 hour',
  now()
),
(
  '11111111-1111-1111-1111-111111111105',
  '11111111-1111-1111-1111-111111111111',
  5,
  'Final Finish',
  'Apply protective finish to preserve the paint and add durability. Allow to cure completely.',
  null,
  ARRAY['Fine brush', 'Cloth'],
  ARRAY['Protective finish'],
  '2 hours',
  now()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  tools_needed = EXCLUDED.tools_needed,
  materials_needed = EXCLUDED.materials_needed,
  estimated_time = EXCLUDED.estimated_time;

-- Insert steps for Coffee Table project
INSERT INTO steps (
  id,
  project_id,
  step_number,
  title,
  description,
  image_url,
  tools_needed,
  materials_needed,
  estimated_time,
  created_at
) VALUES 
(
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222222',
  1,
  'Disassembly and Assessment',
  'Carefully disassemble the table and assess the condition of all parts. Clean thoroughly and identify areas needing repair.',
  null,
  ARRAY['Screwdriver', 'Pliers', 'Wire brush'],
  ARRAY['Degreaser', 'Steel wool'],
  '3 hours',
  now()
),
(
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222222',
  2,
  'Wood Preparation',
  'Sand the wood surface and apply dark walnut stain for an aged industrial look. Allow to penetrate and dry.',
  null,
  ARRAY['Orbital sander', 'Brushes', 'Rags'],
  ARRAY['Sandpaper', 'Dark walnut stain'],
  '4 hours',
  now()
),
(
  '22222222-2222-2222-2222-222222222203',
  '22222222-2222-2222-2222-222222222222',
  3,
  'Metal Components',
  'Prepare and prime any metal components. Install new metal pipe legs or accents for the industrial aesthetic.',
  null,
  ARRAY['Wire brush', 'Spray gun', 'Wrench'],
  ARRAY['Metal primer', 'Black paint', 'Metal pipes'],
  '5 hours',
  now()
),
(
  '22222222-2222-2222-2222-222222222204',
  '22222222-2222-2222-2222-222222222222',
  4,
  'Assembly and Finishing',
  'Reassemble the table with new hardware. Apply polyurethane finish for protection and industrial sheen.',
  null,
  ARRAY['Screwdriver', 'Level', 'Brush'],
  ARRAY['Screws', 'Polyurethane finish'],
  '3 hours',
  now()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  tools_needed = EXCLUDED.tools_needed,
  materials_needed = EXCLUDED.materials_needed,
  estimated_time = EXCLUDED.estimated_time;

-- Insert steps for Bookshelf project
INSERT INTO steps (
  id,
  project_id,
  step_number,
  title,
  description,
  image_url,
  tools_needed,
  materials_needed,
  estimated_time,
  created_at
) VALUES 
(
  '33333333-3333-3333-3333-333333333301',
  '33333333-3333-3333-3333-333333333333',
  1,
  'Surface Preparation',
  'Clean the bookshelf thoroughly and sand lightly to create a smooth surface for painting.',
  null,
  ARRAY['Sandpaper', 'Tack cloth', 'Vacuum'],
  ARRAY['120-grit sandpaper', 'Cleaning solution'],
  '2 hours',
  now()
),
(
  '33333333-3333-3333-3333-333333333302',
  '33333333-3333-3333-3333-333333333333',
  2,
  'Priming',
  'Apply high-quality primer to ensure even paint coverage and better adhesion.',
  null,
  ARRAY['Roller', 'Brush', 'Paint tray'],
  ARRAY['Primer'],
  '2 hours',
  now()
),
(
  '33333333-3333-3333-3333-333333333303',
  '33333333-3333-3333-3333-333333333333',
  3,
  'Painting',
  'Apply two coats of white paint for a clean, modern finish. Allow proper drying time between coats.',
  null,
  ARRAY['Roller', 'Brush', 'Paint tray'],
  ARRAY['White paint'],
  '4 hours',
  now()
),
(
  '33333333-3333-3333-3333-333333333304',
  '33333333-3333-3333-3333-333333333333',
  4,
  'Hardware Update',
  'Install modern handles or leave clean for a minimalist look. Add any final touches.',
  null,
  ARRAY['Drill', 'Screwdriver'],
  ARRAY['Modern handles', 'Screws'],
  '1 hour',
  now()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  tools_needed = EXCLUDED.tools_needed,
  materials_needed = EXCLUDED.materials_needed,
  estimated_time = EXCLUDED.estimated_time;