-- REAL DATA EXPORT (Anonymized) - 2025-12-07T20:58:41.785Z

-- Products (Real Data)
INSERT INTO public.products (id, name, description, price_thb, category, is_active, stock_quantity) VALUES
('95d78d76-6c41-45e9-95b9-a37ae8ac6d90', '{"en":"Organic Coconut Oil"}', '{"en":"Pure organic coconut oil for skin and hair."}', 350, 'Body Care', TRUE, NULL),
('d31f7711-8fb7-4051-b83c-cd3f90aea63e', '{"en":"Aloe Vera Gel"}', '{"en":"Soothing gel for after-sun care."}', 250, 'After Sun', TRUE, NULL),
('bb5b128b-e051-4a5a-a3da-57826bb5e6ec', '{"en":"Lemongrass Essential Oil"}', '{"en":"Refreshing aromatherapy oil."}', 450, 'Aromatherapy', TRUE, NULL),
('8f66543e-6a25-4891-bcdd-a0394fb9b94e', '{"en":"Handmade Soap Set"}', '{"en":"Natural handmade soaps with essential oils."}', 300, 'Skincare', TRUE, NULL),
('4c6a2466-b651-41d1-ad9d-4df73f136851', '{"en":"Döner"}', '{"en":"Esse"}', 350, 'Food', TRUE, NULL);

-- Profiles (Anonymized)
INSERT INTO public.profiles (id, email, full_name, role, bio) VALUES
('0147f4fb-8829-4cf5-9d71-a30820d96022', 'user_3482@example.com', 'Anonymized User', 'admin', NULL),
('18168f02-4217-4bd0-b5fe-7139ad2cfb29', 'user_3894@example.com', 'Anonymized User', 'staff', NULL),
('c6849248-c53f-4152-9969-21985411e00a', 'user_2658@example.com', 'Anonymized User', 'customer', NULL);


-- ============================================================================
-- SECURE RLS POLICIES FOR PAYMENTS & DATA PROTECTION
-- ============================================================================
-- This script implements strict Row Level Security (RLS) to protect user data
-- and payment information. It replaces previous permissive policies.
-- ============================================================================

-- Function to check if user is admin (Bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES (Strict Privacy)
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile on signup" ON profiles;
DROP POLICY IF EXISTS "Public can view staff profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Allow users to read their OWN profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow everyone (including anon) to read STAFF profiles (for booking)
CREATE POLICY "Public can view staff profiles"
ON profiles FOR SELECT
TO authenticated, anon
USING (role = 'staff');

-- Allow Admins to read ALL profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_admin());

-- Allow users to update their OWN profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow Admins to update ALL profiles
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (is_admin());

-- Allow users to insert their OWN profile (during signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);


-- 2. BOOKINGS (Payment Security)
-- ============================================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view related bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update related bookings" ON bookings;
DROP POLICY IF EXISTS "Secure booking visibility" ON bookings;
DROP POLICY IF EXISTS "Secure booking creation" ON bookings;
DROP POLICY IF EXISTS "Secure booking updates" ON bookings;

-- Users can only see their OWN bookings. Staff see ASSIGNED. Admins see ALL.
CREATE POLICY "Secure booking visibility"
ON bookings FOR SELECT
TO authenticated
USING (
    customer_id = auth.uid()
    OR staff_id = auth.uid()
    OR is_admin()
);

-- Users can only create bookings for THEMSELVES
CREATE POLICY "Secure booking creation"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (
    customer_id = auth.uid()
);

-- Users can cancel (update) their OWN bookings. Staff/Admins can manage.
CREATE POLICY "Secure booking updates"
ON bookings FOR UPDATE
TO authenticated
USING (
    customer_id = auth.uid()
    OR staff_id = auth.uid()
    OR is_admin()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'staff'
);


-- 3. ORDERS (E-commerce Security)
-- ============================================================================
-- Ensure orders table exists before applying policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orders') THEN
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own orders" ON orders;
        DROP POLICY IF EXISTS "Users can view related orders" ON orders;
        DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
        DROP POLICY IF EXISTS "Admins can update orders" ON orders;
        DROP POLICY IF EXISTS "Secure order visibility" ON orders;
        DROP POLICY IF EXISTS "Secure order creation" ON orders;

        -- Users see OWN orders. Admins see ALL.
        EXECUTE 'CREATE POLICY "Secure order visibility" ON orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin())';
        
        -- Users create orders for THEMSELVES
        EXECUTE 'CREATE POLICY "Secure order creation" ON orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
        
        -- Only Admins can update orders (e.g. status changes)
        EXECUTE 'CREATE POLICY "Admins can update orders" ON orders FOR UPDATE TO authenticated USING (is_admin())';
    END IF;
END $$;


-- 4. COMPANY SETTINGS (Config Protection)
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='company_settings') THEN
        ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Anyone can view company settings" ON company_settings;
        DROP POLICY IF EXISTS "Admins can manage company settings" ON company_settings;
        DROP POLICY IF EXISTS "Public view company settings" ON company_settings;

        -- Public read access to settings (Ensure NO SECRETS are stored here!)
        EXECUTE 'CREATE POLICY "Public view company settings" ON company_settings FOR SELECT TO authenticated, anon USING (true)';
        
        -- Only Admins can change settings
        EXECUTE 'CREATE POLICY "Admins can manage company settings" ON company_settings FOR ALL TO authenticated USING (is_admin())';
    END IF;
END $$;


-- 5. SERVICES & PRODUCTS (Public Catalog)
-- ============================================================================
-- Services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;
DROP POLICY IF EXISTS "Public view active services" ON services;
DROP POLICY IF EXISTS "Admins manage services" ON services;

CREATE POLICY "Public view active services"
ON services FOR SELECT
TO authenticated, anon
USING (is_active IS NOT FALSE);

CREATE POLICY "Admins manage services"
ON services FOR ALL
TO authenticated
USING (is_admin());

-- Products
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='products') THEN
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Anyone can view products" ON products;
        DROP POLICY IF EXISTS "Admins can manage products" ON products;
        DROP POLICY IF EXISTS "Public view active products" ON products;
        DROP POLICY IF EXISTS "Admins manage products" ON products;

        EXECUTE 'CREATE POLICY "Public view active products" ON products FOR SELECT TO authenticated, anon USING (is_active IS NOT FALSE)';
        
        EXECUTE 'CREATE POLICY "Admins manage products" ON products FOR ALL TO authenticated USING (is_admin())';
    END IF;
END $$;

-- 6. STAFF & AVAILABILITY (Operational Data)
-- ============================================================================
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view staff services" ON staff_services;
DROP POLICY IF EXISTS "Staff can manage own services" ON staff_services;
DROP POLICY IF EXISTS "Public view staff services" ON staff_services;
DROP POLICY IF EXISTS "Staff manage own services" ON staff_services;

CREATE POLICY "Public view staff services"
ON staff_services FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Staff manage own services"
ON staff_services FOR ALL
TO authenticated
USING (
    staff_id = auth.uid()
    OR is_admin()
);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view all availability" ON availability;
DROP POLICY IF EXISTS "Staff can manage own availability" ON availability;
DROP POLICY IF EXISTS "Public view availability" ON availability;
DROP POLICY IF EXISTS "Staff manage own availability" ON availability;

CREATE POLICY "Public view availability"
ON availability FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Staff manage own availability"
ON availability FOR ALL
TO authenticated
USING (
    staff_id = auth.uid()
    OR is_admin()
);
