-- 1. Create Tables

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- User Preferences
CREATE TABLE public.user_preferences (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  categories text[] DEFAULT '{}'::text[],
  desk_size text,
  color_palette text[] DEFAULT '{}'::text[],
  interested_peripherals text[] DEFAULT '{}'::text[],
  onboarding_completed boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Setups (Images of desks)
CREATE TABLE public.setups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text,
  source text DEFAULT 'user' CHECK (source IN ('system', 'user')),
  is_public boolean DEFAULT false,
  categories text[] DEFAULT '{}'::text[],
  desk_size text,
  color_palette text[] DEFAULT '{}'::text[],
  lighting text,
  peripheral_zones jsonb DEFAULT '{}'::jsonb,
  like_count integer DEFAULT 0,
  save_count integer DEFAULT 0,
  try_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Wraith Products (from manifest.json)
CREATE TABLE public.wraith_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  model text NOT NULL,
  vendor text,
  product_type text,
  product_handle text NOT NULL,
  variant_id text,
  variant_title text,
  sku text,
  available boolean DEFAULT true,
  color_option text,
  color text,
  price numeric(10,2),
  compare_at_price numeric(10,2),
  price_raw numeric(10,2),
  compare_at_price_raw numeric(10,2),
  page_url text NOT NULL,
  image_url text NOT NULL,
  local_image_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(product_handle, variant_id)
);

-- Customizations (AI Inpainting Results)
CREATE TABLE public.customizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  setup_id uuid REFERENCES public.setups(id) ON DELETE CASCADE NOT NULL,
  applied_products jsonb NOT NULL DEFAULT '[]'::jsonb,
  original_image_url text NOT NULL,
  result_image_url text NOT NULL,
  visibility text DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Analytics / Impressions
CREATE TABLE public.product_impressions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.wraith_products(id) ON DELETE CASCADE,
  setup_id uuid REFERENCES public.setups(id) ON DELETE SET NULL,
  action text NOT NULL, -- 'view', 'applied', 'clicked_buy'
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Auth Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Create empty preferences row
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Row Level Security

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE wraith_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Preferences
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Setups
CREATE POLICY "Public setups viewable by all authenticated" ON setups 
  FOR SELECT USING (auth.role() = 'authenticated' AND (is_public = true OR user_id = auth.uid()));
CREATE POLICY "Users can insert own setups" ON setups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own setups" ON setups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own setups" ON setups FOR DELETE USING (auth.uid() = user_id);

-- Products
CREATE POLICY "Products viewable by all authenticated" ON wraith_products FOR SELECT USING (auth.role() = 'authenticated');

-- Customizations
CREATE POLICY "Users can view own customizations" ON customizations 
  FOR SELECT USING (auth.uid() = user_id OR visibility = 'public');
CREATE POLICY "Users can insert own customizations" ON customizations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customizations" ON customizations FOR UPDATE USING (auth.uid() = user_id);

-- 4. Storage Buckets (Run these manually in SQL Editor if needed, sometimes standard migrations fail for storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES 
--   ('setups', 'setups', true),
--   ('customizations', 'customizations', true),
--   ('products', 'products', true),
--   ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;
