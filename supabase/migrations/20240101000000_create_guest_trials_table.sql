-- Create guest_trials table for tracking guest free trials
CREATE TABLE IF NOT EXISTS public.guest_trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fingerprint VARCHAR(255) UNIQUE NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  image_url TEXT,
  prompt TEXT,
  style VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_guest_trials_fingerprint ON public.guest_trials(fingerprint);
CREATE INDEX idx_guest_trials_used_at ON public.guest_trials(used_at);

-- Enable Row Level Security
ALTER TABLE public.guest_trials ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only (guests don't have direct access)
CREATE POLICY "Service role can manage guest trials" ON public.guest_trials
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.guest_trials IS 'Tracks guest free trial usage to prevent abuse';