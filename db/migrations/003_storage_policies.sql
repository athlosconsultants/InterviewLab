-- Storage policies for uploads bucket
CREATE POLICY "Users can upload their own files to uploads bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own files in uploads bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files in uploads bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files in uploads bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for audio bucket
CREATE POLICY "Users can upload their own files to audio bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own files in audio bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files in audio bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files in audio bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for reports bucket
CREATE POLICY "Users can upload their own files to reports bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own files in reports bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files in reports bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files in reports bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

