-- Update storage bucket policies
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'login-photos');

CREATE POLICY "Allow public viewing of photos" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'login-photos');