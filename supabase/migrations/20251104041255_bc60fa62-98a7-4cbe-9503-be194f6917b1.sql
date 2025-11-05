-- Drop the existing check constraint on transportation_requests status
ALTER TABLE transportation_requests DROP CONSTRAINT IF EXISTS transportation_requests_status_check;

-- Add a new check constraint that includes all statuses
ALTER TABLE transportation_requests ADD CONSTRAINT transportation_requests_status_check 
CHECK (status IN ('pending', 'submitted', 'approved', 'assigned', 'loaded', 'in_transit', 'delivered', 'pod_received', 'completed', 'rejected', 'cancelled'));