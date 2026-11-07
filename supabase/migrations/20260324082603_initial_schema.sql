
-- 001_initial_schema.sql
-- Portable Postgres schema — no Supabase-specific extensions

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Posts
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  date date NOT NULL,
  summary text NOT NULL,
  content text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  cover_url text,
  draft boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Collections
CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  date date NOT NULL,
  end_date date,
  location text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_photo_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Photos
CREATE TABLE photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  filename text NOT NULL,
  alt text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add cover_photo_id FK after photos table exists
ALTER TABLE collections
  ADD CONSTRAINT collections_cover_photo_id_fkey
  FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL;

-- Profile (singleton)
CREATE TABLE profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text NOT NULL DEFAULT '',
  photo_url text,
  email text NOT NULL,
  social jsonb NOT NULL DEFAULT '{}',
  cta jsonb NOT NULL DEFAULT '{}',
  highlights jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profile_updated_at
  BEFORE UPDATE ON profile
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- About sections
CREATE TABLE about_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('experience', 'education', 'publication', 'achievement', 'skill_group', 'interest', 'highlight')),
  title text NOT NULL,
  subtitle text,
  date_start text,
  date_end text,
  url text,
  content jsonb NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER about_sections_updated_at
  BEFORE UPDATE ON about_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_date ON posts(date DESC);
CREATE INDEX idx_posts_draft ON posts(draft);
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_date ON collections(date DESC);
CREATE INDEX idx_photos_collection ON photos(collection_id);
CREATE INDEX idx_photos_moments ON photos(collection_id) WHERE collection_id IS NULL;
CREATE INDEX idx_about_sections_type ON about_sections(type);

-- Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public read photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Public read profile" ON profile FOR SELECT USING (true);
CREATE POLICY "Public read about_sections" ON about_sections FOR SELECT USING (true);

-- Service role write policies (server-side only, scoped to service_role)
CREATE POLICY "Service write posts" ON posts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write collections" ON collections FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write photos" ON photos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write profile" ON profile FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write about_sections" ON about_sections FOR ALL TO service_role USING (true) WITH CHECK (true);
;
