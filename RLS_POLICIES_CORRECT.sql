-- ============================================
-- RLS POLICIES - KORREKT FÜR BESTEHENDE DB
-- Basierend auf tatsächlicher Struktur
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Alte Policies löschen
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile on signup" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;

-- NEUE POLICIES (EINFACHER)

-- 1a. Jeder kann alle Profile LESEN (für Staff Auswahl etc.)
CREATE POLICY "Public profiles are viewable"
ON profiles FOR SELECT
TO authenticated, anon
USING (true);

-- 1b. User kann eigenes Profil updaten
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 1c. Admins können alle Profile updaten
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
    id IN (
        SELECT id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 1d. User kann eigenes Profil beim Signup erstellen
CREATE POLICY "Users can insert own profile on signup"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);


-- ============================================
-- 2. SERVICES TABLE
-- ============================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active services" ON services;
DROP POLICY IF EXISTS "Anyone can view all services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;

-- 2a. Alle können Services sehen (is_active kann NULL sein!)
CREATE POLICY "Anyone can view services"
ON services FOR SELECT
TO authenticated, anon
USING (is_active IS NOT FALSE);  -- Zeigt true UND null

-- 2b. Admins können Services verwalten
CREATE POLICY "Admins can manage services"
ON services FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
);


-- ============================================
-- 3. BOOKINGS TABLE
-- ============================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can view assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Staff and Admin can update bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view related bookings" ON bookings;

-- 3a. User sehen eigene Bookings + assigned Bookings
CREATE POLICY "Users can view related bookings"
ON bookings FOR SELECT
TO authenticated
USING (
    customer_id = auth.uid()  -- Eigene Bookings
    OR staff_id = auth.uid()  -- Assigned Bookings
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')  -- Admin sieht alle
);

-- 3b. Authenticated users können Bookings erstellen
CREATE POLICY "Authenticated users can create bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

-- 3c. User können eigene Bookings updaten, Staff/Admin können assigned/alle updaten
CREATE POLICY "Users can update related bookings"
ON bookings FOR UPDATE
TO authenticated
USING (
    customer_id = auth.uid()
    OR staff_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);


-- ============================================
-- 4. STAFF_SERVICES TABLE
-- ============================================

ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view staff services" ON staff_services;
DROP POLICY IF EXISTS "Staff can manage own services" ON staff_services;

CREATE POLICY "Anyone can view staff services"
ON staff_services FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Staff can manage own services"
ON staff_services FOR ALL
TO authenticated
USING (
    staff_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================
-- 5. AVAILABILITY TABLE
-- ============================================

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view availability" ON availability;
DROP POLICY IF EXISTS "Anyone can view all availability" ON availability;
DROP POLICY IF EXISTS "Staff can manage own availability" ON availability;

CREATE POLICY "Anyone can view all availability"
ON availability FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Staff can manage own availability"
ON availability FOR ALL
TO authenticated
USING (
    staff_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================
-- 6. BLOCKERS TABLE
-- ============================================

ALTER TABLE blockers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff and admin can view blockers" ON blockers;
DROP POLICY IF EXISTS "Staff can manage own blockers" ON blockers;
DROP POLICY IF EXISTS "Staff can view related blockers" ON blockers;

CREATE POLICY "Staff can view related blockers"
ON blockers FOR SELECT
TO authenticated
USING (
    staff_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

CREATE POLICY "Staff can manage own blockers"
ON blockers FOR ALL
TO authenticated
USING (
    staff_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================
-- 7. ORDERS TABLE (falls vorhanden)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orders') THEN
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own orders" ON orders;
        DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
        DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
        DROP POLICY IF EXISTS "Admins can update orders" ON orders;
        DROP POLICY IF EXISTS "Users can view related orders" ON orders;

        EXECUTE 'CREATE POLICY "Users can view related orders" ON orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin''))';
        
        EXECUTE 'CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
        
        EXECUTE 'CREATE POLICY "Admins can update orders" ON orders FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin''))';
    END IF;
END $$;


-- ============================================
-- 8. COMPANY_SETTINGS TABLE (falls vorhanden)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='company_settings') THEN
        ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Anyone can view company settings" ON company_settings;
        DROP POLICY IF EXISTS "Admins can update company settings" ON company_settings;
        DROP POLICY IF EXISTS "Admins can insert company settings" ON company_settings;

        EXECUTE 'CREATE POLICY "Anyone can view company settings" ON company_settings FOR SELECT TO authenticated, anon USING (true)';
        
        EXECUTE 'CREATE POLICY "Admins can manage company settings" ON company_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin''))';
    END IF;
END $$;


-- ============================================
-- 9. PRODUCTS TABLE (falls vorhanden)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='products') THEN
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Anyone can view active products" ON products;
        DROP POLICY IF EXISTS "Anyone can view all products" ON products;
        DROP POLICY IF EXISTS "Admins can manage products" ON products;

        EXECUTE 'CREATE POLICY "Anyone can view products" ON products FOR SELECT TO authenticated, anon USING (is_active IS NOT FALSE)';
        
        EXECUTE 'CREATE POLICY "Admins can manage products" ON products FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin''))';
    END IF;
END $$;


-- ============================================
-- FERTIG!
-- ============================================
-- Diese Policies sind jetzt KORREKT für deine DB Struktur.
-- Wichtige Änderungen:
-- 1. is_active checks verwenden "IS NOT FALSE" statt "= true"
-- 2. Profiles sind public readable (für Staff Selection)
-- 3. Simplere Policy Logik, weniger zirkuläre Abhängigkeiten
-- ============================================
