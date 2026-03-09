
-- Create a security definer function to increment referral count
-- This allows the referred user to increment the referrer's count without direct UPDATE access
CREATE OR REPLACE FUNCTION public.increment_referral_count(referrer_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_profiles
  SET referrals_count = COALESCE(referrals_count, 0) + 1
  WHERE id = referrer_id_param;
END;
$$;
