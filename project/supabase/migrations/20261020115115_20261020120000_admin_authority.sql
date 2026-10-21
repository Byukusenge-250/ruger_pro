-- Give admin role full authority over all marketplace tables.
-- Admin can read, insert, update, and delete on profiles, photographers, and reviews.

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PROFILES: admin can read and update all profiles
DROP POLICY IF EXISTS "admin_select_profiles" ON public.profiles;
CREATE POLICY "admin_select_profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_profiles" ON public.profiles;
CREATE POLICY "admin_update_profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_profiles" ON public.profiles;
CREATE POLICY "admin_insert_profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_profiles" ON public.profiles;
CREATE POLICY "admin_delete_profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.is_admin());

-- PHOTOGRAPHERS: admin full access to all rows (any status)
DROP POLICY IF EXISTS "admin_all_photographers" ON public.photographers;
CREATE POLICY "admin_all_photographers" ON public.photographers
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_photographers" ON public.photographers;
CREATE POLICY "admin_insert_photographers" ON public.photographers
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_photographers" ON public.photographers;
CREATE POLICY "admin_update_photographers" ON public.photographers
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_photographers" ON public.photographers;
CREATE POLICY "admin_delete_photographers" ON public.photographers
  FOR DELETE TO authenticated USING (public.is_admin());

-- REVIEWS: admin can moderate (update + delete)
DROP POLICY IF EXISTS "admin_update_reviews" ON public.reviews;
CREATE POLICY "admin_update_reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_reviews" ON public.reviews;
CREATE POLICY "admin_delete_reviews" ON public.reviews
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_reviews" ON public.reviews;
CREATE POLICY "admin_insert_reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
