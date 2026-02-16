-- Migrate from Supabase Storage to AWS S3
-- Rename storage_path to s3_key and add content_type column

ALTER TABLE public.media RENAME COLUMN storage_path TO s3_key;
ALTER TABLE public.media ADD COLUMN content_type TEXT;
