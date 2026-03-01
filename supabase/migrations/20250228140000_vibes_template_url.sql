-- Vibes: template image URL from storage (faster: no local read, no fal upload)
ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS template_url text;

-- Populate template_url so API uses DB instead of local files:
-- 1. Supabase Dashboard → Storage → New bucket "vibe_templates" (Public).
-- 2. Upload from ../vibe_template/*.png (neon_arcade.png, shadow_realm.png, command_bridge.png, etc.).
-- 3. Public URL format: https://<PROJECT_REF>.supabase.co/storage/v1/object/public/vibe_templates/<vibe_id>.png
-- 4. After upload, run (replace PROJECT_REF with your project ref):
--    UPDATE vibes SET template_url = 'https://PROJECT_REF.supabase.co/storage/v1/object/public/vibe_templates/' || id || '.png';
