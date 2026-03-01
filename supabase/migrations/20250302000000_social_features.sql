-- ============================================================
-- Social Features: follows, notifications, toggle_follow RPC
-- ============================================================

-- 1. follows table
CREATE TABLE public.follows (
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read follows"
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can insert own follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- 2. notifications table
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('new_follower', 'setup_liked')),
  actor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  setup_id uuid REFERENCES public.setups(id) ON DELETE CASCADE,
  read boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 3. toggle_follow RPC
CREATE OR REPLACE FUNCTION public.toggle_follow(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  already_following boolean;
BEGIN
  -- Prevent self-follow
  IF auth.uid() = p_user_id THEN
    RAISE EXCEPTION 'Cannot follow yourself';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.follows
    WHERE follower_id = auth.uid() AND following_id = p_user_id
  ) INTO already_following;

  IF already_following THEN
    DELETE FROM public.follows
    WHERE follower_id = auth.uid() AND following_id = p_user_id;
    RETURN false;
  ELSE
    INSERT INTO public.follows (follower_id, following_id) VALUES (auth.uid(), p_user_id);
    -- Create notification for the followed user
    INSERT INTO public.notifications (user_id, type, actor_id)
    VALUES (p_user_id, 'new_follower', auth.uid());
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update toggle_like to create notification
CREATE OR REPLACE FUNCTION public.toggle_like(p_setup_id uuid)
RETURNS boolean AS $$
DECLARE
  already_liked boolean;
  setup_owner_id uuid;
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

    -- Notify setup owner (skip self-like)
    SELECT user_id INTO setup_owner_id FROM public.setups WHERE id = p_setup_id;
    IF setup_owner_id IS NOT NULL AND setup_owner_id != auth.uid() THEN
      INSERT INTO public.notifications (user_id, type, actor_id, setup_id)
      VALUES (setup_owner_id, 'setup_liked', auth.uid(), p_setup_id);
    END IF;

    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. mark_all_notifications_read RPC
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE user_id = auth.uid() AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
