-- Add fields for transportation request status tracking
ALTER TABLE transportation_requests
ADD COLUMN IF NOT EXISTS driver_name TEXT,
ADD COLUMN IF NOT EXISTS driver_mobile TEXT,
ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS loading_proof_url TEXT,
ADD COLUMN IF NOT EXISTS pod_proof_url TEXT,
ADD COLUMN IF NOT EXISTS tracking_ref TEXT,
ADD COLUMN IF NOT EXISTS tracking_link TEXT;