
-- 1. Remove overly broad public SELECT policies on scans and confirmations
DROP POLICY IF EXISTS "Public read scan by id" ON public.scans;
DROP POLICY IF EXISTS "Public reads confirmations" ON public.confirmations;

-- 2. Fix user_profiles privilege escalation: replace broad UPDATE with column-restricted function
DROP POLICY IF EXISTS "Users update own profile" ON public.user_profiles;

-- Create a restrictive UPDATE policy that only allows safe columns
-- Users can only update display_name, email_preferences, referred_by
CREATE POLICY "Users update own safe fields"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a security definer function to reset billing cycle (server-side only)
CREATE OR REPLACE FUNCTION public.reset_billing_cycle(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.user_profiles
  SET scans_this_month = 0,
      billing_cycle_start = now()
  WHERE id = user_id_param;
END;
$$;

-- Create a trigger to prevent users from modifying protected columns via direct UPDATE
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only service_role or the trigger/function context can change these fields
  -- For regular user updates via RLS, enforce that protected columns don't change
  IF current_setting('role') = 'authenticated' THEN
    NEW.plan := OLD.plan;
    NEW.role := OLD.role;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
    NEW.scans_this_month := OLD.scans_this_month;
    NEW.billing_cycle_start := OLD.billing_cycle_start;
    NEW.payment_failed := OLD.payment_failed;
    NEW.cancel_at := OLD.cancel_at;
    NEW.referrals_count := OLD.referrals_count;
    NEW.referral_code := OLD.referral_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_columns_trigger
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_columns();
