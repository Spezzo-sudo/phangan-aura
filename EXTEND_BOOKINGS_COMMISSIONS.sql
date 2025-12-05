-- STEP 2: Extend Bookings Table for Commission Tracking
-- Run this in Supabase SQL Editor

-- Add commission tracking columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_price_snapshot INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addons_price_snapshot INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS staff_commission INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS transport_fee INTEGER DEFAULT 100;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_fee INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS material_cost INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS company_share INTEGER;

-- Payment tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_to_staff BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_to_staff_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pending'; -- 'pending', 'cash', 'bank_transfer', 'stripe'

-- Notes
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payout_notes TEXT;

-- Create index for faster payout queries
CREATE INDEX IF NOT EXISTS idx_bookings_paid_to_staff ON bookings(paid_to_staff, staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Verify
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;
