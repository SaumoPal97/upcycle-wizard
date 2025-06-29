/*
  # Setup Dummy Data for Projects and Steps

  1. New Data
    - Creates sample projects with complete guide data
    - Adds detailed steps for each project
    - Includes realistic project information

  2. Projects Created
    - "My Vintage Dresser" (Completed, Public, Bohemian style)
    - "Coffee Table Restoration" (In Progress, Private, Industrial style)  
    - "Bookshelf Makeover" (Draft, Private, Modern style)

  3. Steps
    - Each project has 4-5 detailed steps
    - Complete with tools, materials, and time estimates
    - Proper step numbering and descriptions
*/

-- Use a consistent demo user ID that we can reference
DO $$
DECLARE
    demo_user_id uuid := '550e8400-e29b-41d4-a716-446655440000';
BEGIN
    -- Insert demo user into users table if not exists
    INSERT INTO users (id, email, full_name, created_at)
    VALUES (
        demo_user_id,
        'demo@upcyclewizard.com',
        'Demo User',
        now()
    ) ON CONFLICT (id) DO NOTHING;

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
        demo_user_id,
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
        demo_user_id,
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
        demo_user_id,
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
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert steps for Vintage Dresser project
    INSERT INTO steps (
        id,
        project_id,
        step_number,
        title,
        description,
        tools_needed,
        materials_needed,
        estimated_time
    ) VALUES 
    (
        '11111111-1111-1111-1111-111111111101',
        '11111111-1111-1111-1111-111111111111',
        1,
        'Preparation & Cleaning',
        'Remove all hardware and clean the dresser thoroughly. Sand any rough areas and wipe down with a damp cloth.',
        ARRAY['Screwdriver', 'Sandpaper', 'Cleaning cloth'],
        ARRAY['Wood cleaner', 'Sandpaper'],
        '2 hours'
    ),
    (
        '11111111-1111-1111-1111-111111111102',
        '11111111-1111-1111-1111-111111111111',
        2,
        'Prime and Base Coat',
        'Apply primer to ensure good paint adhesion, then apply the base coat in sage green. Allow to dry completely between coats.',
        ARRAY['Paint brushes', 'Roller', 'Paint tray'],
        ARRAY['Primer', 'Sage green chalk paint'],
        '4 hours'
    ),
    (
        '11111111-1111-1111-1111-111111111103',
        '11111111-1111-1111-1111-111111111111',
        3,
        'Decorative Details',
        'Add cream-colored accents and decorative patterns. Use stencils or freehand painting for bohemian designs.',
        ARRAY['Fine brushes', 'Stencils'],
        ARRAY['Cream chalk paint', 'Stencils'],
        '3 hours'
    ),
    (
        '11111111-1111-1111-1111-111111111104',
        '11111111-1111-1111-1111-111111111111',
        4,
        'Hardware Installation',
        'Install new decorative knobs and handles that complement the bohemian style.',
        ARRAY['Drill', 'Screwdriver'],
        ARRAY['Decorative knobs', 'Screws'],
        '1 hour'
    ),
    (
        '11111111-1111-1111-1111-111111111105',
        '11111111-1111-1111-1111-111111111111',
        5,
        'Final Finish',
        'Apply protective finish to preserve the paint and add durability. Allow to cure completely.',
        ARRAY['Fine brush', 'Cloth'],
        ARRAY['Protective finish'],
        '2 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert steps for Coffee Table project
    INSERT INTO steps (
        id,
        project_id,
        step_number,
        title,
        description,
        tools_needed,
        materials_needed,
        estimated_time
    ) VALUES 
    (
        '22222222-2222-2222-2222-222222222201',
        '22222222-2222-2222-2222-222222222222',
        1,
        'Disassembly and Assessment',
        'Carefully disassemble the table and assess the condition of all parts. Clean thoroughly and identify areas needing repair.',
        ARRAY['Screwdriver', 'Pliers', 'Wire brush'],
        ARRAY['Degreaser', 'Steel wool'],
        '3 hours'
    ),
    (
        '22222222-2222-2222-2222-222222222202',
        '22222222-2222-2222-2222-222222222222',
        2,
        'Wood Preparation',
        'Sand the wood surface and apply dark walnut stain for an aged industrial look. Allow to penetrate and dry.',
        ARRAY['Orbital sander', 'Brushes', 'Rags'],
        ARRAY['Sandpaper', 'Dark walnut stain'],
        '4 hours'
    ),
    (
        '22222222-2222-2222-2222-222222222203',
        '22222222-2222-2222-2222-222222222222',
        3,
        'Metal Components',
        'Prepare and prime any metal components. Install new metal pipe legs or accents for the industrial aesthetic.',
        ARRAY['Wire brush', 'Spray gun', 'Wrench'],
        ARRAY['Metal primer', 'Black paint', 'Metal pipes'],
        '5 hours'
    ),
    (
        '22222222-2222-2222-2222-222222222204',
        '22222222-2222-2222-2222-222222222222',
        4,
        'Assembly and Finishing',
        'Reassemble the table with new hardware. Apply polyurethane finish for protection and industrial sheen.',
        ARRAY['Screwdriver', 'Level', 'Brush'],
        ARRAY['Screws', 'Polyurethane finish'],
        '3 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert steps for Bookshelf project
    INSERT INTO steps (
        id,
        project_id,
        step_number,
        title,
        description,
        tools_needed,
        materials_needed,
        estimated_time
    ) VALUES 
    (
        '33333333-3333-3333-3333-333333333301',
        '33333333-3333-3333-3333-333333333333',
        1,
        'Surface Preparation',
        'Clean the bookshelf thoroughly and sand lightly to create a smooth surface for painting.',
        ARRAY['Sandpaper', 'Tack cloth', 'Vacuum'],
        ARRAY['120-grit sandpaper', 'Cleaning solution'],
        '2 hours'
    ),
    (
        '33333333-3333-3333-3333-333333333302',
        '33333333-3333-3333-3333-333333333333',
        2,
        'Priming',
        'Apply high-quality primer to ensure even paint coverage and better adhesion.',
        ARRAY['Roller', 'Brush', 'Paint tray'],
        ARRAY['Primer'],
        '2 hours'
    ),
    (
        '33333333-3333-3333-3333-333333333303',
        '33333333-3333-3333-3333-333333333333',
        3,
        'Painting',
        'Apply two coats of white paint for a clean, modern finish. Allow proper drying time between coats.',
        ARRAY['Roller', 'Brush', 'Paint tray'],
        ARRAY['White paint'],
        '4 hours'
    ),
    (
        '33333333-3333-3333-3333-333333333304',
        '33333333-3333-3333-3333-333333333333',
        4,
        'Hardware Update',
        'Install modern handles or leave clean for a minimalist look. Add any final touches.',
        ARRAY['Drill', 'Screwdriver'],
        ARRAY['Modern handles', 'Screws'],
        '1 hour'
    ) ON CONFLICT (id) DO NOTHING;

END $$;