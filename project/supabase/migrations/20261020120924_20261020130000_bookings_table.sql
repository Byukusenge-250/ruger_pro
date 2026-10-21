-- Bookings table: clients request sessions with photographers
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
  client_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_email text NOT NULL,
  session_date date NOT NULL,
  session_type text NOT NULL,
  location text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Client can read their own bookings
DROP POLICY IF EXISTS "select_own_bookings" ON public.bookings;
CREATE POLICY "select_own_bookings" ON public.bookings
  FOR SELECT TO authenticated USING (auth.uid() = client_id);

-- Client can insert their own booking
DROP POLICY IF EXISTS "insert_own_booking" ON public.bookings;
CREATE POLICY "insert_own_booking" ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);

-- Client can update their own bookings (cancel)
DROP POLICY IF EXISTS "update_own_booking" ON public.bookings;
CREATE POLICY "update_own_booking" ON public.bookings
  FOR UPDATE TO authenticated USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);

-- Photographer owner can read bookings for their listing
DROP POLICY IF EXISTS "select_photographer_bookings" ON public.bookings;
CREATE POLICY "select_photographer_bookings" ON public.bookings
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.photographers p WHERE p.id = bookings.photographer_id AND p.user_id = auth.uid())
  );

-- Photographer owner can update booking status (confirm/complete/cancel)
DROP POLICY IF EXISTS "update_photographer_bookings" ON public.bookings;
CREATE POLICY "update_photographer_bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.photographers p WHERE p.id = bookings.photographer_id AND p.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.photographers p WHERE p.id = bookings.photographer_id AND p.user_id = auth.uid())
  );

-- Admin full access to bookings
DROP POLICY IF EXISTS "admin_all_bookings" ON public.bookings;
CREATE POLICY "admin_all_bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "admin_update_bookings" ON public.bookings;
CREATE POLICY "admin_update_bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_bookings" ON public.bookings;
CREATE POLICY "admin_delete_bookings" ON public.bookings
  FOR DELETE TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS bookings_client_idx ON public.bookings (client_id);
CREATE INDEX IF NOT EXISTS bookings_photographer_idx ON public.bookings (photographer_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings (status);
