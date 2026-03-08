-- Fix views to use SECURITY INVOKER instead of SECURITY DEFINER
CREATE OR REPLACE VIEW public.scans_public
WITH (security_invoker = true)
AS
SELECT id, type, status, vehicle_plate, vehicle_model, vehicle_color_hex, vehicle_color_name,
       created_at, confirmed_at, confirmation_method, hash_sha256, paired_scan_id
FROM public.scans;

CREATE OR REPLACE VIEW public.confirmations_public
WITH (security_invoker = true)
AS
SELECT id, scan_id, method, confirmed_at
FROM public.confirmations;

-- Since we dropped the public SELECT policies on scans/confirmations,
-- we need a policy that allows reading scans via the view for public sharing.
-- The view only exposes safe columns, so we can re-add a public SELECT policy on scans
-- that the view will use.
CREATE POLICY "Public read scan by id" ON public.scans FOR SELECT USING (true);
CREATE POLICY "Public reads confirmations" ON public.confirmations FOR SELECT USING (true);