-- ==============================================================================
-- PHASE 1: SECURITY & FOUNDATION
-- Description: Hardening RLS, adding Audit Logs, and creating Secure Views.
-- ==============================================================================

-- 1. AUDIT LOGS TABLE
-- ------------------------------------------------------------------------------
-- Tracks critical changes (money, status) to prevent disputes.

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    details TEXT
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only Admins can view logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Policy: System/Triggers can insert (implicitly allowed for triggers, but good for API usage if needed)
-- No specific insert policy needed for triggers as they run with security definer usually, 
-- but if we write from client (not recommended), we'd need one. We'll stick to triggers.


-- 2. SECURE PUBLIC PROFILES VIEW
-- ------------------------------------------------------------------------------
-- Exposes only safe data (Name, Avatar, Role) to the public.
-- Hides Email, Phone, and other sensitive info.

CREATE OR REPLACE VIEW public_profiles_view AS
SELECT 
    id, 
    full_name, 
    avatar_url, 
    role,
    bio -- Assuming bio is safe and desirable for staff selection
FROM profiles;

-- Grant access to everyone (anon + authenticated)
GRANT SELECT ON public_profiles_view TO anon, authenticated;


-- 3. HARDEN PROFILES TABLE RLS
-- ------------------------------------------------------------------------------
-- Restrict the actual 'profiles' table so only the owner or admin can see full details.

-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles; -- Just in case

-- Policy: Users can view their OWN profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Policy: Admins can view ALL profiles (already exists in previous scripts, but ensuring it here)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- 4. AUTOMATED LOGGING TRIGGER
-- ------------------------------------------------------------------------------
-- Automatically logs changes to 'bookings' when status or payment info changes.

CREATE OR REPLACE FUNCTION log_booking_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log if Status, Payment, or Price changes
    IF (OLD.status IS DISTINCT FROM NEW.status) OR 
       (OLD.paid_to_staff IS DISTINCT FROM NEW.paid_to_staff) OR 
       (OLD.total_price IS DISTINCT FROM NEW.total_price) THEN
       
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data, details)
        VALUES (
            auth.uid(), -- The user making the change
            'UPDATE',
            'bookings',
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW),
            CASE 
                WHEN OLD.status IS DISTINCT FROM NEW.status THEN 'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status
                WHEN OLD.paid_to_staff IS DISTINCT FROM NEW.paid_to_staff THEN 'Payout status changed'
                ELSE 'Critical update'
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Trigger to Bookings
DROP TRIGGER IF EXISTS on_booking_change ON bookings;
CREATE TRIGGER on_booking_change
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION log_booking_changes();

