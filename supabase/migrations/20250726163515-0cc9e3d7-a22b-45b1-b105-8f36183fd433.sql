-- Add profile_image_url columns to persona tables
ALTER TABLE public.knyt_personas 
ADD COLUMN profile_image_url text DEFAULT '';

ALTER TABLE public.qrypto_personas 
ADD COLUMN profile_image_url text DEFAULT '';

-- Create storage bucket for persona profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('persona-profile-images', 'persona-profile-images', true);

-- Create storage policies for persona profile images
CREATE POLICY "Users can view persona profile images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'persona-profile-images');

CREATE POLICY "Users can upload their own persona profile images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'persona-profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own persona profile images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'persona-profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own persona profile images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'persona-profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);