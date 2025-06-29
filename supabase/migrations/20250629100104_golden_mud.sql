/*
  # Create furniture-photos storage bucket

  1. New Storage Bucket
    - `furniture-photos` bucket for storing user-uploaded furniture images
    - Public read access enabled for displaying images
    - Authenticated users can upload images

  2. Security
    - RLS policies for authenticated uploads
    - Public read access for displaying images
    - Users can only upload to their own folder (user_id prefix)
*/

-- Create the furniture-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('furniture-photos', 'furniture-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to furniture-photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'furniture-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow authenticated users to update their own files
CREATE POLICY "Allow users to update their own files in furniture-photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'furniture-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow authenticated users to delete their own files
CREATE POLICY "Allow users to delete their own files in furniture-photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'furniture-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow public read access to all files in furniture-photos
CREATE POLICY "Allow public read access to furniture-photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'furniture-photos');