/*
  # Create furniture-photos storage bucket

  1. Storage Setup
    - Create furniture-photos bucket with public access
    - Set up RLS policies for secure file operations

  2. Security Policies
    - Authenticated users can upload to their own folders
    - Users can manage their own files
    - Public read access for displaying images

  3. Notes
    - Uses proper Supabase storage functions
    - Avoids direct table manipulation that requires ownership
*/

-- Create the furniture-photos bucket using Supabase storage functions
DO $$
BEGIN
  -- Create bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'furniture-photos',
    'furniture-photos', 
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Create storage policies using the storage schema
DO $$
BEGIN
  -- Policy: Allow authenticated users to upload files to their own folder
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow authenticated uploads to furniture-photos'
  ) THEN
    CREATE POLICY "Allow authenticated uploads to furniture-photos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'furniture-photos' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;

  -- Policy: Allow users to update their own files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow users to update their own files in furniture-photos'
  ) THEN
    CREATE POLICY "Allow users to update their own files in furniture-photos"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'furniture-photos' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;

  -- Policy: Allow users to delete their own files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow users to delete their own files in furniture-photos'
  ) THEN
    CREATE POLICY "Allow users to delete their own files in furniture-photos"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'furniture-photos' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;

  -- Policy: Allow public read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow public read access to furniture-photos'
  ) THEN
    CREATE POLICY "Allow public read access to furniture-photos"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'furniture-photos');
  END IF;
END $$;