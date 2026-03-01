-- setup_likes table (composite PK: user_id + setup_id)
CREATE TABLE public.setup_likes (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  setup_id uuid REFERENCES public.setups(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, setup_id)
);

ALTER TABLE public.setup_likes ENABLE ROW LEVEL SECURITY;

-- RLS: everyone can read all likes (needed for like counts)
CREATE POLICY "Anyone can read likes"
  ON public.setup_likes FOR SELECT
  USING (true);

-- RLS: users can insert their own likes
CREATE POLICY "Users can insert own likes"
  ON public.setup_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS: users can delete their own likes
CREATE POLICY "Users can delete own likes"
  ON public.setup_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Add view_count column to setups
ALTER TABLE public.setups
  ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

-- RPC: toggle_like (atomic insert/delete + counter update)
CREATE OR REPLACE FUNCTION public.toggle_like(p_setup_id uuid)
RETURNS boolean AS $$
DECLARE
  already_liked boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.setup_likes
    WHERE user_id = auth.uid() AND setup_id = p_setup_id
  ) INTO already_liked;

  IF already_liked THEN
    DELETE FROM public.setup_likes
    WHERE user_id = auth.uid() AND setup_id = p_setup_id;
    UPDATE public.setups SET like_count = GREATEST(like_count - 1, 0) WHERE id = p_setup_id;
    RETURN false;
  ELSE
    INSERT INTO public.setup_likes (user_id, setup_id) VALUES (auth.uid(), p_setup_id);
    UPDATE public.setups SET like_count = like_count + 1 WHERE id = p_setup_id;
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: increment_view_count
CREATE OR REPLACE FUNCTION public.increment_view_count(p_setup_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.setups SET view_count = view_count + 1 WHERE id = p_setup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
