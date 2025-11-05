-- Add new columns to transportation_request_items table
ALTER TABLE transportation_request_items
ADD COLUMN IF NOT EXISTS item_description TEXT,
ADD COLUMN IF NOT EXISTS weight NUMERIC,
ADD COLUMN IF NOT EXISTS dimension TEXT;

-- Add pickup and destination contact fields to transportation_requests table
ALTER TABLE transportation_requests
ADD COLUMN IF NOT EXISTS pickup_contact_name TEXT,
ADD COLUMN IF NOT EXISTS pickup_contact_mobile TEXT,
ADD COLUMN IF NOT EXISTS pickup_contact_email TEXT,
ADD COLUMN IF NOT EXISTS receiver_contact_name TEXT,
ADD COLUMN IF NOT EXISTS receiver_contact_mobile TEXT,
ADD COLUMN IF NOT EXISTS receiver_contact_email TEXT,
ADD COLUMN IF NOT EXISTS vendor_name TEXT,
ADD COLUMN IF NOT EXISTS vehicle_type TEXT;

COMMENT ON COLUMN transportation_request_items.item_description IS 'Detailed description of the item';
COMMENT ON COLUMN transportation_request_items.weight IS 'Weight of the item in Kg';
COMMENT ON COLUMN transportation_request_items.dimension IS 'Dimensions in L x W x H format';

COMMENT ON COLUMN transportation_requests.pickup_contact_name IS 'Contact person name at pickup location';
COMMENT ON COLUMN transportation_requests.pickup_contact_mobile IS 'Contact mobile number at pickup location';
COMMENT ON COLUMN transportation_requests.pickup_contact_email IS 'Contact email at pickup location';
COMMENT ON COLUMN transportation_requests.receiver_contact_name IS 'Contact person name at destination';
COMMENT ON COLUMN transportation_requests.receiver_contact_mobile IS 'Contact mobile number at destination';
COMMENT ON COLUMN transportation_requests.receiver_contact_email IS 'Contact email at destination';
COMMENT ON COLUMN transportation_requests.vendor_name IS 'Name of the vendor/carrier assigned';
COMMENT ON COLUMN transportation_requests.vehicle_type IS 'Type of vehicle used for transportation';