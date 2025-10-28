-- Create preview_questions table for cached dynamic questions
CREATE TABLE IF NOT EXISTS public.preview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  question TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster role-based lookups
CREATE INDEX idx_preview_questions_role ON public.preview_questions(role);
CREATE INDEX idx_preview_questions_created_at ON public.preview_questions(created_at DESC);

-- Enable RLS
ALTER TABLE public.preview_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read preview questions (public access)
CREATE POLICY "Anyone can read preview questions"
  ON public.preview_questions
  FOR SELECT
  TO public
  USING (true);

-- Policy: Service role can insert/update/delete (for regeneration job)
CREATE POLICY "Service role can manage preview questions"
  ON public.preview_questions
  FOR ALL
  TO service_role
  USING (true);

-- Add comment
COMMENT ON TABLE public.preview_questions IS 'Cached pool of preview questions per role, regenerated hourly by cron job';

