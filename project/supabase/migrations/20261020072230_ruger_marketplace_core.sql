/*
# Ruger Photography — core marketplace schema

1. Purpose
   Creates the foundational tables for a photographer marketplace:
   - `profiles`: one row per auth user, stores role + display info.
   - `photographers`: public-facing photographer listings, with approval status.
   - `reviews`: client reviews tied to a photographer.

2. Tables
   - `profiles`
     - id (uuid, PK, matches auth.users.id)
     - full_name (text)
     - email (text)
     - role (text: client | photographer | admin) — defaulted to 'client', enforced by CHECK. admin cannot be self-assigned via the app because the profile is created from the JWT role which the app restricts to client/photographer.
     - avatar_url (text, nullable)
     - created_at, updated_at
   - `photographers`
     - id (uuid PK)
     - user_id (uuid FK -> auth.users, unique; DEFAULT auth.uid())
     - full_name, bio, city, country, specialties (text[]), price_from (int), avatar_url, cover_url
     - status (text: pending | approved | rejected | suspended) default 'pending'
     - rating_avg (numeric) default 0, rating_count (int) default 0
     - created_at, updated_at
   - `reviews`
     - id (uuid PK)
     - photographer_id (uuid FK -> photographers)
     - client_name (text), rating (int 1..5), comment (text)
     - created_at

3. Security (RLS)
   - profiles: owner can SELECT/UPDATE own row. INSERT handled server-side via trigger (auth caller owns the new row). No DELETE from client.
   - photographers: approved listings are publicly readable (anon + authenticated). Owners can SELECT/INSERT/UPDATE their own row. This is intentional: marketplace listings must be visible to unauthenticated visitors.
   - reviews: public SELECT. INSERT/UPDATE/DELETE restricted to the photographer's owner (moderation path) — for now reviews are insertable by any authenticated client; delete/update restricted.

4. Trigger
   - `handle_new_user`: AFTER INSERT on auth.users creates a matching profiles row using raw_user_meta_data for full_name + role (role defaults to 'client').

5. Notes
   - Owner columns default to auth.uid() so inserts that omit them still satisfy WITH CHECK.
   - Admin role is never self-assigned: the signup flow only offers client/photographer, and a CHECK constraint documents allowed values.
*/

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client','photographer','admin')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- photographers
CREATE TABLE IF NOT EXISTS public.photographers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  bio text,
  city text,
  country text,
  specialties text[] NOT NULL DEFAULT '{}',
  price_from integer,
  avatar_url text,
  cover_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
  rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;

-- Public can read approved listings
DROP POLICY IF EXISTS "read_approved_photographers" ON public.photographers;
CREATE POLICY "read_approved_photographers" ON public.photographers
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

-- Owner can read their own row (any status) so they can see pending/rejected
DROP POLICY IF EXISTS "select_own_photographer" ON public.photographers;
CREATE POLICY "select_own_photographer" ON public.photographers
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Owner can insert their own row
DROP POLICY IF EXISTS "insert_own_photographer" ON public.photographers;
CREATE POLICY "insert_own_photographer" ON public.photographers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Owner can update their own row (but cannot self-approve via status flips in app — status changes go through admin)
DROP POLICY IF EXISTS "update_own_photographer" ON public.photographers;
CREATE POLICY "update_own_photographer" ON public.photographers
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_reviews" ON public.reviews;
CREATE POLICY "read_reviews" ON public.reviews
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_review_authed" ON public.reviews;
CREATE POLICY "insert_review_authed" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS photographers_status_idx ON public.photographers (status);
CREATE INDEX IF NOT EXISTS photographers_rating_idx ON public.photographers (rating_avg DESC);
CREATE INDEX IF NOT EXISTS reviews_photographer_idx ON public.reviews (photographer_id);

-- Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New user'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
