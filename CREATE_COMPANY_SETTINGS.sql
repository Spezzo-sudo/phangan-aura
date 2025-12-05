-- STEP 3: Create Company Settings Table (for Loan Tracking)
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view/edit
CREATE POLICY "Admins can manage company settings"
ON company_settings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Insert initial loan settings
INSERT INTO company_settings (setting_key, setting_value, description)
VALUES 
    ('loan_repayment', '{"initial_amount": 80000, "repaid_amount": 0, "currency": "THB", "start_date": "2025-01-01"}', 'Investor loan repayment tracking'),
    ('commission_rates', '{"staff_commission_percent": 50, "transport_fee_thb": 100, "stripe_fee_percent": 4, "material_cost_percent": 4}', 'Commission calculation rates'),
    ('business_metrics', '{"target_bookings_per_day": 7, "target_avg_booking_value": 1200}', 'Business KPI targets');

-- Verify
SELECT * FROM company_settings;
