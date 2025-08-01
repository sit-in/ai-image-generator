-- Create guest_trials table for tracking guest trial usage
CREATE TABLE IF NOT EXISTS public.guest_trials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fingerprint TEXT NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    prompt TEXT,
    style TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fingerprint lookups
CREATE INDEX IF NOT EXISTS idx_guest_trials_fingerprint ON public.guest_trials(fingerprint);

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_guest_trials_used_at ON public.guest_trials(used_at);

-- Add unique constraint on fingerprint to prevent duplicate trials
CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_trials_fingerprint_unique ON public.guest_trials(fingerprint);

-- Enable RLS
ALTER TABLE public.guest_trials ENABLE ROW LEVEL SECURITY;

-- Allow insert for anonymous users (guests)
CREATE POLICY "Allow insert for anonymous users" ON public.guest_trials
    FOR INSERT 
    WITH CHECK (true);

-- Allow select for service role only
CREATE POLICY "Allow select for service role" ON public.guest_trials
    FOR SELECT 
    USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE public.guest_trials IS 'Tracks guest trial usage for image generation';