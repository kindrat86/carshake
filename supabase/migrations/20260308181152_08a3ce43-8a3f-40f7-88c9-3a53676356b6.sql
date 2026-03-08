ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS vehicle_plate TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS vehicle_color_hex TEXT,
ADD COLUMN IF NOT EXISTS vehicle_color_name TEXT;