-- =====================================================
-- VISITOR PHOTO FEATURE - DATABASE MIGRATION
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add photo_url and register_number columns to visitors table
ALTER TABLE visitors 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS register_number TEXT;

-- Add index for faster lookup by register number
CREATE INDEX IF NOT EXISTS idx_visitors_register_number 
ON visitors(register_number);

-- 2. Create storage bucket for visitor photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('visitor-photos', 'visitor-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up storage policies for visitor photos bucket

-- Allow public read access
CREATE POLICY "Public read access for visitor photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'visitor-photos');

-- Allow authenticated uploads (for API)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'visitor-photos');

-- Allow authenticated updates
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'visitor-photos');

-- Allow authenticated deletes
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'visitor-photos');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'visitors' AND column_name IN ('photo_url', 'register_number');

-- Check if bucket was created
SELECT * FROM storage.buckets WHERE id = 'visitor-photos';

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Photo URLs will be stored as: https://your-project.supabase.co/storage/v1/object/public/visitor-photos/visitor-xxxxx.jpg
-- 2. Photos are automatically uploaded during visitor registration
-- 3. Guard can see photos in scan history and full details modal
-- 4. Register number is used to match with student identity cards
-- 5. Make sure your Supabase project has storage enabled
-- =====================================================
