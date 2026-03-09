CREATE OR REPLACE FUNCTION public.increment_referral_count(referrer_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF auth.uid() = referrer_id_param THEN
    RAISE EXCEPTION 'Cannot refer yourself';
  END IF;
  UPDATE public.user_profiles
  SET referrals_count = COALESCE(referrals_count, 0) + 1
  WHERE id = referrer_id_param;
END;
$$;