-- Vibes table for Keşfet filter bar (labels and metadata from DB)
CREATE TABLE public.vibes (
  id text PRIMARY KEY,
  emoji text NOT NULL,
  label_en text NOT NULL,
  label_tr text NOT NULL,
  description text,
  percentage integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.vibes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vibes are viewable by everyone" ON public.vibes
  FOR SELECT USING (true);

-- Seed vibes (same ids as onboarding)
INSERT INTO public.vibes (id, emoji, label_en, label_tr, description, percentage, sort_order) VALUES
  ('shadow_realm',    '🖤', 'Shadow Realm',     'Gölge Diyarı',      'Jet Black, Stealth Black',     25, 1),
  ('frost_kingdom',   '🤍', 'Frost Kingdom',    'Buz Krallığı',     'Phantom White, Beyaz',         20, 2),
  ('neon_arcade',     '🌈', 'Neon Arcade',      'Neon Atari Salonu','Multi-color, RGB',             15, 3),
  ('cyber_district',  '💜', 'Cyber District',   'Siber Bölge',      'Cyber Blue, Electro',          8, 4),
  ('sakura_garden',   '🌸', 'Sakura Garden',    'Sakura Bahçesi',   'Pembe, Soft Lilac',             8, 5),
  ('dragon_forge',    '🔥', 'Dragon Forge',     'Ejder Ocağı',      'Anodized, Kırmızı',            6, 6),
  ('enchanted_grove', '🌿', 'Enchanted Grove',  'Büyülü Koru',      'Matcha Green, Yeşil',           4, 7),
  ('command_bridge',  '🎙️', 'Command Bridge',   'Komuta Köprüsü',   'Pro editions, Mikrofon',       6, 8),
  ('sunset_lounge',   '🌅', 'Sunset Lounge',    'Gün Batımı',       'Turuncu, Warm Colors',          5, 9),
  ('phantom_vault',   '👻', 'Phantom Vault',    'Hayalet Kasası',   'Electro, Limited',              3, 10);
