-- Add vibe to user_preferences (onboarding result)
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS vibe text;
