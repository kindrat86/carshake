CREATE OR REPLACE FUNCTION increment_scan_count(user_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.user_profiles
  SET scans_this_month = scans_this_month + 1
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;