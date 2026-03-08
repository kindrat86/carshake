-- 1. Drop open INSERT policy on email_sequence_log (service role bypasses RLS)
DROP POLICY IF EXISTS "System inserts email log" ON public.email_sequence_log;

-- 2. Fix increment_scan_count to only allow self-increment
CREATE OR REPLACE FUNCTION public.increment_scan_count(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Not authorized to modify another user scan count';
  END IF;
  UPDATE public.user_profiles
  SET scans_this_month = scans_this_month + 1
  WHERE id = user_id_param;
END;
$$;

-- 3. Server-side scan quota enforcement trigger
CREATE OR REPLACE FUNCTION public.check_scan_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT plan FROM public.user_profiles WHERE id = NEW.user_id) IN ('free') OR
     (SELECT plan FROM public.user_profiles WHERE id = NEW.user_id) IS NULL THEN
    IF (SELECT scans_this_month FROM public.user_profiles WHERE id = NEW.user_id) >= 3 THEN
      RAISE EXCEPTION 'Free plan scan limit reached (3 per month)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_scan_quota
  BEFORE INSERT ON public.scans
  FOR EACH ROW EXECUTE FUNCTION public.check_scan_quota();

-- 4. Create public views that exclude sensitive fields
CREATE OR REPLACE VIEW public.scans_public AS
SELECT id, type, status, vehicle_plate, vehicle_model, vehicle_color_hex, vehicle_color_name,
       created_at, confirmed_at, confirmation_method, hash_sha256, paired_scan_id
FROM public.scans;

CREATE OR REPLACE VIEW public.confirmations_public AS
SELECT id, scan_id, method, confirmed_at
FROM public.confirmations;

-- 5. Drop overly broad public SELECT policies
DROP POLICY IF EXISTS "Public read scan by id" ON public.scans;
DROP POLICY IF EXISTS "Public reads confirmations" ON public.confirmations;

-- 6. Grant SELECT on the views to anon and authenticated
GRANT SELECT ON public.scans_public TO anon, authenticated;