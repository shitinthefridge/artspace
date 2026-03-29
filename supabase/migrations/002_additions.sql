-- ============================================================
-- ARTSPACE — Phase 2-8 additions
-- Run this AFTER the first migration (001_initial_schema.sql)
-- Paste the whole thing into Supabase SQL Editor and click Run
-- ============================================================

-- 1. Add username + is_admin columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Announcements table (admin can post sitewide banners)
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read announcements"
  ON announcements FOR SELECT TO public USING (active = true);

-- ============================================================
-- 3. Drop old RLS policies & recreate with correct logic
-- ============================================================

-- USERS
DROP POLICY IF EXISTS "Users can view approved artists" ON users;
DROP POLICY IF EXISTS "Artists can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Read users" ON users;
DROP POLICY IF EXISTS "Insert own user" ON users;
DROP POLICY IF EXISTS "Update own user" ON users;

CREATE POLICY "Read users"
  ON users FOR SELECT TO public
  USING (approved = true OR auth.uid() = id);

CREATE POLICY "Insert own user"
  ON users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Update own user"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ARTWORKS
DROP POLICY IF EXISTS "Anyone can view artworks" ON artworks;
DROP POLICY IF EXISTS "Artists can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Artists can update their artworks" ON artworks;
DROP POLICY IF EXISTS "Artists can update artworks" ON artworks;
DROP POLICY IF EXISTS "Artists can delete artworks" ON artworks;

CREATE POLICY "Anyone can view artworks"
  ON artworks FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE id = artworks.user_id AND approved = true
  ));

CREATE POLICY "Artists can insert artworks"
  ON artworks FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND type = 'artist' AND approved = true)
  );

CREATE POLICY "Artists can update artworks"
  ON artworks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Artists can delete artworks"
  ON artworks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- LIKES
DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
DROP POLICY IF EXISTS "Authenticated users can add likes" ON likes;
DROP POLICY IF EXISTS "Users can remove own likes" ON likes;

CREATE POLICY "Anyone can view likes"
  ON likes FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can like"
  ON likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- COMMENTS
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can comment" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can comment"
  ON comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. Admin RPC functions (bypass RLS, used by admin panel)
-- ============================================================

CREATE OR REPLACE FUNCTION get_all_users_admin()
RETURNS SETOF users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM users ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION set_user_approved(p_user_id uuid, p_approved boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users SET approved = p_approved WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION upsert_announcement(p_content text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE announcements SET active = false;
  IF p_content != '' THEN
    INSERT INTO announcements (content, active) VALUES (p_content, true);
  END IF;
END;
$$;

-- ============================================================
-- 5. Storage buckets (run after creating them in the UI)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
  VALUES ('artworks', 'artworks', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload artwork" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

CREATE POLICY "Anyone can view artwork images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'artworks');

CREATE POLICY "Authenticated users can upload artwork"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'artworks');

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (true);
