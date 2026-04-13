-- ============================================================
-- Атопи-трекер: инициализация базы данных
-- ============================================================

-- 1. PROFILES --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name       TEXT,
  child_birth_date DATE,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Автоматически создаём профиль при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. FOOD_ENTRIES ----------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_entries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  time           TIME,
  food_name      TEXT NOT NULL,
  category       TEXT CHECK (category IN (
    'молочное','глютен','фрукты','овощи','мясо','рыба','яйца',
    'орехи','сладкое','напитки','другое'
  )),
  is_new_product BOOLEAN DEFAULT false,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 3. CONTACT_ENTRIES -------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  time         TIME,
  contact_type TEXT NOT NULL CHECK (contact_type IN (
    'бытовая химия','косметика','ткань/одежда','животные',
    'пыль','пыльца','вода','солнце','другое'
  )),
  contact_name TEXT NOT NULL,
  body_area    TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 4. SKIN_ENTRIES ----------------------------------------------
CREATE TABLE IF NOT EXISTS public.skin_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  time        TIME,
  severity    INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
  body_areas  TEXT[] DEFAULT '{}',
  symptoms    TEXT[] DEFAULT '{}',
  photo_url   TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 5. MEDICATIONS -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.medications (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  time      TIME,
  med_type  TEXT CHECK (med_type IN (
    'эмолент','гормональная мазь','антигистамин','антибиотик',
    'пробиотик','другое'
  )),
  med_name  TEXT NOT NULL,
  body_area TEXT,
  notes     TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ENVIRONMENT_ENTRIES ----------------------------------------
CREATE TABLE IF NOT EXISTS public.environment_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  temperature REAL,
  humidity    REAL,
  weather     TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skin_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environment_entries ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles: own data" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- food_entries
CREATE POLICY "food: own data" ON public.food_entries
  FOR ALL USING (auth.uid() = user_id);

-- contact_entries
CREATE POLICY "contacts: own data" ON public.contact_entries
  FOR ALL USING (auth.uid() = user_id);

-- skin_entries
CREATE POLICY "skin: own data" ON public.skin_entries
  FOR ALL USING (auth.uid() = user_id);

-- medications
CREATE POLICY "meds: own data" ON public.medications
  FOR ALL USING (auth.uid() = user_id);

-- environment_entries
CREATE POLICY "env: own data" ON public.environment_entries
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE: skin-photos bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('skin-photos', 'skin-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "skin-photos: upload own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'skin-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "skin-photos: view own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'skin-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "skin-photos: delete own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'skin-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_food_user_date    ON public.food_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_contact_user_date ON public.contact_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_skin_user_date    ON public.skin_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_meds_user_date    ON public.medications(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_env_user_date     ON public.environment_entries(user_id, date DESC);
