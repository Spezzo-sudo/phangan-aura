-- Migration: Add paid_to_staff tracking columns to bookings table
-- Purpose: Enable staff payout settlement tracking in StaffPayoutDashboard

-- Add paid_to_staff boolean column (default false = unpaid)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS paid_to_staff BOOLEAN DEFAULT false;

-- Add timestamp for when payment was made
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS paid_to_staff_at TIMESTAMPTZ;

-- Add reference to admin who marked as paid
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS paid_by_admin_id UUID REFERENCES profiles(id);

-- Add optional payment notes
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Create index for faster queries on unpaid bookings
CREATE INDEX IF NOT EXISTS idx_bookings_paid_to_staff 
ON bookings(paid_to_staff) 
WHERE paid_to_staff = false;

-- Create index for staff payout queries
CREATE INDEX IF NOT EXISTS idx_bookings_staff_payment 
ON bookings(staff_id, paid_to_staff, status);

-- Add comment for documentation
COMMENT ON COLUMN bookings.paid_to_staff IS 'Indicates if staff member has been paid their commission and transport fee';
COMMENT ON COLUMN bookings.paid_to_staff_at IS 'Timestamp when staff was marked as paid';
COMMENT ON COLUMN bookings.paid_by_admin_id IS 'Admin user who marked this booking as paid to staff';
COMMENT ON COLUMN bookings.payment_notes IS 'Optional notes about the payment (e.g., partial payment, pending amount)';
