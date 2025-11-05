-- Add new fields to transportation_requests table
ALTER TABLE transportation_requests
ADD COLUMN insurance_coverage boolean DEFAULT false,
ADD COLUMN remarks text,
ADD COLUMN vehicle_mode text CHECK (vehicle_mode IN ('own', 'vendor'));

-- Update status field to support full lifecycle
-- Note: We keep status as text to allow all lifecycle values
COMMENT ON COLUMN transportation_requests.status IS 'Lifecycle: draft, submitted, approved, assigned, ready_for_pickup, arrived_at_pickup, loaded, in_transit, arrived_at_hub, departed_from_hub, arrived_at_destination, unloading, delivered, pod_received, completed, billed, closed';